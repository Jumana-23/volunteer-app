import { validateMatchData } from './volunteerMatchingValidation.js';

const volunteerMatches = [
  { eventId: 1, volunteers: ['Sam', 'Alex'] },
];

export function getAllMatches() {
  return volunteerMatches;
}

export function addMatch(data) {
  validateMatchData(data);
  volunteerMatches.push(data);
  return data;
}
