import { CssBaseline, ThemeProvider } from '@mui/material';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import theme from './theme';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
);
