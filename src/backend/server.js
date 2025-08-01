const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import database connection and models
const connectDB = require('./config/database');
const User = require('./models/User');
const Event = require('./models/Event');
const Notification = require('./models/Notification');

// Import routes
const eventRoutes = require('./eventRoutes');
const volunteerMatchingRoutes = require('./volunteerMatchingRoutes');
const notificationRoutes = require('./notificationRoutes');
const volunteerHistoryRoutes = require('./volunteerHistoryRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5174", "http://localhost:5175"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Make io available to other modules
app.set('io', io);

// Connect to MongoDB
connectDB();

// Helper functions for testing
const resetUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    
    // Create test users
    const testUsers = [
      {
        email: 'admin@test.com',
        password: 'password123',
        userType: 'admin'
      },
      {
        email: 'volunteer@test.com',
        password: 'password123',
        userType: 'volunteer'
      }
    ];
    
    for (const userData of testUsers) {
      await User.createUser(userData);
    }
    
    console.log('✅ Test users created in MongoDB');
  } catch (error) {
    console.error('❌ Error resetting users:', error.message);
  }
};

const getUsers = async () => {
  try {
    return await User.find({}).select('-password');
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Initialize test users
async function initializeUsers() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await resetUsers();
      console.log('✅ Test users initialized with password: password123');
    } else {
      console.log(`📊 Found ${userCount} existing users in database`);
    }
  } catch (error) {
    console.error('❌ Error initializing users:', error.message);
  }
}

async function initializeEvents() {
  try {
    const eventCount = await Event.countDocuments();
    console.log(`📊 Found ${eventCount} existing events in database`);
    
    if (eventCount === 0) {
      // Get admin user to assign as event creator
      const adminUser = await User.findOne({ email: 'admin@test.com' });
      if (!adminUser) {
        console.log('⚠️  Admin user not found, skipping event initialization');
        return;
      }
      
      const sampleEvents = [
        {
          title: 'Community Food Drive',
          description: 'Organize and distribute food packages to families in need. Help sort donations, pack bags, and distribute to community members.',
          location: 'Midtown Community Center, 123 Main St, Houston, TX 77002',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          skills: ['Event Management', 'Customer Service', 'Physical Labor'],
          urgency: 'High',
          requiredVolunteers: 8,
          createdBy: adminUser._id
        },
        {
          title: 'Clothing Distribution Event',
          description: 'Sort and distribute donated clothing to community members. Assist with organizing items by size and helping families find suitable clothing.',
          location: 'East Side Community Hall, 456 Oak Ave, Houston, TX 77003',
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          skills: ['Customer Service', 'Organization', 'Communication'],
          urgency: 'Medium',
          requiredVolunteers: 6,
          createdBy: adminUser._id
        },
        {
          title: 'Senior Center Technology Workshop',
          description: 'Teach basic computer and smartphone skills to senior citizens. Help them learn email, video calling, and internet safety.',
          location: 'Golden Years Senior Center, 789 Pine St, Houston, TX 77004',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          skills: ['Teaching', 'Technology', 'Communication', 'Patience'],
          urgency: 'Low',
          requiredVolunteers: 4,
          createdBy: adminUser._id
        }
      ];
      
      await Event.insertMany(sampleEvents);
      console.log('✅ Sample events created in MongoDB');
    }
  } catch (error) {
    console.error('❌ Error initializing events:', error.message);
  }
}

// Test endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', message: 'Backend is running!' });
});

// Test endpoint to create a notification (for debugging)
app.post('/api/test-notification', async (req, res) => {
  try {
    const testUserId = '507f1f77bcf86cd799439011';
    
    // Create a test notification
    const notification = await Notification.createNotification({
      recipientId: testUserId,
      recipientType: 'volunteer',
      message: 'Test notification: You have been assigned to a new event!',
      type: 'assignment',
      eventId: null
    });
    
    console.log('🧪 Created test notification:', notification);
    
    // Emit real-time notification via Socket.IO
    io.to(testUserId).emit('newNotification', {
      id: notification._id,
      message: notification.message,
      type: notification.type,
      eventId: notification.eventId,
      createdAt: notification.createdAt,
      isRead: false
    });
    
    console.log('📡 Emitted test notification via Socket.IO');
    
    res.status(200).json({ 
      message: 'Test notification created and emitted',
      notification 
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ error: 'Failed to create test notification' });
  }
});

