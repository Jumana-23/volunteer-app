//const { describe, test, expect, jest } = require('@jest/globals');
const { getVolunteerHistory, postVolunteerHistory } = require('../volunteerHistoryController.js');
const service = require('../volunteerHistoryService.js');


jest.mock('../volunteerHistoryService.js');

describe('VolunteerHistoryController', () => {
  test('should return all volunteer history', () => {
    const mockData = [{ volunteerName: 'Test User', eventName: 'Test Event', hours: 3 }];
    service.getAllVolunteerHistory.mockReturnValue(mockData);

    const req = {};
    const res = { json: jest.fn() };

    getVolunteerHistory(req, res);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  test('should add volunteer history successfully', () => {
    const req = { body: { volunteerName: 'Test User', eventName: 'Test Event', hours: 3 } };
    const res = { status: jest.fn(() => res), json: jest.fn() };

    service.addVolunteerHistory.mockReturnValue(req.body);

    postVolunteerHistory(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(req.body);
  });

  test('should handle errors when adding volunteer history', () => {
    const req = { body: {} };
    const res = { status: jest.fn(() => res), json: jest.fn() };

    service.addVolunteerHistory.mockImplementation(() => { throw new Error('Invalid data'); });

    postVolunteerHistory(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid data' })