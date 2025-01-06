import { Socket } from 'socket.io';
import { Device } from '../src/types/device';

export interface ServerToClientEvents {
  signal: (data: any) => void;
  devicePresence: (device: Device) => void;
  deviceLeft: (deviceId: string) => void;
}

export interface ClientToServerEvents {
  register: (data: { deviceId: string }) => void;
  signal: (data: any) => void;
  devicePresence: (device: Device) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  deviceId: string;
}

export type SignalingSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>; 