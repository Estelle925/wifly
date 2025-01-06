import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Fade,
  Grid,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  PhoneIphone as PhoneIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Device } from '@/types/device';

interface DeviceListProps {
  devices: Device[];
  onDeviceSelect: (device: Device) => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, onDeviceSelect }) => {
  const { t } = useTranslation();

  if (devices.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          background: 'rgba(26,26,26,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255,255,255,0.7)',
            mb: 1,
          }}
        >
          {t('noDevicesFound')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.5)',
            fontStyle: 'italic',
          }}
        >
          {t('waitingForDevices')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2}>
      {devices.map((device) => (
        <Grid item xs={12} sm={6} md={4} key={device.id}>
          <Paper
            onClick={() => onDeviceSelect(device)}
            sx={{
              p: 3,
              cursor: 'pointer',
              background: 'rgba(26,26,26,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 32px rgba(0,255,245,0.15)',
                border: '1px solid rgba(0,255,245,0.3)',
              }
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#fff',
                mb: 1,
              }}
            >
              {device.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {device.id}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default DeviceList; 