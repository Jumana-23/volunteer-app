const express = require('express');
const router = express.Router();

// Hardcoded sample notifications
let notifications = [
  { id: 1, message: 'Confirmed for Beach Cleanup at 9 AM' },
  { id: 2, message: 'New Event: Park Restoration needs 6 volunteers' },
];

// GET all notifications
router.get('/', (req, res) => {
  res.json(notifications);
});

// POST a new notification
router.post('/', (req, res) => {
  const newNotif = { id: Date.now(), message: req.body.message };
  notifications.push(newNotif);
  res.status(201).json(newNotif);
});

module.exports = router;
 