import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
  styled
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Full-page gradient background
const StyledContainer = styled(Box)(() => ({
  minHeight: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #3AB795 0%, #F76C5E 50%, #FFD972 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 20px 40px 20px',
}));

// Card layout
const StyledPaper = styled(Paper)(() => ({
  padding: '40px',
  borderRadius: '24px',
  background: '#F9F9F9',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '700px',
  border: '1px solid rgba(58, 183, 149, 0.1)',
}));

// Gradient button
const GradientButton = styled(Button)(() => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: '12px',
  padding: '10px 20px',
  marginBottom: '24px',
  color: '#fff',
  background: 'linear-gradient(to right, #3AB795, #F76C5E, #FFD972)',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
  },
}));

export default function AdminNotifications() {
  const navigate = useNavigate();

  const notifications = [
    'New volunteer signed up for Food Drive.',
    'Clothing Distribution event updated.',
    'Reminder: East Side event is tomorrow.',
  ];

  return (
    <StyledContainer>
      <StyledPaper>
        {/* Back to Admin */}
        <GradientButton onClick={() => navigate('/admin')}>
          ← Back to Dashboard
        </GradientButton>

        {/* Header */}
        <Typography variant="h4" gutterBottom sx={{ color: '#333' }}>
          Admin Notifications
        </Typography>

        {/* Notifications List */}
        <List>
          {notifications.map((note, index) => (
            <ListItem
              key={index}
              sx={{
                mb: 1,
                borderBottom: '1px solid #e0e0e0',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <ListItemText primary={note} />
            </ListItem>
          ))}
        </List>
      </StyledPaper>
    </StyledContainer>
  );
}
