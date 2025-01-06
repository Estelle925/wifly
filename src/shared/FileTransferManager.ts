import { EventEmitter } from 'events';
import { WebRTCManager } from './WebRTCManager';
import { CompressionManager } from './CompressionManager';

export interface FileProgress {
  fileId: string;
  fileName: string;
  size: number;
  progress: number;
  status: 'transferring' | 'completed' | 'error' | 'cancelled' | 'paused';
  speed?: number;
  remainingTime?: number;
  error?: string;
}

interface FileError {
  fileId: string;
  error: string;
}

interface TransferTask {
  id: string;
  files: File[];
  deviceId: string;
  status: 'pending' | 'transferring' | 'paused' | 'completed' | 'error';
  progress: number;
  speed: number;
  remainingTime: number;
  resumePosition?: number;
}

interface ChunkMetrics {
  size: number;
  sendTime: number;
  ackTime?: number;
}

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

interface TransferChunk {
  id: string;
  data: Uint8Array;
  compressed: boolean;
  retries: number;
}

export class FileTransferManager extends EventEmitter {
  private webRTCManager: WebRTCManager;
  private transferQueue: TransferTask[];
  private activeTransfers: Map<string, {
    channel: RTCDataChannel;
    controller: AbortController;
    task: TransferTask;
  }>;
  private maxConcurrentTransfers: number = 3;
  private chunkMetrics: Map<string, ChunkMetrics[]> = new Map();
  private readonly MIN_CHUNK_SIZE = 16 * 1024; // 16KB
  private readonly MAX_CHUNK_SIZE = 256 * 1024; // 256KB
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 1.5
  };

  constructor(webRTCManager: WebRTCManager) {
    super();
    this.webRTCManager = webRTCManager;
    this.transferQueue = [];
    this.activeTransfers = new Map();
    this.setupWebRTCHandlers();
  }

  async sendFile(deviceId: string, file: File) {
    try {
      const fileId = this.generateFileId();
      const channel = await this.webRTCManager.createDataChannel(deviceId, fileId);
      const controller = new AbortController();

      this.activeTransfers.set(fileId, { channel, controller, task: { id: fileId, files: [file], deviceId, status: 'pending', progress: 0, speed: 0, remainingTime: 0 } });

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
    const reader = file.stream().getReader();
    const chunkQueue: TransferChunk[] = [];
    let totalSent = 0;
    let lastProgressUpdate = 0;
    const startTime = Date.now();

    try {
      // 预读取一定数量的块到队列
      while (true) {
        if (signal.aborted) throw new Error('Transfer cancelled');

        const { done, value } = await reader.read();
        if (done) break;

        const chunks = this.splitIntoChunks(value, this.calculateOptimalChunkSize(channel, fileId));
        
        for (const chunk of chunks) {
          // 压缩数据
          const shouldCompress = CompressionManager.shouldCompress(chunk);
          const { compressed, compressionRatio } = shouldCompress ? 
            await CompressionManager.compress(chunk) :
            { compressed: chunk, compressionRatio: 1 };

          chunkQueue.push({
            id: `${fileId}_${totalSent}`,
            data: compressed,
            compressed: shouldCompress,
            retries: 0
          });
        }

        // 当队列达到一定大小时开始并发传输
        if (chunkQueue.length >= 5) {
          await this.sendChunksConcurrently(channel, chunkQueue, signal);
          totalSent += chunkQueue.reduce((sum, chunk) => sum + chunk.data.length, 0);
          chunkQueue.length = 0;

          this.updateProgress(fileId, file.name, file.size, totalSent, startTime);
        }
      }

      // 发送剩余的块
      if (chunkQueue.length > 0) {
        await this.sendChunksConcurrently(channel, chunkQueue, signal);
        totalSent += chunkQueue.reduce((sum, chunk) => sum + chunk.data.length, 0);
      }

      // 发送完成标记
      this.emit('progressUpdate', {
        fileId,
        fileName: file.name,
        size: file.size,
        progress: 1,
        status: 'completed',
        speed: totalSent / ((Date.now() - startTime) / 1000),
        remainingTime: 0
      });

    } catch (error: any) {
      this.emit('error', { fileId, error: error.message });
    }
  }

  // 并发发送数据块
  private async sendChunksConcurrently(
    channel: RTCDataChannel,
    chunks: TransferChunk[],
    signal: AbortSignal
  ) {
    const maxConcurrent = 3; // 最大并发数
    const pending = new Set<Promise<void>>();

    for (const chunk of chunks) {
      if (signal.aborted) throw new Error('Transfer cancelled');

      // 等待某些传输完成,保持并发数
      while (pending.size >= maxConcurrent) {
        await Promise.race(pending);
      }

      const sendPromise = this.sendChunkWithRetry(channel, chunk, signal)
        .finally(() => pending.delete(sendPromise));
      
      pending.add(sendPromise);
    }

    // 等待所有传输完成
    await Promise.all(pending);
  }

  // 带重试机制的数据块发送
  private async sendChunkWithRetry(
    channel: RTCDataChannel,
    chunk: TransferChunk,
    signal: AbortSignal
  ): Promise<void> {
    let delay = this.retryConfig.retryDelay;

    while (chunk.retries < this.retryConfig.maxRetries) {
      try {
        await this.waitForChannelBuffer(channel, signal);

        // 发送数据块元数据
        channel.send(JSON.stringify({
          type: 'chunk',
          id: chunk.id,
          compressed: chunk.compressed
        }));

        // 发送数据
        channel.send(chunk.data);

        // 等待确认
        await this.waitForAck(channel, chunk.id, signal);
        return;

      } catch (error) {
        chunk.retries++;
        if (chunk.retries >= this.retryConfig.maxRetries) {
          throw new Error(`Failed to send chunk ${chunk.id} after ${chunk.retries} retries`);
        }

        // 指数退避
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= this.retryConfig.backoffMultiplier;
      }
    }
  }

  // 等待数据块确认
  private waitForAck(channel: RTCDataChannel, chunkId: string, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Ack timeout'));
      }, 5000);

      const onMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ack' && data.chunkId === chunkId) {
            cleanup();
            resolve();
          }
        } catch (error) {
          // 忽略非JSON消息
        }
      };

      const onAbort = () => {
        cleanup();
        reject(new Error('Transfer cancelled'));
      };

      const cleanup = () => {
        clearTimeout(timeout);
        channel.removeEventListener('message', onMessage);
        signal.removeEventListener('abort', onAbort);
      };

      channel.addEventListener('message', onMessage);
      signal.addEventListener('abort', onAbort);
    });
  }

  private calculateOptimalChunkSize(channel: RTCDataChannel, fileId: string): number {
    const metrics = this.chunkMetrics.get(fileId);
    if (!metrics || metrics.length < 5) {
      return this.MIN_CHUNK_SIZE;
    }

    // 计算最近5个分片的平均传输速度
    const recentMetrics = metrics.slice(-5);
    const avgSpeed = recentMetrics.reduce((sum, metric) => {
      if (!metric.ackTime) return sum;
      const transferTime = metric.ackTime - metric.sendTime;
      return sum + (metric.size / transferTime);
    }, 0) / recentMetrics.length;

    // 根据速度动态调整分片大小
    let newChunkSize = this.MIN_CHUNK_SIZE;
    if (avgSpeed > 1024 * 1024) { // 如果速度大于1MB/s
      newChunkSize = Math.min(this.MAX_CHUNK_SIZE, this.MIN_CHUNK_SIZE * 2);
    }

    return Math.max(this.MIN_CHUNK_SIZE, Math.min(newChunkSize, this.MAX_CHUNK_SIZE));
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
    this.webRTCManager.on('dataChannel', (channel) => {
      let fileMetadata: any;
      let receivedSize = 0;
      let chunks: Uint8Array[] = [];
      let isCompressed = false;

      channel.onmessage = async (event: MessageEvent) => {
        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'metadata') {
              fileMetadata = data;
              this.emit('progressUpdate', {
                fileId: fileMetadata.fileId,
                fileName: fileMetadata.fileName,
                size: fileMetadata.size,
                progress: 0,
                status: 'transferring'
              });
            } else if (data.type === 'chunk') {
              isCompressed = data.compressed;
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        } else {
          // 处理文件数据
          const chunk = new Uint8Array(event.data);
          if (isCompressed) {
            const decompressed = await CompressionManager.decompress(chunk);
            chunks.push(decompressed);
            receivedSize += decompressed.length;
          } else {
            chunks.push(chunk);
            receivedSize += chunk.length;
          }

          this.emit('progressUpdate', {
            fileId: fileMetadata.fileId,
            fileName: fileMetadata.fileName,
            size: fileMetadata.size,
            progress: receivedSize / fileMetadata.size,
            status: 'transferring'
          });

          // 发送确认
          channel.send(JSON.stringify({
            type: 'ack',
            chunkId: `${fileMetadata.fileId}_${receivedSize}`
          }));

          if (receivedSize >= fileMetadata.size) {
            // 文件接收完成
            const blob = new Blob(chunks);
            this.emit('fileReceived', {
              fileId: fileMetadata.fileId,
              fileName: fileMetadata.fileName,
              blob
            });

            // 清理资源
            chunks = [];
            channel.close();
          }
        }
      };
    });
  }

  // 添加传输速度计算
  private calculateTransferSpeed(
    channel: RTCDataChannel,
    fileId: string,
    startTime: number,
    totalSent: number
  ): number {
    const elapsedTime = (Date.now() - startTime) / 1000; // 转换为秒
    return totalSent / elapsedTime; // 字节/秒
  }

  // 支持文件夹传输
  async sendFolder(deviceId: string, folder: FileSystemDirectoryHandle) {
    const files: File[] = [];
    
    async function collectFiles(handle: FileSystemDirectoryHandle, path: string) {
      for await (const [name, entry] of handle.entries()) {
        if (entry.kind === 'file') {
          const file = await (entry as FileSystemFileHandle).getFile();
          Object.defineProperty(file, 'path', { value: `${path}/${name}` });
          files.push(file);
        } else if (entry.kind === 'directory') {
          await collectFiles(entry as FileSystemDirectoryHandle, `${path}/${name}`);
        }
      }
    }

    await collectFiles(folder, '');
    await this.addToQueue(deviceId, files);
  }

  // 添加传输队列管理
  private async addToQueue(deviceId: string, files: File[]): Promise<string> {
    const taskId = this.generateTaskId();
    const task: TransferTask = {
      id: taskId,
      files,
      deviceId,
      status: 'pending',
      progress: 0,
      speed: 0,
      remainingTime: 0
    };

    this.transferQueue.push(task);
    this.processQueue();
    return taskId;
  }

  // 处理传输队列
  private async processQueue() {
    const activeCount = this.activeTransfers.size;
    if (activeCount >= this.maxConcurrentTransfers) return;

    const availableSlots = this.maxConcurrentTransfers - activeCount;
    const pendingTasks = this.transferQueue
      .filter(task => task.status === 'pending')
      .slice(0, availableSlots);

    for (const task of pendingTasks) {
      await this.startTransfer(task);
    }
  }

  // 支持断点续传
  private async resumeTransfer(task: TransferTask) {
    if (!task.resumePosition) return false;

    const channel = await this.webRTCManager.createDataChannel(task.deviceId, task.id);
    
    // 发送恢复传输请求
    channel.send(JSON.stringify({
      type: 'resumeRequest',
      fileId: task.id,
      position: task.resumePosition
    }));

    return new Promise((resolve) => {
      channel.onmessage = (event) => {
        const response = JSON.parse(event.data);
        resolve(response.canResume);
      };
    });
  }

  // 将数据分割成指定大小的分片
  private splitIntoChunks(data: Uint8Array, chunkSize: number): Uint8Array[] {
    const chunks: Uint8Array[] = [];
    let offset = 0;
    
    while (offset < data.length) {
      chunks.push(data.slice(offset, offset + chunkSize));
      offset += chunkSize;
    }
    
    return chunks;
  }

  private generateTaskId(): string {
    return `task_${Math.random().toString(36).substring(2)}_${Date.now()}`;
  }

  private async startTransfer(task: TransferTask) {
    try {
      task.status = 'transferring';
      for (const file of task.files) {
        await this.sendFile(task.deviceId, file);
      }
      task.status = 'completed';
    } catch (error) {
      task.status = 'error';
      console.error('Error in transfer task:', error);
    }
  }

  private updateProgress(
    fileId: string,
    fileName: string,
    totalSize: number,
    sentBytes: number,
    startTime: number
  ) {
    const now = Date.now();
    const elapsedTime = (now - startTime) / 1000;
    const speed = sentBytes / elapsedTime;
    const remainingBytes = totalSize - sentBytes;
    const remainingTime = speed > 0 ? remainingBytes / speed : 0;

    this.emit('progressUpdate', {
      fileId,
      fileName,
      size: totalSize,
      progress: sentBytes / totalSize,
      status: 'transferring',
      speed,
      remainingTime
    });
  }
} 