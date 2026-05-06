const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const SAMPLE_NOTIFICATIONS = [
  { id: '1', type: 'Event', message: 'New appointment slot available', timestamp: '2026-05-06T09:30:00Z' },
  { id: '2', type: 'Result', message: 'Lab report finalized successfully', timestamp: '2026-05-06T08:15:00Z' },
  { id: '3', type: 'Placement', message: 'New placement request requires approval', timestamp: '2026-05-06T07:45:00Z' },
  { id: '4', type: 'Event', message: 'System maintenance scheduled for tonight', timestamp: '2026-05-06T06:00:00Z' },
  { id: '5', type: 'Result', message: 'Patient test results are ready for review', timestamp: '2026-05-06T05:20:00Z' },
  { id: '6', type: 'Placement', message: 'Placement details updated for case #334', timestamp: '2026-05-05T19:10:00Z' },
  { id: '7', type: 'Event', message: 'New policy notification from the administrator', timestamp: '2026-05-05T16:55:00Z' },
  { id: '8', type: 'Result', message: 'Follow-up required for patient notification', timestamp: '2026-05-05T15:40:00Z' },
  { id: '9', type: 'Placement', message: 'Placement confirmation complete', timestamp: '2026-05-05T14:25:00Z' },
  { id: '10', type: 'Event', message: 'Daily summary of notifications is ready', timestamp: '2026-05-05T13:00:00Z' },
  { id: '11', type: 'Placement', message: 'New placement opportunity created', timestamp: '2026-05-05T12:00:00Z' },
  { id: '12', type: 'Result', message: 'Medical result validation completed', timestamp: '2026-05-05T11:00:00Z' }
];

function applyFilters(notifications, type) {
  if (!type || type.toLowerCase() === 'all') {
    return notifications;
  }
  return notifications.filter((notification) => notification.type.toLowerCase() === type.toLowerCase());
}

app.get('/evaluation-service/notifications', (req, res) => {
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 50));
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const type = req.query.notification_type || 'all';

  const filtered = applyFilters(SAMPLE_NOTIFICATIONS, type);
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  res.json({ notifications: items });
});

app.get('/', (req, res) => {
  res.send('Notification backend is running. Use /evaluation-service/notifications');
});

app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
