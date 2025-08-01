console.log("VolunteerDash Loaded");
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ProfileCard from '../components/ProfileCard';
import EventCard from '../components/EventCard';


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
            // Check if eventId is populated (object) or just an ID (string)
            const eventId = historyItem.eventId?._id || historyItem.eventId;
            
            if (historyItem.eventId && typeof historyItem.eventId === 'object') {
                // EventId is already populated with event data
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
                // Fetch full event details from the backend
                const response = await fetch(`${API_URL}/events/${eventId}`);
                if (response.ok) {
                    const eventData = await response.json();
                    setSelectedEventForView({
                        ...eventData,
                        volunteerStatus: historyItem.status,
                        assignedDate: historyItem.assignedDate
                    });
                } else {
                    // Fallback to history item data if event fetch fails
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
                // No eventId available, use history item data
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
            // Fallback to history item data
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
                
                // Transform the profile data to match the expected format
                setUser({
                    name: data.profile?.fullName || data.email || 'User',
                    location: data.profile?.city && data.profile?.state 
                        ? `${data.profile.city}, ${data.profile.state}` 
                        : data.profile?.city || 'Location not set',
                    skills: data.profile?.skills || []
                });
            } else {
                console.error('Failed to fetch user profile:', response.status);
                // Keep default loading state if profile fetch fails
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
    const [volunteerStats, setVolunteerStats] = useState({
        totalEvents: 0,
        completedEvents: 0,
        totalHours: 0
    });
    
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
    
    // Fetch volunteer statistics
    const fetchVolunteerStats = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/volunteer-history/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setVolunteerStats(data);
            } else {
                console.error('Failed to fetch volunteer stats');
            }
        } catch (error) {
            console.error('Error fetching volunteer stats:', error);
        }
    };
    
    useEffect(() => {
        // Create a test token for demonstration if none exists
        const existingToken = localStorage.getItem('authToken');
        if (!existingToken) {
            // Use a real JWT token from backend registration
            // This token was generated by registering test2@example.com as a volunteer
            const realToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODhiOGMxZDI4YzY4MDFlMTQ2YWRlM2UiLCJ1c2VyVHlwZSI6InZvbHVudGVlciIsImlhdCI6MTc1Mzk3NTgzNywiZXhwIjoxNzU0MDYyMjM3fQ.nhM_S294q5WwZ6bwIXL58CpiALNRitrMwjHeutXI_uE';
            
            localStorage.setItem('token', realToken);
            console.log('🧪 Using real JWT token for testing');
        }
        
        // Fetch all data on component mount
        fetchUserProfile();
        fetchEvents();
        fetchNotifications();
        fetchVolunteerHistory();
        // fetchVolunteerStats();
    }, []);
    
    // Handle real-time notifications
    useEffect(() => {
        console.log('🔄 Real-time notifications updated:', realtimeNotifications.length);
        if (realtimeNotifications.length > 0) {
            // Merge real-time notifications with existing ones
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
                
                // Show snackbar for the latest notification
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

    /*----- UI ----- */
    
    // Dark theme TextField styling
    const textFieldSx = {
      mb: 2,
      '& .MuiOutlinedInput-root': {
        color: '#ffffff',
        '& fieldset': {
          borderColor: '#555555',
        },
        '&:hover fieldset': {
          borderColor: '#64b5f6',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#64b5f6',
        },
      },
      '& .MuiInputLabel-root': {
        color: '#b0b0b0',
        '&.Mui-focused': {
          color: '#64b5f6',
        },
      },
    };

    const logout = () => {
      localStorage.removeItem('authToken');
      navigate('/');
    }

    return (
    <Container maxWidth="lg" sx={{ 
      py: 4, 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#ffffff'
    }}>
      {/* header row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#ffffff' }}>
          Welcome, {user.name.split(' ')[0]}! 
        </Typography>
        <Button onClick={logout}>
          Log Out
        </Button>
        <IconButton 
          sx={{ 
            color: '#64b5f6',
            backgroundColor: 'rgba(100, 181, 246, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(100, 181, 246, 0.2)',
            }
          }} 
          onClick={() => setOpenEdit(true)}
        >
          <EditIcon />
        </IconButton>
      </Box>

      {savedMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSavedMsg('')}>
          {savedMsg}
        </Alert>
      )}

      {/* profile */}
      {profileLoading ? (
        <Paper elevation={4} sx={{ p: 3, mt: 3 }}>
          <Typography>Loading profile...</Typography>
        </Paper>
      ) : (
        <ProfileCard user={user} />
      )}

      {/* notifications */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          mt: 3,
          borderLeft: '4px solid #64b5f6',
          background: 'linear-gradient(135deg, #333333 0%, #404040 100%)',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <Badge 
              badgeContent={notifications.filter(n => !n.isRead).length} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#f44336',
                  color: '#ffffff'
                }
              }}
            >
              <NotificationsActive sx={{ mr: 1, color: '#64b5f6' }} />
            </Badge>
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600, ml: 1 }}>
              Notifications
            </Typography>
          </Box>
        </Box>
        {loadingNotifications ? (
          <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Loading notifications...</Typography>
        ) : notifications.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#b0b0b0' }}>No notifications yet</Typography>
        ) : (
          notifications.slice(0, 5).map((note) => (
            <Box key={note._id || note.id} sx={{ mb: 1, p: 1, borderRadius: 1, backgroundColor: note.isRead ? 'transparent' : 'rgba(100, 181, 246, 0.1)' }}>
              <Typography variant="body2" sx={{ color: note.isRead ? '#b0b0b0' : '#e0e0e0', fontWeight: note.isRead ? 'normal' : 'bold' }}>
                • {note.message}
              </Typography>
              {note.createdAt && (
                <Typography variant="caption" sx={{ color: '#888888', ml: 2 }}>
                  {new Date(note.createdAt).toLocaleString()}
                </Typography>
              )}
            </Box>
          ))
        )}

      </Paper>

      {/* upcoming events */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2, color: '#ffffff', fontWeight: 600 }}>
        Upcoming Events
      </Typography>
      <Grid container spacing={2}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} key={event._id}>
            <EventCard event={event} onRegister={handleRegister} showVolunteerCount={true} />
          </Grid>
        ))}
      </Grid>

      {/* volunteer statistics */}
      {/* <Divider sx={{ my: 4, borderColor: '#555555' }} />
      <Typography variant="h5" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>
        Volunteer Statistics
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              {volunteerStats.totalEvents}
            </Typography>
            <Typography variant="body2" sx={{ color: '#e0e7ff' }}>
              Total Events
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #166534 0%, #22c55e 100%)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              {volunteerStats.completedEvents}
            </Typography>
            <Typography variant="body2" sx={{ color: '#dcfce7' }}>
              Completed
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #7c2d12 0%, #a855f7 100%)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              {volunteerStats.totalHours}
            </Typography>
            <Typography variant="body2" sx={{ color: '#f3e8ff' }}>
              Total Hours
            </Typography>
          </Paper>
        </Grid>
      </Grid> */}

      {/* history */}
      <Typography variant="h5" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>
        Volunteer History
      </Typography>
      <Paper
        elevation={2}
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #333333 0%, #404040 100%)',
          borderRadius: 2,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        }}
      >
        {loadingHistory ? (
          <Typography variant="body2" sx={{ color: '#b0b0b0', textAlign: 'center', py: 4 }}>
            Loading history...
          </Typography>
        ) : history.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#b0b0b0', textAlign: 'center', py: 4 }}>
            No volunteer history yet
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #555' }}>Event Name</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #555' }}>Date</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #555' }}>Status</TableCell>
                  {/* <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #555' }}>Hours</TableCell> */}
                  {/* <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #555' }}>Rating</TableCell> */}
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #555' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h._id} sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' } }}>
                    <TableCell sx={{ color: '#e0e0e0', borderBottom: '1px solid #444' }}>
                      {h.eventName}
                    </TableCell>
                    <TableCell sx={{ color: '#b0b0b0', borderBottom: '1px solid #444' }}>
                      {new Date(h.eventDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #444' }}>
                      <Chip 
                        label={h.status} 
                        size="small"
                        sx={{
                          backgroundColor: h.status === 'Completed' ? '#22c55e' : 
                                         h.status === 'Assigned' ? '#3b82f6' : 
                                         h.status === 'Cancelled' ? '#ef4444' : '#6b7280',
                          color: '#ffffff',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    {/* <TableCell sx={{ color: '#64b5f6', fontWeight: 500, borderBottom: '1px solid #444' }}>
                      {h.hoursWorked || 0} hrs
                    </TableCell> */}
                    {/* <TableCell sx={{ color: '#fbbf24', borderBottom: '1px solid #444' }}>
                      {h.rating ? `★ ${h.rating}/5` : '-'}
                    </TableCell> */}
                    <TableCell sx={{ borderBottom: '1px solid #444' }}>
                      <Tooltip title="View Event Details">
                        <IconButton 
                          onClick={() => handleViewEventDetails(h)}
                          sx={{ color: '#64b5f6', '&:hover': { backgroundColor: 'rgba(100, 181, 246, 0.1)' } }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ---------- Edit Profile dialog ---------- */}
      <Dialog 
        open={openEdit} 
        onClose={() => setOpenEdit(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #2d2d2d 0%, #404040 100%)',
            color: '#ffffff',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #555555' }}>Edit Profile</DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#555555' }}>
            <TextField
                fullWidth
                label="Full Name"
                sx={textFieldSx}
                inputProps={{ maxLength: 50 }}
                value={editDraft.name}
                onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                required
            />
            <TextField
                fullWidth
                label="Address 1"
                sx={textFieldSx}
                inputProps={{ maxLength: 100 }}
                value={editDraft.address1 || ''}
                onChange={(e) => setEditDraft({ ...editDraft, address1: e.target.value })}
                required
            />
            <TextField
                fullWidth
                label="Address 2"
                sx={textFieldSx}
                inputProps={{ maxLength: 100 }}
                value={editDraft.address2 || ''}
                onChange={(e) => setEditDraft({ ...editDraft, address2: e.target.value })}
            />
            <TextField
                fullWidth
                label="City"
                sx={textFieldSx}
                inputProps={{ maxLength: 100 }}
                value={editDraft.city || ''}
                onChange={(e) => setEditDraft({ ...editDraft, city: e.target.value })}
                required
            />
            <TextField
                fullWidth
                select
                label="State"
                sx={{
                  ...textFieldSx,
                  '& .MuiSelect-select': {
                    color: '#ffffff',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#b0b0b0',
                  },
                }}
                value={editDraft.state || ''}
                onChange={(e) => setEditDraft({ ...editDraft, state: e.target.value })}
                required
                SelectProps={{ 
                  native: true,
                  sx: {
                    '& option': {
                      backgroundColor: '#404040',
                      color: '#ffffff',
                    },
                  },
                }}
            >
                <option value="" style={{ backgroundColor: '#404040', color: '#ffffff' }}>Select State</option>
                {[
                'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
                ].map((code) => (
                <option key={code} value={code} style={{ backgroundColor: '#404040', color: '#ffffff' }}>{code}</option>
                ))}
            </TextField>
            <TextField
                fullWidth
                label="Zip Code"
                sx={textFieldSx}
                inputProps={{ maxLength: 9 }}
                value={editDraft.zip || ''}
                onChange={(e) => setEditDraft({ ...editDraft, zip: e.target.value })}
                required
            />
            <TextField
                fullWidth
                label="Skills (comma-separated)"
                sx={textFieldSx}
                value={editDraft.skills.join(', ')}
                onChange={(e) =>
                setEditDraft({ ...editDraft, skills: e.target.value.split(',').map((s) => s.trim()) })
                }
                required
            />
            <TextField
                fullWidth
                label="Preferences"
                sx={textFieldSx}
                multiline
                rows={3}
                value={editDraft.preferences || ''}
                onChange={(e) => setEditDraft({ ...editDraft, preferences: e.target.value })}
            />
            <TextField
                fullWidth
                label="Availability Dates (comma-separated)"
                helperText="Example: 2024-07-04, 2024-07-10"
                sx={{
                  ...textFieldSx,
                  '& .MuiFormHelperText-root': {
                    color: '#b0b0b0',
                  },
                }}
                value={editDraft.availability?.join(', ') || ''}
                onChange={(e) =>
                setEditDraft({ ...editDraft, availability: e.target.value.split(',').map((d) => d.trim()) })
                }
                required
            />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #555555', pt: 2 }}>
          <Button 
            onClick={() => setOpenEdit(false)}
            sx={{
              color: '#b0b0b0',
              '&:hover': {
                backgroundColor: 'rgba(176, 176, 176, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveProfile}
            sx={{
              backgroundColor: '#64b5f6',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#42a5f5',
              },
            }}
          >
            Save
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
            backgroundColor: '#1976d2',
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

      {/* Event Details Modal */}
      <Dialog 
        open={showEventDetails} 
        onClose={() => setShowEventDetails(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #2d2d2d 0%, #404040 100%)',
            color: '#ffffff',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #555', pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Event Details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedEventForView && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#64b5f6', mb: 1 }}>
                  {selectedEventForView.eventName || selectedEventForView.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 0.5 }}>Event Date:</Typography>
                <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
                  {new Date(selectedEventForView.eventDate || selectedEventForView.date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 0.5 }}>Location:</Typography>
                <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
                  {selectedEventForView.location || 'Not specified'}
                </Typography>
              </Grid>
              {/* <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 0.5 }}>Urgency:</Typography>
                <Chip 
                  label={selectedEventForView.urgency || 'Medium'} 
                  size="small"
                  sx={{
                    backgroundColor: selectedEventForView.urgency === 'High' ? '#ef4444' : 
                                   selectedEventForView.urgency === 'Medium' ? '#f59e0b' : '#22c55e',
                    color: '#ffffff',
                    fontWeight: 500
                  }}
                />
              </Grid> */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 0.5 }}>Your Status:</Typography>
                <Chip 
                  label={selectedEventForView.volunteerStatus} 
                  size="small"
                  sx={{
                    backgroundColor: selectedEventForView.volunteerStatus === 'Completed' ? '#22c55e' : 
                                   selectedEventForView.volunteerStatus === 'Assigned' ? '#3b82f6' : 
                                   selectedEventForView.volunteerStatus === 'Cancelled' ? '#ef4444' : '#6b7280',
                    color: '#ffffff',
                    fontWeight: 500
                  }}
                />
              </Grid>
              {selectedEventForView.assignedDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 0.5 }}>Assigned Date:</Typography>
                  <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
                    {new Date(selectedEventForView.assignedDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
              {/* <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 0.5 }}>Description:</Typography>
                <Typography variant="body1" sx={{ color: '#e0e0e0', lineHeight: 1.6 }}>
                  {selectedEventForView.description || 'No description available'}
                </Typography>
              </Grid> */}
              {selectedEventForView.skills && selectedEventForView.skills.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>Required Skills:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedEventForView.skills.map((skill, index) => (
                      <Chip 
                        key={index}
                        label={skill} 
                        size="small"
                        sx={{
                          backgroundColor: '#64b5f6',
                          color: '#ffffff'
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #555', pt: 2 }}>
          <Button 
            onClick={() => setShowEventDetails(false)}
            sx={{
              color: '#b0b0b0',
              '&:hover': {
                backgroundColor: 'rgba(176, 176, 176, 0.1)',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
    