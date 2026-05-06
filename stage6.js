const http = require('http');
const url = 'http://20.207.122.201/evaluation-service/notifications';

const typeWeight = {
  placement: 3,
  result: 2,
  event: 1,
};

function getValue(obj, key1, key2) {
  return obj[key1] || obj[key2] || '';
}

function score(notification) {
  const type = getValue(notification, 'type', 'Type').toLowerCase();
  const weight = typeWeight[type] || 1;
  const time = Date.parse(getValue(notification, 'timestamp', 'Timestamp')) || 0;
  return weight * 1000000 + Math.floor(time / 1000);
}

http.get(url, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      const list = data.notifications || [];
      const top = list
        .map((notif) => ({
          ...notif,
          score: score(notif),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      console.log('Top 10 priority notifications:');
      top.forEach((notif, index) => {
        console.log(`${index + 1}. ${getValue(notif, 'Type', 'type')} - ${getValue(notif, 'Message', 'message')} (${getValue(notif, 'Timestamp', 'timestamp')})`);
      });
    } catch (err) {
      console.error('Could not parse response:', err.message);
    }
  });
}).on('error', (err) => {
  console.error('Request failed:', err.message);
});