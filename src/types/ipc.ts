import { AppSettings } from './settings';
import { FileProgress } from '@/shared/FileTransferManager';
import { TransferRecord } from '@/shared/TransferHistoryManager';

export interface IpcEvents {
  // 设置相关
  'settings:get': () => AppSettings;
  'settings:set': (settings: Partial<AppSettings>) => void;
  'settings:changed': (settings: AppSettings) => void;
  
  // 文件传输相关
  'file:select': () => string[];
  'file:save-path': () => string;
  'file:save': (data: { fileName: string; content: Buffer }) => void;
  'file:send': (data: { files: File[]; deviceId: string }) => void;
  'file:receive': (data: { fileId: string; fileName: string; size: number }) => void;
  'file:progress': (progress: FileProgress) => void;
  'file:cancel': (fileId: string) => void;
  'file:error': (data: { fileId: string; error: string }) => void;
  
  // 系统相关
  'app:minimize': () => void;
  'app:quit': () => void;
  
  // 历史记录相关
  'history:get': (limit: number, offset: number) => TransferRecord[];
  'history:clear': () => void;
  'history:delete': (id: string) => void;
  'history:export': () => string;
  'history:import': (data: string) => void;
}

export type IpcChannel = keyof IpcEvents; 