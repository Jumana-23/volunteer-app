const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    required: true,
    enum: ['admin', 'volunteer'],
    default: 'volunteer'
  },
  profile: {
    fullName: { type: String, trim: true },
    address1: { type: String, trim: true },
    address2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    skills: [{ type: String }],
    preferences: { type: String, trim: true },
    availability: [{ type: String }]
  },
  isComplete: {
    type: Boolean,
    default: false
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update profile
userSchema.methods.updateProfile = function(profileData) {
  this.profile = { ...this.profile, ...profileData };
  this.isComplete = this.checkProfileComplete();
  return this.save();
};

// Instance method to check if profile is complete
userSchema.methods.checkProfileComplete = function() {
  const profile = this.profile;
  return !!(profile && 
    profile.fullName && 
    profile.address1 && 
    profile.city && 
    profile.state && 
    profile.zipCode &&
    profile.skills && 
    profile.skills.length > 0 &&
    profile.availability &&
    profile.availability.length > 0
  );
};

// Static method to find user by email and userType
userSchema.statics.findByEmailAndType = function(email, userType) {
  return this.findOne({ email: email.toLowerCase(), userType });
};

// Static method to create user with validation
userSchema.statics.createUser = async function(userData) {
  const { email, password, userType } = userData;
  
  // Check if user already exists
  const existingUser = await this.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }
  
  // Create new user
  const user = new this({
    email: email.toLowerCase(),
    password,
    userType
  });
  
  return user.save();
};

// Static method to find volunteers by skills
userSchema.statics.findVolunteersBySkills = function(skills) {
  return this.find({
    userType: 'volunteer',
    isComplete: true,
    'profile.skills': { $in: skills }
  }).select('email profile.fullName profile.skills profile.availability');
};

// Static method to get all complete volunteer profiles
userSchema.statics.getCompleteVolunteers = function() {
  return this.find({
    userType: 'volunteer',
    isComplete: true
  }).select('email profile');
};

module.exports = mongoose.model('User', userSchema);