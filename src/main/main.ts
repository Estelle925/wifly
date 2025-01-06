import { app, BrowserWindow, globalShortcut } from 'electron';
import * as path from 'path';
import { SettingsManager } from '@/shared/SettingsManager';
import { IpcMainManager } from '@/shared/IpcManager';
import { WebRTCManager } from '@/shared/WebRTCManager';
import { FileTransferManager } from '@/shared/FileTransferManager';
import { TrayManager } from '@/shared/TrayManager';
import { t } from 'i18next';

let mainWindow: BrowserWindow | null = null;
let settingsManager: SettingsManager;
let webRTCManager: WebRTCManager;
let fileTransferManager: FileTransferManager;
let ipcManager: IpcMainManager;
let trayManager: TrayManager;

async function createWindow() {
  try {
    // 初始化管理器
    settingsManager = new SettingsManager();
    webRTCManager = new WebRTCManager();
    fileTransferManager = new FileTransferManager(webRTCManager);
    ipcManager = new IpcMainManager(settingsManager, webRTCManager, fileTransferManager);

    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: true,
        sandbox: false
      },
    });

    // 设置 CSP
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:"
          ]
        }
      });
    });

    // 添加路径日志以便调试
    const htmlPath = path.join(app.getAppPath(), 'dist', 'index.html');
    console.log('Loading HTML from:', htmlPath);

    // 添加错误处理
    mainWindow.webContents.on('crashed', (e) => {
      console.error('Window crashed:', e);
    });

    mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
      console.error('Failed to load:', code, desc);
    });

    // 初始化托盘
    trayManager = new TrayManager(mainWindow, settingsManager);

    // 监听文件传输状态以更新托盘图标
    fileTransferManager.on('progressUpdate', (progress) => {
      const hasActiveTransfers = fileTransferManager.hasActiveTransfers();
      trayManager.updateIcon(hasActiveTransfers);
    });

    // 监听文件接收完成以显示通知
    fileTransferManager.on('fileReceived', ({ fileName }) => {
      trayManager.showNotification(
        t('notification.fileReceived.title'),
        t('notification.fileReceived.body', { fileName })
      );
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Loading development file...');
      await mainWindow.loadFile(htmlPath);
      mainWindow.webContents.openDevTools();
    } else {
      console.log('Loading production file...');
      await mainWindow.loadFile(htmlPath);
    }

    // 处理窗口最小化
    mainWindow.on('minimize', (event: Electron.Event) => {
      if (settingsManager.get('minimizeToTray')) {
        event.preventDefault();
        mainWindow?.hide();
      }
    });

    // 处理窗口关闭
    mainWindow.on('close', (event: Electron.Event) => {
      if (settingsManager.get('minimizeToTray')) {
        event.preventDefault();
        mainWindow?.hide();
      }
    });

    // 注册快捷键
    globalShortcut.register('CommandOrControl+Shift+D', () => {
      mainWindow?.webContents.openDevTools();
    });

  } catch (error) {
    console.error('Error creating window:', error);
    // 添加更详细的错误信息
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

// 添加未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

app.whenReady().then(createWindow).catch(error => {
  console.error('Error in app startup:', error);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 清理资源
app.on('before-quit', () => {
  trayManager?.destroy();
}); 