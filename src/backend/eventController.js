const Event = require('./models/Event');
const User = require('./models/User');
const Notification = require('./models/Notification');
const VolunteerHistory = require('./models/VolunteerHistory');
const { logEventHistory } = require('./eventHistoryService');

// GET all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: { $ne: 'Cancelled' } })
      .populate('createdBy', 'email profile.fullName')
      .populate('assignedVolunteers.volunteerId', 'email profile.fullName')
      .sort({ createdAt: -1 });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// GET one event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'email profile.fullName')
      .populate('assignedVolunteers.volunteerId', 'email profile.fullName');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

// POST create new event
const createEvent = async (req, res) => {
  try {
    const { title, description, location, date, skills, urgency, requiredVolunteers } = req.body;
    
    // Get user ID from token (assuming middleware sets req.user)
    // For testing purposes, use a default user if no authentication is provided
    let createdBy = req.user?.id || req.body.createdBy;
    
    if (!createdBy) {
      // Try to find the first user in the database as a fallback
      const defaultUser = await User.findOne();
      if (defaultUser) {
        createdBy = defaultUser._id;
      } else {
        return res.status(400).json({ message: 'User authentication required and no default user found' });
      }
    }
    
    const newEvent = new Event({
      title,
      description,
      location,
      date,
      skills,
      urgency,
      requiredVolunteers: requiredVolunteers || 1,
      createdBy
    });
    
    const savedEvent = await newEvent.save();
    await savedEvent.populate('createdBy', 'email profile.fullName');
    
    // Log event history
    try {
      logEventHistory(savedEvent);
    } catch (historyError) {
      console.warn('Failed to log event history:', historyError.message);
    }
    
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }
    
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

// PUT update existing event
const updateEvent = async (req, res) => {
  try {
    const { title, description, location, date, skills, urgency, requiredVolunteers, status } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if status is being changed to 'Completed' for notification
    const wasCompleted = event.status === 'Completed';
    const willBeCompleted = status === 'Completed';
    
    // Update fields if provided
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (location !== undefined) event.location = location;
    if (date !== undefined) event.date = date;
    if (skills !== undefined) event.skills = skills;
    if (urgency !== undefined) event.urgency = urgency;
    if (requiredVolunteers !== undefined) event.requiredVolunteers = requiredVolunteers;
    if (status !== undefined) event.status = status;
    
    const updatedEvent = await event.save();
    
    // Create notification if event was just completed
    if (!wasCompleted && willBeCompleted) {
      try {
        await Notification.create({
          message: `Event "${event.title}" has been completed`,
          type: 'event_completion',
          isRead: false,
          createdAt: new Date()
        });
        console.log('✅ Admin notification created for event completion');
      } catch (notificationError) {
        console.error('Failed to create event completion notification:', notificationError);
      }
    }
    await updatedEvent.populate('createdBy', 'email profile.fullName');
    await updatedEvent.populate('assignedVolunteers.volunteerId', 'email profile.fullName');
    
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }
    
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
};

// DELETE event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Soft delete by setting status to Cancelled
    event.status = 'Cancelled';
    await event.save();
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

// POST assign volunteer to event
const assignVolunteer = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { volunteerId, volunteerName, volunteerEmail } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    let volunteer;
    
    // If volunteerId is provided, find by ID
    if (volunteerId) {
      volunteer = await User.findById(volunteerId);
    } 
    // If volunteerEmail is provided, find by email
    else if (volunteerEmail) {
      volunteer = await User.findOne({ email: volunteerEmail });
    }
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    
    await event.addVolunteer(volunteer._id, volunteerName || volunteer.profile?.fullName || volunteer.email);
    await event.populate('assignedVolunteers.volunteerId', 'email profile.fullName');
    
    // Create notification for the volunteer
    const notification = await Notification.createNotification({
      recipientId: volunteer._id,
      recipientType: 'volunteer',
      message: `You have been assigned to "${event.title}" on ${new Date(event.date).toLocaleDateString()}`,
      type: 'assignment',
      eventId: event._id
    });
    
    // Emit real-time notification via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(volunteer._id.toString()).emit('newNotification', {
        id: notification._id,
        message: notification.message,
        type: notification.type,
        eventId: notification.eventId,
        createdAt: notification.createdAt,
        isRead: false
      });
      console.log(`🔔 Real-time notification sent to volunteer ${volunteer.email}`);
    }
    
    // Create volunteer history record
    await VolunteerHistory.createRecord({
      volunteerId: volunteer._id,
      eventId: event._id,
      volunteerName: volunteerName || volunteer.profile?.fullName || volunteer.email,
      eventName: event.title,
      eventDate: event.date,
      status: 'Assigned'
    });
    
    res.status(200).json({ message: 'Volunteer assigned successfully', event });
  } catch (error) {
    console.error('Error assigning volunteer:', error);
    res.status(400).json({ message: error.message });
  }
};

// POST remove volunteer from event
const removeVolunteer = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { volunteerId } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    await event.removeVolunteer(volunteerId);
    await event.populate('assignedVolunteers.volunteerId', 'email profile.fullName');
    
    res.status(200).json({ message: 'Volunteer removed successfully', event });
  } catch (error) {
    console.error('Error removing volunteer:', error);
    res.status(400).json({ message: error.message });
  }
};

// GET events needing volunteers
const getEventsNeedingVolunteers = async (req, res) => {
  try {
    const events = await Event.findNeedingVolunteers();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events needing volunteers:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// GET event statistics
const getEventStatistics = async (req, res) => {
  try {
    const stats = await Event.getStatistics();
    res.status(200).json(stats[0] || {
      totalEvents: 0,
      activeEvents: 0,
      completedEvents: 0,
      totalVolunteersAssigned: 0
    });
  } catch (error) {
    console.error('Error fetching event statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  assignVolunteer,
  removeVolunteer,
  getEventsNeedingVolunteers,
  getEventStatistics
};
