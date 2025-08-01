const eventHistory = [];

function logEventHistory(event) {
  eventHistory.push({
    title: event.title,
    location: event.location,
    date: event.date,
  });
}

function getEventHistory() {
  return eventHistory;
}

module.exports = {
  logEventHistory,
  getEventHistory
};
