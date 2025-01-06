import { ThemeOptions } from '@mui/material';

export const darkTheme: ThemeOptions = {
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
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, rgba(6,6,6,0.9) 0%, rgba(20,20,20,0.9) 100%)',
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
        },
        contained: {
          background: 'linear-gradient(45deg, #00fff5, #ff0099)',
          color: '#000',
          '&:hover': {
            boxShadow: '0 0 20px rgba(0,255,245,0.5)',
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0,255,245,0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0,255,245,0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00fff5',
            }
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0,255,245,0.3)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0,255,245,0.5)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#00fff5',
          }
        }
      }
    }
  }
};

export const lightTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: 'rgba(0, 0, 0, 0.7)',
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(31,38,135,0.15)',
          border: '1px solid rgba(255,255,255,0.2)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          background: 'linear-gradient(45deg, #2196f3, #f50057)',
          color: '#fff',
          '&:hover': {
            boxShadow: '0 0 20px rgba(33,150,243,0.5)',
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(33,150,243,0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(33,150,243,0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2196f3',
            }
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(33,150,243,0.3)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(33,150,243,0.5)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2196f3',
          }
        }
      }
    }
  }
}; 