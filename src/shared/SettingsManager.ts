import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { AppSettings, SettingsKey } from '@/types/settings';

export class SettingsManager {
  private settings: AppSettings;
  private settingsPath: string;

  constructor() {
    this.settingsPath = path.join(app.getPath('userData'), 'settings.json');
    this.settings = this.loadSettings();
  }

  private getDefaultSettings(): AppSettings {
    return {
      language: 'zh',
      userName: 'User',
      autoStart: false,
      minimizeToTray: true,
      enableAnimations: true,
      downloadPath: app.getPath('downloads'),
      autoSave: false,
    };
  }

  private loadSettings(): AppSettings {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf-8');
        return { ...this.getDefaultSettings(), ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return this.getDefaultSettings();
  }

  private saveSettings() {
    try {
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  get<T extends SettingsKey>(key: T): AppSettings[T] {
    return this.settings[key];
  }

  set<T extends SettingsKey>(key: T, value: AppSettings[T]) {
    this.settings[key] = value;
    this.saveSettings();
  }

  getAll(): AppSettings {
    return { ...this.settings };
  }

  async setAutoStart(enable: boolean) {
    try {
      app.setLoginItemSettings({
        openAtLogin: enable,
        path: app.getPath('exe'),
      });
      this.set('autoStart', enable);
    } catch (error) {
      console.error('Error setting auto start:', error);
    }
  }
} 