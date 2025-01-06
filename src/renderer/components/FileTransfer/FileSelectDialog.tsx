import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import DropZone from './DropZone';
import { Device } from '@/types/device';

interface FileSelectDialogProps {
  open: boolean;
  device: Device;
  onClose: () => void;
  onFilesSelected: (files: File[]) => void;
}

const FileSelectDialog: React.FC<FileSelectDialogProps> = ({
  open,
  device,
  onClose,
  onFilesSelected,
}) => {
  const { t } = useTranslation();

  const handleFilesSelected = (files: File[]) => {
    onFilesSelected(files);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('fileSelect.title', { deviceName: device.name })}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <DropZone onFilesSelected={handleFilesSelected} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileSelectDialog; 