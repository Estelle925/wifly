import { EventEmitter } from 'events';
import { WebRTCManager } from './WebRTCManager';

export interface FileProgress {
  fileId: string;
  fileName: string;
  size: number;
  progress: number;
  status: 'transferring' | 'completed' | 'error' | 'cancelled';
  error?: string;
}

interface FileError {
  fileId: string;
  error: string;
}

export class FileTransferManager extends EventEmitter {
  private webRTCManager: WebRTCManager;
  private activeTransfers: Map<string, {
    channel: RTCDataChannel;
    controller: AbortController;
  }>;

  constructor(webRTCManager: WebRTCManager) {
    super();
    this.webRTCManager = webRTCManager;
    this.activeTransfers = new Map();
    this.setupWebRTCHandlers();
  }

  async sendFile(deviceId: string, file: File) {
    try {
      const fileId = this.generateFileId();
      const channel = await this.webRTCManager.createDataChannel(deviceId, fileId);
      const controller = new AbortController();

      this.activeTransfers.set(fileId, { channel, controller });

      // 发送文件元数据
      channel.send(JSON.stringify({
        type: 'metadata',
        fileId,
        fileName: file.name,
        size: file.size,
      }));

      // 读取并发送文件数据
      await this.sendFileData(channel, file, fileId, controller.signal);

    } catch (error: any) {
      console.error('Error sending file:', error);
      this.emit('error', { fileId: 'unknown', error: error.message } as FileError);
    }
  }

  private async sendFileData(
    channel: RTCDataChannel,
    file: File,
    fileId: string,
    signal: AbortSignal
  ) {
    const chunkSize = this.calculateOptimalChunkSize(channel);
    const reader = file.stream().getReader();
    let totalSent = 0;
    let lastProgressUpdate = 0;

    try {
      while (true) {
        if (signal.aborted) {
          throw new Error('Transfer cancelled');
        }

        const { done, value } = await reader.read();
        if (done) break;

        // 动态调整等待时间
        await this.waitForChannelBuffer(channel, signal);

        channel.send(value);
        totalSent += value.length;

        // 限制进度更新频率
        const now = Date.now();
        if (now - lastProgressUpdate > 100) { // 每100ms更新一次
          this.emit('progressUpdate', {
            fileId,
            fileName: file.name,
            size: file.size,
            progress: totalSent / file.size,
            status: 'transferring',
          });
          lastProgressUpdate = now;
        }
      }

      // 发送最终进度
      this.emit('progressUpdate', {
        fileId,
        fileName: file.name,
        size: file.size,
        progress: 1,
        status: 'completed',
      });

    } catch (error: any) {
      this.emit('error', { fileId, error: error.message });
      channel.close();
    } finally {
      reader.releaseLock();
      this.activeTransfers.delete(fileId);
    }
  }

  private calculateOptimalChunkSize(channel: RTCDataChannel): number {
    // 基于连接质量动态调整分片大小
    const baseChunkSize = 16384; // 16KB
    const connectionSpeed = channel.bufferedAmount === 0 ? 1 : 0.5;
    return Math.floor(baseChunkSize * connectionSpeed);
  }

  private async waitForChannelBuffer(
    channel: RTCDataChannel,
    signal: AbortSignal
  ): Promise<void> {
    const maxBufferSize = channel.bufferedAmountLowThreshold * 2;
    
    while (channel.bufferedAmount > maxBufferSize) {
      if (signal.aborted) {
        throw new Error('Transfer cancelled');
      }
      
      // 动态调整等待时间
      const waitTime = Math.min(
        100,
        Math.max(10, channel.bufferedAmount / maxBufferSize * 100)
      );
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  cancelTransfer(fileId: string) {
    const transfer = this.activeTransfers.get(fileId);
    if (transfer) {
      transfer.controller.abort();
      transfer.channel.close();
      this.activeTransfers.delete(fileId);
      
      this.emit('progressUpdate', {
        fileId,
        fileName: '', // 这里可能需要存储文件名
        size: 0,
        progress: 0,
        status: 'cancelled',
      });
    }
  }

  hasActiveTransfers(): boolean {
    return this.activeTransfers.size > 0;
  }

  private generateFileId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private setupWebRTCHandlers() {
    // 处理接收到的文件
    this.webRTCManager.on('dataChannel', (channel) => {
      let fileMetadata: any;
      let receivedSize = 0;
      let chunks: Uint8Array[] = [];

      channel.onmessage = (event: MessageEvent) => {
        if (typeof event.data === 'string') {
          // 处理元数据
          fileMetadata = JSON.parse(event.data);
          this.emit('progressUpdate', {
            fileId: fileMetadata.fileId,
            fileName: fileMetadata.fileName,
            size: fileMetadata.size,
            progress: 0,
            status: 'transferring',
          });
        } else {
          // 处理文件数据
          chunks.push(new Uint8Array(event.data));
          receivedSize += event.data.byteLength;

          this.emit('progressUpdate', {
            fileId: fileMetadata.fileId,
            fileName: fileMetadata.fileName,
            size: fileMetadata.size,
            progress: receivedSize / fileMetadata.size,
            status: 'transferring',
          });

          if (receivedSize === fileMetadata.size) {
            // 文件接收完成
            const blob = new Blob(chunks);
            this.emit('fileReceived', {
              fileId: fileMetadata.fileId,
              fileName: fileMetadata.fileName,
              blob,
            });

            // 清理资源
            chunks = [];
            channel.close();
          }
        }
      };
    });
  }
} 