import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  DeleteOutline as DeleteOutlineIcon,
  ImportExport as ImportExportIcon,
  GetApp as GetAppIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { IpcRendererManager } from '@/shared/IpcManager';
import { TransferRecord } from '@/shared/TransferHistoryManager';

const TransferHistory: React.FC = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<TransferRecord[]>([]);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRecord, setSelectedRecord] = useState<TransferRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadHistory = async () => {
    try {
      const records = await IpcRendererManager.invoke('history:get', 50, 0);
      setHistory(records);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearHistory = async () => {
    try {
      await IpcRendererManager.invoke('history:clear');
      setHistory([]);
      setClearDialogOpen(false);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const getStatusIcon = (status: TransferRecord['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleExportHistory = async () => {
    try {
      const data = await IpcRendererManager.invoke('history:export');
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transfer-history-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting history:', error);
      // TODO: 显示错误提示
    }
  };

  const handleImportHistory = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.text();
      await IpcRendererManager.invoke('history:import', data);
      await loadHistory(); // 重新加载历史记录
    } catch (error) {
      console.error('Error importing history:', error);
      // TODO: 显示错误提示
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await IpcRendererManager.invoke('history:delete', id);
      setHistory(prev => prev.filter(record => record.id !== id));
    } catch (error) {
      console.error('Error deleting record:', error);
      // TODO: 显示错误提示
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>{t('common.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{t('history.title')}</Typography>
        <Box>
          <IconButton
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            disabled={history.length === 0}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={handleExportHistory}>
              <ListItemIcon>
                <GetAppIcon fontSize="small" />
              </ListItemIcon>
              {t('history.export')}
            </MenuItem>
            <MenuItem onClick={() => fileInputRef.current?.click()}>
              <ListItemIcon>
                <UploadIcon fontSize="small" />
              </ListItemIcon>
              {t('history.import')}
            </MenuItem>
            <MenuItem onClick={() => setClearDialogOpen(true)} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <DeleteOutlineIcon fontSize="small" color="error" />
              </ListItemIcon>
              {t('history.clear')}
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {history.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('history.empty')}</Typography>
        </Box>
      ) : (
        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
          {history.map((record) => (
            <ListItem
              key={record.id}
              divider
              secondaryAction={getStatusIcon(record.status)}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {record.type === 'send' ? <UploadIcon /> : <DownloadIcon />}
                    <Typography>{record.fileName}</Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(record.timestamp)} - {formatFileSize(record.size)}
                    </Typography>
                    <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                      <Chip
                        size="small"
                        label={t(`history.type.${record.type}`)}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={record.deviceName}
                        variant="outlined"
                      />
                    </Box>
                    {record.error && (
                      <Typography
                        variant="body2"
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        {record.error}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
      >
        <DialogTitle>{t('history.clearConfirm.title')}</DialogTitle>
        <DialogContent>
          <Typography>{t('history.clearConfirm.message')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleClearHistory}
            color="error"
            variant="contained"
          >
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleImportHistory}
      />
    </Paper>
  );
};

export default TransferHistory; 