## Stage 1

## Core Actions
1. User Login
2. Fetch all notifications
3. Fetch single notification
4. Mark notification as read
5. Delete notification
6. Create notification

## REST API Endpoints

1. Login
POST /api/auth/login
Headers: Content-Type: application/json
Body:
{
  "email": "student@campus.edu",
  "password": "password123"
}

2. Get all notifications
GET /api/notifications
Headers:
Content-Type: application/json
Authorization: Bearer <token>

3. Get single notification
GET /api/notifications/:id
Headers:
Content-Type: application/json
Authorization: Bearer <token>

4. Mark notification read
PUT /api/notifications/:id/mark-read
Headers:
Content-Type: application/json
Authorization: Bearer <token>
Body:
{
  "isRead": true
}

5. Delete notification
DELETE /api/notifications/:id
Headers:
Content-Type: application/json
Authorization: Bearer <token>

6. Create notification
POST /api/notifications
Headers:
Content-Type: application/json
Authorization: Bearer admin_token_here
Body:
{
  "type": "placement",
  "title": "Placement Drive - Microsoft",
  "message": "Microsoft is recruiting. Apply now!",
  "description": "Detailed info about placement drive",
  "priority": "high",
  "notificationFor": "all_students"
}

Real time notifications:
Use WebSocket if possible so new messages will show up without refersh. 
If not, the app can call GET /api/notifications every 5-10 seconds.

### Stage 2
I would go with MySQL relational and persistant DB. 
Use simple storage for notifications.
I suggest a table called notifications with id, userId, type, title, message, isRead, createdAt.
If data grows, add indexes on userId and createdAt.
A simple SQL query to get unread notifications is:
SELECT * FROM notifications WHERE userId = ? AND isRead = false ORDER BY createdAt DESC;

### Stage 3
The query is not accurate enough because it uses `studentID` but the table has `userId` in our design. It is slow because it may scan many rows if there is no index.
I would add an index on `userId` and `createdAt` only, not every column.
Better query for placement notifications in last 7 days:

SELECT * FROM notifications WHERE userId = ? AND notificationType = 'placement' AND createdAt >= NOW() - INTERVAL 7 DAY ORDER BY createdAt DESC;

### Stage 4
Do not fetch notifications on every page load for every student. Use a lazy load or only fetch unread items for the logged in student. You can also cache recent notifications so the DB does not get hit too much.

### Stage 5
The current code is bad because it sends email and DB writes one by one, so it fails when many students are there.
Better is to queue the work: save notification records first, then send emails using a background process or worker.
This makes it more reliable and faster because the app does not wait for each email to finish.

