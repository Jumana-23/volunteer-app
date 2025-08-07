import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Toolbar,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  TableContainer,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  FormHelperText,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Autocomplete,
  Switch,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import NotificationsIcon from '@mui/icons-material/Notifications';
import HistoryIcon from '@mui/icons-material/History';
import MatchIcon from '@mui/icons-material/PersonSearch';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import skills from '../assets/skills';
import users from '../assets/users';
import EventFormDialog from '../components/EventFormDialog';
import AssessmentIcon from '@mui/icons-material/Assessment';


// API Configuration
const API_URL = 'http://localhost:5000/api';

// Professional Container with Original Color Scheme
const StyledContainer = styled(Box)(() => ({
  minHeight: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #3AB795 0%, #F76C5E 50%, #FFD972 100%)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '80px 20px 40px 20px',
}));

// Professional Paper for content box
const StyledPaper = styled(Paper)(() => ({
  padding: '32px',
  borderRadius: '16px',
  background: '#ffffff',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  width: '100%',
  maxWidth: '1400px',
  border: '1px solid rgba(0, 0, 0, 0.05)',
}));

// Professional Stats Card
const StatsCard = styled(Card)(() => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
  },
}));

// Professional Table Container
const StyledTableContainer = styled(TableContainer)(() => ({
  borderRadius: '12px',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
}));

// Professional Navigation Button with Original Colors
const NavButton = styled(Button)(() => ({
  textTransform: 'none',
  fontWeight: 500,
  color: '#ffffff',
  borderRadius: '6px',
  padding: '8px 16px',
  margin: '0 8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(255, 255, 255, 0.1)',
  },
}));

// Professional Action Button with Original Colors
const ActionButton = styled(Button)(() => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: '8px',
  padding: '10px 24px',
  background: 'linear-gradient(to right, #3AB795, #F76C5E, #FFD972)',
  color: '#ffffff',
  boxShadow: '0 4px 15px rgba(58, 183, 149, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(to right, #2ea082, #e55a4c, #f5c842)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(58, 183, 149, 0.4)',
  },
}));

// Urgency Chip Styling
const getUrgencyColor = (urgency) => {
  switch (urgency?.toLowerCase()) {
    case 'high': return { backgroundColor: '#ff5252', color: '#ffffff' };
    case 'medium': return { backgroundColor: '#ff9800', color: '#ffffff' };
    case 'low': return { backgroundColor: '#4caf50', color: '#ffffff' };
    default: return { backgroundColor: '#9e9e9e', color: '#ffffff' };
  }
};

