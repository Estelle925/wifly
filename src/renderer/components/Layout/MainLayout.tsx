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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(0,255,245,0.1) 0%, rgba(255,0,153,0.1) 100%)',
        pointerEvents: 'none'
      }
    }}>
      <Box sx={{ 
        px: 4, 
        py: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'transparent'
      }}>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&::before': {
              content: '""',
              width: '24px',
              height: '24px',
              background: 'linear-gradient(45deg, #00fff5, #ff0099)',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              animation: 'rotate 4s linear infinite',
              boxShadow: '0 0 20px rgba(0,255,245,0.5)',
            },
            '@keyframes rotate': {
              '0%': {
                transform: 'rotate(0deg)'
              },
              '100%': {
                transform: 'rotate(360deg)'
              }
            },
            background: 'linear-gradient(45deg, #00fff5, #ff0099)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(0,255,245,0.5)',
            letterSpacing: '1px'
          }}
        >
          WiFly
        </Typography>
        <IconButton
          size="large"
          onClick={onOpenSettings}
          sx={{
            color: '#00fff5',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              background: 'linear-gradient(45deg, #00fff5, #ff0099)',
              borderRadius: '50%',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              zIndex: -1
            },
            '&:hover': {
              transform: 'rotate(180deg)',
              transition: 'transform 0.3s ease',
              '&::after': {
                opacity: 0.3
              }
            }
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Box>
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        p: 4,
        position: 'relative',
        '&::-webkit-scrollbar': {
          width: '8px'
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,255,245,0.3)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(0,255,245,0.5)'
          }
        }
      }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout; 