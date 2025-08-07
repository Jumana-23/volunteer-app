import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Button,
  styled,
  Container,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HistoryIcon from '@mui/icons-material/History';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DownloadIcon from '@mui/icons-material/Download';

// Styled components matching VolunteerDash
const StyledContainer = styled(Box)(() => ({
  minHeight: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #3AB795 0%, #F76C5E 50%, #FFD972 100%)',
  padding: '40px 20px',
}));

const HeaderCard = styled(Paper)(() => ({
  padding: '24px 32px',
  borderRadius: '24px',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(58, 183, 149, 0.2)',
  marginBottom: '24px',
}));

const StyledPaper = styled(Paper)(() => ({
  padding: '32px',
  borderRadius: '24px',
  background: '#F9F9F9',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(58, 183, 149, 0.1)',
  marginBottom: '24px',
}));

const StyledTableContainer = styled(TableContainer)(() => ({
  borderRadius: '16px',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  background: '#ffffff',
}));

const BackButton = styled(Button)(() => ({
  padding: '10px 20px',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  color: '#666666',
  border: '2px solid #e0e6ed',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  '&:hover': {
    backgroundColor: '#ffffff',
    borderColor: '#3AB795',
    color: '#3AB795',
  },
}));

const ExportButton = styled(Button)(() => ({
  padding: '10px 20px',
  background: 'linear-gradient(45deg, #3AB795 30%, #F76C5E 90%)',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  color: 'white',
  boxShadow: '0 4px 15px rgba(58, 183, 149, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #2ea082 30%, #f55a4c 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(58, 183, 149, 0.4)',
  },
}));

const SectionTitle = styled(Typography)(() => ({
  color: '#333333',
  fontWeight: 700,
  marginBottom: '24px',
  fontSize: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  '&:after': {
    content: '""',
    flex: 1,
    height: '2px',
    background: 'linear-gradient(to right, #3AB795, transparent)',
  }
}));

const StatsCard = styled(Paper)(() => ({
  padding: '20px',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
  },
}));

