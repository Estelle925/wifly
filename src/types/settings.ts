export interface AppSettings {
  language: string;
  userName: string;
  autoStart: boolean;
  minimizeToTray: boolean;
  enableAnimations: boolean;
  downloadPath: string;
  autoSave: boolean;
}

export type SettingsKey = keyof AppSettings; 