const mongoose = require('mongoose');

const volunteerHistorySchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  volunteerName: {
    type: String,
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Assigned', 'Completed', 'Cancelled', 'No-Show'],
    default: 'Assigned'
  },
  hoursWorked: {
    type: Number,
    default: 0,
    min: 0
  },
  feedback: {
    type: String,
    maxlength: 1000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
volunteerHistorySchema.index({ volunteerId: 1, eventDate: -1 });
volunteerHistorySchema.index({ eventId: 1 });
volunteerHistorySchema.index({ status: 1 });

// Static method to create volunteer history record
volunteerHistorySchema.statics.createRecord = async function(data) {
  const record = new this(data);
  return await record.save();
};

// Static method to get volunteer history for a user
volunteerHistorySchema.statics.getVolunteerHistory = async function(volunteerId, limit = 50) {
  return await this.find({ volunteerId })
    .populate('eventId', 'title location date')
    .sort({ eventDate: -1 })
    .limit(limit);
};

// Static method to get event history (all volunteers for an event)
volunteerHistorySchema.statics.getEventHistory = async function(eventId) {
  return await this.find({ eventId })
    .populate('volunteerId', 'email profile.fullName')
    .sort({ assignedDate: 1 });
};

// Static method to update volunteer status
volunteerHistorySchema.statics.updateStatus = async function(volunteerId, eventId, status, hoursWorked = null) {
  const updateData = { status };
  if (hoursWorked !== null) {
    updateData.hoursWorked = hoursWorked;
  }
  
  return await this.findOneAndUpdate(
    { volunteerId, eventId },
    updateData,
    { new: true }
  );
};

// Static method to get volunteer statistics
volunteerHistorySchema.statics.getVolunteerStats = async function(volunteerId) {
  const stats = await this.aggregate([
    { $match: { volunteerId: mongoose.Types.ObjectId(volunteerId) } },
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        completedEvents: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
        },
        totalHours: { $sum: '$hoursWorked' },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);
  
  return stats[0] || {
    totalEvents: 0,
    completedEvents: 0,
    totalHours: 0,
    averageRating: 0
  };
};

// Static method to get all volunteer history (admin view)
volunteerHistorySchema.statics.getAllHistory = async function(filters = {}, limit = 100) {
  const query = {};
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.startDate && filters.endDate) {
    query.eventDate = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  return await this.find(query)
    .populate('volunteerId', 'email profile.fullName')
    .populate('eventId', 'title location date')
    .sort({ eventDate: -1 })
    .limit(limit);
};

module.exports = mongoose.model('VolunteerHistory', volunteerHistorySchema);