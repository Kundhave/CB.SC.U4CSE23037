import json
import os
import urllib.request
from datetime import datetime

URL = os.environ.get('NOTIFICATIONS_URL', 'http://20.207.122.201/evaluation-service/notifications')
ACCESS_TOKEN = os.environ.get('ACCESS_TOKEN', '').strip()
REQUEST_TIMEOUT = 15
TYPE_WEIGHT = {
    'placement': 3,
    'result': 2,
    'event': 1,
}


def get_value(obj, *keys):
    for key in keys:
        if key in obj:
            return obj[key]
    return ''


def parse_timestamp(value):
    if not value:
        return 0
    for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%SZ'):
        try:
            return int(datetime.strptime(value, fmt).timestamp())
        except Exception:
            pass
    try:
        return int(datetime.fromisoformat(value).timestamp())
    except Exception:
        return 0


def score(notification):
    type_value = str(get_value(notification, 'type', 'Type')).lower()
    weight = TYPE_WEIGHT.get(type_value, 1)
    ts = get_value(notification, 'timestamp', 'Timestamp')
    time_value = parse_timestamp(ts)
    return weight * 1000000000 + time_value


try:
    print(f'URL: {URL}')
    print(f'ACCESS_TOKEN present: {bool(ACCESS_TOKEN)}')
    req = urllib.request.Request(URL)
    if ACCESS_TOKEN:
        req.add_header('Authorization', f'Bearer {ACCESS_TOKEN}')

    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as response:
        body = response.read().decode('utf-8')
        data = json.loads(body)
        notifications = data.get('notifications', [])

        scored = []
        for item in notifications:
            scored.append((score(item), item))

        scored.sort(key=lambda x: x[0], reverse=True)
        top10 = [item for _, item in scored[:10]]

        print('Top 10 priority notifications:')
        for i, notif in enumerate(top10, 1):
            ntype = get_value(notif, 'type', 'Type')
            message = get_value(notif, 'message', 'Message')
            timestamp = get_value(notif, 'timestamp', 'Timestamp')
            print(f'{i}. {ntype} - {message} ({timestamp})')
except urllib.error.URLError as err:
    print('Network Error:', err)
    if hasattr(err, 'reason'):
        print('Reason:', err.reason)
    if hasattr(err, 'code'):
        print('HTTP status code:', err.code)
except Exception as err:
    print('Error:', err)