export default function EventHistory() {
  const [pastEvents, setPastEvents] = useState([
    { 
      id: 1, 
      volunteerName: 'John Doe', 
      eventName: 'Beach Cleanup', 
      eventDate: '2024-06-15',
      hours: 4, 
      status: 'Completed',
      skills: ['Environmental', 'Manual Labor']
    },
    { 
      id: 2, 
      volunteerName: 'Jane Smith', 
      eventName: 'Food Drive', 
      eventDate: '2024-06-20',
      hours: 6, 
      status: 'Completed',
      skills: ['Food Service', 'Organization']
    },
    { 
      id: 3, 
      volunteerName: 'Mike Johnson', 
      eventName: 'Tree Planting', 
      eventDate: '2024-06-25',
      hours: 5, 
      status: 'Completed',
      skills: ['Gardening', 'Environmental']
    },
    { 
      id: 4, 
      volunteerName: 'Sarah Williams', 
      eventName: 'Senior Center Visit', 
      eventDate: '2024-07-01',
      hours: 3, 
      status: 'No-Show',
      skills: ['Elderly Care', 'Social']
    },
    { 
      id: 5, 
      volunteerName: 'David Brown', 
      eventName: 'Community Garden', 
      eventDate: '2024-07-05',
      hours: 4, 
      status: 'Completed',
      skills: ['Gardening', 'Teaching']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return { bg: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' };
      case 'No-Show': return { bg: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' };
      case 'Cancelled': return { bg: 'rgba(243, 156, 18, 0.1)', color: '#f39c12' };
      default: return { bg: 'rgba(0, 0, 0, 0.05)', color: '#666666' };
    }
  };

  const filteredEvents = pastEvents.filter(event => {
    const matchesSearch = event.volunteerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalHours = pastEvents.reduce((sum, event) => sum + event.hours, 0);
  const completedEvents = pastEvents.filter(e => e.status === 'Completed').length;
  const uniqueVolunteers = [...new Set(pastEvents.map(e => e.volunteerName))].length;

  useEffect(() => {
    // Fetch event history from backend
    fetch('/api/volunteerHistory')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch history');
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setPastEvents(data);
        }
      })
      .catch((err) => console.error('Error fetching event history:', err));
  }, []);

  return (
    <StyledContainer>
      <Container maxWidth="lg">
        {/* Header Section */}
        <HeaderCard elevation={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: '#3AB795', width: 48, height: 48 }}>
                  <HistoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#333333' }}>
                    Event History
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666666' }}>
                    Track volunteer participation and event outcomes
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <ExportButton
                startIcon={<DownloadIcon />}
                onClick={() => console.log('Export data')}
              >
                Export Report
              </ExportButton>
              <BackButton 
                onClick={() => navigate('/admin')}
                startIcon={<ArrowBackIcon />}
              >
                Back to Dashboard
              </BackButton>
            </Box>
          </Box>
        </HeaderCard>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard elevation={0}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#3AB795' }}>
                    {filteredEvents.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Total Records
                  </Typography>
                </Box>
                <EventIcon sx={{ fontSize: 32, color: '#3AB795', opacity: 0.3 }} />
              </Box>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard elevation={0}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#2ecc71' }}>
                    {completedEvents}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Completed
                  </Typography>
                </Box>
                <EventIcon sx={{ fontSize: 32, color: '#2ecc71', opacity: 0.3 }} />
              </Box>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard elevation={0}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#F76C5E' }}>
                    {totalHours}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Total Hours
                  </Typography>
                </Box>
                <AccessTimeIcon sx={{ fontSize: 32, color: '#F76C5E', opacity: 0.3 }} />
              </Box>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard elevation={0}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#FFD972' }}>
                    {uniqueVolunteers}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Volunteers
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 32, color: '#FFD972', opacity: 0.3 }} />
              </Box>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Filters Section */}
        <StyledPaper elevation={0}>
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              placeholder="Search by volunteer or event name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                flex: 1, 
                minWidth: '300px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#999999' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="No-Show">No-Show</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <SectionTitle variant="h5">
            <HistoryIcon sx={{ color: '#3AB795' }} />
            Volunteer Activity Log
          </SectionTitle>

          <StyledTableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#333333' }}>
                    Volunteer
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333333' }}>
                    Event
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333333' }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333333' }}>
                    Hours
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333333' }}>
                    Skills Used
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333333' }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((record) => (
                    <TableRow 
                      key={record.id}
                      sx={{ 
                         '&:hover': { backgroundColor: 'rgba(58, 183, 149, 0.02)' },
                       '&:last-child td': { border: 0 }
                     }}
                   >
                     <TableCell>
                       <Box display="flex" alignItems="center" gap={1}>
                         <Avatar sx={{ 
                           bgcolor: '#3AB795', 
                           width: 32, 
                           height: 32,
                           fontSize: '0.875rem'
                         }}>
                           {record.volunteerName.split(' ').map(n => n[0]).join('')}
                         </Avatar>
                         <Typography variant="body2" sx={{ fontWeight: 500, color: '#333333' }}>
                           {record.volunteerName}
                         </Typography>
                       </Box>
                     </TableCell>
                     <TableCell>
                       <Typography variant="body2" sx={{ color: '#333333' }}>
                         {record.eventName}
                       </Typography>
                     </TableCell>
                     <TableCell>
                       <Typography variant="body2" sx={{ color: '#666666' }}>
                         {new Date(record.eventDate).toLocaleDateString()}
                       </Typography>
                     </TableCell>
                     <TableCell>
                       <Box display="flex" alignItems="center" gap={0.5}>
                         <AccessTimeIcon sx={{ fontSize: 16, color: '#999999' }} />
                         <Typography variant="body2" sx={{ color: '#333333', fontWeight: 500 }}>
                           {record.hours} hrs
                         </Typography>
                       </Box>
                     </TableCell>
                     <TableCell>
                       <Box display="flex" gap={0.5} flexWrap="wrap">
                         {record.skills?.map((skill, idx) => (
                           <Chip
                             key={idx}
                             label={skill}
                             size="small"
                             sx={{
                               backgroundColor: 'rgba(255, 217, 114, 0.1)',
                               color: '#f39c12',
                               border: 'none',
                               fontWeight: 500,
                               fontSize: '0.75rem'
                             }}
                           />
                         ))}
                       </Box>
                     </TableCell>
                     <TableCell>
                       <Chip
                         label={record.status}
                         size="small"
                         sx={{
                           backgroundColor: getStatusColor(record.status).bg,
                           color: getStatusColor(record.status).color,
                           fontWeight: 600,
                           border: 'none'
                         }}
                       />
                     </TableCell>
                   </TableRow>
                 ))
               ) : (
                 <TableRow>
                   <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                     <HistoryIcon sx={{ fontSize: 48, color: '#e0e6ed', mb: 2 }} />
                     <Typography variant="h6" sx={{ color: '#666666', mb: 1 }}>
                       No history records found
                     </Typography>
                     <Typography variant="body2" sx={{ color: '#999999' }}>
                       {searchTerm || statusFilter !== 'All' 
                         ? 'Try adjusting your filters' 
                         : 'Event history will appear here once volunteers complete activities'}
                     </Typography>
                   </TableCell>
                 </TableRow>
               )}
             </TableBody>
           </Table>
         </StyledTableContainer>
       </StyledPaper>
     </Container>
   </StyledContainer>
 );
}