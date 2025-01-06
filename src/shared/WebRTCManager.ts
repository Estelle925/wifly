import { PeerConnection, SignalData, FileTransferData } from '@/types/webrtc';
import { EventEmitter } from 'events';

export class WebRTCManager extends EventEmitter {
  private connections: Map<string, PeerConnection>;
  private configuration: RTCConfiguration;

  constructor() {
    super();
    this.connections = new Map();
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
  }

  // 创建新的对等连接
  async createPeerConnection(peerId: string, peerName: string): Promise<PeerConnection> {
    const connection = new RTCPeerConnection(this.configuration);
    const dataChannel = connection.createDataChannel('fileTransfer');
    
    const peer: PeerConnection = {
      id: peerId,
      name: peerName,
      connection,
      dataChannel,
    };

    this.setupConnectionHandlers(peer);
    this.connections.set(peerId, peer);
    return peer;
  }

  // 设置连接事件处理
  private setupConnectionHandlers(peer: PeerConnection) {
    peer.connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('iceCandidate', {
          type: 'candidate',
          sender: peer.id,
          data: event.candidate,
        });
      }
    };

    peer.connection.onconnectionstatechange = () => {
      this.emit('connectionStateChange', {
        peerId: peer.id,
        state: peer.connection.connectionState,
      });
    };

    if (peer.dataChannel) {
      this.setupDataChannelHandlers(peer.dataChannel, peer.id);
    }

    peer.connection.ondatachannel = (event) => {
      peer.dataChannel = event.channel;
      this.setupDataChannelHandlers(event.channel, peer.id);
    };
  }

  // 设置数据通道事件处理
  private setupDataChannelHandlers(channel: RTCDataChannel, peerId: string) {
    channel.onopen = () => {
      this.emit('dataChannelOpen', { peerId });
    };

    channel.onclose = () => {
      this.emit('dataChannelClose', { peerId });
    };

    channel.onmessage = (event) => {
      const data: FileTransferData = JSON.parse(event.data);
      this.emit('dataReceived', { peerId, data });
    };
  }

  // 处理信令数据
  async handleSignalData(signal: SignalData) {
    const peer = this.connections.get(signal.sender);
    
    if (!peer) {
      console.error('No peer connection found for:', signal.sender);
      return;
    }

    try {
      if (signal.type === 'offer') {
        await peer.connection.setRemoteDescription(new RTCSessionDescription(signal.data));
        const answer = await peer.connection.createAnswer();
        await peer.connection.setLocalDescription(answer);
        this.emit('answer', {
          type: 'answer',
          sender: peer.id,
          data: answer,
        });
      } else if (signal.type === 'answer') {
        await peer.connection.setRemoteDescription(new RTCSessionDescription(signal.data));
      } else if (signal.type === 'candidate') {
        await peer.connection.addIceCandidate(new RTCIceCandidate(signal.data));
      }
    } catch (error) {
      console.error('Error handling signal:', error);
    }
  }

  // 发送数据
  sendData(peerId: string, data: FileTransferData) {
    const peer = this.connections.get(peerId);
    if (peer?.dataChannel?.readyState === 'open') {
      peer.dataChannel.send(JSON.stringify(data));
    }
  }

  // 关闭连接
  closePeerConnection(peerId: string) {
    const peer = this.connections.get(peerId);
    if (peer) {
      if (peer.dataChannel) {
        peer.dataChannel.close();
      }
      peer.connection.close();
      this.connections.delete(peerId);
    }
  }

  // 获取所有连接
  getAllConnections(): PeerConnection[] {
    return Array.from(this.connections.values());
  }

  async createDataChannel(deviceId: string, channelId: string): Promise<RTCDataChannel> {
    const peer = this.connections.get(deviceId);
    if (!peer) {
      throw new Error('No connection found for device');
    }

    const channel = peer.connection.createDataChannel(channelId);
    return channel;
  }
} 