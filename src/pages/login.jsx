import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  Alert,
  Link,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  CircularProgress,
  styled
} from '@mui/material';
import {
  Email,
  Lock,
  Person,
  AdminPanelSettings,
  VolunteerActivism,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

// API Configuration
const API_URL = 'http://localhost:5000/api';

// Styled components for custom styling
const StyledContainer = styled(Box)(() => ({
  minHeight: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #3AB795 0%, #F76C5E 50%, #FFD972 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
}));

const StyledPaper = styled(Paper)(() => ({
  padding: '40px',
  borderRadius: '24px',
  background: '#F9F9F9',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '500px',
  minWidth: '400px',
  border: '1px solid rgba(58, 183, 149, 0.1)',
  '@media (max-width: 600px)': {
    padding: '30px 20px',
    minWidth: 'auto',
    margin: '10px'
  }
}));

const LogoBox = styled(Box)(() => ({
  width: 60,
  height: 60,
  background: 'linear-gradient(45deg, #3AB795, #F76C5E)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 15px',
  fontSize: 24,
  color: 'white'
}));

const UserTypeButton = styled(Button)(({ selected }) => ({
  flex: 1,
  padding: '12px 16px',
  border: `2px solid ${selected ? '#3AB795' : '#e0e6ed'}`,
  borderRadius: '10px',
  background: selected ? 'rgba(58, 183, 149, 0.1)' : 'white',
  color: selected ? '#3AB795' : '#333333',
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    background: selected ? 'rgba(58, 183, 149, 0.15)' : '#f8f9fa',
    border: `2px solid ${selected ? '#3AB795' : '#ccc'}`
  }
}));

