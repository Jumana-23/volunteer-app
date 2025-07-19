export function validateEvent(event) {
  if (!event.title || typeof event.title !== 'string') {
    throw new Error('Title is required');
  }
  if (!event.date || typeof event.date !== 'string') {
    throw new Error('Date is required');
  }
  if (!event.location || typeof event.location !== 'string') {
    throw new Error('Location is required');
  }
}
