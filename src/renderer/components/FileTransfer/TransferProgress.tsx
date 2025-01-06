import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { FileProgress } from '@/shared/FileTransferManager';

interface TransferProgressProps {
  transfer: FileProgress;
  onCancel?: () => void;
}

const TransferProgress: React.FC<TransferProgressProps> = ({
  transfer,
  onCancel,
}) => {
  const progress = Math.round(transfer.progress * 100);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(26,26,26,0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        border: '1px solid rgba(0,255,245,0.1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 0 30px rgba(0,255,245,0.2)',
          border: '1px solid rgba(0,255,245,0.3)',
        }
      }}
    >
      <Box sx={{ flexGrow: 1, mr: 2 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 1.5,
          alignItems: 'center'
        }}>
          <Typography 
            variant="subtitle1" 
            sx={{
              fontWeight: 500,
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 0 10px rgba(0,255,245,0.3)'
            }}
          >
            {transfer.fileName}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{
              fontWeight: 600,
              color: transfer.status === 'error' ? '#ff0099' : '#00fff5',
              textShadow: transfer.status === 'error' 
                ? '0 0 10px rgba(255,0,153,0.5)'
                : '0 0 10px rgba(0,255,245,0.5)',
              transition: 'all 0.3s ease'
            }}
          >
            {progress}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              backgroundImage: transfer.status === 'error' 
                ? 'linear-gradient(to right, #ff0099, #ff56c1)'
                : 'linear-gradient(to right, #00fff5, #5ffffa)',
              boxShadow: transfer.status === 'error'
                ? '0 0 20px rgba(255,0,153,0.5)'
                : '0 0 20px rgba(0,255,245,0.5)'
            }
          }}
        />
        {transfer.error && (
          <Typography 
            color="#ff0099" 
            variant="caption" 
            sx={{ 
              mt: 1, 
              display: 'block',
              opacity: 0.9,
              textShadow: '0 0 10px rgba(255,0,153,0.3)'
            }}
          >
            {transfer.error}
          </Typography>
        )}
      </Box>
      {onCancel && transfer.status === 'transferring' && (
        <IconButton 
          size="small"
          onClick={onCancel}
          sx={{
            color: 'rgba(255,255,255,0.7)',
            '&:hover': {
              color: '#ff0099',
              transform: 'rotate(90deg) scale(1.1)',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 20px rgba(255,0,153,0.5)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
    </Paper>
  );
};

export default TransferProgress; 