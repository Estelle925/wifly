import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import MainLayout from './components/Layout/MainLayout';
import DeviceList from './components/DeviceList/DeviceList';
import TransferProgress from './components/FileTransfer/TransferProgress';
import { Device } from '@/types/device';
import { FileProgress } from '@/shared/FileTransferManager';
import SettingsDialog from './components/Settings/SettingsDialog';
import { AppSettings } from '@/types/settings';
import { IpcRendererManager } from '@/shared/IpcManager';
import FileSelectDialog from './components/FileTransfer/FileSelectDialog';
import TransferHistory from './components/History/TransferHistory';
import { useTranslation } from 'react-i18next';

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const [devices, setDevices] = useState<Device[]>([]);
  const [transfers, setTransfers] = useState<FileProgress[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    language: 'zh',
    userName: 'User',
    autoStart: false,
    minimizeToTray: true,
    enableAnimations: true,
    downloadPath: '',
    autoSave: false,
  });
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [fileSelectOpen, setFileSelectOpen] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await IpcRendererManager.invoke('settings:get');
      setSettings(savedSettings);
      i18n.changeLanguage(savedSettings.language);
    };

    loadSettings();

    const unsubscribe = IpcRendererManager.on('settings:changed', (_, newSettings) => {
      setSettings(newSettings);
    });

    return () => {
      unsubscribe();
    };
  }, [i18n]);

  // 监听文件传输进度
  useEffect(() => {
    const unsubscribeProgress = IpcRendererManager.on('file:progress', (_, progress) => {
      setTransfers((prev) => {
        const index = prev.findIndex((t) => t.fileId === progress.fileId);
        if (index === -1) {
          return [...prev, progress];
        }
        const newTransfers = [...prev];
        newTransfers[index] = progress;
        return newTransfers;
      });
    });

    const unsubscribeError = IpcRendererManager.on('file:error', (_, { fileId, error }) => {
      setTransfers((prev) => {
        const index = prev.findIndex((t) => t.fileId === fileId);
        if (index === -1) return prev;
        const newTransfers = [...prev];
        newTransfers[index] = {
          ...newTransfers[index],
          status: 'error',
          error,
        };
        return newTransfers;
      });
    });

    return () => {
      unsubscribeProgress();
      unsubscribeError();
    };
  }, []);

  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    await IpcRendererManager.invoke('settings:set', newSettings);
  };

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setFileSelectOpen(true);
  };

  const handleFilesSelected = async (files: File[]) => {
    if (!selectedDevice) return;
    
    try {
      await IpcRendererManager.invoke('file:send', {
        files,
        deviceId: selectedDevice.id,
      });
    } catch (error) {
      console.error('Error sending files:', error);
      // TODO: 显示错误提示
    }
  };

  const handleCancelTransfer = async (fileId: string) => {
    try {
      await IpcRendererManager.invoke('file:cancel', fileId);
    } catch (error) {
      console.error('Error canceling transfer:', error);
    }
  };

  return (
    <MainLayout 
      onOpenSettings={handleOpenSettings}
      userName={settings.userName}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <DeviceList
            devices={devices}
            onDeviceSelect={handleDeviceSelect}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          {transfers.map((transfer) => (
            <TransferProgress
              key={transfer.fileId}
              transfer={transfer}
              onCancel={() => handleCancelTransfer(transfer.fileId)}
            />
          ))}
        </Box>
        <Box sx={{ height: 400 }}>
          <TransferHistory />
        </Box>
        <FileSelectDialog
          open={fileSelectOpen}
          device={selectedDevice}
          onClose={() => setFileSelectOpen(false)}
          onFilesSelected={handleFilesSelected}
        />
      </Container>
      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </MainLayout>
  );
};

export default App; 