import fs from 'fs';
import path from 'path';
import { logEventHistory } from '../services/eventHistoryService.js';

const filePath = path.resolve('data/events.json');

// Utility: Read events from JSON file
function readEvents() {
  const raw = fs.readFileSync(filePath);
  return JSON.parse(raw);
}

// Utility: Write events to JSON file
function writeEvents(events) {
  fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
}

// GET all events
export const getAllEvents = (req, res) => {
  const events = readEvents();
  res.status(200).json(events);
};

// GET one event by ID
export const getEventById = (req, res) => {
  const events = readEvents();
  const event = events.find(e => e.id === parseInt(req.params.id));
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.status(200).json(event);
};

// POST create new event
export const createEvent = (req, res) => {
  const events = readEvents();
  const newEvent = { id: Date.now(), ...req.body };
  events.push(newEvent);

  writeEvents(events);
  logEventHistory(newEvent); // ← Save to event history log

  res.status(201).json(newEvent);
};

// PUT update existing event
export const updateEvent = (req, res) => {
  const events = readEvents();
  const index = events.findIndex(e => e.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Event not found' });

  events[index] = { ...events[index], ...req.body };
  writeEvents(events);
  res.status(200).json(events[index]);
};

// DELETE event
export const deleteEvent = (req, res) => {
  let events = readEvents();
  const index = events.findIndex(e => e.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Event not found' });

  events.splice(index, 1);
  writeEvents(events);
  res.status(200).json({ message: 'Event deleted' });
};
