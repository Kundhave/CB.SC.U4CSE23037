const express = require('express');
const cors = require('cors');
const { Log } = require('./logger');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  Log('backend', 'info', 'middleware', `incoming request ${req.method} ${req.url}`);
  next();
});

app.get('/health', (req, res) => {
  Log('backend', 'debug', 'controller', 'health check route accessed');
  res.json({ status: 'ok' });
});

app.post('/notify', (req, res) => {
  const { userId, message } = req.body;

  if (typeof userId !== 'string' || typeof message !== 'string') {
    Log(
      'backend',
      'error',
      'controller',
      `invalid payload types received userId=${typeof userId} message=${typeof message}`
    );
    return res.status(400).json({ error: 'invalid payload' });
  }

  Log('backend', 'info', 'controller', `notification request received for user ${userId}`);
  Log('backend', 'debug', 'db', 'notification save skipped in demo mode');

  res.status(200).json({ sent: true });
});

app.use((err, req, res, next) => {
  Log('backend', 'fatal', 'controller', `unhandled error ${err.message}`);
  res.status(500).json({ error: 'server error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  Log('backend', 'info', 'utils', `server started on port ${port}`);
});