export default function AdminDash() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // API Functions
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events`);
      if (response.ok) {
        const eventsData = await response.json();
        setEvents(eventsData);
      } else {
        console.error('Failed to fetch events');
        setSnackbar({ open: true, message: 'Failed to load events', severity: 'error' });
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setSnackbar({ open: true, message: 'Error loading events', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData) => {
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(eventData)
      });
      
      if (response.ok) {
        const newEvent = await response.json();
        setEvents(prev => [newEvent, ...prev]);
        setSnackbar({ open: true, message: 'Event created successfully!', severity: 'success' });
        return true;
      } else {
        const error = await response.json();
        setSnackbar({ open: true, message: error.message || 'Failed to create event', severity: 'error' });
        return false;
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setSnackbar({ open: true, message: 'Error creating event', severity: 'error' });
      return false;
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        setEvents(prev => prev.filter(event => event._id !== eventId));
        setSnackbar({ open: true, message: 'Event deleted successfully!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Failed to delete event', severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setSnackbar({ open: true, message: 'Error deleting event', severity: 'error' });
    }
  };

  const updateEvent = async (eventId, eventData) => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(eventData)
      });
      
      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents(prev => prev.map(event => 
          event._id === eventId ? updatedEvent : event
        ));
        setSnackbar({ open: true, message: 'Event updated successfully!', severity: 'success' });
        return true;
      } else {
        const error = await response.json();
        setSnackbar({ open: true, message: error.message || 'Failed to update event', severity: 'error' });
        return false;
      }
    } catch (error) {
      console.error('Error updating event:', error);
      setSnackbar({ open: true, message: 'Error updating event', severity: 'error' });
      return false;
    }
  };

  const assignVolunteerToEvent = async (eventId, volunteerEmail) => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/assign-volunteer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ volunteerEmail })
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign volunteer');
      }
    } catch (error) {
      console.error('Error assigning volunteer:', error);
      throw error;
    }
  };

  // Load events and volunteers on component mount
  useEffect(() => {
    fetchEvents();
    fetchAvailableVolunteers();
  }, []);

  // Enhanced State Management
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showMatchingForm, setShowMatchingForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Event Form State
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
    skills: [],
    urgency: '',
    date: '',
    requiredVolunteers: 1
  });
  
  // Volunteer Matching State
  const [matchingData, setMatchingData] = useState({
    selectedEvent: '',
    selectedVolunteers: [],
    autoMatch: false,
    autoMatchResult: null,
    availableVolunteers: []
  });
  
  // Fetch available volunteers for auto-complete
  const fetchAvailableVolunteers = async () => {
    try {
      const response = await fetch(`${API_URL}/users?userType=volunteer`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const volunteers = await response.json();
        setMatchingData(prev => ({ 
          ...prev, 
          availableVolunteers: volunteers.map(v => ({
            name: v.profile?.fullName || v.email,
            email: v.email,
            skills: v.profile?.skills || [],
            id: v._id
          }))
        }));
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    }
  };
  
  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New volunteer John Doe registered', type: 'info', timestamp: new Date() },
    { id: 2, message: 'Food Drive event needs 3 more volunteers', type: 'warning', timestamp: new Date() },
    { id: 3, message: 'Clothing Distribution completed successfully', type: 'success', timestamp: new Date() }
  ]);
  
  // Volunteer History State
  const [volunteerHistory, setVolunteerHistory] = useState([
    { id: 1, volunteerName: 'John Doe', eventName: 'Beach Cleanup', date: '2024-06-15', hours: 4, status: 'Completed' },
    { id: 2, volunteerName: 'Jane Smith', eventName: 'Food Drive', date: '2024-06-20', hours: 6, status: 'Completed' },
    { id: 3, volunteerName: 'Mike Johnson', eventName: 'Tree Planting', date: '2024-06-25', hours: 5, status: 'Completed' }
  ]);
  
  // Form Validation Errors
  const [errors, setErrors] = useState({});

  // Simplified event form handlers
  const handleEventFormSubmit = useCallback((formData) => {
    handleAddEvent(formData);
  }, []);

  const handleEventFormClose = useCallback(() => {
    setShowEventForm(false);
    setIsEditMode(false);
    setEditingEvent(null);
    setEventData({
      title: '',
      description: '',
      location: '',
      skills: [],
      urgency: '',
      date: '',
      requiredVolunteers: 1
    });
    setErrors({});
  }, []);

  // Enhanced Validation Functions
  const validateEventForm = (data) => {
    const newErrors = {};
    
    if (!data.title.trim()) {
      newErrors.title = 'Event name is required';
    } else if (data.title.length > 100) {
      newErrors.title = 'Event name must be 100 characters or less';
    }
    
    if (!data.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (data.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!data.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!data.urgency) {
      newErrors.urgency = 'Urgency level is required';
    }
    
    if (!data.date) {
      newErrors.date = 'Event date is required';
    } else if (new Date(data.date) < new Date()) {
      newErrors.date = 'Event date cannot be in the past';
    }
    
    if (data.requiredVolunteers < 1) {
      newErrors.requiredVolunteers = 'At least 1 volunteer is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddEvent = async (formData) => {
    const dataToUse = formData || eventData;
    
    if (!validateEventForm(dataToUse)) {
      setSnackbar({ open: true, message: 'Please fix the validation errors', severity: 'error' });
      return;
    }
    
    let success;
    if (isEditMode && editingEvent) {
      success = await updateEvent(editingEvent._id, dataToUse);
    } else {
      success = await createEvent(dataToUse);
    }
    
    if (success) {
      setEventData({
        title: '',
        description: '',
        location: '',
        skills: [],
        urgency: '',
        date: '',
        requiredVolunteers: 1
      });
      setErrors({});
      setShowEventForm(false);
      setIsEditMode(false);
      setEditingEvent(null);
      
      // Add notification
      const newNotification = {
        id: notifications.length + 1,
        message: isEditMode ? `Event "${dataToUse.title}" has been updated` : `New event "${dataToUse.title}" has been created`,
        type: 'success',
        timestamp: new Date()
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };
  
  const handleEditEvent = (event) => {
    setEventData({
      title: event.title || '',
      description: event.description || '',
      location: event.location || '',
      skills: event.skills || [],
      urgency: event.urgency || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      requiredVolunteers: event.requiredVolunteers || 1
    });
    setEditingEvent(event);
    setIsEditMode(true);
    setShowEventForm(true);
    setErrors({});
  };
  
  const handleDeleteEvent = async (eventId) => {
    await deleteEvent(eventId);
  };
  



  
  const handleVolunteerMatch = async () => {
    if (!matchingData.selectedEvent || matchingData.selectedVolunteers.length === 0) {
      setSnackbar({ open: true, message: 'Please select an event and volunteers', severity: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      const selectedEvent = events.find(e => e._id === matchingData.selectedEvent);
      
      // Create match record using the new API
      const matchData = {
        eventId: matchingData.selectedEvent,
        volunteers: matchingData.selectedVolunteers
      };
      
      const response = await fetch(`${API_URL}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(matchData)
      });
      
      if (response.ok) {
        const matchResult = await response.json();
        
        // Assign each volunteer to the event
        let successCount = 0;
        for (const volunteerName of matchingData.selectedVolunteers) {
          try {
            // Find volunteer from available volunteers
            const volunteer = matchingData.availableVolunteers.find(v => v.name === volunteerName);
            const volunteerEmail = volunteer?.email || `${volunteerName.toLowerCase().replace(' ', '.')}@example.com`;
            
            await assignVolunteerToEvent(matchingData.selectedEvent, volunteerEmail);
            successCount++;
          } catch (error) {
            console.error(`Failed to assign ${volunteerName}:`, error);
          }
        }
        
        if (successCount > 0) {
          // Refresh events to get updated data
          await fetchEvents();
          
          // Add to volunteer history
          const newHistoryEntries = matchingData.selectedVolunteers.slice(0, successCount).map(volunteer => ({
            id: volunteerHistory.length + Math.random(),
            volunteerName: volunteer,
            eventName: selectedEvent?.title || 'Unknown Event',
            date: selectedEvent?.date || new Date().toISOString().split('T')[0],
            hours: 0,
            status: 'Assigned'
          }));
          
          setVolunteerHistory(prev => [...newHistoryEntries, ...prev]);
          
          // Add notification
          const newNotification = {
            id: notifications.length + 1,
            message: `${successCount} volunteers matched to ${selectedEvent?.title}`,
            type: 'success',
            timestamp: new Date()
          };
          setNotifications(prev => [newNotification, ...prev]);
          
          setSnackbar({ open: true, message: `${successCount} volunteers matched successfully!`, severity: 'success' });
        } else {
          setSnackbar({ open: true, message: 'Failed to assign volunteers', severity: 'error' });
        }
        
        // Reset form
        setMatchingData({ 
          selectedEvent: '', 
          selectedVolunteers: [], 
          autoMatch: false, 
          autoMatchResult: null,
          availableVolunteers: matchingData.availableVolunteers
        });
        setShowMatchingForm(false);
      } else {
        const error = await response.json();
        setSnackbar({ 
          open: true, 
          message: error.message || 'Failed to create match record', 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('Error in volunteer matching:', error);
      setSnackbar({ open: true, message: 'Error matching volunteers', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAutoMatch = async () => {
    if (!matchingData.selectedEvent) {
      setSnackbar({ open: true, message: 'Please select an event first', severity: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/matches/auto-match/${matchingData.selectedEvent}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const matchResult = await response.json();
        const volunteerNames = matchResult.matches.map(match => match.name);
        
        setMatchingData(prev => ({ 
          ...prev, 
          selectedVolunteers: volunteerNames,
          autoMatchResult: matchResult
        }));
        
        setSnackbar({ 
          open: true, 
          message: `Auto-matched ${volunteerNames.length} volunteers based on skills and availability`, 
          severity: 'success' 
        });
      } else {
        const error = await response.json();
        setSnackbar({ 
          open: true, 
          message: error.message || 'Failed to auto-match volunteers', 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('Error in auto-matching:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error connecting to auto-match service', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const totalEvents = events.length;
  const highUrgencyEvents = events.filter(e => e.urgency === 'High').length;
  const totalVolunteers = events.reduce((sum, event) => sum + (event.assignedVolunteers?.length || 0), 0);
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
 
  return (
    <>
      {/* Professional AppBar */}
      <AppBar position="fixed" sx={{ 
  background: 'linear-gradient(to right, #3AB795, #F76C5E, #FFD972)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
}}>
  <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <NavButton onClick={() => navigate('/admin')}>Dashboard</NavButton>
      <NavButton onClick={() => setShowMatchingForm(true)}>
        <MatchIcon sx={{ mr: 1 }} />
        Match Volunteers
      </NavButton>
      <NavButton onClick={() => setShowNotifications(true)}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon sx={{ mr: 1 }} />
        </Badge>
        Notifications
      </NavButton>
      <NavButton onClick={() => setShowHistory(true)}>
        <HistoryIcon sx={{ mr: 1 }} />
        Volunteer History
      </NavButton>

      
      <NavButton onClick={() => navigate('/reports')}>
        <AssessmentIcon sx={{ mr: 1 }} />
        Reports
      </NavButton>
      
    </Box>

    <NavButton onClick={logout}>
      <LogoutIcon sx={{ mr: 1 }} />
      Logout
    </NavButton>
  </Toolbar>
</AppBar>

      {/* Page Container */}
      <StyledContainer>
        <StyledPaper>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="700" sx={{ color: '#2c3e50', mb: 1 }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
              Manage events, volunteers, and monitor your organization's activities
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: '#3498db', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                    <EventIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#2c3e50' }}>
                    {totalEvents}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                    Total Events
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: '#e74c3c', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                    <PriorityHighIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#2c3e50' }}>
                    {highUrgencyEvents}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                    High Priority
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: '#2ecc71', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                    <PeopleIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#2c3e50' }}>
                    {totalVolunteers}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                    Total Volunteers
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: '#f39c12', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                    <LocationOnIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#2c3e50' }}>
                    {upcomingEvents}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                    Upcoming Events
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>
          </Grid>

          {/* Events Section Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="600" sx={{ color: '#2c3e50' }}>
              Event Management
            </Typography>
            <ActionButton
              startIcon={<AddIcon />}
              onClick={() => setShowEventForm(true)}
            >
              Create New Event
            </ActionButton>
          </Box>

          {/* Professional Events Table */}
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Event Details</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Date & Location</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Skills Required</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Volunteers</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                      <Typography sx={{ mt: 2 }}>Loading events...</Typography>
                    </TableCell>
                  </TableRow>
                ) : events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" sx={{ color: '#7f8c8d' }}>No events found</Typography>
                      <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Create your first event to get started</Typography>
                    </TableCell>
                  </TableRow>
                ) : events.map((event, index) => (
                  <TableRow 
                    key={event._id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f8f9fa' },
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc'
                    }}
                  >
                    <TableCell sx={{ py: 3 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#2c3e50', mb: 0.5 }}>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                          {event.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#2c3e50', mb: 0.5, fontWeight: 500 }}>
                          📅 {new Date(event.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                          📍 {event.location}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {event.skills && event.skills.length > 0 ? (
                          event.skills.map((skill, idx) => (
                            <Chip 
                              key={idx} 
                              label={skill} 
                              size="small" 
                              sx={{ 
                                backgroundColor: '#e3f2fd', 
                                color: '#1976d2',
                                fontWeight: 500
                              }} 
                            />
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                            No specific skills
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Chip 
                        label={event.urgency || 'Not specified'}
                        size="small"
                        sx={{
                          ...getUrgencyColor(event.urgency),
                          fontWeight: 600,
                          minWidth: 80
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: '#3498db', width: 32, height: 32 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {event.assignedVolunteers?.length || 0}
                          </Typography>
                        </Avatar>
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                          / {event.requiredVolunteers || 0} needed
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>

                        <Tooltip title="Edit Event">
                          <IconButton 
                            size="small" 
                            sx={{ color: '#3498db' }}
                            onClick={() => handleEditEvent(event)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Event">
                          <IconButton 
                            size="small" 
                            sx={{ color: '#e74c3c' }}
                            onClick={() => handleDeleteEvent(event._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>

          {/* Event Form Dialog */}
          <EventFormDialog
            open={showEventForm}
            onClose={handleEventFormClose}
            onSubmit={handleEventFormSubmit}
            initialData={isEditMode ? eventData : null}
            isEditMode={isEditMode}
            errors={errors}
          />

          {/* Volunteer Matching Modal */}
          <Dialog open={showMatchingForm} onClose={() => setShowMatchingForm(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Match Volunteers to Events
              <IconButton onClick={() => setShowMatchingForm(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Select Event</InputLabel>
                    <Select
                      value={matchingData.selectedEvent}
                      onChange={(e) => setMatchingData(prev => ({ ...prev, selectedEvent: e.target.value }))}
                      label="Select Event"
                    >
                      {events.map((event) => (
                        <MenuItem key={event._id} value={event._id}>
                          {event.title} - {new Date(event.date).toLocaleDateString()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="600">Select Volunteers</Typography>
                    <Button 
                      variant="outlined" 
                      onClick={handleAutoMatch}
                      disabled={!matchingData.selectedEvent}
                      startIcon={<MatchIcon />}
                    >
                      Auto Match
                    </Button>
                  </Box>
                  <Autocomplete
                    multiple
                    options={matchingData.availableVolunteers.map(volunteer => volunteer.name)}
                    value={matchingData.selectedVolunteers}
                    onChange={(event, newValue) => {
                      setMatchingData(prev => ({ ...prev, selectedVolunteers: newValue }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Volunteers"
                        placeholder="Choose volunteers for this event or use Auto Match"
                        helperText={`${matchingData.availableVolunteers.length} volunteers available`}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const volunteer = matchingData.availableVolunteers.find(v => v.name === option);
                        const matchInfo = matchingData.autoMatchResult?.matches.find(m => m.name === option);
                        return (
                          <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                            key={option}
                            color={matchInfo ? 'primary' : 'default'}
                            icon={matchInfo ? <CheckCircleIcon /> : undefined}
                          />
                        );
                      })
                    }
                    renderOption={(props, option) => {
                      const volunteer = matchingData.availableVolunteers.find(v => v.name === option);
                      const matchInfo = matchingData.autoMatchResult?.matches.find(m => m.name === option);
                      return (
                        <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body1" sx={{ fontWeight: matchInfo ? 600 : 400 }}>
                              {option}
                            </Typography>
                            {matchInfo && (
                              <Chip 
                                size="small" 
                                label={`${matchInfo.score}% match`} 
                                color="primary" 
                                sx={{ ml: 'auto' }}
                              />
                            )}
                          </Box>
                          {volunteer?.skills && volunteer.skills.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              Skills: {volunteer.skills.slice(0, 3).join(', ')}{volunteer.skills.length > 3 ? '...' : ''}
                            </Typography>
                          )}
                          {matchInfo?.matchingSkills && matchInfo.matchingSkills.length > 0 && (
                            <Typography variant="caption" color="primary">
                              Matching: {matchInfo.matchingSkills.join(', ')}
                            </Typography>
                          )}
                        </Box>
                      );
                    }}
                  />
                </Grid>
                {/* Auto-Match Results */}
                {matchingData.autoMatchResult && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, backgroundColor: '#e8f5e8', border: '1px solid #4caf50' }}>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom color="primary">
                        🎯 Auto-Match Results
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Found {matchingData.autoMatchResult.matches.length} suitable volunteers for this event
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {matchingData.autoMatchResult.matches.map((match, index) => (
                          <Box key={match.volunteerId} sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            p: 1,
                            backgroundColor: 'white',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0'
                          }}>
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {match.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {match.email}
                              </Typography>
                              {match.matchingSkills.length > 0 && (
                                <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
                                  Matching Skills: {match.matchingSkills.join(', ')}
                                </Typography>
                              )}
                            </Box>
                            <Chip 
                              size="small" 
                              label={`${match.score}% match`} 
                              color="primary"
                              variant="filled"
                            />
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                )}
                
                {matchingData.selectedEvent && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                        Event Details:
                      </Typography>
                      {(() => {
                        const selectedEvent = events.find(e => e._id === matchingData.selectedEvent);
                        return selectedEvent ? (
                          <Box>
                            <Typography variant="body2">📅 {new Date(selectedEvent.date).toLocaleDateString()}</Typography>
                            <Typography variant="body2">📍 {selectedEvent.location}</Typography>
                            <Typography variant="body2">🎯 Required Skills: {selectedEvent.skills?.join(', ') || 'None specified'}</Typography>
                            <Typography variant="body2">⚡ Priority: {selectedEvent.urgency}</Typography>
                            <Typography variant="body2">👥 Volunteers Needed: {selectedEvent.requiredVolunteers - (selectedEvent.assignedVolunteers?.length || 0)}</Typography>
                          </Box>
                        ) : null;
                      })()}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setShowMatchingForm(false)} color="inherit">
                Cancel
              </Button>
              <ActionButton onClick={handleVolunteerMatch}>
                Match Volunteers
              </ActionButton>
            </DialogActions>
          </Dialog>

          {/* Notifications Modal */}
          <Dialog open={showNotifications} onClose={() => setShowNotifications(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Notifications
              <IconButton onClick={() => setShowNotifications(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {notifications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <NotificationsIcon sx={{ fontSize: 48, color: '#bbb', mb: 2 }} />
                  <Typography variant="body1" color="textSecondary">
                    No notifications at this time
                  </Typography>
                </Box>
              ) : (
                <List>
                  {notifications.map((notification) => (
                    <ListItem
                      key={notification.id}
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        mb: 1,
                        backgroundColor: notification.type === 'warning' ? '#fff3cd' : 
                                       notification.type === 'success' ? '#d4edda' : '#d1ecf1'
                      }}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          onClick={() => clearNotification(notification.id)}
                          size="small"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        {notification.type === 'success' && <CheckCircleIcon color="success" />}
                        {notification.type === 'warning' && <WarningIcon color="warning" />}
                        {notification.type === 'info' && <InfoIcon color="info" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.message}
                        secondary={notification.timestamp.toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </DialogContent>
          </Dialog>

          {/* Volunteer History Modal */}
          <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="600">Volunteer History</Typography>
              <IconButton onClick={() => setShowHistory(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {volunteerHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <HistoryIcon sx={{ fontSize: 48, color: '#bbb', mb: 2 }} />
                  <Typography variant="body1" color="textSecondary">
                    No volunteer history available
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Volunteer Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Hours</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {volunteerHistory.map((record) => (
                        <TableRow key={record.id} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ bgcolor: '#3498db', mr: 2, width: 32, height: 32 }}>
                                {record.volunteerName.charAt(0)}
                              </Avatar>
                              {record.volunteerName}
                            </Box>
                          </TableCell>
                          <TableCell>{record.eventName}</TableCell>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>{record.hours} hrs</TableCell>
                          <TableCell>
                            <Chip
                              label={record.status}
                              size="small"
                              color={record.status === 'Completed' ? 'success' : 
                                     record.status === 'Assigned' ? 'primary' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DialogContent>
          </Dialog>



          {/* Success/Error Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </StyledPaper>
      </StyledContainer>
    </>
  );
}
