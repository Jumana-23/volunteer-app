import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  styled,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Full-screen gradient background
const StyledContainer = styled(Box)(() => ({
  minHeight: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #3AB795 0%, #F76C5E 50%, #FFD972 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 20px 40px 20px',
}));

// Styled card
const StyledPaper = styled(Paper)(() => ({
  padding: '40px',
  borderRadius: '24px',
  background: '#F9F9F9',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '800px',
  border: '1px solid rgba(58, 183, 149, 0.1)',
}));

// Gradient back button
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

export default function EventHistory() {
  const [pastEvents, setPastEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/volunteerHistory') // ✅ using Vite proxy
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch history');
        }
        return res.json();
      })
      .then((data) => setPastEvents(data))
      .catch((err) => console.error('Error fetching event history:', err));
  }, []);

  return (
    <StyledContainer>
      <StyledPaper>
        <GradientButton onClick={() => navigate('/admin')}>
          ← Back to Dashboard
        </GradientButton>

        <Typography variant="h4" gutterBottom sx={{ color: '#333' }}>
          Event History
        </Typography>

        <Box sx={{ overflowX: 'auto', mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#FFD972', fontWeight: 600 }}>
                  Volunteer Name
                </TableCell>
                <TableCell sx={{ backgroundColor: '#FFD972', fontWeight: 600 }}>
                  Event Name
                </TableCell>
                <TableCell sx={{ backgroundColor: '#FFD972', fontWeight: 600 }}>
                  Hours
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pastEvents.length > 0 ? (
                pastEvents.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{record.volunteerName}</TableCell>
                    <TableCell>{record.eventName}</TableCell>
                    <TableCell>{record.hours}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>No event history found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </StyledPaper>
    </StyledContainer>
  );
}
