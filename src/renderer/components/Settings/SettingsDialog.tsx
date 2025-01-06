import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppSettings } from '@/types/settings';

interface SettingsDialogProps {
  open: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  settings,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [localSettings, setLocalSettings] = React.useState<AppSettings>(settings);

  const handleChange = <T extends keyof AppSettings>(
    key: T,
    value: AppSettings[T]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('settings.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('settings.theme')}
            </Typography>
            <Select
              value={localSettings.theme}
              onChange={(e) => handleChange('theme', e.target.value as AppSettings['theme'])}
            >
              <MenuItem value="light">{t('settings.theme.light')}</MenuItem>
              <MenuItem value="dark">{t('settings.theme.dark')}</MenuItem>
              <MenuItem value="system">{t('settings.theme.system')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('settings.language')}
            </Typography>
            <Select
              value={localSettings.language}
              onChange={(e) => handleChange('language', e.target.value as string)}
            >
              <MenuItem value="zh">中文</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('settings.downloadPath')}
            </Typography>
            <TextField
              value={localSettings.downloadPath}
              onChange={(e) => handleChange('downloadPath', e.target.value)}
              fullWidth
            />
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={localSettings.autoStart}
                onChange={(e) => handleChange('autoStart', e.target.checked)}
              />
            }
            label={t('settings.autoStart')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={localSettings.minimizeToTray}
                onChange={(e) => handleChange('minimizeToTray', e.target.checked)}
              />
            }
            label={t('settings.minimizeToTray')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={localSettings.enableAnimations}
                onChange={(e) => handleChange('enableAnimations', e.target.checked)}
              />
            }
            label={t('settings.enableAnimations')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={localSettings.autoSave}
                onChange={(e) => handleChange('autoSave', e.target.checked)}
              />
            }
            label={t('settings.autoSave')}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSave} variant="contained">
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog; 