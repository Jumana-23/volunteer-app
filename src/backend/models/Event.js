const mongoose = require('mongoose');

// Event Schema
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Event title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  skills: {
    type: [String],
    default: [],
    validate: {
      validator: function(skills) {
        return skills.length > 0;
      },
      message: 'At least one skill is required'
    }
  },
  urgency: {
    type: String,
    required: [true, 'Urgency level is required'],
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: 'Urgency must be Low, Medium, or High'
    }
  },
  requiredVolunteers: {
    type: Number,
    required: [true, 'Number of required volunteers is required'],
    min: [1, 'At least 1 volunteer is required'],
    default: 1
  },
  assignedVolunteers: [{
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    volunteerName: String,
    assignedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Assigned', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Assigned'
    }
  }],
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check if event is full
eventSchema.methods.isFull = function() {
  return this.assignedVolunteers.filter(v => v.status !== 'Cancelled').length >= this.requiredVolunteers;
};

// Instance method to add volunteer
eventSchema.methods.addVolunteer = function(volunteerId, volunteerName) {
  if (this.isFull()) {
    throw new Error('Event is already full');
  }
  
  // Check if volunteer is already assigned
  const alreadyAssigned = this.assignedVolunteers.some(
    v => v.volunteerId.toString() === volunteerId.toString() && v.status !== 'Cancelled'
  );
  
  if (alreadyAssigned) {
    throw new Error('Volunteer is already assigned to this event');
  }
  
  this.assignedVolunteers.push({
    volunteerId,
    volunteerName,
    status: 'Assigned'
  });
  
  return this.save();
};

// Instance method to remove volunteer
eventSchema.methods.removeVolunteer = function(volunteerId) {
  const volunteerIndex = this.assignedVolunteers.findIndex(
    v => v.volunteerId.toString() === volunteerId.toString()
  );
  
  if (volunteerIndex === -1) {
    throw new Error('Volunteer not found in this event');
  }
  
  this.assignedVolunteers[volunteerIndex].status = 'Cancelled';
  return this.save();
};

// Static method to find events by skills
eventSchema.statics.findBySkills = function(skills) {
  return this.find({
    status: 'Active',
    skills: { $in: skills },
    date: { $gte: new Date() }
  }).populate('createdBy', 'email profile.fullName');
};

// Static method to find events needing volunteers
eventSchema.statics.findNeedingVolunteers = function() {
  return this.aggregate([
    {
      $match: {
        status: 'Active',
        date: { $gte: new Date() }
      }
    },
    {
      $addFields: {
        activeVolunteers: {
          $size: {
            $filter: {
              input: '$assignedVolunteers',
              cond: { $ne: ['$$this.status', 'Cancelled'] }
            }
          }
        }
      }
    },
    {
      $match: {
        $expr: { $lt: ['$activeVolunteers', '$requiredVolunteers'] }
      }
    }
  ]);
};

// Static method to get event statistics
eventSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        activeEvents: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Active'] }, 1, 0]
          }
        },
        completedEvents: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0]
          }
        },
        totalVolunteersAssigned: {
          $sum: {
            $size: {
              $filter: {
                input: '$assignedVolunteers',
                cond: { $ne: ['$$this.status', 'Cancelled'] }
              }
            }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Event', eventSchema);