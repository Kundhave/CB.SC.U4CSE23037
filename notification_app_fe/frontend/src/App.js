import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_NOTIFICATIONS_URL || 'http://20.207.122.201/evaluation-service/notifications';
const TYPE_WEIGHT = { placement: 3, result: 2, event: 1 };
const TYPES = ['all', 'Event', 'Result', 'Placement'];

function normalizeId(notification) {
  return (
    notification.id ||
    notification.notification_id ||
    `${notification.type || ''}|${notification.timestamp || ''}|${notification.message || ''}`
  );
}

function scoreNotification(notification) {
  const type = String(notification.type || notification.Type || '').toLowerCase();
  const weight = TYPE_WEIGHT[type] || 1;
  const ts = notification.timestamp || notification.Timestamp || '';
  const time = Date.parse(ts) || 0;
  return weight * 1000000000 + Math.floor(time / 1000);
}

function buildUrl(type, page) {
  const params = new URLSearchParams({ limit: '50', page: String(page) });
  if (type && type !== 'all') {
    params.set('notification_type', type);
  }
  return `${API_URL}?${params.toString()}`;
}

function App() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const [view, setView] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewedIds, setViewedIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('viewedNotifications') || '[]'));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetch(buildUrl(filterType, page), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        return res.json();
      })
      .then((payload) => {
        const list = Array.isArray(payload.notifications) ? payload.notifications : [];
        setNotifications(list);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Unable to load notifications');
          setNotifications([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [filterType, page]);

  useEffect(() => {
    localStorage.setItem('viewedNotifications', JSON.stringify(Array.from(viewedIds)));
  }, [viewedIds]);

  const topNotifications = useMemo(() => {
    return [...notifications]
      .map((notif) => ({ score: scoreNotification(notif), notif }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry) => entry.notif);
  }, [notifications]);

  const handleMarkViewed = (notification) => {
    const id = normalizeId(notification);
    if (!viewedIds.has(id)) {
      setViewedIds((current) => new Set(current).add(id));
    }
  };

  const renderList = (list) => {
    if (list.length === 0) {
      return <div className="empty-state">No notifications found.</div>;
    }

    return (
      <div className="notification-list">
        {list.map((notification) => {
          const id = normalizeId(notification);
          const isViewed = viewedIds.has(id);
          return (
            <button
              key={id}
              type="button"
              className={`notification-card ${isViewed ? 'viewed' : 'new'}`}
              onClick={() => handleMarkViewed(notification)}
            >
              <div className="notification-meta">
                <span className="notification-type">{notification.type || notification.Type || 'Unknown'}</span>
                <span className="notification-time">{notification.timestamp || notification.Timestamp || 'No timestamp'}</span>
              </div>
              <div className="notification-message">{notification.message || notification.Message || 'No message'}</div>
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
          <p className="brand">Notification App</p>
          <p className="subtitle">Stage 7: All Notifications, Priority view, filter, paging, and viewed state.</p>
        </div>
        <div className="tabs">
          <button className={view === 'all' ? 'active' : ''} onClick={() => setView('all')}>
            All Notifications
          </button>
          <button className={view === 'priority' ? 'active' : ''} onClick={() => setView('priority')}>
            Priority Notifications
          </button>
        </div>
      </header>

      <section className="controls-panel">
        <div className="control-group">
          <label htmlFor="type-select">Notification Type</label>
          <select id="type-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All types' : type}
              </option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label>Page</label>
          <div className="page-controls">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Prev
            </button>
            <span>{page}</span>
            <button type="button" onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      </section>

      <main className="main-content">
        {error && <div className="error-panel">{error}</div>}
        {loading && <div className="loading">Loading notifications...</div>}

        {!loading && !error && (
          <>
            {view === 'all' ? (
              <div className="section">
                <div className="section-header">
                  <h2>All Notifications</h2>
                  <p>{notifications.length} notifications loaded.</p>
                </div>
                {renderList(notifications)}
              </div>
            ) : (
              <div className="section">
                <div className="section-header">
                  <h2>Top 10 Priority Notifications</h2>
                  <p>Sorted by type weight and timestamp.</p>
                </div>
                {renderList(topNotifications)}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
