import { io, Socket } from 'socket.io-client';
import { SignalData } from '@/types/webrtc';
import { Device } from '@/types/device';
import { EventEmitter } from 'events';

export class SignalingService extends EventEmitter {
  private socket: Socket;
  private deviceId: string;

  constructor(deviceId: string) {
    super();
    this.deviceId = deviceId;
    this.socket = io('http://localhost:3000');
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.socket.on('connect', () => {
      this.socket.emit('register', { deviceId: this.deviceId });
    });

    this.socket.on('signal', (data: SignalData) => {
      this.emit('signal', data);
    });

    this.socket.on('devicePresence', (data: Device) => {
      this.emit('devicePresence', data);
    });

    this.socket.on('deviceLeft', (deviceId: string) => {
      this.emit('deviceLeft', deviceId);
    });
  }

  sendSignal(signal: SignalData) {
    this.socket.emit('signal', signal);
  }

  broadcastPresence(device: Device) {
    this.socket.emit('devicePresence', device);
  }

  disconnect() {
    this.socket.disconnect();
  }
} 