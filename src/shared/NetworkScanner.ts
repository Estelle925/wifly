import { Device } from '@/types/device';
import { networkInterfaces } from 'os';
import * as dgram from 'dgram';
import * as dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

export class NetworkScanner {
  private socket: dgram.Socket;
  private discoveredDevices: Map<string, Device>;
  private scanTimeout: number = 3000; // 3秒超时

  constructor() {
    this.socket = dgram.createSocket('udp4');
    this.discoveredDevices = new Map();
    this.setupSocket();
  }

  private setupSocket() {
    this.socket.on('message', async (msg, rinfo) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.type === 'DISCOVERY_RESPONSE') {
          const device: Device = {
            id: data.deviceId,
            name: data.deviceName,
            type: data.deviceType,
            os: data.os,
            ip: rinfo.address,
            status: 'online',
            lastSeen: Date.now()
          };
          this.discoveredDevices.set(device.id, device);
        }
      } catch (error) {
        console.error('Error parsing discovery response:', error);
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  async scan(): Promise<Device[]> {
    this.discoveredDevices.clear();

    // 获取所有本地网络接口
    const interfaces = networkInterfaces();
    const broadcastAddresses: string[] = [];

    // 收集所有广播地址
    Object.values(interfaces).forEach((iface) => {
      iface?.forEach((addr) => {
        if (addr.family === 'IPv4' && !addr.internal) {
          const parts = addr.address.split('.');
          broadcastAddresses.push(`${parts[0]}.${parts[1]}.${parts[2]}.255`);
        }
      });
    });

    // 发送发现请求到所有广播地址
    const discoveryMessage = JSON.stringify({
      type: 'DISCOVERY_REQUEST',
      timestamp: Date.now()
    });

    for (const address of broadcastAddresses) {
      try {
        this.socket.send(discoveryMessage, 0, discoveryMessage.length, 35939, address);
      } catch (error) {
        console.error(`Error sending discovery request to ${address}:`, error);
      }
    }

    // 等待响应
    await new Promise(resolve => setTimeout(resolve, this.scanTimeout));

    return Array.from(this.discoveredDevices.values());
  }

  // 扫描指定IP范围
  async scanRange(startIp: string, endIp: string): Promise<Device[]> {
    const start = this.ipToLong(startIp);
    const end = this.ipToLong(endIp);
    
    for (let ip = start; ip <= end; ip++) {
      const currentIp = this.longToIp(ip);
      try {
        const hostname = await lookup(currentIp);
        if (hostname) {
          const device: Device = {
            id: `${currentIp}_${Date.now()}`,
            name: hostname.address || currentIp,
            type: 'desktop',
            os: 'unknown',
            ip: currentIp,
            status: 'online',
            lastSeen: Date.now()
          };
          this.discoveredDevices.set(device.id, device);
        }
      } catch (error) {
        // 忽略查找失败的IP
        continue;
      }
    }

    return Array.from(this.discoveredDevices.values());
  }

  private ipToLong(ip: string): number {
    const parts = ip.split('.');
    return ((parseInt(parts[0]) << 24) |
            (parseInt(parts[1]) << 16) |
            (parseInt(parts[2]) << 8) |
            parseInt(parts[3])) >>> 0;
  }

  private longToIp(long: number): string {
    return [
      (long >>> 24) & 0xFF,
      (long >>> 16) & 0xFF,
      (long >>> 8) & 0xFF,
      long & 0xFF
    ].join('.');
  }

  close() {
    this.socket.close();
  }
} 