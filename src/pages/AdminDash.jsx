import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Fab,
  styled,
  Paper,
  Button,
  AppBar,
  Toolbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';

// Styled Container (full-page gradient)
const StyledContainer = styled(Box)(() => ({
  minHeight: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #3AB795 0%, #F76C5E 50%, #FFD972 100%)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '80px 20px 40px 20px',
}));

// Styled Paper for content box
const StyledPaper = styled(Paper)(() => ({
  padding: '40px',
  borderRadius: '24px',
  background: '#F9F9F9',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '1000px',
  border: '1px solid rgba(58, 183, 149, 0.1)',
}));

// Colorful button like login UI
const GradientButton = styled(Button)(() => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: '12px',
  padding: '8px 20px',
  marginRight: '12px',
  color: '#fff',
  background: 'linear-gradient(to right, #3AB795, #F76C5E, #FFD972)',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
  },
}));

export default function AdminDash() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([
    { id: 1, title: 'Food Drive', date: '2024-07-01', location: 'Midtown', volunteers: 5 },
    { id: 2, title: 'Clothing Distribution', date: '2024-07-05', location: 'East Side', volunteers: 10 },
  ]);

  const [showForm, setShowForm] = useState(false);

  const handleAddEvent = (newEvent) => {
    setEvents((prevEvents) => [
      ...prevEvents,
      { ...newEvent, id: prevEvents.length + 1, volunteers: 0 },
    ]);
    setShowForm(false);
  };

  return (
    <>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ background: 'linear-gradient(to right, #3AB795, #F76C5E, #FFD972)' }}>
        <Toolbar sx={{ justifyContent: 'center' }}>
          <GradientButton onClick={() => navigate('/admin')}>Dashboard</GradientButton>
          <GradientButton onClick={() => navigate('/match')}>Match Volunteers</GradientButton>
          <GradientButton onClick={() => navigate('/notifications')}>Notifications</GradientButton>
          <GradientButton onClick={() => navigate('/history')}>Event History</GradientButton>
        </Toolbar>
      </AppBar>

      {/* Page Container */}
      <StyledContainer>
        <StyledPaper>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom sx={{ color: '#333' }}>
            Admin Dashboard
          </Typography>

          {/* Events Table */}
          <Box sx={{ overflowX: 'auto', mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: '#FFD972', fontWeight: 600 }}>Event Title</TableCell>
                  <TableCell sx={{ backgroundColor: '#FFD972', fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ backgroundColor: '#FFD972', fontWeight: 600 }}>Location</TableCell>
                  <TableCell sx={{ backgroundColor: '#FFD972', fontWeight: 600 }}>Volunteers Needed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>{event.volunteers}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Event Form */}
          {showForm && <EventForm onClose={() => setShowForm(false)} onSubmit={handleAddEvent} />}
        </StyledPaper>
      </StyledContainer>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setShowForm(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#F76C5E',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#e15a50'
          }
        }}
      >
        <AddIcon />
      </Fab>
    </>
  );
}