import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface MainLayoutProps {
  children: React.ReactNode;
  onOpenSettings: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onOpenSettings }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            WiFly
          </Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            onClick={onOpenSettings}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout; 