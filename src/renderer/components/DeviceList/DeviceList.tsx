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
    <Paper elevation={2}>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {devices.length === 0 ? (
          <ListItem>
            <ListItemText
              primary={t('noDevicesFound')}
              secondary={t('waitingForDevices')}
            />
          </ListItem>
        ) : (
          devices.map((device) => (
            <ListItem
              key={device.id}
              button
              onClick={() => onDeviceSelect(device)}
              sx={{
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <ComputerIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={device.name}
                secondary={
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {device.os} - {device.ip}
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