const { 
  getAllMatches, 
  addMatch, 
  autoMatchVolunteers, 
  getVolunteerSuggestions 
} = require('./volunteerMatchingService');

function getMatches(req, res) {
  try {
    const matches = getAllMatches();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function postMatch(req, res) {
  try {
    const match = addMatch(req.body);
    res.status(201).json(match);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Auto-match volunteers to a specific event
async function autoMatch(req, res) {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }
    
    const matchResult = await autoMatchVolunteers(eventId);
    res.json(matchResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get volunteer suggestions for an event
async function getVolunteerSuggestionsForEvent(req, res) {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }
    
    const suggestions = await getVolunteerSuggestions(eventId);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { 
  getMatches, 
  postMatch, 
  autoMatch, 
  getVolunteerSuggestionsForEvent 
};
