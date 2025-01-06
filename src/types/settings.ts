export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoStart: boolean;
  minimizeToTray: boolean;
  enableAnimations: boolean;
  downloadPath: string;
  autoSave: boolean;
}

export type SettingsKey = keyof AppSettings; 