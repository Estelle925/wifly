import { Tray, Menu, BrowserWindow, nativeImage } from 'electron';
import { SettingsManager } from './SettingsManager';

export class TrayManager {
  private tray: Tray | null = null;
  private window: BrowserWindow;
  private settingsManager: SettingsManager;

  constructor(window: BrowserWindow, settingsManager: SettingsManager) {
    this.window = window;
    this.settingsManager = settingsManager;
    this.createTray();
  }

  private createTray() {
    // 创建一个简单的图标
    const icon = nativeImage.createFromDataURL(`
      data:image/png;base64,
      iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABSdEVYdENvcHlyaWdodABDQzAgUHVibGljIERvbWFpbiBEZWRpY2F0aW9uIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL3B1YmxpY2RvbWFpbi96ZXJvLzEuMC/g6u7RAAAAB3RJTUUH5QQQCQkjvgk3IAAAADFJREFUOMtjYBgF9AH/gfg/BebDxBgZGRkYGRgYGP79+8fAwMDAyMTExAjX9H8UUAcAAO8LCwwUHAkKAAAAAElFTkSuQmCC
    `);
    
    this.tray = new Tray(icon);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示窗口',
        click: () => {
          this.window.show();
        },
      },
      {
        label: '退出',
        click: () => {
          this.window.destroy();
          if (this.tray) {
            this.tray.destroy();
          }
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('WiFly');
  }

  updateIcon(isActive: boolean) {
    // 移除自定义图标切换逻辑
  }

  showNotification(title: string, body: string) {
    if (this.tray) {
      this.tray.displayBalloon({
        title,
        content: body,
      });
    }
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
} 