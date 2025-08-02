const request = require('supertest');
const app = require('../server.js'); 


describe('Events API', () => {
  it('should return all events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a new event', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({
        title: 'Cleanup Day',
        date: '2025-08-01',
        location: 'East Park',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toBe('Cleanup Day');
  });
});