const StyledButton = styled(Button)(() => ({
  padding: '16px',
  background: 'linear-gradient(45deg, #3AB795 30%, #F76C5E 90%)',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 600,
  textTransform: 'none',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #2ea082 30%, #f55a4c 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(58, 183, 149, 0.3)'
  },
  '&:disabled': {
    opacity: 0.7,
    transform: 'none'
  }
}));

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Login() {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState({
    login: false,
    register: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    userType: 'volunteer'
  });
  
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'volunteer',
    agreeToTerms: false
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handlePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!loginData.email || !loginData.password) {
        throw new Error('Please fill in all required fields');
      }

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          userType: loginData.userType
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);      
      // Store authentication token
      localStorage.setItem('authToken', data.token);
      
      // Handle remember me
      if (loginData.rememberMe) {
        localStorage.setItem('rememberUser', JSON.stringify({
          email: loginData.email,
          userType: loginData.userType
        }));
      }
      
      setSuccess(`Welcome back! Redirecting to ${loginData.userType} dashboard...`);
      
      setTimeout(() => {
        window.location.href = data.redirectTo;
      }, 1500);
      
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!registerData.email || !registerData.password) {
        throw new Error('Please fill in all required fields');
      }
      
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (!registerData.agreeToTerms) {
        throw new Error('Please agree to the terms and conditions');
      }

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          userType: registerData.userType
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      // Store authentication token
      localStorage.setItem('authToken', data.token);
      
      setSuccess('Account created successfully! Redirecting to complete your profile...');
      
      setTimeout(() => {
        window.location.href = '/profile';
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (form, field, value) => {
    if (form === 'login') {
      setLoginData(prev => ({ ...prev, [field]: value }));
    } else {
      setRegisterData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <StyledContainer>
      <StyledPaper elevation={10}>
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <LogoBox>
            <VolunteerActivism sx={{ fontSize: 30 }} />
          </LogoBox>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{ color: '#333333' }}>
            VolunteerConnect
          </Typography>
          <Typography variant="body1" sx={{ color: '#666666' }}>
            Connecting hearts, building communities
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: '#e0e6ed', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                color: '#666666',
                '&.Mui-selected': {
                  color: '#3AB795'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#3AB795'
              }
            }}
          >
            <Tab 
              label="Sign In" 
              icon={<Person />} 
              iconPosition="start"
              sx={{ textTransform: 'none', fontSize: '1rem' }}
            />
            <Tab 
              label="Sign Up" 
              icon={<VolunteerActivism />} 
              iconPosition="start"
              sx={{ textTransform: 'none', fontSize: '1rem' }}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleLoginSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={500} sx={{ color: '#333333' }}>
                I am a:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <UserTypeButton
                  selected={loginData.userType === 'volunteer'}
                  startIcon={<VolunteerActivism />}
                  onClick={() => handleInputChange('login', 'userType', 'volunteer')}
                >
                  Volunteer
                </UserTypeButton>
                <UserTypeButton
                  selected={loginData.userType === 'admin'}
                  startIcon={<AdminPanelSettings />}
                  onClick={() => handleInputChange('login', 'userType', 'admin')}
                >
                  Admin
                </UserTypeButton>
              </Box>
            </Box>

            <TextField
              fullWidth
              type="email"
              label="Email Address"
              value={loginData.email}
              onChange={(e) => handleInputChange('login', 'email', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              type={showPassword.login ? 'text' : 'password'}
              label="Password"
              value={loginData.password}
              onChange={(e) => handleInputChange('login', 'password', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handlePasswordVisibility('login')}
                      edge="end"
                    >
                      {showPassword.login ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
              required
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={loginData.rememberMe}
                    onChange={(e) => handleInputChange('login', 'rememberMe', e.target.checked)}
                    sx={{ 
                      color: '#3AB795',
                      '&.Mui-checked': { color: '#3AB795' }
                    }}
                  />
                }
                label="Remember me"
              />
              <Link 
                href="#" 
                variant="body2" 
                sx={{ textDecoration: 'none', color: '#3AB795' }}
                onClick={(e) => {
                  e.preventDefault();
                  setSuccess('Password reset functionality coming soon!');
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </StyledButton>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handleRegisterSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={500} sx={{ color: '#333333' }}>
                I want to:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <UserTypeButton
                  selected={registerData.userType === 'volunteer'}
                  startIcon={<VolunteerActivism />}
                  onClick={() => handleInputChange('register', 'userType', 'volunteer')}
                >
                  Volunteer
                </UserTypeButton>
                <UserTypeButton
                  selected={registerData.userType === 'admin'}
                  startIcon={<AdminPanelSettings />}
                  onClick={() => handleInputChange('register', 'userType', 'admin')}
                >
                  Organize Events
                </UserTypeButton>
              </Box>
            </Box>

            <TextField
              fullWidth
              type="email"
              label="Email Address"
              value={registerData.email}
              onChange={(e) => handleInputChange('register', 'email', e.target.value)}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              type={showPassword.register ? 'text' : 'password'}
              label="Password"
              value={registerData.password}
              onChange={(e) => handleInputChange('register', 'password', e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handlePasswordVisibility('register')}
                      edge="end"
                    >
                      {showPassword.register ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              type={showPassword.confirm ? 'text' : 'password'}
              label="Confirm Password"
              value={registerData.confirmPassword}
              onChange={(e) => handleInputChange('register', 'confirmPassword', e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handlePasswordVisibility('confirm')}
                      edge="end"
                    >
                      {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
              required
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={registerData.agreeToTerms}
                  onChange={(e) => handleInputChange('register', 'agreeToTerms', e.target.checked)}
                  required
                  sx={{ 
                    color: '#3AB795',
                    '&.Mui-checked': { color: '#3AB795' }
                  }}
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link 
                    href="#" 
                    sx={{ textDecoration: 'none', color: '#3AB795' }}
                    onClick={(e) => {
                      e.preventDefault();
                      setSuccess('Terms of Service opened');
                    }}
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link 
                    href="#" 
                    sx={{ textDecoration: 'none', color: '#3AB795' }}
                    onClick={(e) => {
                      e.preventDefault();
                      setSuccess('Privacy Policy opened');
                    }}
                  >
                    Privacy Policy
                  </Link>
                </Typography>
              }
              sx={{ mb: 3, alignItems: 'flex-start' }}
            />

            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </StyledButton>
          </Box>
        </TabPanel>

        <Box textAlign="center" sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e6ed' }}>
          <Typography variant="body2" sx={{ color: '#666666' }}>
            After registration, you'll complete your profile with address, skills, and availability details
          </Typography>
        </Box>
      </StyledPaper>
    </StyledContainer>
  );
}