import { app } from 'electron';
import fs from 'fs/promises';
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
  private historyPath: string;
  private history: TransferRecord[] = [];
  private maxHistoryItems = 1000;

  constructor() {
    this.historyPath = path.join(app.getPath('userData'), 'transfer-history.json');
    this.loadHistory();
  }

  private async loadHistory() {
    try {
      const data = await fs.readFile(this.historyPath, 'utf-8');
      this.history = JSON.parse(data);
    } catch (error) {
      console.error('Error loading transfer history:', error);
      this.history = [];
    }
  }

  private async saveHistory() {
    try {
      await fs.writeFile(this.historyPath, JSON.stringify(this.history));
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