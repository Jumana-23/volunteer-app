import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Alert,
  CircularProgress,
  styled
} from '@mui/material';
import {
  Person,
  LocationOn,
  Work,
  CalendarToday,
  Save,
  ExitToApp
} from '@mui/icons-material';

// API Configuration
const API_URL = 'http://localhost:5000/api';

// Styled components matching login.jsx
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
  maxWidth: '700px',
  minWidth: '600px',
  border: '1px solid rgba(58, 183, 149, 0.1)',
  maxHeight: '90vh',
  overflowY: 'auto',
  '@media (max-width: 768px)': {
    padding: '30px 20px',
    minWidth: 'auto',
    margin: '10px',
    maxHeight: '95vh'
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

const StyledButton = styled(Button)(() => ({
  padding: '16px 32px',
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

const SectionTitle = styled(Typography)(() => ({
  color: '#333333',
  fontWeight: 600,
  marginBottom: '16px',
  marginTop: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '&:first-of-type': {
    marginTop: 0
  }
}));

// US States with 2-character codes
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

// Available skills for volunteers
const AVAILABLE_SKILLS = [
  'First Aid',
  'CPR Certified',
  'Event Planning',
  'Teaching/Tutoring',
  'Cooking',
  'Driving',
  'Translation (Spanish)',
  'Translation (Other)',
  'Technology Support',
  'Photography',
  'Social Media',
  'Fundraising',
  'Administrative',
  'Manual Labor',
  'Childcare',
  'Elderly Care',
  'Animal Care',
  'Environmental Cleanup',
  'Construction',
  'Graphic Design',
  'Writing/Editing',
  'Public Speaking',
  'Mentoring',
  'Sports Coaching'
];

export default function UserProfileManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    skills: [],
    preferences: '',
    availability: []
  });

  const [newDate, setNewDate] = useState('');

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please log in to access your profile');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return;
    }

    // Get user email from token (simple decode)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserEmail(payload.userId === 1 ? 'admin@test.com' : 'volunteer@test.com');
    } catch (err) {
      console.error('Token decode error:', err);
      setUserEmail('User');
    }
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillsChange = (event) => {
    const value = event.target.value;
    setProfileData(prev => ({
      ...prev,
      skills: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleAddDate = () => {
    if (newDate && !profileData.availability.includes(newDate)) {
      // Check if date is in the future
      const selectedDate = new Date(newDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setError('Cannot select dates in the past');
        return;
      }

      setProfileData(prev => ({
        ...prev,
        availability: [...prev.availability, newDate]
      }));
      setNewDate('');
      setError(''); // Clear any previous date errors
    }
  };

  const handleRemoveDate = (dateToRemove) => {
    setProfileData(prev => ({
      ...prev,
      availability: prev.availability.filter(date => date !== dateToRemove)
    }));
  };

  const validateForm = () => {
    // Required field validation matching backend requirements
    if (!profileData.fullName.trim()) {
      throw new Error('Full Name is required');
    }
    if (profileData.fullName.length > 50) {
      throw new Error('Full Name must be 50 characters or less');
    }
    
    if (!profileData.address1.trim()) {
      throw new Error('Address 1 is required');
    }
    if (profileData.address1.length > 100) {
      throw new Error('Address 1 must be 100 characters or less');
    }
    
    if (profileData.address2.length > 100) {
      throw new Error('Address 2 must be 100 characters or less');
    }
    
    if (!profileData.city.trim()) {
      throw new Error('City is required');
    }
    if (profileData.city.length > 100) {
      throw new Error('City must be 100 characters or less');
    }
    
    if (!profileData.state) {
      throw new Error('State is required');
    }
    
    if (!profileData.zipCode.trim()) {
      throw new Error('Zip Code is required');
    }
    if (profileData.zipCode.length < 5) {
      throw new Error('Zip Code must be at least 5 characters');
    }
    if (profileData.zipCode.length > 9) {
      throw new Error('Zip Code must be 9 characters or less');
    }
    if (!/^\d+$/.test(profileData.zipCode)) {
      throw new Error('Zip Code must contain only numbers');
    }
    
    if (profileData.skills.length === 0) {
      throw new Error('At least one skill is required');
    }
    
    if (profileData.availability.length === 0) {
      throw new Error('At least one availability date is required');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Client-side validation
      validateForm();
      
      // Submit to backend
      const response = await fetch(`${API_URL}/profile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setSuccess('Profile saved successfully! Redirecting to dashboard...');
      
      // Redirect based on backend response
      setTimeout(() => {
        window.location.href = data.redirectTo || '/volunteer';
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberUser');
    window.location.href = '/';
  };

  return (
    <StyledContainer>
      <StyledPaper elevation={10}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box textAlign="center" flex={1}>
            <LogoBox>
              <Person sx={{ fontSize: 30 }} />
            </LogoBox>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{ color: '#333333' }}>
              Complete Your Profile
            </Typography>
            <Typography variant="body1" sx={{ color: '#666666' }}>
              Welcome {userEmail}! Please complete your profile to get started.
            </Typography>
          </Box>
          
          <Button
            onClick={handleLogout}
            startIcon={<ExitToApp />}
            sx={{ 
              color: '#666666', 
              textTransform: 'none',
              position: 'absolute',
              top: 20,
              right: 20
            }}
          >
            Logout
          </Button>
        </Box>

        {/* Alert Messages */}
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

        {/* Profile Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <SectionTitle variant="h6">
            <Person /> Personal Information
          </SectionTitle>
          
          <TextField
            fullWidth
            label="Full Name"
            value={profileData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            inputProps={{ maxLength: 50 }}
            helperText={`${profileData.fullName.length}/50 characters`}
            sx={{ mb: 2 }}
            required
          />

          {/* Address Information */}
          <SectionTitle variant="h6">
            <LocationOn /> Address Information
          </SectionTitle>
          
          <TextField
            fullWidth
            label="Address Line 1"
            value={profileData.address1}
            onChange={(e) => handleInputChange('address1', e.target.value)}
            inputProps={{ maxLength: 100 }}
            helperText={`${profileData.address1.length}/100 characters`}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Address Line 2 (Optional)"
            value={profileData.address2}
            onChange={(e) => handleInputChange('address2', e.target.value)}
            inputProps={{ maxLength: 100 }}
            helperText={`${profileData.address2.length}/100 characters`}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="City"
              value={profileData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              inputProps={{ maxLength: 100 }}
              helperText={`${profileData.city.length}/100 characters`}
              required
            />
            
            <FormControl fullWidth required>
              <InputLabel>State</InputLabel>
              <Select
                value={profileData.state}
                label="State"
                onChange={(e) => handleInputChange('state', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#3AB795'
                    }
                  }
                }}
              >
                {US_STATES.map((state) => (
                  <MenuItem key={state.code} value={state.code}>
                    {state.name} ({state.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            label="Zip Code"
            value={profileData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            inputProps={{ maxLength: 9, pattern: '[0-9]*' }}
            helperText="5-9 digits required"
            sx={{ mb: 2 }}
            required
          />

          {/* Skills and Preferences */}
          <SectionTitle variant="h6">
            <Work /> Skills & Preferences
          </SectionTitle>
          
          <FormControl fullWidth sx={{ mb: 2 }} required>
            <InputLabel>Skills</InputLabel>
            <Select
              multiple
              value={profileData.skills}
              onChange={handleSkillsChange}
              input={<OutlinedInput label="Skills" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={value} 
                      sx={{ 
                        backgroundColor: 'rgba(58, 183, 149, 0.1)',
                        color: '#3AB795'
                      }}
                    />
                  ))}
                </Box>
              )}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#3AB795'
                  }
                }
              }}
            >
              {AVAILABLE_SKILLS.map((skill) => (
                <MenuItem key={skill} value={skill}>
                  {skill}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Preferences (Optional)"
            value={profileData.preferences}
            onChange={(e) => handleInputChange('preferences', e.target.value)}
            multiline
            rows={3}
            placeholder="Any specific preferences, accessibility needs, or additional information..."
            sx={{ mb: 2 }}
          />

          {/* Availability */}
          <SectionTitle variant="h6">
            <CalendarToday /> Availability
          </SectionTitle>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              type="date"
              label="Add Available Date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              onClick={handleAddDate}
              disabled={!newDate}
              sx={{ 
                borderColor: '#3AB795',
                color: '#3AB795',
                '&:hover': {
                  borderColor: '#2ea082',
                  backgroundColor: 'rgba(58, 183, 149, 0.1)'
                }
              }}
            >
              Add Date
            </Button>
          </Box>

          {profileData.availability.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#333333' }}>
                Selected Dates ({profileData.availability.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profileData.availability.map((date, index) => (
                  <Chip
                    key={index}
                    label={new Date(date).toLocaleDateString()}
                    onDelete={() => handleRemoveDate(date)}
                    sx={{ 
                      backgroundColor: 'rgba(58, 183, 149, 0.1)',
                      color: '#3AB795'
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <StyledButton
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            >
              {loading ? 'Saving Profile...' : 'Save Profile'}
            </StyledButton>
          </Box>
        </Box>

        {/* Footer */}
        <Box textAlign="center" sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e6ed' }}>
          <Typography variant="body2" sx={{ color: '#666666' }}>
            Your profile helps us match you with the most suitable volunteer opportunities
          </Typography>
        </Box>
      </StyledPaper>
    </StyledContainer>
  );
}