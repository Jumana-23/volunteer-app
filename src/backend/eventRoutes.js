const express = require('express');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  assignVolunteer,
  removeVolunteer,
  getEventsNeedingVolunteers,
  getEventStatistics
} = require('./eventController');

const router = express.Router();

// Basic CRUD operations
router.get('/', getAllEvents);
router.get('/statistics', getEventStatistics);
router.get('/needing-volunteers', getEventsNeedingVolunteers);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

// Volunteer management
router.post('/:eventId/assign-volunteer', assignVolunteer);
router.post('/:eventId/remove-volunteer', removeVolunteer);

module.exports = router;
