import { deflate, inflate } from 'pako';

export class CompressionManager {
  // 压缩阈值,小于这个大小的数据不压缩
  private static readonly COMPRESSION_THRESHOLD = 1024; // 1KB
  
  // 压缩数据
  static async compress(data: Uint8Array): Promise<{
    compressed: Uint8Array;
    originalSize: number;
    compressionRatio: number;
  }> {
    if (data.length < this.COMPRESSION_THRESHOLD) {
      return {
        compressed: data,
        originalSize: data.length,
        compressionRatio: 1
      };
    }

    try {
      const compressed = deflate(data);
      return {
        compressed,
        originalSize: data.length,
        compressionRatio: compressed.length / data.length
      };
    } catch (error) {
      console.error('Compression failed:', error);
      return {
        compressed: data,
        originalSize: data.length,
        compressionRatio: 1
      };
    }
  }

  // 解压数据
  static async decompress(data: Uint8Array): Promise<Uint8Array> {
    try {
      return inflate(data);
    } catch (error) {
      console.error('Decompression failed:', error);
      return data;
    }
  }

  // 判断是否值得压缩
  static shouldCompress(data: Uint8Array): boolean {
    // 检查文件类型,某些文件类型已经是压缩格式
    const header = data.slice(0, 4);
    const compressedTypes = [
      [0x1f, 0x8b], // gzip
      [0x50, 0x4b], // zip
      [0xff, 0xd8], // jpeg
      [0x89, 0x50], // png
    ];

    for (const signature of compressedTypes) {
      if (header[0] === signature[0] && header[1] === signature[1]) {
        return false;
      }
    }

    return data.length >= this.COMPRESSION_THRESHOLD;
  }
} 