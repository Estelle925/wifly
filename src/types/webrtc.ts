export interface PeerConnection {
  id: string;
  name: string;
  connection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
}

export interface SignalData {
  type: 'offer' | 'answer' | 'candidate';
  sender: string;
  receiver: string;
  data: any;
}

export interface FileTransferData {
  type: 'meta' | 'chunk' | 'complete';
  fileId: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  chunk?: ArrayBuffer;
  chunkIndex?: number;
  totalChunks?: number;
} 