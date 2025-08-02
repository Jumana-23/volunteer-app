const request = require('supertest');
const app = require('../server.js'); 

describe('Volunteer Matching API', () => {
  it('GET /api/matches returns matches', async () => {
    const res = await request(app).get('/api/matches');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/matches adds a match', async () => {
    const newMatch = {
      eventId: 2,
      volunteers: ['Taylor', 'Jordan']
    };

    const res = await request(app)
      .post('/api/matches')
      .send(newMatch);

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject(newMatch);
  });

  it('POST /api/matches with invalid data returns 400', async () => {
    const res = await request(app)
      .post('/api/matches')
      .send({ eventId: 'bad', volunteers: [] });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
