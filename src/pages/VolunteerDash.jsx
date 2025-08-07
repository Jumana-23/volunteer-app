import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';

import{
    Container,
    Box,
    Typography,
    Button,
    Divider,
    Grid,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Alert,
    Paper,
    Badge,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Tooltip,
    styled,
    Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import ProfileCard from '../components/ProfileCard';
import EventCard from '../components/EventCard';

// Styled components matching the login/admin color scheme
const StyledContainer = styled(Box)(() => ({
  minHeight: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #3AB795 0%, #F76C5E 50%, #FFD972 100%)',
  padding: '40px 20px',
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

const HeaderCard = styled(Paper)(() => ({
  padding: '24px 32px',
  borderRadius: '24px',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(58, 183, 149, 0.2)',
  marginBottom: '24px',
}));

const StatsCard = styled(Paper)(() => ({
  padding: '24px',
  borderRadius: '16px',
  background: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
  },
}));

const NotificationCard = styled(Paper)(() => ({
  padding: '24px',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(58, 183, 149, 0.15)',
  borderLeft: '4px solid #3AB795',
}));

const StyledButton = styled(Button)(() => ({
  padding: '12px 24px',
  background: 'linear-gradient(45deg, #3AB795 30%, #F76C5E 90%)',
  borderRadius: '12px',
  fontSize: '16px',
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

const LogoutButton = styled(Button)(() => ({
  padding: '10px 20px',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  color: '#666666',
  border: '2px solid #e0e6ed',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  '&:hover': {
    backgroundColor: '#ffffff',
    borderColor: '#F76C5E',
    color: '#F76C5E',
  },
}));

const SectionTitle = styled(Typography)(() => ({
  color: '#333333',
  fontWeight: 700,
  marginBottom: '20px',
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

const StyledTableContainer = styled(TableContainer)(() => ({
  borderRadius: '16px',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  background: '#ffffff',
}));

export default function VolunteerDash() {
    /* State */
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: 'Loading...', 
        location: 'Loading...', 
        skills: [],
    });
    const [profileLoading, setProfileLoading] = useState(true);
    const [selectedEventForView, setSelectedEventForView] = useState(null);
    const [showEventDetails, setShowEventDetails] = useState(false);
    
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // API configuration
    const API_URL = 'http://localhost:5000/api';

    // Handle viewing event details
    const handleViewEventDetails = async (historyItem) => {
        try {
            const eventId = historyItem.eventId?._id || historyItem.eventId;
            
            if (historyItem.eventId && typeof historyItem.eventId === 'object') {
                setSelectedEventForView({
                    eventName: historyItem.eventId.title || historyItem.eventName,
                    eventDate: historyItem.eventId.date || historyItem.eventDate,
                    location: historyItem.eventId.location || 'Location not available',
                    volunteerStatus: historyItem.status,
                    assignedDate: historyItem.assignedDate,
                    description: historyItem.eventId.description || 'Event details not available',
                    urgency: historyItem.eventId.urgency || 'Unknown',
                    requiredSkills: historyItem.eventId.requiredSkills || []
                });
            } else if (eventId) {
                const response = await fetch(`${API_URL}/events/${eventId}`);
                if (response.ok) {
                    const eventData = await response.json();
                    setSelectedEventForView({
                        ...eventData,
                        volunteerStatus: historyItem.status,
                        assignedDate: historyItem.assignedDate
                    });
                } else {
                    setSelectedEventForView({
                        eventName: historyItem.eventName,
                        eventDate: historyItem.eventDate,
                        volunteerStatus: historyItem.status,
                        assignedDate: historyItem.assignedDate,
                        description: historyItem.eventId.description,
                        location: 'Location not available',
                        urgency: 'Unknown'
                    });
                }
            } else {
                setSelectedEventForView({
                    eventName: historyItem.eventName,
                    eventDate: historyItem.eventDate,
                    volunteerStatus: historyItem.status,
                    assignedDate: historyItem.assignedDate,
                    description: 'Event details not available',
                    location: 'Location not available',
                    urgency: 'Unknown'
                });
            }
        } catch (error) {
            console.error('Error fetching event details:', error);
            setSelectedEventForView({
                eventName: historyItem.eventName,
                eventDate: historyItem.eventDate,
                volunteerStatus: historyItem.status,
                assignedDate: historyItem.assignedDate,
                description: 'Event details not available',
                location: 'Location not available',
                urgency: 'Unknown'
            });
        }
        setShowEventDetails(true);
    };
    
    // Fetch user profile from backend
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.warn('No authentication token found');
                setProfileLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched user profile:', data);
                
                setUser({
                    name: data.profile?.fullName || data.email || 'User',
                    location: data.profile?.city && data.profile?.state 
                        ? `${data.profile.city}, ${data.profile.state}` 
                        : data.profile?.city || 'Location not set',
                    skills: data.profile?.skills || []
                });
            } else {
                console.error('Failed to fetch user profile:', response.status);
                setUser({
                    name: 'Profile not found',
                    location: 'Please complete your profile',
                    skills: []
                });
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser({
                name: 'Error loading profile',
                location: 'Please refresh the page',
                skills: []
            });
        } finally {
            setProfileLoading(false);
        }
    };

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

    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [showNotificationSnackbar, setShowNotificationSnackbar] = useState(false);
    const [latestNotification, setLatestNotification] = useState(null);
    
    // Socket.IO integration for real-time notifications
    const { notifications: realtimeNotifications, isConnected, clearNotification } = useSocket();
    
    // Fetch notifications from backend
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('authToken');
            console.log('🔍 Token for notifications:', token ? 'Token exists' : 'No token found');
            
            if (!token) {
                console.warn('⚠️ No authentication token found, skipping notification fetch');
                setLoadingNotifications(false);
                return;
            }
            
            const response = await fetch(`${API_URL}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 Notifications API response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📋 Fetched notifications:', data);
                setNotifications(data);
            } else {
                const errorText = await response.text();
                console.error('❌ Failed to fetch notifications:', response.status, errorText);
            }
        } catch (error) {
            console.error('💥 Error fetching notifications:', error);
        } finally {
            setLoadingNotifications(false);
        }
    };
    
    // Fetch volunteer history from backend
    const fetchVolunteerHistory = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/volunteer-history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            } else {
                console.error('Failed to fetch volunteer history');
            }
        } catch (error) {
            console.error('Error fetching volunteer history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };
    
    useEffect(() => {
        const existingToken = localStorage.getItem('authToken');
        if (!existingToken) {
            const realToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODhiOGMxZDI4YzY4MDFlMTQ2YWRlM2UiLCJ1c2VyVHlwZSI6InZvbHVudGVlciIsImlhdCI6MTc1Mzk3NTgzNywiZXhwIjoxNzU0MDYyMjM3fQ.nhM_S294q5WwZ6bwIXL58CpiALNRitrMwjHeutXI_uE';
            
            localStorage.setItem('token', realToken);
            console.log('🧪 Using real JWT token for testing');
        }
        
        fetchUserProfile();
        fetchEvents();
        fetchNotifications();
        fetchVolunteerHistory();
    }, []);
    
    // Handle real-time notifications
    useEffect(() => {
        console.log('🔄 Real-time notifications updated:', realtimeNotifications.length);
        if (realtimeNotifications.length > 0) {
            const newNotifications = realtimeNotifications.filter(
                rtNotif => !notifications.some(notif => notif._id === rtNotif.id)
            );
            
            console.log('📋 New notifications to add:', newNotifications.length);
            
            if (newNotifications.length > 0) {
                setNotifications(prev => {
                    const updated = [...newNotifications.map(n => ({
                        _id: n.id,
                        message: n.message,
                        type: n.type,
                        eventId: n.eventId,
                        createdAt: n.createdAt,
                        isRead: n.isRead || false
                    })), ...prev];
                    console.log('📋 Updated notifications list:', updated.length);
                    return updated;
                });
                
                const latestNotif = newNotifications[0];
                setLatestNotification(latestNotif);
                setShowNotificationSnackbar(true);
                console.log('🔔 Showing snackbar for:', latestNotif.message);
            }
        }
    }, [realtimeNotifications]);
    
    const [openEdit, setOpenEdit] = useState(false);
    const [editDraft, setEditDraft] = useState(user);
    const [savedMsg, setSavedMsg] = useState('');

    /* ---- Handlers ---- */
    const handleRegister = (eventId) =>
        setEvents((prev)=>
            prev.map((e) => (e.id ===eventId ? { ...e, need: e.need-1} :e))
        );
    const handleSaveProfile = () => {
        setUser(editDraft);
        setSavedMsg('Profile Updated !');
        setOpenEdit(false);
    };

    const logout = () => {
      localStorage.removeItem('authToken');
      navigate('/');
    }

    return (
    <StyledContainer>
      <Container maxWidth="lg">
        {/* Header Section */}
        <HeaderCard elevation={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#333333', mb: 1 }}>
                Welcome back, {user.name.split(' ')[0]}! 
              </Typography>
              <Typography variant="body1" sx={{ color: '#666666' }}>
                Ready to make a difference in your community?
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <IconButton 
                sx={{ 
                  color: '#3AB795',
                  backgroundColor: 'rgba(58, 183, 149, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(58, 183, 149, 0.2)',
                  }
                }} 
                onClick={() => setOpenEdit(true)}
              >
                <EditIcon />
              </IconButton>
              <LogoutButton onClick={logout} startIcon={<LogoutIcon />}>
                Log Out
              </LogoutButton>
            </Box>
          </Box>
        </HeaderCard>

        {savedMsg && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              borderRadius: '12px',
              backgroundColor: 'rgba(58, 183, 149, 0.1)',
              color: '#2ea082'
            }} 
            onClose={() => setSavedMsg('')}
          >
            {savedMsg}
          </Alert>
        )}

        {/* Profile Section */}
        <StyledPaper elevation={0}>
          <SectionTitle variant="h5">
            <PersonIcon sx={{ color: '#3AB795' }} />
            Your Profile
          </SectionTitle>
          {profileLoading ? (
            <Typography sx={{ color: '#666666' }}>Loading profile...</Typography>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOnIcon sx={{ color: '#F76C5E' }} />
                  <Typography variant="body1" sx={{ color: '#333333' }}>
                    {user.location}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <WorkIcon sx={{ color: '#FFD972' }} />
                  {user.skills.map((skill, index) => (
                    <Chip 
                      key={index}
                      label={skill}
                      sx={{
                        backgroundColor: 'rgba(58, 183, 149, 0.1)',
                        color: '#3AB795',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </StyledPaper>

        {/* Notifications Section */}
        <NotificationCard elevation={0}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <Badge 
                badgeContent={notifications.filter(n => !n.isRead).length} 
                color="error"
              >
                <NotificationsActive sx={{ mr: 2, color: '#3AB795', fontSize: 28 }} />
              </Badge>
              <Typography variant="h6" sx={{ color: '#333333', fontWeight: 600 }}>
                Notifications
              </Typography>
            </Box>
          </Box>
          {loadingNotifications ? (
            <Typography variant="body2" sx={{ color: '#666666' }}>Loading notifications...</Typography>
          ) : notifications.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#666666' }}>No notifications yet</Typography>
          ) : (
            notifications.slice(0, 5).map((note) => (
              <Box 
                key={note._id || note.id} 
                sx={{ 
                  mb: 2, 
                  p: 2, 
                  borderRadius: '8px', 
                  backgroundColor: note.isRead ? 'transparent' : 'rgba(58, 183, 149, 0.05)',
                  borderLeft: note.isRead ? 'none' : '3px solid #3AB795'
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: note.isRead ? '#666666' : '#333333', 
                    fontWeight: note.isRead ? 'normal' : 500 
                  }}
                >
                  {note.message}
                </Typography>
                {note.createdAt && (
                  <Typography variant="caption" sx={{ color: '#999999' }}>
                    {new Date(note.createdAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
            ))
          )}
        </NotificationCard>

        {/* Upcoming Events */}
        <Box mt={4}>
          <SectionTitle variant="h5">
            Upcoming Events
          </SectionTitle>
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event._id}>
                <StatsCard elevation={0}>
                  <Typography variant="h6" sx={{ color: '#333333', fontWeight: 600, mb: 2 }}>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666', mb: 1 }}>
                    📅 {new Date(event.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                    📍 {event.location}
                  </Typography>
                  <StyledButton fullWidth size="small" onClick={() => handleRegister(event._id)}>
                    Register
                  </StyledButton>
                </StatsCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Volunteer History */}
        <Box mt={4}>
          <SectionTitle variant="h5">
            Your Volunteer History
          </SectionTitle>
          <StyledTableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ color: '#333333', fontWeight: 600 }}>Event Name</TableCell>
                  <TableCell sx={{ color: '#333333', fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ color: '#333333', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: '#333333', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingHistory ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#666666' }}>
                      Loading history...
                    </TableCell>
                  </TableRow>
                ) : history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#666666' }}>
                      No volunteer history yet
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((h) => (
                    <TableRow key={h._id} sx={{ '&:hover': { backgroundColor: 'rgba(58, 183, 149, 0.02)' } }}>
                      <TableCell sx={{ color: '#333333' }}>{h.eventName}</TableCell>
                      <TableCell sx={{ color: '#666666' }}>
                        {new Date(h.eventDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={h.status} 
                          size="small"
                          sx={{
                            backgroundColor: h.status === 'Completed' ? 'rgba(46, 204, 113, 0.1)' : 
                                           h.status === 'Assigned' ? 'rgba(58, 183, 149, 0.1)' : 
                                           h.status === 'Cancelled' ? 'rgba(247, 108, 94, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                            color: h.status === 'Completed' ? '#2ecc71' : 
                                  h.status === 'Assigned' ? '#3AB795' : 
                                  h.status === 'Cancelled' ? '#F76C5E' : '#666666',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Event Details">
                          <IconButton 
                            onClick={() => handleViewEventDetails(h)}
                            sx={{ 
                              color: '#3AB795',
                              '&:hover': { backgroundColor: 'rgba(58, 183, 149, 0.1)' } 
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Box>

        {/* Edit Profile Dialog */}
        <Dialog 
          open={openEdit} 
          onClose={() => setOpenEdit(false)} 
          fullWidth 
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: '24px',
              padding: '8px',
            }
          }}
        >
          <DialogTitle sx={{ color: '#333333', fontWeight: 600 }}>Edit Profile</DialogTitle>
          <DialogContent dividers>
            <TextField
                fullWidth
                label="Full Name"
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 50 }}
                value={editDraft.name}
                onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                required
            />
            <TextField
                fullWidth
                label="City"
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 100 }}
                value={editDraft.city || ''}
                onChange={(e) => setEditDraft({ ...editDraft, city: e.target.value })}
                required
            />
            <TextField
                fullWidth
                select
                label="State"
                sx={{ mb: 2 }}
                value={editDraft.state || ''}
                onChange={(e) => setEditDraft({ ...editDraft, state: e.target.value })}
                required
                SelectProps={{ native: true }}
            >
                <option value="">Select State</option>
                {[
                'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
                ].map((code) => (
                <option key={code} value={code}>{code}</option>
                ))}
            </TextField>
            <TextField
                fullWidth
                label="Skills (comma-separated)"
                sx={{ mb: 2 }}
                value={editDraft.skills?.join(', ') || ''}
                onChange={(e) =>
                setEditDraft({ ...editDraft, skills: e.target.value.split(',').map((s) => s.trim()) })
                }
                required
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setOpenEdit(false)}
              sx={{ color: '#666666' }}
            >
              Cancel
            </Button>
            <StyledButton onClick={handleSaveProfile}>
              Save Changes
            </StyledButton>
          </DialogActions>
        </Dialog>
        
        {/* Event Details Modal */}
        <Dialog 
          open={showEventDetails} 
          onClose={() => setShowEventDetails(false)} 
          fullWidth 
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: '24px',
              padding: '8px',
            }
          }}
        >
          <DialogTitle sx={{ borderBottom: '1px solid #e0e6ed', pb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#333333' }}>
              Event Details
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedEventForView && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: '#3AB795', mb: 1 }}>
                    {selectedEventForView.eventName || selectedEventForView.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#666666', mb: 0.5 }}>Event Date:</Typography>
                  <Typography variant="body1" sx={{ color: '#333333' }}>
                    {new Date(selectedEventForView.eventDate || selectedEventForView.date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#666666', mb: 0.5 }}>Location:</Typography>
                  <Typography variant="body1" sx={{ color: '#333333' }}>
                    {selectedEventForView.location || 'Not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#666666', mb: 0.5 }}>Your Status:</Typography>
                  <Chip 
                    label={selectedEventForView.volunteerStatus} 
                    size="small"
                    sx={{
                      
                      backgroundColor: selectedEventForView.volunteerStatus === 'Completed' ? 'rgba(46, 204, 113, 0.1)' : 
                                    selectedEventForView.volunteerStatus === 'Assigned' ? 'rgba(58, 183, 149, 0.1)' : 
                                    selectedEventForView.volunteerStatus === 'Cancelled' ? 'rgba(247, 108, 94, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                     color: selectedEventForView.volunteerStatus === 'Completed' ? '#2ecc71' : 
                           selectedEventForView.volunteerStatus === 'Assigned' ? '#3AB795' : 
                           selectedEventForView.volunteerStatus === 'Cancelled' ? '#F76C5E' : '#666666',
                     fontWeight: 500
                   }}
                 />
               </Grid>
               {selectedEventForView.assignedDate && (
                 <Grid item xs={12} sm={6}>
                   <Typography variant="body2" sx={{ color: '#666666', mb: 0.5 }}>Assigned Date:</Typography>
                   <Typography variant="body1" sx={{ color: '#333333' }}>
                     {new Date(selectedEventForView.assignedDate).toLocaleDateString()}
                   </Typography>
                 </Grid>
               )}
               {selectedEventForView.skills && selectedEventForView.skills.length > 0 && (
                 <Grid item xs={12}>
                   <Typography variant="body2" sx={{ color: '#666666', mb: 1 }}>Required Skills:</Typography>
                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                     {selectedEventForView.skills.map((skill, index) => (
                       <Chip 
                         key={index}
                         label={skill} 
                         size="small"
                         sx={{
                           backgroundColor: 'rgba(58, 183, 149, 0.1)',
                           color: '#3AB795'
                         }}
                       />
                     ))}
                   </Box>
                 </Grid>
               )}
             </Grid>
           )}
         </DialogContent>
         <DialogActions sx={{ borderTop: '1px solid #e0e6ed', pt: 2 }}>
           <Button 
             onClick={() => setShowEventDetails(false)}
             sx={{
               color: '#666666',
               '&:hover': {
                 backgroundColor: 'rgba(0, 0, 0, 0.04)',
               },
             }}
           >
             Close
           </Button>
         </DialogActions>
       </Dialog>

       {/* Real-time notification snackbar */}
       <Snackbar
         open={showNotificationSnackbar}
         autoHideDuration={6000}
         onClose={() => setShowNotificationSnackbar(false)}
         anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
       >
         <Alert 
           onClose={() => setShowNotificationSnackbar(false)} 
           severity="info" 
           sx={{ 
             width: '100%',
             backgroundColor: '#3AB795',
             color: '#ffffff',
             '& .MuiAlert-icon': {
               color: '#ffffff'
             }
           }}
         >
           <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
             🔔 New Assignment!
           </Typography>
           <Typography variant="body2">
             {latestNotification?.message}
           </Typography>
         </Alert>
       </Snackbar>
     </Container>
   </StyledContainer>
 );
}