import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  FormHelperText,
  Chip,
  Box,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import skills from '../assets/skills';

const urgencyOptions = ['Low', 'Medium', 'High'];

const EventFormDialog = React.memo(({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = null, 
  isEditMode = false,
  errors = {} 
}) => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
    skills: [],
    urgency: '',
    date: '',
    requiredVolunteers: 1,
    ...initialData
  });

  // Reset form when dialog opens/closes or initialData changes
  React.useEffect(() => {
    if (open) {
      setEventData({
        title: '',
        description: '',
        location: '',
        skills: [],
        urgency: '',
        date: '',
        requiredVolunteers: 1,
        ...initialData
      });
    }
  }, [open, initialData]);

  // Optimized input handlers with debouncing
  const handleChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setEventData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNumberChange = useCallback((field) => (e) => {
    const value = parseInt(e.target.value) || 1;
    setEventData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSkillsChange = useCallback((e) => {
    setEventData(prev => ({ ...prev, skills: e.target.value }));
  }, []);

  // Memoized helper text to prevent recalculation on every render
  const titleHelperText = useMemo(() => {
    return errors.title || `${eventData.title.length}/100 characters`;
  }, [errors.title, eventData.title.length]);

  const descriptionHelperText = useMemo(() => {
    return errors.description || 'Provide a detailed description of the event';
  }, [errors.description]);

  const locationHelperText = useMemo(() => {
    return errors.location || 'Enter the complete address or location details';
  }, [errors.location]);

  const urgencyHelperText = useMemo(() => {
    return errors.urgency || 'Select the urgency level for this event';
  }, [errors.urgency]);

  const volunteersHelperText = useMemo(() => {
    return errors.requiredVolunteers || 'Number of volunteers needed';
  }, [errors.requiredVolunteers]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(eventData);
  }, [eventData, onSubmit]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isEditMode ? 'Edit Event' : 'Create New Event'}
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Event Name"
                value={eventData.title}
                onChange={handleChange('title')}
                error={!!errors.title}
                helperText={titleHelperText}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Event Date"
                type="date"
                value={eventData.date}
                onChange={handleChange('date')}
                error={!!errors.date}
                helperText={errors.date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label="Description"
                value={eventData.description}
                onChange={handleChange('description')}
                error={!!errors.description}
                helperText={descriptionHelperText}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={2}
                label="Location"
                value={eventData.location}
                onChange={handleChange('location')}
                error={!!errors.location}
                helperText={locationHelperText}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Urgency</InputLabel>
                <Select
                  value={eventData.urgency}
                  onChange={handleChange('urgency')}
                  label="Urgency"
                  error={!!errors.urgency}
                >
                  {urgencyOptions.map((urgency) => (
                    <MenuItem key={urgency} value={urgency}>
                      {urgency}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText error={!!errors.urgency}>
                  {urgencyHelperText}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Required Volunteers"
                type="number"
                value={eventData.requiredVolunteers}
                onChange={handleNumberChange('requiredVolunteers')}
                error={!!errors.requiredVolunteers}
                helperText={volunteersHelperText}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Required Skills</InputLabel>
                <Select
                  multiple
                  value={eventData.skills}
                  onChange={handleSkillsChange}
                  input={<OutlinedInput label="Required Skills" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
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
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {isEditMode ? 'Update Event' : 'Create Event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

EventFormDialog.displayName = 'EventFormDialog';

export default EventFormDialog;