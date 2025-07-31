const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientType: {
    type: String,
    enum: ['admin', 'volunteer'],
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['assignment', 'reminder', 'info', 'warning', 'success'],
    default: 'info'
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  return await notification.save();
};

// Static method to get notifications for a user
notificationSchema.statics.getNotificationsForUser = async function(userId, limit = 20) {
  return await this.find({ recipientId: userId })
    .populate('eventId', 'title date')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to mark notification as read
notificationSchema.statics.markAsRead = async function(notificationId, userId) {
  return await this.findOneAndUpdate(
    { _id: notificationId, recipientId: userId },
    { isRead: true },
    { new: true }
  );
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { recipientId: userId, isRead: false },
    { isRead: true }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ recipientId: userId, isRead: false });
};

module.exports = mongoose.model('Notification', notificationSchema);