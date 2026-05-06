import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_NOTIFICATIONS_URL || 'http://localhost:4000/evaluation-service/notifications';
const TYPE_WEIGHT = { placement: 3, result: 2, event: 1 };
const TYPES = ['all', 'Event', 'Result', 'Placement'];

function scoreNotification(notification) {
  const type = String(notification.type || '').toLowerCase();
  const weight = TYPE_WEIGHT[type] || 1;
  const time = Date.parse(notification.timestamp || notification.Timestamp || '') || 0;
  return weight * 1e9 + Math.floor(time / 1000);
}

function buildUrl(type, page) {
  const params = new URLSearchParams({ limit: '50', page: String(page) });
  if (type !== 'all') params.set('notification_type', type);
  return `${API_URL}?${params.toString()}`;
}

function App() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const [view, setView] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewed, setViewed] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    setError('');

    fetch(buildUrl(filterType, page))
      .then((res) => res.ok ? res.json() : Promise.reject(new Error(`Server ${res.status}`)))
      .then((data) => setNotifications(Array.isArray(data.notifications) ? data.notifications : []))
      .catch((err) => setError(err.message || 'Unable to load notifications'))
      .finally(() => setLoading(false));
  }, [filterType, page]);

  const topNotifications = useMemo(
    () => [...notifications]
      .map((notification) => ({ score: scoreNotification(notification), notification }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => item.notification),
    [notifications]
  );

  const markViewed = (notification) => {
    const id = notification.id || `${notification.type}|${notification.timestamp}|${notification.message}`;
    setViewed((next) => new Set(next).add(id));
  };

  const renderNotifications = (list) => {
    if (!list.length) return <div className="empty-state">No notifications found.</div>;

    return (
      <div className="notification-list">
        {list.map((notification) => {
          const id = notification.id || `${notification.type}|${notification.timestamp}|${notification.message}`;
          const isViewed = viewed.has(id);
          return (
            <button key={id} className={`notification-card ${isViewed ? 'viewed' : ''}`} onClick={() => markViewed(notification)}>
              <div className="notification-meta">
                <span>{notification.type || 'Unknown'}</span>
                <span>{notification.timestamp || 'No timestamp'}</span>
              </div>
              <div className="notification-message">{notification.message || 'No message'}</div>
              {!isViewed && <span className="notification-badge">NEW</span>}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Notification App</h1>
          <p>View all notifications and priority notifications with type filtering.</p>
        </div>
        <div className="tabs">
          <button className={view === 'all' ? 'active' : ''} onClick={() => setView('all')}>
            All
          </button>
          <button className={view === 'priority' ? 'active' : ''} onClick={() => setView('priority')}>
            Priority
          </button>
        </div>
      </header>

      <div className="controls-panel">
        <label>
          Type
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All types' : type}
              </option>
            ))}
          </select>
        </label>
        <div className="page-controls">
          <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>
            Prev
          </button>
          <span>Page {page}</span>
          <button onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </div>

      {error && <div className="error-panel">{error}</div>}
      {loading && <div className="loading">Loading notifications...</div>}

      {!loading && !error && (
        <div className="section">
          <div className="section-header">
            <h2>{view === 'all' ? 'All Notifications' : 'Top 10 Priority Notifications'}</h2>
            <p>{view === 'all' ? `${notifications.length} loaded` : 'Sorted by type weight and time'}</p>
          </div>
          {renderNotifications(view === 'all' ? notifications : topNotifications)}
        </div>
      )}
    </div>
  );
}

export default App;
