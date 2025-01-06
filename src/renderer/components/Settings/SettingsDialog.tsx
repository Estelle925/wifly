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
  const { t, i18n } = useTranslation();
  const [localSettings, setLocalSettings] = React.useState<AppSettings>(settings);

  const handleChange = <T extends keyof AppSettings>(
    key: T,
    value: AppSettings[T]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localSettings);
    if (localSettings.language !== settings.language) {
      i18n.changeLanguage(localSettings.language);
    }
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(26,26,26,0.9)',
          backdropFilter: 'blur(12px)',
        }
      }}
    >
      <DialogTitle>{t('settings.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Typography 
              variant="subtitle2" 
              gutterBottom
              sx={{ color: 'rgba(255,255,255,0.9)' }}
            >
              {t('settings.language')}
            </Typography>
            <Select
              value={localSettings.language}
              onChange={(e) => handleChange('language', e.target.value as string)}
              sx={{
                '& .MuiSelect-select': {
                  color: '#fff',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0,255,245,0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0,255,245,0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00fff5',
                },
              }}
            >
              <MenuItem value="en">{t('settings.languages.en')}</MenuItem>
              <MenuItem value="zh">{t('settings.languages.zh')}</MenuItem>
            </Select>
          </FormControl>

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
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose}
          sx={{
            color: 'rgba(255,255,255,0.7)',
            '&:hover': {
              color: '#fff',
              background: 'rgba(255,255,255,0.1)',
            }
          }}
        >
          {t('common.cancel')}
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #00fff5, #ff0099)',
            color: '#000',
            '&:hover': {
              boxShadow: '0 0 20px rgba(0,255,245,0.5)',
            }
          }}
        >
          {t('settings.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog; 