const { validateVolunteerHistory } = require('./validations.js');

const volunteerHistoryData = [
  { volunteerName: 'John Doe', eventName: 'Beach Cleanup', hours: 5 },
];

function getAllVolunteerHistory() {
  return volunteerHistoryData;
}

function addVolunteerHistory(record) {
  validateVolunteerHistory(record);
  volunteerHistoryData.push(record);
  return record;
}

module.exports = {
  getAllVolunteerHistory,
  addVolunteerHistory
};