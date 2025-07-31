const express = require('express');
const Notification = require('./models/Notification');
const User = require('./models/User');
const { authenticateToken, requireAdmin } = require('./middleware/auth');

const router = express.Router();

// GET /api/notifications - Get notifications for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const notifications = await Notification.getNotificationsForUser(req.user._id, parseInt(limit));
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// POST /api/notifications - Create a new notification (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    
    const { recipientId, recipientType, message, type, eventId } = req.body;
    
    if (!recipientId || !recipientType || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const notification = await Notification.createNotification({
      recipientId,
      recipientType,
      message,
      type: type || 'info',
      eventId
    });
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// POST /api/notifications/broadcast - Broadcast notification to all users of a type
router.post('/broadcast', authenticateToken, requireAdmin, async (req, res) => {
  try {
    
    const { recipientType, message, type, eventId } = req.body;
    
    if (!recipientType || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get all users of the specified type
    const users = await User.find({ userType: recipientType }).select('_id');
    
    // Create notifications for all users
    const notifications = await Promise.all(
      users.map(user => 
        Notification.createNotification({
          recipientId: user._id,
          recipientType,
          message,
          type: type || 'info',
          eventId
        })
      )
    );
    
    res.status(201).json({ 
      message: `Notification sent to ${notifications.length} ${recipientType}s`,
      count: notifications.length 
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ error: 'Failed to broadcast notification' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.markAsRead(req.params.id, req.user._id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const result = await Notification.markAllAsRead(req.user._id);
    res.json({ message: 'All notifications marked as read', modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;