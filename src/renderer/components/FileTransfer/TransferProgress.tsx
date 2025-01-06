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
        p: 2,
        mb: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box sx={{ flexGrow: 1, mr: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Typography variant="subtitle2">{transfer.fileName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {progress}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={transfer.status === 'error' ? 'error' : 'primary'}
        />
        {transfer.error && (
          <Typography color="error" variant="caption">
            {transfer.error}
          </Typography>
        )}
      </Box>
      {onCancel && transfer.status === 'transferring' && (
        <IconButton size="small" onClick={onCancel}>
          <CloseIcon />
        </IconButton>
      )}
    </Paper>
  );
};

export default TransferProgress; 