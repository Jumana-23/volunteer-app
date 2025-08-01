function validateMatchData(data) {
  if (!data.eventId || typeof data.eventId !== 'string') {
    throw new Error('Event ID is required and must be a string');
  }
  if (!Array.isArray(data.volunteers) || data.volunteers.length === 0) {
    throw new Error('Volunteers must be a non-empty array');
  }
  data.volunteers.forEach((name) => {
    if (typeof name !== 'string') {
      throw new Error('Each volunteer name must be a string');
    }
  });
  return true;
}

module.exports = { validateMatchData };
