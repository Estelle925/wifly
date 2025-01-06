import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export class FileSystemManager {
  private defaultDownloadPath: string;

  constructor() {
    this.defaultDownloadPath = app.getPath('downloads');
  }

  async saveFile(
    blob: Blob,
    fileName: string,
    customPath?: string
  ): Promise<string> {
    const savePath = customPath || this.defaultDownloadPath;
    const filePath = path.join(savePath, fileName);

    // 确保文件名不重复
    const uniqueFilePath = await this.getUniqueFilePath(filePath);

    try {
      // 将 Blob 转换为 Buffer
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 确保目录存在
      await fs.promises.mkdir(path.dirname(uniqueFilePath), { recursive: true });

      // 写入文件
      await fs.promises.writeFile(uniqueFilePath, buffer);

      return uniqueFilePath;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  private async getUniqueFilePath(originalPath: string): Promise<string> {
    const dir = path.dirname(originalPath);
    const ext = path.extname(originalPath);
    const baseName = path.basename(originalPath, ext);
    let filePath = originalPath;
    let counter = 1;

    while (await this.fileExists(filePath)) {
      filePath = path.join(dir, `${baseName} (${counter})${ext}`);
      counter++;
    }

    return filePath;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
      throw error;
    }
  }
} 