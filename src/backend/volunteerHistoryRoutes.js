const express = require('express');
const VolunteerHistory = require('./models/VolunteerHistory');
const User = require('./models/User');
const Event = require('./models/Event');
const { authenticateToken, requireAdmin } = require('./middleware/auth');

const router = express.Router();

// GET /api/volunteer-history - Get volunteer history (user-specific or all for admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, status, startDate, endDate } = req.query;
    
    let history;
    
    if (req.user.userType === 'admin') {
      // Admin can see all volunteer history
      const filters = {};
      if (status) filters.status = status;
      if (startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
      }
      
      history = await VolunteerHistory.getAllHistory(filters, parseInt(limit));
    } else {
      // Volunteers can only see their own history
      history = await VolunteerHistory.getVolunteerHistory(req.user._id, parseInt(limit));
    }
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching volunteer history:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer history' });
  }
});

// GET /api/volunteer-history/stats - Get volunteer statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    let stats;
    
    if (req.user.userType === 'admin') {
      // Admin gets overall statistics
      const totalRecords = await VolunteerHistory.countDocuments();
      const completedEvents = await VolunteerHistory.countDocuments({ status: 'Completed' });
      const totalHours = await VolunteerHistory.aggregate([
        { $group: { _id: null, total: { $sum: '$hoursWorked' } } }
      ]);
      
      stats = {
        totalRecords,
        completedEvents,
        totalHours: totalHours[0]?.total || 0,
        completionRate: totalRecords > 0 ? (completedEvents / totalRecords * 100).toFixed(1) : 0
      };
    } else {
      // Volunteers get their own statistics
      stats = await VolunteerHistory.getVolunteerStats(req.user._id);
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching volunteer statistics:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer statistics' });
  }
});

// GET /api/volunteer-history/event/:eventId - Get volunteer history for a specific event
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const history = await VolunteerHistory.getEventHistory(req.params.eventId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching event history:', error);
    res.status(500).json({ error: 'Failed to fetch event history' });
  }
});

// POST /api/volunteer-history - Create volunteer history record (usually done automatically)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { volunteerId, eventId, volunteerName, eventName, eventDate, status, hoursWorked } = req.body;
    
    if (!volunteerId || !eventId || !volunteerName || !eventName || !eventDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify volunteer and event exist
    const volunteer = await User.findById(volunteerId);
    const event = await Event.findById(eventId);
    
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const historyRecord = await VolunteerHistory.createRecord({
      volunteerId,
      eventId,
      volunteerName,
      eventName,
      eventDate: new Date(eventDate),
      status: status || 'Assigned',
      hoursWorked: hoursWorked || 0
    });
    
    res.status(201).json(historyRecord);
  } catch (error) {
    console.error('Error creating volunteer history record:', error);
    res.status(500).json({ error: 'Failed to create volunteer history record' });
  }
});

// PUT /api/volunteer-history/:volunteerId/:eventId - Update volunteer status and hours
router.put('/:volunteerId/:eventId', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { volunteerId, eventId } = req.params;
    const { status, hoursWorked, feedback, rating } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const updateData = { status };
    if (hoursWorked !== undefined) updateData.hoursWorked = hoursWorked;
    if (feedback !== undefined) updateData.feedback = feedback;
    if (rating !== undefined) updateData.rating = rating;
    
    const updatedRecord = await VolunteerHistory.findOneAndUpdate(
      { volunteerId, eventId },
      updateData,
      { new: true }
    ).populate('volunteerId', 'email profile.fullName')
     .populate('eventId', 'title location date');
    
    if (!updatedRecord) {
      return res.status(404).json({ error: 'Volunteer history record not found' });
    }
    
    res.json(updatedRecord);
  } catch (error) {
    console.error('Error updating volunteer history:', error);
    res.status(500).json({ error: 'Failed to update volunteer history' });
  }
});

// DELETE /api/volunteer-history/:volunteerId/:eventId - Delete volunteer history record
router.delete('/:volunteerId/:eventId', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { volunteerId, eventId } = req.params;
    
    const deletedRecord = await VolunteerHistory.findOneAndDelete({
      volunteerId,
      eventId
    });
    
    if (!deletedRecord) {
      return res.status(404).json({ error: 'Volunteer history record not found' });
    }
    
    res.json({ message: 'Volunteer history record deleted successfully' });
  } catch (error) {
    console.error('Error deleting volunteer history record:', error);
    res.status(500).json({ error: 'Failed to delete volunteer history record' });
  }
});

module.exports = router;