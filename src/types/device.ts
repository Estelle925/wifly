export interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile';
  os: string;
  ip: string;
  status: 'online' | 'offline';
  lastSeen: number;
}

export interface DeviceInfo {
  name: string;
  type: 'desktop' | 'mobile';
  os: string;
} 