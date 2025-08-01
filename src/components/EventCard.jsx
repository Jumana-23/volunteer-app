import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';

export default function EventCard({ event , onRegister, showVolunteerCount = false }) {
  const assignedCount = event.assignedVolunteers ? event.assignedVolunteers.length : 0;
  const requiredCount = event.requiredVolunteers || event.volunteersNeeded || 0;
  const isEventFull = assignedCount >= requiredCount;
  
  return (
    <Card sx={{ 
      margin: 2,
      background: 'linear-gradient(135deg, #333333 0%, #404040 100%)',
      borderRadius: 2,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      border: '1px solid #555555',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
      },
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <EventIcon sx={{ color: '#64b5f6', mr: 1 }} />
          <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
            {event.title}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" mb={1.5}>
          <LocationOnIcon sx={{ color: '#64b5f6', mr: 1, fontSize: 18 }} />
          <Typography sx={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
            {event.location}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" mb={1.5}>
          <AccessTimeIcon sx={{ color: '#64b5f6', mr: 1, fontSize: 18 }} />
          <Typography sx={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
            {event.time}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <PeopleIcon sx={{ color: '#64b5f6', mr: 1, fontSize: 18 }} />
            <Typography sx={{ color: '#e0e0e0', fontSize: '0.9rem', mr: 1 }}>
              {showVolunteerCount ? 'Volunteers:' : 'Volunteers Needed:'}
            </Typography>
          </Box>
          <Chip
            label={showVolunteerCount ? `${assignedCount}/${requiredCount}` : (event.need || requiredCount)}
            size="small"
            sx={{
              backgroundColor: isEventFull ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)',
              color: isEventFull ? '#f44336' : '#4caf50',
              border: `1px solid ${isEventFull ? 'rgba(244, 67, 54, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`,
              fontWeight: 600,
            }}
          />
        </Box>
        
        <Button 
          variant="contained" 
          fullWidth
          sx={{ 
            mt: 2,
            py: 1.2,
            backgroundColor: isEventFull ? '#555555' : '#64b5f6',
            color: isEventFull ? '#999999' : '#ffffff',
            fontWeight: 600,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: isEventFull ? '#555555' : '#42a5f5',
            },
            '&:disabled': {
              backgroundColor: '#555555',
              color: '#999999',
            },
          }}
          disabled={isEventFull}
          onClick={() => onRegister?.(event._id)}
        >
          {isEventFull ? 'Event Full' : 'Register Now'}
        </Button>
      </CardContent>
    </Card>
  );
}
