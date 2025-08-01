console.log("VolunteerDash Loaded");
import { useEffect, useState } from 'react';

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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import ProfileCard from '../components/ProfileCard';
import EventCard from '../components/EventCard';


export default function VolunteerDash() {
    /* State */
    const [user, setUser] =useState  ({
        name:'Jumana', 
        location:'Houston', 
        skills:['First Aid', 'Organizing'],
    });
    
  
    const [events, setEvents] = useState([
        { id: 1, title: 'Beach Cleanup', location: 'Galveston', time: '9:00 AM', need: 10 },
        { id: 2, title: 'Food Bank Helper', location: 'Downtown', time: '1:00 PM', need: 5 },
    ]);

    const [history] = useState([
        {id:1, title: 'Park Restoration', date: 'June 1, 2025', hours: 3},
        { id: 2, title: 'Library Organizer', date: 'June 5, 2025', hours: 2},
    ]);
    
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    
    useEffect(() => {
      fetch('http://localhost:3001/api/notifications')
        .then((res) => res.json())
        .then((data) => {
          setNotifications(data);
          setLoadingNotifications(false);
        })
        .catch((err) => {
          console.error('Failed to fetch notifications:', err);
          setLoadingNotifications(false);
        });
    }, []);
    
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

    return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* header row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">
          Welcome, {user.name.split(' ')[0]}!
        </Typography>
        <IconButton color="primary" onClick={() => setOpenEdit(true)}>
          <EditIcon />
        </IconButton>
      </Box>

      {savedMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSavedMsg('')}>
          {savedMsg}
        </Alert>
      )}

      {/* profile */}
      <ProfileCard user={user} />

      {/* notifications */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mt: 3,
          borderLeft: '6px solid',
          borderColor: 'primary.main',
          background: 'linear-gradient(90deg, #F9F9F9 0%, #F9F9F9 60%, rgba(58, 183, 149, 0.1) 100%)',
        }}
      >
        <Box display="flex" alignItems="center" mb={1}>
          <NotificationsActive color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Notifications</Typography>
        </Box>
        {loadingNotifications ? (
          <Typography variant="body2">Loading notifications...</Typography>
        ) : (
          notifications.map((note) => (
            <Typography key={note.id} variant="body2" sx={{ mb: 0.5 }}>
              • {note.message}
            </Typography>
          ))
        )}

      </Paper>

      {/* upcoming events */}
      <Typography variant="h5" sx={{ mt: 4, mb: 1 }}>
        Upcoming Events
      </Typography>
      <Grid container spacing={2}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} key={event.id}>
            <EventCard event={event} onRegister={handleRegister} />
          </Grid>
        ))}
      </Grid>

      {/* history */}
      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" sx={{ mb: 1 }}>
        Volunteer History
      </Typography>
      {history.map((h) => (
        <Box key={h.id} sx={{ mb: 1, pl: 1 }}>
          <Typography variant="body2">
            • {h.title} – {h.date} ({h.hours} hrs)
          </Typography>
        </Box>
      ))}

      {/* ---------- Edit Profile dialog ---------- */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
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
                label="Address 1"
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 100 }}
                value={editDraft.address1 || ''}
                onChange={(e) => setEditDraft({ ...editDraft, address1: e.target.value })}
                required
            />
            <TextField
                fullWidth
                label="Address 2"
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 100 }}
                value={editDraft.address2 || ''}
                onChange={(e) => setEditDraft({ ...editDraft, address2: e.target.value })}
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
                label="Zip Code"
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 9 }}
                value={editDraft.zip || ''}
                onChange={(e) => setEditDraft({ ...editDraft, zip: e.target.value })}
                required
            />
            <TextField
                fullWidth
                label="Skills (comma-separated)"
                sx={{ mb: 2 }}
                value={editDraft.skills.join(', ')}
                onChange={(e) =>
                setEditDraft({ ...editDraft, skills: e.target.value.split(',').map((s) => s.trim()) })
                }
                required
            />
            <TextField
                fullWidth
                label="Preferences"
                sx={{ mb: 2 }}
                multiline
                rows={3}
                value={editDraft.preferences || ''}
                onChange={(e) => setEditDraft({ ...editDraft, preferences: e.target.value })}
            />
            <TextField
                fullWidth
                label="Availability Dates (comma-separated)"
                helperText="Example: 2024-07-04, 2024-07-10"
                sx={{ mb: 2 }}
                value={editDraft.availability?.join(', ') || ''}
                onChange={(e) =>
                setEditDraft({ ...editDraft, availability: e.target.value.split(',').map((d) => d.trim()) })
                }
                required
            />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProfile}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
     