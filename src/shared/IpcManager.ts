import { ipcMain, ipcRenderer, dialog, BrowserWindow, app, shell, Notification } from 'electron';
import { IpcChannel, IpcEvents } from '@/types/ipc';
import { SettingsManager } from './SettingsManager';
import { WebRTCManager } from './WebRTCManager';
import { FileTransferManager } from './FileTransferManager';
import { FileSystemManager } from './FileSystemManager';
import path from 'path';
import { t } from 'i18next';
import { NotificationManager } from './NotificationManager';
import { TransferHistoryManager } from './TransferHistoryManager';

export class IpcMainManager {
  private settingsManager: SettingsManager;
  private webRTCManager: WebRTCManager;
  private fileTransferManager: FileTransferManager;
  private fileSystemManager: FileSystemManager;
  private notificationManager: NotificationManager;
  private transferHistoryManager: TransferHistoryManager;

  constructor(
    settingsManager: SettingsManager,
    webRTCManager: WebRTCManager,
    fileTransferManager: FileTransferManager
  ) {
    this.settingsManager = settingsManager;
    this.webRTCManager = webRTCManager;
    this.fileTransferManager = fileTransferManager;
    this.fileSystemManager = new FileSystemManager();
    this.notificationManager = new NotificationManager();
    this.transferHistoryManager = new TransferHistoryManager();
    this.setupHandlers();
    this.setupFileTransferHandlers();
  }

  private setupFileTransferHandlers() {
    // 处理文件发送请求
    ipcMain.handle('file:send', async (_, { files, deviceId }) => {
      try {
        for (const file of files) {
          await this.fileTransferManager.sendFile(deviceId, file);
        }
      } catch (error) {
        console.error('Error sending file:', error);
      }
    });

    // 处理取消传输请求
    ipcMain.handle('file:cancel', (_, fileId: string) => {
      this.fileTransferManager.cancelTransfer(fileId);
    });

    // 监听文件传输进度
    this.fileTransferManager.on('progressUpdate', async (progress) => {
      if (progress.status === 'completed' || progress.status === 'error') {
        // 添加到历史记录
        await this.transferHistoryManager.addRecord({
          id: progress.fileId,
          fileName: progress.fileName,
          size: progress.size,
          type: 'send', // 或 'receive'，需要根据实际情况判断
          status: progress.status,
          deviceName: 'Device Name', // 需要从某处获取设备名称
          error: progress.error,
        });
      }
      
      this.broadcast('file:progress', progress);
      // 只在特定状态显示通知
      if (progress.status !== 'cancelled') {
        this.notificationManager.showTransferProgress(progress);
      }
    });

    // 监听文件传输错误
    this.fileTransferManager.on('error', ({ fileId, error }) => {
      this.broadcast('file:error', { fileId, error });
    });

    // 监听文件接收
    this.fileTransferManager.on('fileReceived', async ({ fileId, fileName, blob }) => {
      try {
        const savePath = this.settingsManager.get('downloadPath');
        const filePath = await this.fileSystemManager.saveFile(blob, fileName, savePath);
        
        // 发送通知
        const notification = new Notification({
          title: t('notification.fileReceived.title'),
          body: t('notification.fileReceived.body', { fileName }),
          icon: path.join(__dirname, '../assets/icon.png'),
        });

        notification.show();

        // 如果设置了自动打开文件夹
        if (this.settingsManager.get('autoSave')) {
          shell.showItemInFolder(filePath);
        }
      } catch (error) {
        console.error('Error saving received file:', error);
        this.broadcast('file:error', {
          fileId,
          error: t('error.fileSave'),
        });
      }
    });

    // 添加历史记录相关的 IPC 处理程序
    this.setupHistoryHandlers();
  }

  private setupHistoryHandlers() {
    ipcMain.handle('history:get', async (_, limit: number, offset: number) => {
      return await this.transferHistoryManager.getHistory(limit, offset);
    });

    ipcMain.handle('history:clear', async () => {
      await this.transferHistoryManager.clearHistory();
    });

    ipcMain.handle('history:delete', async (_, id: string) => {
      await this.transferHistoryManager.deleteRecord(id);
    });

    ipcMain.handle('history:export', async () => {
      return await this.transferHistoryManager.exportHistory();
    });

    ipcMain.handle('history:import', async (_, data: string) => {
      await this.transferHistoryManager.importHistory(data);
    });
  }

  private setupHandlers() {
    // 设置相关
    ipcMain.handle('settings:get', () => {
      return this.settingsManager.getAll();
    });

    ipcMain.handle('settings:set', (_, settings) => {
      Object.entries(settings).forEach(([key, value]) => {
        this.settingsManager.set(key as any, value);
      });
      // 广播设置变更
      this.broadcast('settings:changed', this.settingsManager.getAll());
    });

    // 文件选择
    ipcMain.handle('file:select', async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
      });
      return result.filePaths;
    });

    // 保存路径选择
    ipcMain.handle('file:save-path', async () => {
      const result = await dialog.showSaveDialog({});
      return result.filePath || '';
    });

    // 系统操作
    ipcMain.handle('app:minimize', () => {
      const win = BrowserWindow.getFocusedWindow();
      if (win) win.minimize();
    });

    ipcMain.handle('app:quit', () => {
      app.quit();
    });

    ipcMain.handle('directory:select', async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      });
      return result.filePaths[0];
    });
  }

  // 广播消息给所有渲染进程
  broadcast<T extends IpcChannel>(channel: T, ...args: Parameters<IpcEvents[T]>) {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send(channel, ...args);
    });
  }
}

// 渲染进程的 IPC 工具类
export class IpcRendererManager {
  // 发送请求并等待响应
  static async invoke<T extends IpcChannel>(
    channel: T,
    ...args: Parameters<IpcEvents[T]>
  ): Promise<ReturnType<IpcEvents[T]>> {
    return await ipcRenderer.invoke(channel, ...args);
  }

  // 监听广播消息
  static on<T extends IpcChannel>(
    channel: T,
    callback: (event: Electron.IpcRendererEvent, ...args: Parameters<IpcEvents[T]>) => void
  ) {
    ipcRenderer.on(channel, callback);
    return () => {
      ipcRenderer.removeListener(channel, callback);
    };
  }
} 