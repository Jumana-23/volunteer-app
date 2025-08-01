function validateVolunteerHistory(data) {
  if (!data.volunteerName || typeof data.volunteerName !== 'string') {
    throw new Error('Volunteer Name is required');
  }
  if (!data.eventName || typeof data.eventName !== 'string') {
    throw new Error('Event Name is required');
  }
  if (typeof data.hours !== 'number' || isNaN(data.hours)) {
    throw new Error('Hours must be a valid number');
  }
  if (data.hours < 0 || data.hours > 1000) {
    throw new Error('Hours must be between 0 and 1000');
  }
  return true;
}

module.exports = {
  validateVolunteerHistory
};
