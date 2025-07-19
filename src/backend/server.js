const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory storage - FIXED PASSWORDS
let users = [
  { 
    id: 1, 
    email: 'admin@test.com', 
    password: '$2b$10$CwTycUXWue0Thq9StjUM0uBUcYONVhV8.i.5b2c9b8m.o5aOKOFlW',
    userType: 'admin', 
    profile: null, 
    isComplete: false 
  },
  { 
    id: 2, 
    email: 'volunteer@test.com', 
    password: '$2b$10$CwTycUXWue0Thq9StjUM0uBUcYONVhV8.i.5b2c9b8m.o5aOKOFlW',
    userType: 'volunteer', 
    profile: null, 
    isComplete: false 
  }
];

// Helper functions for testing
const resetUsers = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  users = [
    { 
      id: 1, 
      email: 'admin@test.com', 
      password: hashedPassword,
      userType: 'admin', 
      profile: null, 
      isComplete: false 
    },
    { 
      id: 2, 
      email: 'volunteer@test.com', 
      password: hashedPassword,
      userType: 'volunteer', 
      profile: null, 
      isComplete: false 
    }
  ];
};

const getUsers = () => users;
const setUsers = (newUsers) => { users = newUsers; };

// Initialize users with proper password hashing
async function initializeUsers() {
  await resetUsers();
  console.log('✅ Test users initialized with password: password123');
}

// Test endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', message: 'Backend is running!' });
});

// Register
app.post('/api/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body.email);
    const { email, password, userType } = req.body;
    
    if (!email || !password || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
      id: users.length + 1, 
      email, 
      password: hashedPassword, 
      userType, 
      profile: null, 
      isComplete: false 
    };
    users.push(newUser);
    
    const token = jwt.sign({ userId: newUser.id, userType }, 'secret-key', { expiresIn: '24h' });
    console.log('✅ Registration successful for:', email);
    res.json({ 
      token, 
      user: { email, userType, isComplete: false }, 
      redirectTo: '/profile' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body.email, req.body.userType);
    const { email, password, userType } = req.body;
    
    if (!email || !password || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = users.find(u => u.email === email && u.userType === userType);
    
    if (!user) {
      console.log('❌ User not found:', email, userType);
      return res.status(401).json({ error: 'Invalid email or user type' });
    }
    
    console.log('🔍 Checking password for user:', email);
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', validPassword);
    
    if (!validPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const token = jwt.sign({ userId: user.id, userType }, 'secret-key', { expiresIn: '24h' });
    const redirectTo = user.isComplete ? `/${userType}` : '/profile';
    
    console.log('✅ Login successful for:', email);
    res.json({ 
      token, 
      user: { email, userType, isComplete: user.isComplete }, 
      redirectTo 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Profile
app.post('/api/profile', (req, res) => {
  try {
    console.log('Profile save attempt');
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

    const userIndex = users.findIndex(u => u.id === 1);
    if (userIndex !== -1) {
      users[userIndex].profile = req.body;
      users[userIndex].isComplete = true;
      console.log('✅ Profile saved successfully');
      res.json({ message: 'Profile saved successfully', redirectTo: '/volunteer' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ error: 'Profile save failed' });
  }
});

const PORT = process.env.PORT || 5000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log('📋 Available endpoints:');
    console.log('  GET  /api/health');
    console.log('  POST /api/register');
    console.log('  POST /api/login');
    console.log('  POST /api/profile');
    
    await initializeUsers();
  });
}

// Export for testing
module.exports = { app, getUsers, setUsers, resetUsers, initializeUsers };