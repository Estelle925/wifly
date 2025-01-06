import { app } from 'electron';
import * as fs from 'fs';
import path from 'path';
import { FileProgress } from './FileTransferManager';

export interface TransferRecord {
  id: string;
  fileName: string;
  size: number;
  type: 'send' | 'receive';
  status: FileProgress['status'];
  timestamp: number;
  deviceName: string;
  error?: string;
}

export class TransferHistoryManager {
  private historyFile: string;
  private history: TransferRecord[] = [];
  private maxHistoryItems = 1000;

  constructor() {
    // 获取应用数据目录
    const userDataPath = app.getPath('userData');
    this.historyFile = path.join(userDataPath, 'transfer-history.json');
    
    // 确保目录存在
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists() {
    const dir = path.dirname(this.historyFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 如果历史文件不存在，创建一个空的
    if (!fs.existsSync(this.historyFile)) {
      fs.writeFileSync(this.historyFile, '[]', 'utf8');
    }
  }

  private async loadHistory() {
    try {
      const data = await fs.promises.readFile(this.historyFile, 'utf-8');
      this.history = JSON.parse(data);
    } catch (error) {
      console.error('Error loading transfer history:', error);
      this.history = [];
    }
  }

  private async saveHistory() {
    try {
      await fs.promises.writeFile(this.historyFile, JSON.stringify(this.history));
    } catch (error) {
      console.error('Error saving transfer history:', error);
    }
  }

  async addRecord(record: Omit<TransferRecord, 'timestamp'>) {
    const newRecord: TransferRecord = {
      ...record,
      timestamp: Date.now(),
    };

    this.history.unshift(newRecord);
    
    // 限制历史记录数量
    if (this.history.length > this.maxHistoryItems) {
      this.history = this.history.slice(0, this.maxHistoryItems);
    }

    await this.saveHistory();
  }

  async getHistory(limit = 50, offset = 0): Promise<TransferRecord[]> {
    return this.history.slice(offset, offset + limit);
  }

  async clearHistory(): Promise<void> {
    this.history = [];
    await this.saveHistory();
  }

  async exportHistory(): Promise<string> {
    return JSON.stringify(this.history, null, 2);
  }

  async importHistory(data: string): Promise<void> {
    try {
      const importedHistory = JSON.parse(data);
      if (!Array.isArray(importedHistory)) {
        throw new Error('Invalid history data format');
      }

      // 验证和清理导入的数据
      const validRecords = importedHistory.filter(record => {
        return (
          record.id &&
          record.fileName &&
          record.size &&
          record.type &&
          record.status &&
          record.timestamp &&
          record.deviceName
        );
      });

      this.history = [...validRecords, ...this.history]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.maxHistoryItems);

      await this.saveHistory();
    } catch (error) {
      console.error('Error importing history:', error);
      throw error;
    }
  }

  async deleteRecord(id: string): Promise<void> {
    this.history = this.history.filter(record => record.id !== id);
    await this.saveHistory();
  }
} 