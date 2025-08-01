import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';

export default function ProfileCard({ user }) {
  return (
    <Card sx={{ 
      margin: 2,
      background: 'linear-gradient(135deg, #333333 0%, #404040 100%)',
      borderRadius: 2,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      border: '1px solid #555555',
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <PersonIcon sx={{ color: '#64b5f6', mr: 1 }} />
          <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
            {user.name}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" mb={2}>
          <LocationOnIcon sx={{ color: '#64b5f6', mr: 1, fontSize: 20 }} />
          <Typography sx={{ color: '#e0e0e0' }}>
            {user.location}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="flex-start" mb={1}>
          <StarIcon sx={{ color: '#64b5f6', mr: 1, fontSize: 20, mt: 0.2 }} />
          <Typography sx={{ color: '#e0e0e0', mr: 1 }}>Skills:</Typography>
        </Box>
        
        <Box display="flex" flexWrap="wrap" gap={1} ml={3}>
          {user.skills.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              size="small"
              sx={{
                backgroundColor: 'rgba(100, 181, 246, 0.2)',
                color: '#64b5f6',
                border: '1px solid rgba(100, 181, 246, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(100, 181, 246, 0.3)',
                },
              }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
