const request = require('supertest');
const { app, resetUsers } = require('../server');

describe('Backend API Tests', () => {
  beforeEach(async () => {
    await resetUsers();
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.message).toBe('Backend is running!');
    });
  });

  describe('POST /api/register', () => {
    test('should register new user successfully', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'password123',
        userType: 'volunteer'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.userType).toBe(userData.userType);
      expect(response.body.user.isComplete).toBe(false);
      expect(response.body.redirectTo).toBe('/profile');
    });

    test('should reject duplicate email', async () => {
      const userData = {
        email: 'admin@test.com',
        password: 'password123',
        userType: 'admin'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('User already exists');
    });

    test('should reject missing required fields', async () => {
      const userData = {
        email: 'test@test.com'
        // Missing password and userType
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });

    test('should reject empty email', async () => {
      const userData = {
        email: '',
        password: 'password123',
        userType: 'volunteer'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });
  });

  describe('POST /api/login', () => {
    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'admin@test.com',
        password: 'password123',
        userType: 'admin'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user.userType).toBe(loginData.userType);
      expect(response.body.redirectTo).toBeDefined();
    });

    test('should reject invalid email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password123',
        userType: 'volunteer'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid email or user type');
    });

    test('should reject invalid password', async () => {
      const loginData = {
        email: 'admin@test.com',
        password: 'wrongpassword',
        userType: 'admin'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid password');
    });

    test('should reject wrong user type', async () => {
      const loginData = {
        email: 'admin@test.com',
        password: 'password123',
        userType: 'volunteer'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid email or user type');
    });

    test('should reject missing required fields', async () => {
      const loginData = {
        email: 'admin@test.com'
        // Missing password and userType
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });
  });

  describe('POST /api/profile', () => {
    const validProfile = {
      fullName: 'John Doe',
      address1: '123 Main St',
      address2: 'Apt 4B',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      skills: ['First Aid', 'Event Planning'],
      preferences: 'Available weekends',
      availability: ['2024-08-01', '2024-08-15']
    };

    test('should save valid profile', async () => {
      const response = await request(app)
        .post('/api/profile')
        .send(validProfile)
        .expect(200);

      expect(response.body.message).toBe('Profile saved successfully');
      expect(response.body.redirectTo).toBe('/volunteer');
    });

    test('should reject missing required fields', async () => {
      const invalidProfile = {
        fullName: 'John Doe'
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/profile')
        .send(invalidProfile)
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });

    test('should reject full name too long', async () => {
      const invalidProfile = {
        ...validProfile,
        fullName: 'A'.repeat(51) // 51 characters
      };

      const response = await request(app)
        .post('/api/profile')
        .send(invalidProfile)
        .expect(400);

      expect(response.body.error).toBe('Full name too long');
    });

    test('should reject address1 too long', async () => {
      const invalidProfile = {
        ...validProfile,
        address1: 'A'.repeat(101) // 101 characters
      };

      const response = await request(app)
        .post('/api/profile')
        .send(invalidProfile)
        .expect(400);

      expect(response.body.error).toBe('Address 1 too long');
    });

    test('should reject invalid zip code', async () => {
      const invalidProfile = {
        ...validProfile,
        zipCode: '123' // Too short
      };

      const response = await request(app)
        .post('/api/profile')
        .send(invalidProfile)
        .expect(400);

      expect(response.body.error).toBe('Invalid zip code format');
    });

    test('should reject empty skills array', async () => {
      const invalidProfile = {
        ...validProfile,
        skills: []
      };

      const response = await request(app)
        .post('/api/profile')
        .send(invalidProfile)
        .expect(400);

      expect(response.body.error).toBe('At least one skill required');
    });

    test('should reject empty availability array', async () => {
      const invalidProfile = {
        ...validProfile,
        availability: []
      };

      const response = await request(app)
        .post('/api/profile')
        .send(invalidProfile)
        .expect(400);

      expect(response.body.error).toBe('At least one availability date required');
    });
  });
  describe('Additional Coverage Tests', () => {
    test('should handle profile with minimal required fields', async () => {
      const minimalProfile = {
        fullName: 'Min User',
        address1: '1 St',
        address2: '', // Optional field
        city: 'City',
        state: 'TX',
        zipCode: '12345',
        skills: ['One Skill'],
        preferences: '', // Optional field
        availability: ['2024-08-01']
      };

      const response = await request(app)
        .post('/api/profile')
        .send(minimalProfile)
        .expect(200);

      expect(response.body.message).toBe('Profile saved successfully');
    });

    test('should handle different zip code lengths', async () => {
      const profile9Digit = {
        fullName: 'Test User',
        address1: '123 Main St',
        city: 'Houston',
        state: 'TX',
        zipCode: '770011234', // 9 digits
        skills: ['Testing'],
        availability: ['2024-08-01']
      };

      const response = await request(app)
        .post('/api/profile')
        .send(profile9Digit)
        .expect(200);

      expect(response.body.message).toBe('Profile saved successfully');
    });
  });
  describe('Edge Cases and Additional Coverage', () => {
    test('should handle registration with edge case fields', async () => {
      const userData = {
        email: 'edge@test.com',
        password: 'password123',
        userType: 'admin'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(200);

      expect(response.body.token).toBeDefined();
    });

    test('should handle profile with optional address2', async () => {
      const profileWithAddress2 = {
        fullName: 'User With Address2',
        address1: '123 Main St',
        address2: 'Apt 5C',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        skills: ['First Aid', 'CPR Certified'],
        preferences: 'Weekend availability only',
        availability: ['2024-08-01', '2024-08-02']
      };

      const response = await request(app)
        .post('/api/profile')
        .send(profileWithAddress2)
        .expect(200);

      expect(response.body.message).toBe('Profile saved successfully');
    });

    test('should handle profile with maximum length fields', async () => {
      const maxProfile = {
        fullName: 'A'.repeat(50), // Exactly 50 characters
        address1: 'B'.repeat(100), // Exactly 100 characters
        address2: 'C'.repeat(50),
        city: 'D'.repeat(100), // Exactly 100 characters
        state: 'TX',
        zipCode: '770011234', // 9 digits
        skills: ['First Aid', 'CPR Certified', 'Event Planning'],
        preferences: 'Available for emergency response and weekend events',
        availability: ['2024-08-01', '2024-08-02', '2024-08-03']
      };

      const response = await request(app)
        .post('/api/profile')
        .send(maxProfile)
        .expect(200);

      expect(response.body.message).toBe('Profile saved successfully');
    });

    test('should handle zip code with letters (should fail)', async () => {
      const invalidProfile = {
        fullName: 'Test User',
        address1: '123 Main St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001A', // Contains letter
        skills: ['Testing'],
        availability: ['2024-08-01']
      };

      const response = await request(app)
        .post('/api/profile')
        .send(invalidProfile)
        .expect(400);

      expect(response.body.error).toBe('Invalid zip code format');
    });

    test('should handle skills as non-array', async () => {
      const invalidProfile = {
        fullName: 'Test User',
        address1: '123 Main St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        skills: 'Not an array', // Should be array
        availability: ['2024-08-01']
      };

      const response = await request(app)
        .post('/api/profile')
        .send(invalidProfile)
        .expect(400);

      expect(response.body.error).toBe('At least one skill required');
    });

    test('should handle availability as non-array', async () => {
      const invalidProfile = {
        fullName: 'Test User',
        address1: '123 Main St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        skills: ['Testing'],
        availability: 'Not an array' // Should be array
      };

      const response = await request(app)
        .post('/api/profile')
        .send(invalidProfile)
        .expect(400);

      expect(response.body.error).toBe('At least one availability date required');
    });
  });
  describe('Utility Functions Coverage', () => {
    test('should handle server module exports', () => {
      const serverModule = require('../server');
      expect(serverModule.app).toBeDefined();
      expect(serverModule.getUsers).toBeDefined();
      expect(serverModule.setUsers).toBeDefined();
      expect(serverModule.resetUsers).toBeDefined();
    });

    test('should test resetUsers function', async () => {
      const { resetUsers, getUsers } = require('../server');
      await resetUsers();
      const users = getUsers();
      expect(users.length).toBe(2);
      expect(users[0].email).toBe('admin@test.com');
      expect(users[1].email).toBe('volunteer@test.com');
    });

    test('should test setUsers function', () => {
      const { setUsers, getUsers } = require('../server');
      const testUsers = [{ id: 1, email: 'test@test.com' }];
      setUsers(testUsers);
      const users = getUsers();
      expect(users.length).toBe(1);
      expect(users[0].email).toBe('test@test.com');
    });
  });
});