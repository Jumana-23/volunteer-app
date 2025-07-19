import { getAllMatches, addMatch } from './volunteerMatchingService.js';

export function getMatches(req, res) {
  const data = getAllMatches();
  res.status(200).json(data);
}

export function postMatch(req, res) {
  try {
    const newMatch = addMatch(req.body);
    res.status(201).json(newMatch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
