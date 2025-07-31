import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Chip,
  FormHelperText,
} from '@mui/material';
import skills from '../assets/skills';

const urgencyOptions = ['Low', 'Medium', 'High'];

export default function EventForm({ onClose, onSubmit }) {
  const [eventData, setEventData] = React.useState({
    title: '',
    description: '',
    location: '',
    skills: [],
    urgency: '',
    date: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!eventData.title.trim()) {
      alert('Event Name is required');
      return;
    }
    if (eventData.title.length > 100) {
      alert('Event Name must be 100 characters or less');
      return;
    }
    if (!eventData.description.trim()) {
      alert('Description is required');
      return;
    }
    if (!eventData.location.trim()) {
      alert('Location is required');
      return;
    }
    if (!eventData.urgency) {
      alert('Urgency level is required');
      return;
    }
    if (!eventData.date) {
      alert('Event Date is required');
      return;
    }
    
    onSubmit(eventData); // Pass data to AdminDash
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Create New Event
      </Typography>

      <TextField
        fullWidth
        required
        label="Event Name"
        name="title"
        inputProps={{ maxLength: 100 }}
        margin="normal"
        value={eventData.title}
        onChange={handleChange}
        helperText={`${eventData.title.length}/100 characters`}
      />

      <TextField
        fullWidth
        required
        multiline
        rows={3}
        label="Description"
        name="description"
        margin="normal"
        value={eventData.description}
        onChange={handleChange}
        helperText="Provide a detailed description of the event"
      />

      <TextField
        fullWidth
        required
        multiline
        rows={2}
        label="Location"
        name="location"
        margin="normal"
        value={eventData.location}
        onChange={handleChange}
        helperText="Enter the complete address or location details"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Required Skills</InputLabel>
        <Select
          multiple
          name="skills"
          value={eventData.skills}
          onChange={handleChange}
          input={<OutlinedInput label="Required Skills" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {skills.map((skill) => (
            <MenuItem key={skill} value={skill}>
              {skill}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>Select all skills required for this event</FormHelperText>
      </FormControl>

      <FormControl fullWidth margin="normal" required>
        <InputLabel>Urgency</InputLabel>
        <Select name="urgency" value={eventData.urgency} onChange={handleChange} required>
          {urgencyOptions.map((urgency) => (
            <MenuItem key={urgency} value={urgency}>
              {urgency}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>Select the urgency level for this event</FormHelperText>
      </FormControl>

      <TextField
        fullWidth
        required
        label="Event Date"
        name="date"
        type="date"
        margin="normal"
        value={eventData.date}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        helperText="Select the date when the event will take place"
      />

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Save Event
      </Button>

      <Button onClick={onClose} sx={{ mt: 1, ml: 2 }}>
        Cancel
      </Button>
    </Box>
  );
}
