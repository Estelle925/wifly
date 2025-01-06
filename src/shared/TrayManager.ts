import { Tray, Menu, app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { t } from 'i18next';
import { SettingsManager } from './SettingsManager';

export class TrayManager {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow;
  private settingsManager: SettingsManager;

  constructor(mainWindow: BrowserWindow, settingsManager: SettingsManager) {
    this.mainWindow = mainWindow;
    this.settingsManager = settingsManager;
    this.createTray();
  }

  private createTray() {
    try {
      const iconPath = path.join(__dirname, '..', 'assets', 'tray-icon.png');
      this.tray = new Tray(iconPath);
      this.tray.setToolTip('WiFly');
      this.updateContextMenu();
    } catch (error) {
      console.error('Failed to create tray:', error);
      // 使用一个默认的空白图标或内置图标
      const defaultIcon = path.join(__dirname, '..', 'assets', 'default-icon.png');
      this.tray = new Tray(defaultIcon);
    }
  }

  private updateContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: t('tray.show'),
        click: () => this.mainWindow.show(),
      },
      {
        label: t('tray.hide'),
        click: () => this.mainWindow.hide(),
      },
      { type: 'separator' },
      {
        label: t('tray.openDownloadFolder'),
        click: () => {
          shell.openPath(this.settingsManager.get('downloadPath'));
        },
      },
      {
        label: t('tray.settings'),
        submenu: [
          {
            label: t('tray.autoStart'),
            type: 'checkbox',
            checked: this.settingsManager.get('autoStart'),
            click: (item) => {
              this.settingsManager.setAutoStart(item.checked);
            },
          },
          {
            label: t('tray.minimizeToTray'),
            type: 'checkbox',
            checked: this.settingsManager.get('minimizeToTray'),
            click: (item) => {
              this.settingsManager.set('minimizeToTray', item.checked);
            },
          },
        ],
      },
      { type: 'separator' },
      {
        label: t('tray.quit'),
        click: () => app.quit(),
      },
    ]);

    this.tray?.setContextMenu(contextMenu);
  }

  // 更新托盘图标
  updateIcon(isTransferring: boolean) {
    if (!this.tray) return;

    const iconName = isTransferring ? 'tray-icon-active.png' : 'tray-icon.png';
    const iconPath = path.join(__dirname, '..', 'assets', iconName);
    this.tray.setImage(iconPath);
  }

  // 显示气泡通知
  showNotification(title: string, body: string) {
    if (!this.tray) return;

    this.tray.displayBalloon({
      title,
      content: body,
      icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    });
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
} 