// Register
app.post('/api/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body.email);
    const { email, password, userType } = req.body;
    
    // Validation
    if (!email || !password || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (!['admin', 'volunteer'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Create user using MongoDB model
    const newUser = await User.createUser({ email, password, userType });
    
    // If a volunteer registered, notify admin
    if (userType === 'volunteer') {
      try {
        await Notification.create({
          message: `New volunteer ${email} has registered`,
          type: 'volunteer_registration',
          isRead: false,
          createdAt: new Date()
        });
        console.log('✅ Admin notification created for new volunteer registration');
      } catch (notificationError) {
        console.error('Failed to create admin notification:', notificationError);
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, userType: newUser.userType }, 
      process.env.JWT_SECRET || 'secret-key', 
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
    
    console.log('✅ Registration successful for:', email);
    res.json({ 
      token, 
      user: { 
        id: newUser._id,
        email: newUser.email, 
        userType: newUser.userType, 
        isComplete: newUser.isComplete 
      }, 
      redirectTo: '/profile' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.message.includes('User already exists')) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body.email, req.body.userType);
    const { email, password, userType } = req.body;
    
    // Validation
    if (!email || !password || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['admin', 'volunteer'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Find user by email and userType
    const user = await User.findByEmailAndType(email, userType);
    
    if (!user) {
      console.log('❌ User not found:', email, userType);
      return res.status(401).json({ error: 'Invalid email or user type' });
    }
    
    console.log('🔍 Checking password for user:', email);
    const validPassword = await user.comparePassword(password);
    console.log('🔐 Password valid:', validPassword);
    
    if (!validPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType }, 
      process.env.JWT_SECRET || 'secret-key', 
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
    
    const redirectTo = user.isComplete ? `/${userType}` : '/profile';
    
    console.log('✅ Login successful for:', email, 'Redirecting to:', redirectTo);
    res.json({ 
      token, 
      user: { 
        id: user._id,
        email: user.email, 
        userType: user.userType, 
        isComplete: user.isComplete 
      }, 
      redirectTo 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get Profile
app.get('/api/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      id: user._id,
      email: user.email, 
      userType: user.userType, 
      profile: user.profile,
      isComplete: user.isComplete 
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Save Profile
app.post('/api/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    console.log('Profile save attempt for user:', decoded.userId);
    const { fullName, address1, address2, city, state, zipCode, skills, preferences, availability } = req.body;
    
    // Validation
    if (!fullName || !address1 || !city || !state || !zipCode || !skills || !availability) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (fullName.length > 50) {
      return res.status(400).json({ error: 'Full name too long' });
    }

    if (address1.length > 100) {
      return res.status(400).json({ error: 'Address 1 too long' });
    }

    if (!/^\d{5,9}$/.test(zipCode)) {
      return res.status(400).json({ error: 'Invalid zip code format' });
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: 'At least one skill required' });
    }

    if (!Array.isArray(availability) || availability.length === 0) {
      return res.status(400).json({ error: 'At least one availability date required' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user profile using MongoDB instance method
    await user.updateProfile(req.body);
    
    console.log('✅ Profile saved successfully for user:', decoded.userId);
    const redirectTo = user.userType === 'admin' ? '/admin' : '/volunteer';
    res.json({ message: 'Profile saved successfully', redirectTo });
  } catch (error) {
    console.error('Profile save error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Profile save failed' });
  }
});

// Get users endpoint
app.get('/api/users', async (req, res) => {
  try {
    const { userType } = req.query;
    
    let query = {};
    if (userType) {
      query.userType = userType;
    }
    
    const users = await User.find(query).select('email profile userType isComplete');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Check and create volunteer reminder notifications
app.post('/api/check-volunteer-reminders', async (req, res) => {
  try {
    // Find events that need more volunteers
    const eventsNeedingVolunteers = await Event.findNeedingVolunteers();
    
    let notificationsCreated = 0;
    
    for (const event of eventsNeedingVolunteers) {
      const volunteersNeeded = event.requiredVolunteers - event.activeVolunteers;
      
      // Check if we already sent a reminder for this event recently (within 24 hours)
      const recentReminder = await Notification.findOne({
        type: 'volunteer_reminder',
        message: { $regex: event.title },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      
      if (!recentReminder) {
        await Notification.create({
          message: `Event "${event.title}" needs ${volunteersNeeded} more volunteer${volunteersNeeded > 1 ? 's' : ''}`,
          type: 'volunteer_reminder',
          isRead: false,
          createdAt: new Date()
        });
        notificationsCreated++;
      }
    }
    
    console.log(`✅ Created ${notificationsCreated} volunteer reminder notifications`);
    res.json({ 
      message: `Created ${notificationsCreated} reminder notifications`,
      eventsChecked: eventsNeedingVolunteers.length,
      notificationsCreated 
    });
  } catch (error) {
    console.error('Error creating volunteer reminders:', error);
    res.status(500).json({ error: 'Failed to create volunteer reminders' });
  }
});

// Mount routes
app.use('/api/events', eventRoutes);
app.use('/api/matches', volunteerMatchingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/volunteer-history', volunteerHistoryRoutes);

const PORT = process.env.PORT || 5000;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);
  
  // Join user to their personal room for targeted notifications
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their personal room`);
  });
  
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log('🔌 Socket.IO enabled for real-time notifications');
    console.log('📋 Available endpoints:');
    console.log('  GET  /api/health');
    console.log('  POST /api/register');
    console.log('  POST /api/login');
    console.log('  GET  /api/profile');
    console.log('  POST /api/profile');
    console.log('  GET  /api/users');
    console.log('  GET  /api/events');
    console.log('  POST /api/events');
    console.log('  GET  /api/events/:id');
    console.log('  PUT  /api/events/:id');
    console.log('  DELETE /api/events/:id');
    console.log('  POST /api/events/:eventId/assign-volunteer');
    console.log('  POST /api/events/:eventId/remove-volunteer');
    console.log('  GET  /api/events/statistics');
    console.log('  GET  /api/events/needing-volunteers');
    console.log('  GET  /api/notifications');
    console.log('  GET  /api/notifications/unread-count');
    console.log('  POST /api/notifications');
    console.log('  PUT  /api/notifications/:id/read');
    console.log('  POST /api/notifications/broadcast');
    console.log('  DELETE /api/notifications/:id');
    console.log('  GET  /api/volunteer-history');
    console.log('  POST /api/check-volunteer-reminders');
    console.log('  GET  /api/volunteer-history/stats');
    console.log('  POST /api/volunteer-history');
    console.log('  PUT  /api/volunteer-history/:id');
    console.log('  DELETE /api/volunteer-history/:id');
    
    await initializeUsers();
    await initializeEvents();
  });
}

// Export for testing
module.exports = { app, server, io, getUsers, resetUsers, initializeUsers };
