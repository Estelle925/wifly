import { EventEmitter } from 'events';
import { SignalingService } from './SignalingService';
import { Device, DeviceInfo } from '@/types/device';
import { machineId } from 'node-machine-id';
import os from 'os';
import { NetworkScanner } from './NetworkScanner';

// 添加设备分组和过滤功能
interface DeviceGroup {
  id: string;
  name: string;
  devices: string[]; // 设备ID数组
}

export class DeviceDiscoveryService extends EventEmitter {
  private devices: Map<string, Device>;
  private groups: Map<string, DeviceGroup>;
  private networkScanner: NetworkScanner;
  private signalingService: SignalingService;
  private deviceInfo: DeviceInfo;
  private deviceId: string;
  private heartbeatInterval: NodeJS.Timeout | null;

  constructor(signalingService: SignalingService) {
    super();
    this.devices = new Map();
    this.groups = new Map();
    this.networkScanner = new NetworkScanner();
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

  // 添加设备过滤方法
  getFilteredDevices(filters: {
    type?: string;
    os?: string;
    group?: string;
  }): Device[] {
    return Array.from(this.devices.values()).filter(device => {
      if (filters.type && device.type !== filters.type) return false;
      if (filters.os && !device.os.includes(filters.os)) return false;
      if (filters.group && !this.isDeviceInGroup(device.id, filters.group)) return false;
      return true;
    });
  }

  // 设备分组管理
  createGroup(name: string): string {
    const id = `group_${Date.now()}`;
    this.groups.set(id, { id, name, devices: [] });
    return id;
  }

  addDeviceToGroup(deviceId: string, groupId: string) {
    const group = this.groups.get(groupId);
    if (group && !group.devices.includes(deviceId)) {
      group.devices.push(deviceId);
      this.emit('groupUpdated', group);
    }
  }

  private isDeviceInGroup(deviceId: string, groupId: string): boolean {
    return this.groups.get(groupId)?.devices.includes(deviceId) || false;
  }

  // 扫描局域网设备
  async scanLocalNetwork(options?: {
    timeout?: number;
    ipRange?: { start: string; end: string };
  }) {
    try {
      let devices: Device[];
      if (options?.ipRange) {
        devices = await this.networkScanner.scanRange(
          options.ipRange.start,
          options.ipRange.end
        );
      } else {
        devices = await this.networkScanner.scan();
      }

      // 更新设备列表
      devices.forEach(device => {
        this.updateDevice({
          ...device,
          status: 'online',
          lastSeen: Date.now()
        });
      });

      // 发出扫描完成事件
      this.emit('scanComplete', devices);
    } catch (error) {
      console.error('Error scanning network:', error);
      this.emit('scanError', error);
    }
  }
} 