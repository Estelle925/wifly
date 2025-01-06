import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.18)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          textTransform: 'none',
          fontWeight: 600,
          backgroundImage: 'linear-gradient(to right, #84fab0 0%, #8fd3f4 51%, #84fab0 100%)',
          backgroundSize: '200% auto',
          transition: '0.5s',
          '&:hover': {
            backgroundPosition: 'right center',
          }
        }
      }
    }
  }
});

export default theme; 