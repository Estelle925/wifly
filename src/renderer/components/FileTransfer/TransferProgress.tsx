import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Pause as PauseIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { FileProgress } from '@/shared/FileTransferManager';

interface TransferProgressProps {
  transfer: FileProgress;
  onCancel?: (fileId: string) => void;
  onPause?: (fileId: string) => void;
  onResume?: (fileId: string) => void;
}

const TransferProgress: React.FC<TransferProgressProps> = ({
  transfer,
  onCancel,
  onPause,
  onResume,
}) => {
  const formatSpeed = (bytesPerSecond: number) => {
    if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(1)} B/s`;
    if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        background: 'rgba(26,26,26,0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: 3,
        border: '1px solid rgba(0,255,245,0.1)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1">{transfer.fileName}</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {transfer.speed != null && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {formatSpeed(transfer.speed)}
            </Typography>
          )}
          {transfer.remainingTime != null && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {formatTime(transfer.remainingTime)} remaining
            </Typography>
          )}
          <Typography variant="h6" sx={{ color: '#00fff5' }}>
            {Math.round(transfer.progress * 100)}%
          </Typography>
        </Box>
      </Box>
      
      <LinearProgress
        variant="determinate"
        value={transfer.progress * 100}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: 'rgba(255,255,255,0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
            backgroundImage: 'linear-gradient(to right, #00fff5, #5ffffa)',
          }
        }}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        {transfer.status === 'transferring' && (
          <>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                onPause?.(transfer.fileId);
              }}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              <PauseIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onCancel?.(transfer.fileId)}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              <CloseIcon />
            </IconButton>
          </>
        )}
        {transfer.status === 'paused' && (
          <IconButton
            size="small"
            onClick={() => onResume?.(transfer.fileId)}
            sx={{ color: '#00fff5' }}
          >
            <PlayArrowIcon />
          </IconButton>
        )}
      </Box>
    </Paper>
  );
};

export default TransferProgress; 