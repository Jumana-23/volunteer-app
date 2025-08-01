const express = require('express');
const { 
  getMatches, 
  postMatch, 
  autoMatch, 
  getVolunteerSuggestionsForEvent 
} = require('./volunteerMatchingController');

const router = express.Router();

// Basic matching routes
router.get('/', getMatches);
router.post('/', postMatch);

// Auto-matching routes
router.get('/auto-match/:eventId', autoMatch);
router.get('/suggestions/:eventId', getVolunteerSuggestionsForEvent);

module.exports = router;
