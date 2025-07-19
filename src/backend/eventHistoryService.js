const eventHistory = [];

export function logEventHistory(event) {
  eventHistory.push({
    title: event.title,
    location: event.location,
    date: event.date,
  });
}

export function getEventHistory() {
  return eventHistory;
}
