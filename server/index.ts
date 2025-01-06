import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Device } from '../src/types/device';
import { SignalData } from '../src/types/webrtc';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());

// 存储连接的设备
const connectedDevices = new Map<string, Device>();

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  // 设备注册
  socket.on('register', ({ deviceId }) => {
    socket.data.deviceId = deviceId;
    console.log('Device registered:', deviceId);
  });

  // 处理设备在线状态广播
  socket.on('devicePresence', (device: Device) => {
    connectedDevices.set(device.id, {
      ...device,
      lastSeen: Date.now()
    });
    
    // 广播给其他设备
    socket.broadcast.emit('devicePresence', device);
  });

  // 处理信令数据转发
  socket.on('signal', (signal: SignalData) => {
    const targetSocket = Array.from(io.sockets.sockets.values())
      .find(s => s.data.deviceId === signal.receiver);
    
    if (targetSocket) {
      targetSocket.emit('signal', signal);
    }
  });

  // 处理断开连接
  socket.on('disconnect', () => {
    const deviceId = socket.data.deviceId;
    if (deviceId) {
      connectedDevices.delete(deviceId);
      io.emit('deviceLeft', deviceId);
      console.log('Device disconnected:', deviceId);
    }
  });
});

// 定期清理离线设备
setInterval(() => {
  const now = Date.now();
  for (const [deviceId, device] of connectedDevices.entries()) {
    if (now - device.lastSeen > 15000) { // 15秒没有心跳就清理
      connectedDevices.delete(deviceId);
      io.emit('deviceLeft', deviceId);
    }
  }
}, 5000);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
}); 