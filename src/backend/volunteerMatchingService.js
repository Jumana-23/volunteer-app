const { validateMatchData } = require('./volunteerMatchingValidation');
const User = require('./models/User');
const Event = require('./models/Event');

const volunteerMatches = [
  { eventId: '1', volunteers: ['Sam', 'Alex'] },
];

function getAllMatches() {
  return volunteerMatches;
}

function addMatch(data) {
  validateMatchData(data);
  const match = {
    id: Date.now().toString(),
    eventId: data.eventId,
    volunteers: data.volunteers,
    matchedAt: new Date(),
    status: 'active'
  };
  volunteerMatches.push(match);
  return match;
}

// Auto-match volunteers to events based on skills and availability
async function autoMatchVolunteers(eventId) {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Get all volunteers with complete profiles
    const volunteers = await User.find({
      userType: 'volunteer',
      isComplete: true,
      'profile.skills': { $exists: true, $ne: [] }
    });

    // Score volunteers based on skill match
    const scoredVolunteers = volunteers.map(volunteer => {
      let score = 0;
      const volunteerSkills = volunteer.profile?.skills || [];
      const eventSkills = event.skills || [];
      
      // Calculate skill match score
      const matchingSkills = volunteerSkills.filter(skill => 
        eventSkills.includes(skill)
      );
      score = matchingSkills.length;
      
      // Bonus for having more matching skills
      if (eventSkills.length > 0) {
        score = (matchingSkills.length / eventSkills.length) * 100;
      }
      
      return {
        volunteer,
        score,
        matchingSkills,
        name: volunteer.profile?.fullName || volunteer.email
      };
    });

    // Sort by score (highest first) and filter out already assigned volunteers
    const availableVolunteers = scoredVolunteers
      .filter(sv => {
        const isAlreadyAssigned = event.assignedVolunteers.some(
          av => av.volunteerId.toString() === sv.volunteer._id.toString()
        );
        return !isAlreadyAssigned && sv.score > 0;
      })
      .sort((a, b) => b.score - a.score);

    // Return top matches up to the number needed
    const volunteersNeeded = event.requiredVolunteers - event.assignedVolunteers.length;
    const topMatches = availableVolunteers.slice(0, volunteersNeeded);

    return {
      event: {
        id: event._id,
        title: event.title,
        skills: event.skills,
        requiredVolunteers: event.requiredVolunteers,
        currentVolunteers: event.assignedVolunteers.length
      },
      matches: topMatches.map(match => ({
        volunteerId: match.volunteer._id,
        name: match.name,
        email: match.volunteer.email,
        skills: match.volunteer.profile?.skills || [],
        matchingSkills: match.matchingSkills,
        score: Math.round(match.score)
      })),
      volunteersNeeded
    };
  } catch (error) {
    throw new Error(`Auto-matching failed: ${error.message}`);
  }
}

// Get volunteer suggestions for a specific event
async function getVolunteerSuggestions(eventId) {
  try {
    const autoMatchResult = await autoMatchVolunteers(eventId);
    return autoMatchResult;
  } catch (error) {
    throw new Error(`Failed to get volunteer suggestions: ${error.message}`);
  }
}

module.exports = { 
  getAllMatches, 
  addMatch, 
  autoMatchVolunteers, 
  getVolunteerSuggestions 
};
