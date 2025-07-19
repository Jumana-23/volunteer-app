import { events } from '../data/events.js';

export const getAllEvents = (req, res) => {
  res.status(200).json(events);
};

export const getEventById = (req, res) => {
  const { id } = req.params;
  const event = events.find(e => e.id === parseInt(id));
  event
    ? res.status(200).json(event)
    : res.status(404).json({ message: 'Event not found' });
};

export const createEvent = (req, res) => {
  const newEvent = { id: Date.now(), ...req.body };
  events.push(newEvent);
  res.status(201).json(newEvent);
};

export const updateEvent = (req, res) => {
  const { id } = req.params;
  const index = events.findIndex(e => e.id === parseInt(id));
  if (index === -1) return res.status(404).json({ message: 'Event not found' });

  events[index] = { ...events[index], ...req.body };
  res.status(200).json(events[index]);
};

export const deleteEvent = (req, res) => {
  const { id } = req.params;
  const index = events.findIndex(e => e.id === parseInt(id));
  if (index === -1) return res.status(404).json({ message: 'Event not found' });

  events.splice(index, 1);
  res.status(200).json({ message: 'Event deleted' });
};