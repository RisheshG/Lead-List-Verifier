import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Card,
  AppBar,
  Toolbar,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const lightTheme = createTheme({
  typography: {
    fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    primary: {
      main: '#4a90e2',
    },
    secondary: {
      main: '#d34836',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

const darkTheme = createTheme({
  typography: {
    fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    primary: {
      main: '#4a90e2',
    },
    secondary: {
      main: '#d34836',
    },
    mode: 'dark',
    background: {
      default: '#1c1c1c',
      paper: '#242424',
    },
  },
});

const FileInput = styled('input')({
  display: 'none',
});

const Hero = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  background: 'linear-gradient(135deg, #4a90e2, #d34836)',
  color: 'white',
  width: '100%',
  height: '70vh',
  padding: theme.spacing(6),
  borderRadius: '0 0 40% 40%',
  marginBottom: theme.spacing(6),
  position: 'relative',
  overflow: 'hidden',
  zIndex: 2,
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  animation: 'gradient 10s ease infinite',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-30%',
    left: '-30%',
    width: '160%',
    height: '160%',
    background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0))',
    animation: 'rotate 20s linear infinite',
    zIndex: 1,
    borderRadius: '50%',
  },
  '@keyframes rotate': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}));

const AppContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(6),
  marginBottom: theme.spacing(6),
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
  backdropFilter: 'blur(12px)',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(6),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[12],
  textAlign: 'center',
  width: '100%',
  maxWidth: '650px',
  margin: '0 auto',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(14px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  zIndex: 2,
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const Footer = styled('footer')(({ theme }) => ({
  textAlign: 'center',
  fontSize: '1em',
  color: 'rgba(255, 255, 255, 0.85)',
  padding: theme.spacing(3),
  background: 'rgba(0, 0, 0, 0.75)',
  borderTop: '1px solid rgba(255, 255, 255, 0.3)',
  width: '100%',
  zIndex: 2,
  position: 'relative',
  backdropFilter: 'blur(12px)',
  '& a': {
    color: '#d34836',
    textDecoration: 'underline',
  },
}));

const DownloadButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(2, 4),
  textTransform: 'uppercase',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.getContrastText(theme.palette.primary.main),
  transition: 'background-color 0.4s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&.MuiButton-containedPrimary': {
    backgroundColor: '#d34836',
    '&:hover': {
      backgroundColor: '#b71c1c',
    },
  },
}));

const Background = styled('div')(({ theme }) => ({
  background: 'linear-gradient(180deg, #d34836, #4a90e2)',
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const AnimatedButton = motion(Button);

function App() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        if (lines.length > 0) {
          const header = lines[0].split(',');
          setColumns(header);
          setSelectedColumn(header[0]);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('emailColumn', selectedColumn); // Ensure emailColumn is sent

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Updated URL to use the new API endpoint
      const response = await axios.post('https://llv-backend-production.up.railway.app/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResults(response.data);
      setSuccess('File uploaded successfully!');
    } catch (err) {
      setError('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (url) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      setError('No data available for download. Please ensure the file is processed correctly.');
    }
  };

  const handleOpenContact = () => {
    setContactOpen(true);
  };

  const handleCloseContact = () => {
    setContactOpen(false);
  };

  const handleToggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const chartData = {
    labels: ['Valid Emails', 'Invalid Emails', 'Catch-All Emails'],
    datasets: [
      {
        label: 'Email Verification Results',
        data: [
          results?.validCount || 0,
          results?.invalidCount || 0,
          results?.catchAllCount || 0,
        ],
        backgroundColor: ['#66bb6a', '#ef5350', '#42a5f5'],
        borderColor: ['#388e3c', '#d32f2f', '#1976d2'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Background>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Email Verifier
            </Typography>
            <Switch checked={darkMode} onChange={handleToggleDarkMode} />
          </Toolbar>
        </AppBar>

        <Hero>
          <Typography variant="h3">Welcome to the Email Verifier</Typography>
          <Typography variant="h6">Upload your CSV file to get started</Typography>
        </Hero>

        <AppContainer>
          <StyledCard>
            <Typography variant="h5">Upload Your CSV File</Typography>
            <Box mt={2}>
              <label htmlFor="upload-button">
                <FileInput
                  id="upload-button"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                />
                <Button variant="contained" color="primary" component="span">
                  Choose File
                </Button>
              </label>
            </Box>
            <FormControl sx={{ mt: 2, width: '100%' }}>
              <InputLabel id="email-column-label">Email Column</InputLabel>
              <Select
                labelId="email-column-label"
                id="email-column-select"
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                {columns.map((column, index) => (
                  <MenuItem key={index} value={column}>
                    {column}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? <CircularProgress size={24} /> : 'Upload'}
            </Button>
          </StyledCard>

          {results && (
            <StyledCard sx={{ mt: 4 }}>
              <Typography variant="h5">Results</Typography>
              <Bar data={chartData} options={{ responsive: true }} />
              <Box mt={2}>
                <DownloadButton onClick={() => handleDownload(results.validDownloadUrl)}>
                  Download Valid Emails
                </DownloadButton>
                <DownloadButton onClick={() => handleDownload(results.invalidDownloadUrl)}>
                  Download Invalid Emails
                </DownloadButton>
                <DownloadButton onClick={() => handleDownload(results.catchAllDownloadUrl)}>
                  Download Catch-All Emails
                </DownloadButton>
              </Box>
            </StyledCard>
          )}

          {error && (
            <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
              <Alert onClose={() => setError(null)} severity="error">
                {error}
              </Alert>
            </Snackbar>
          )}

          {success && (
            <Snackbar open autoHideDuration={6000} onClose={() => setSuccess(null)}>
              <Alert onClose={() => setSuccess(null)} severity="success">
                {success}
              </Alert>
            </Snackbar>
          )}
        </AppContainer>

        <Footer>
          <Typography variant="body2">
            &copy; 2024 Your Company. All rights reserved.
            <Button color="inherit" onClick={handleOpenContact}>Contact Us</Button>
          </Typography>
        </Footer>

        <Dialog open={contactOpen} onClose={handleCloseContact}>
          <DialogTitle>Contact Us</DialogTitle>
          <DialogContent>
            <Typography variant="body1">For inquiries, please email us at contact@yourcompany.com</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseContact}>Close</Button>
          </DialogActions>
        </Dialog>
      </Background>
    </ThemeProvider>
  );
}

export default App;
