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
    onDrop: onFilesSelected,
  });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 6,
        textAlign: 'center',
        cursor: 'pointer',
        background: isDragActive 
          ? 'linear-gradient(120deg, rgba(132,250,176,0.2) 0%, rgba(143,211,244,0.2) 100%)'
          : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(10px)',
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        borderRadius: 4,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      <input {...getInputProps()} />
      <Box 
        sx={{ 
          mb: 3,
          animation: isDragActive ? 'bounce 1s infinite' : 'none',
          '@keyframes bounce': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' }
          }
        }}
      >
        <CloudUploadIcon 
          sx={{ 
            fontSize: 64, 
            color: 'primary.main',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
          }} 
        />
      </Box>
      <Typography variant="h5" gutterBottom fontWeight="medium">
        {isDragActive ? t('dropzone.drop') : t('dropzone.dragOrClick')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('dropzone.supportedFiles')}
      </Typography>
    </Paper>
  );
};

export default DropZone; 