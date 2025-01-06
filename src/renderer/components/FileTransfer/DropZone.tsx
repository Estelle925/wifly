import React, { useCallback } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected }) => {
  const { t } = useTranslation();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
  });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 3,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
      }}
    >
      <input {...getInputProps()} />
      <Box sx={{ mb: 2 }}>
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
      </Box>
      <Typography variant="h6" gutterBottom>
        {isDragActive
          ? t('dropzone.drop')
          : t('dropzone.dragOrClick')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('dropzone.supportedFiles')}
      </Typography>
    </Paper>
  );
};

export default DropZone; 