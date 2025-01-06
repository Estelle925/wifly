import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Paper,
} from '@mui/material';
import { Computer as ComputerIcon } from '@mui/icons-material';
import { Device } from '@/types/device';
import { useTranslation } from 'react-i18next';

interface DeviceListProps {
  devices: Device[];
  onDeviceSelect: (device: Device) => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, onDeviceSelect }) => {
  const { t } = useTranslation();

  return (
    <Paper 
      elevation={3}
      sx={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(10px)',
        borderRadius: 4,
        overflow: 'hidden'
      }}
    >
      <List sx={{ width: '100%' }}>
        {devices.length === 0 ? (
          <ListItem sx={{ py: 4 }}>
            <ListItemText
              primary={
                <Typography variant="h6" align="center" color="text.secondary">
                  {t('noDevicesFound')}
                </Typography>
              }
              secondary={
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
                  {t('waitingForDevices')}
                </Typography>
              }
            />
          </ListItem>
        ) : (
          devices.map((device) => (
            <ListItem
              key={device.id}
              button
              onClick={() => onDeviceSelect(device)}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateX(8px)',
                  bgcolor: 'rgba(132, 250, 176, 0.1)',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    background: 'linear-gradient(45deg, #84fab0 30%, #8fd3f4 90%)',
                  }}
                >
                  <ComputerIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight="medium">
                    {device.name}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    {device.os} • {device.ip}
                  </Typography>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
};

export default DeviceList; 