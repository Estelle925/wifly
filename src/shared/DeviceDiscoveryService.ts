import { EventEmitter } from 'events';
import { SignalingService } from './SignalingService';
import { Device, DeviceInfo } from '@/types/device';
import { machineId } from 'node-machine-id';
import os from 'os';

export class DeviceDiscoveryService extends EventEmitter {
  private devices: Map<string, Device>;
  private signalingService: SignalingService;
  private deviceInfo: DeviceInfo;
  private deviceId: string;
  private heartbeatInterval: NodeJS.Timeout | null;

  constructor(signalingService: SignalingService) {
    super();
    this.devices = new Map();
    this.signalingService = signalingService;
    this.deviceId = '';
    this.deviceInfo = this.getDeviceInfo();
    this.heartbeatInterval = null;
  }

  // 初始化设备发现服务
  async initialize() {
    try {
      this.deviceId = await machineId();
      this.setupSignalingHandlers();
      this.startHeartbeat();
      await this.broadcastPresence();
    } catch (error) {
      console.error('Failed to initialize device discovery:', error);
    }
  }

  // 获取本机设备信息
  private getDeviceInfo(): DeviceInfo {
    return {
      name: os.hostname(),
      type: 'desktop',
      os: `${os.platform()} ${os.release()}`,
    };
  }

  // 设置信令处理程序
  private setupSignalingHandlers() {
    this.signalingService.on('devicePresence', (device: Device) => {
      if (device.id !== this.deviceId) {
        this.updateDevice(device);
      }
    });

    this.signalingService.on('deviceLeft', (deviceId: string) => {
      this.removeDevice(deviceId);
    });
  }

  // 开始心跳检测
  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      this.broadcastPresence();
      this.cleanupOfflineDevices();
    }, 5000); // 每5秒发送一次心跳
  }

  // 广播设备在线状态
  private async broadcastPresence() {
    const device: Device = {
      id: this.deviceId,
      ...this.deviceInfo,
      ip: this.getLocalIP(),
      status: 'online',
      lastSeen: Date.now(),
    };

    this.signalingService.emit('devicePresence', device);
  }

  // 获取本机IP地址
  private getLocalIP(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const interface_ of interfaces[name] || []) {
        if (interface_.family === 'IPv4' && !interface_.internal) {
          return interface_.address;
        }
      }
    }
    return 'unknown';
  }

  // 更新设备信息
  private updateDevice(device: Device) {
    this.devices.set(device.id, device);
    this.emit('deviceUpdated', device);
  }

  // 移除设备
  private removeDevice(deviceId: string) {
    const device = this.devices.get(deviceId);
    if (device) {
      device.status = 'offline';
      this.emit('deviceUpdated', device);
      this.devices.delete(deviceId);
    }
  }

  // 清理离线设备
  private cleanupOfflineDevices() {
    const now = Date.now();
    for (const [deviceId, device] of this.devices.entries()) {
      if (now - device.lastSeen > 15000) { // 15秒没有心跳就认为设备离线
        this.removeDevice(deviceId);
      }
    }
  }

  // 获取所有在线设备
  getOnlineDevices(): Device[] {
    return Array.from(this.devices.values())
      .filter(device => device.status === 'online');
  }

  // 获取指定设备
  getDevice(deviceId: string): Device | undefined {
    return this.devices.get(deviceId);
  }

  // 停止设备发现服务
  stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
} 