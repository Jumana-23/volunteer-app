import React from 'react';
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
  Container
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

  const events = [
    { id: 1, title: 'Food Drive', location: 'Midtown', volunteers: ['Sam', 'Alex'] },
    { id: 2, title: 'Clothing Distribution', location: 'East Side', volunteers: ['Jamie'] },
  ];

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
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.title}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>{event.volunteers.join(', ')}</TableCell>
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
                    Match More
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledPaper>
    </StyledContainer>
  );
}
