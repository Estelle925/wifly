import { Notification } from 'electron';
import path from 'path';
import { t } from 'i18next';
import { FileProgress } from './FileTransferManager';

export class NotificationManager {
  private activeNotifications: Map<string, Notification>;

  constructor() {
    this.activeNotifications = new Map();
  }

  showTransferProgress(progress: FileProgress) {
    // 只在特定进度点显示通知（开始、25%、50%、75%、完成）
    const shouldNotify = this.shouldShowProgressNotification(progress);
    if (!shouldNotify) return;

    const notification = new Notification({
      title: this.getProgressTitle(progress),
      body: this.getProgressBody(progress),
      icon: path.join(__dirname, '../assets/icon.png'),
      silent: true, // 避免频繁的通知声音
    });

    // 存储或更新通知
    this.activeNotifications.set(progress.fileId, notification);
    notification.show();

    // 如果传输完成或出错，一段时间后清除通知
    if (progress.status === 'completed' || progress.status === 'error') {
      setTimeout(() => {
        this.clearNotification(progress.fileId);
      }, 3000);
    }
  }

  private shouldShowProgressNotification(progress: FileProgress): boolean {
    if (progress.status === 'completed' || progress.status === 'error') {
      return true;
    }

    const currentProgress = Math.floor(progress.progress * 100);
    return currentProgress % 25 === 0; // 在 0%, 25%, 50%, 75%, 100% 时显示
  }

  private getProgressTitle(progress: FileProgress): string {
    switch (progress.status) {
      case 'completed':
        return t('notification.transfer.completed');
      case 'error':
        return t('notification.transfer.error');
      default:
        return t('notification.transfer.progress');
    }
  }

  private getProgressBody(progress: FileProgress): string {
    const percentage = Math.floor(progress.progress * 100);
    
    switch (progress.status) {
      case 'completed':
        return t('notification.transfer.completedBody', {
          fileName: progress.fileName,
        });
      case 'error':
        return t('notification.transfer.errorBody', {
          fileName: progress.fileName,
          error: progress.error,
        });
      default:
        return t('notification.transfer.progressBody', {
          fileName: progress.fileName,
          percentage,
        });
    }
  }

  private clearNotification(fileId: string) {
    const notification = this.activeNotifications.get(fileId);
    if (notification) {
      notification.close();
      this.activeNotifications.delete(fileId);
    }
  }

  clearAll() {
    this.activeNotifications.forEach(notification => notification.close());
    this.activeNotifications.clear();
  }
} 