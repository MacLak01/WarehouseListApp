import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f59e0b',
    },
    secondary: {
      main: '#38bdf8',
    },
    background: {
      default: '#07111f',
      paper: '#0e1728',
    },
    text: {
      primary: '#f8fafc',
      secondary: 'rgba(248, 250, 252, 0.72)',
    },
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontWeight: 750,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(circle at top left, rgba(245, 158, 11, 0.18), transparent 32%), radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.2), transparent 36%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(148, 163, 184, 0.16)',
          backdropFilter: 'blur(16px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
        },
      },
    },
  },
});

export default theme;