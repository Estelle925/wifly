import { EventEmitter } from 'events';
import { createHash, randomBytes } from 'crypto';
import { Device } from '@/types/device';

interface AuthRequest {
  deviceId: string;
  timestamp: number;
  nonce: string;
  signature: string;
}

interface AuthToken {
  token: string;
  expiresAt: number;
}

export class AuthenticationManager extends EventEmitter {
  private readonly SECRET_KEY: string;
  private authorizedDevices: Map<string, AuthToken>;
  private pendingRequests: Map<string, AuthRequest>;
  private tokenValidityPeriod = 24 * 60 * 60 * 1000; // 24小时

  constructor(secretKey: string) {
    super();
    this.SECRET_KEY = secretKey;
    this.authorizedDevices = new Map();
    this.pendingRequests = new Map();
  }

  // 生成认证请求
  generateAuthRequest(device: Device): AuthRequest {
    const nonce = randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const signature = this.generateSignature(device.id, nonce, timestamp);

    const request: AuthRequest = {
      deviceId: device.id,
      timestamp,
      nonce,
      signature
    };

    this.pendingRequests.set(device.id, request);
    return request;
  }

  // 验证认证请求
  verifyAuthRequest(request: AuthRequest): boolean {
    // 检查时间戳是否在5分钟内
    if (Date.now() - request.timestamp > 5 * 60 * 1000) {
      return false;
    }

    const expectedSignature = this.generateSignature(
      request.deviceId,
      request.nonce,
      request.timestamp
    );

    return request.signature === expectedSignature;
  }

  // 生成认证令牌
  generateAuthToken(deviceId: string): string {
    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + this.tokenValidityPeriod;

    this.authorizedDevices.set(deviceId, { token, expiresAt });
    return token;
  }

  // 验证令牌
  verifyToken(deviceId: string, token: string): boolean {
    const authToken = this.authorizedDevices.get(deviceId);
    if (!authToken) return false;

    // 检查令牌是否过期
    if (Date.now() > authToken.expiresAt) {
      this.authorizedDevices.delete(deviceId);
      return false;
    }

    return authToken.token === token;
  }

  // 生成签名
  private generateSignature(deviceId: string, nonce: string, timestamp: number): string {
    const data = `${deviceId}:${nonce}:${timestamp}:${this.SECRET_KEY}`;
    return createHash('sha256').update(data).digest('hex');
  }

  // 撤销设备授权
  revokeAuthorization(deviceId: string) {
    this.authorizedDevices.delete(deviceId);
    this.emit('deviceRevoked', deviceId);
  }

  // 清理过期的令牌
  cleanupExpiredTokens() {
    const now = Date.now();
    for (const [deviceId, token] of this.authorizedDevices.entries()) {
      if (now > token.expiresAt) {
        this.authorizedDevices.delete(deviceId);
        this.emit('tokenExpired', deviceId);
      }
    }
  }
} 