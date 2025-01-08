import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface MainLayoutProps {
  children: React.ReactNode;
  onOpenSettings: () => void;
  userName?: string;
}

const Logo = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 外圈 WiFi 信号 */}
    <path
      className="wifi-wave outer"
      d="M20 4C12 4 4.5 7.5 0 13.5L4 17.5C7.5 12.5 13.5 9.5 20 9.5C26.5 9.5 32.5 12.5 36 17.5L40 13.5C35.5 7.5 28 4 20 4Z"
      fill="url(#outer-wave)"
    />
    
    {/* 中圈 WiFi 信号 */}
    <path
      className="wifi-wave middle"
      d="M20 12C14.5 12 9.5 14.5 6 18.5L10 22.5C12.5 19.5 16 17.5 20 17.5C24 17.5 27.5 19.5 30 22.5L34 18.5C30.5 14.5 25.5 12 20 12Z"
      fill="url(#middle-wave)"
    />

    {/* 内圈 WiFi 信号 */}
    <path
      className="wifi-wave inner"
      d="M20 20C17 20 14.5 21.5 13 23.5L20 31L27 23.5C25.5 21.5 23 20 20 20Z"
      fill="url(#inner-wave)"
    />

    {/* 加粗的闪电 ⚡️ */}
    <path
      className="lightning"
      d="M32 8L15 20L23 22.5L8 36L25 24L17 21.5L32 8Z"
      fill="url(#lightning-gradient)"
      filter="url(#glow)"
    />

    {/* 滤镜定义 */}
    <defs>
      <filter id="glow" x="-2" y="-2" width="44" height="44">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      {/* 渐变定义 */}
      <linearGradient id="outer-wave" x1="0" y1="4" x2="40" y2="17.5">
        <stop offset="0%" stopColor="#00E5FF" />
        <stop offset="100%" stopColor="#0091EA" />
      </linearGradient>
      
      <linearGradient id="middle-wave" x1="6" y1="12" x2="34" y2="22.5">
        <stop offset="0%" stopColor="#00E5FF" />
        <stop offset="100%" stopColor="#0091EA" />
      </linearGradient>
      
      <linearGradient id="inner-wave" x1="13" y1="20" x2="27" y2="31">
        <stop offset="0%" stopColor="#00E5FF" />
        <stop offset="100%" stopColor="#0091EA" />
      </linearGradient>

      <linearGradient id="lightning-gradient" x1="8" y1="8" x2="32" y2="36">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="30%" stopColor="#FFC107" />
        <stop offset="70%" stopColor="#FFA000" />
        <stop offset="100%" stopColor="#FF8F00" />
      </linearGradient>
    </defs>

    <style>
      {`
        .wifi-wave {
          opacity: 0.8;
          transform-origin: center;
        }
        
        .outer {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .middle {
          animation: pulse 2s ease-in-out infinite 0.3s;
        }
        
        .inner {
          animation: pulse 2s ease-in-out infinite 0.6s;
        }
        
        .lightning {
          animation: flash 3s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.7));
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(0.95);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1);
          }
        }
        
        @keyframes flash {
          0%, 100% { 
            opacity: 0.8;
            transform: scale(0.95) rotate(0deg);
          }
          50% { 
            opacity: 1;
            transform: scale(1.05) rotate(3deg);
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.9));
          }
        }
      `}
    </style>
  </svg>
);

const MainLayout: React.FC<MainLayoutProps> = ({ children, onOpenSettings, userName }) => {
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
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          '& svg': {
            filter: 'drop-shadow(0 0 12px rgba(0,255,245,0.3))',
            transform: 'scale(1.2)',
          }
        }}>
          <Logo />
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              fontSize: '1.8rem',
              background: 'linear-gradient(45deg, #00fff5, #ff0099)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(0,255,245,0.5)',
              letterSpacing: '1px'
            }}
          >
            WiFly
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          {userName}
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