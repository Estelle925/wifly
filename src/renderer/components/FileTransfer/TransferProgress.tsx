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
      sx={{
        p: 3,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateX(4px)'
        }
      }}
    >
      <Box sx={{ flexGrow: 1, mr: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 1.5,
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium">
            {transfer.fileName}
          </Typography>
          <Typography 
            variant="h6" 
            color={transfer.status === 'error' ? 'error' : 'primary'}
            sx={{ fontWeight: 'bold' }}
          >
            {progress}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={transfer.status === 'error' ? 'error' : 'primary'}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'rgba(0,0,0,0.05)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundImage: 'linear-gradient(to right, #84fab0, #8fd3f4)'
            }
          }}
        />
        {transfer.error && (
          <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
            {transfer.error}
          </Typography>
        )}
      </Box>
      {onCancel && transfer.status === 'transferring' && (
        <IconButton 
          size="small" 
          onClick={onCancel}
          sx={{
            '&:hover': {
              color: 'error.main',
              transform: 'scale(1.1)'
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