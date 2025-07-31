import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
  styled,
  Container,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Full-page gradient container
const StyledContainer = styled(Box)(() => ({
  minHeight: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #3AB795 0%, #F76C5E 50%, #FFD972 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 20px 40px 20px',
}));

// Card style paper
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

export default function VolunteerMatch() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // API configuration
  const API_URL = 'http://localhost:5000/api';
  
  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <StyledContainer>
      <StyledPaper>
        {/* Navigation Back */}
        <GradientButton onClick={() => navigate('/admin')}>
          ← Back to Dashboard
        </GradientButton>

        <Typography variant="h4" gutterBottom sx={{ color: '#333' }}>
          Volunteer Matching
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#FFD972', fontWeight: 600 }}>Event</TableCell>
              <TableCell sx={{ backgroundColor: '#FFD972', fontWeight: 600 }}>Location</TableCell>
              <TableCell sx={{ backgroundColor: '#FFD972', fontWeight: 600 }}>Volunteers Assigned</TableCell>
              <TableCell sx={{ backgroundColor: '#FFD972', fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
              <TableRow key={event._id}>
                <TableCell>{event.title}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>
                  {event.assignedVolunteers && event.assignedVolunteers.length > 0 
                    ? event.assignedVolunteers.map(v => v.name || v.email).join(', ')
                    : 'No volunteers assigned'
                  }
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    sx={{
                      background: '#3AB795',
                      color: '#fff',
                      '&:hover': {
                        background: '#2e9c81',
                      }
                    }}
                  >
                    Match Volunteers
                  </Button>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </StyledPaper>
    </StyledContainer>
  );
}
