const {
    getAllVolunteerHistory,
    addVolunteerHistory
  } = require('../volunteerHistoryService');
  
  const validations = require('../validations');
  
  // ✅ Mock validation so we can control it
  jest.mock('../validations', () => ({
    validateVolunteerHistory: jest.fn()
  }));
  
  describe('volunteerHistoryService', () => {
    beforeEach(() => {
      // Reset data between tests
      const historyModule = require('../volunteerHistoryService');
      historyModule.__setVolunteerHistoryData?.([]);
    });
  
    test('getAllVolunteerHistory should return array', () => {
      const result = getAllVolunteerHistory();
      expect(Array.isArray(result)).toBe(true);
    });
  
    test('addVolunteerHistory should add a valid record', () => {
      const mockRecord = { volunteerName: 'Jane', eventName: 'Food Drive', hours: 4 };
      validations.validateVolunteerHistory.mockReturnValue(true);
  
      const result = addVolunteerHistory(mockRecord);
      expect(result).toEqual(mockRecord);
  
      const all = getAllVolunteerHistory();
      expect(all).toContainEqual(mockRecord);
    });
  
    test('addVolunteerHistory should throw if validation fails', () => {
      const badRecord = { invalid: 'data' };
      validations.validateVolunteerHistory.mockImplementation(() => {
        throw new Error('Invalid data');
      });
  
      expect(() => addVolunteerHistory(badRecord)).toThrow('Invalid data');
    });
  });
  