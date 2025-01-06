import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00fff5',
      light: '#5ffffa',
      dark: '#00b3ab',
    },
    secondary: {
      main: '#ff0099',
      light: '#ff56c1',
      dark: '#c4006f',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, rgba(6,6,6,0.9) 0%, rgba(20,20,20,0.9) 100%)',
          boxShadow: '0 8px 32px 0 rgba(0,255,245,0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,255,245,0.1)',
          '&:hover': {
            boxShadow: '0 8px 32px 0 rgba(0,255,245,0.2)',
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          background: 'linear-gradient(45deg, #00fff5, #ff0099)',
          backgroundSize: '200% auto',
          transition: 'all 0.3s ease',
          animation: 'gradient 3s ease infinite',
          border: 'none',
          color: '#000',
          '&:hover': {
            backgroundPosition: 'right center',
            transform: 'translateY(-2px)',
            boxShadow: '0 0 20px rgba(0,255,245,0.5), 0 0 40px rgba(255,0,153,0.3)',
          },
          '@keyframes gradient': {
            '0%': {
              backgroundPosition: '0% 50%'
            },
            '50%': {
              backgroundPosition: '100% 50%'
            },
            '100%': {
              backgroundPosition: '0% 50%'
            }
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10,10,10,0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0,255,245,0.1)',
          borderBottom: '1px solid rgba(0,255,245,0.1)'
        }
      }
    }
  }
});

export default theme; 