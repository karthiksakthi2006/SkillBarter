# SkillBarter

SkillBarter is now structured as a React + Express + MongoDB application.

## What was upgraded

- Real MongoDB `User` model
- Unique `@username`
- Register and username/password login
- JWT authentication
- Real user search from MongoDB
- Individual `/profile/:username` pages
- Friend request → accept/reject flow
- Connection list through the user's `friends` field
- Messaging restricted to accepted friends
- MongoDB conversations and messages
- Socket.IO real-time incoming messages
- Removed frontend dependency on `mockUsers` and `mockMessages`

## Project structure

```text
skillbarter_clean/
├── src/
└── server/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── server.js
```

## 1. Install frontend

```bash
npm install
```

Copy `.env.example` to `.env` if you want a custom API URL.

## 2. Configure MongoDB

Inside `server/`:

```bash
npm install
```

Copy:

```text
server/.env.example
```

to:

```text
server/.env
```

Then set:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

## 3. Start backend

```bash
cd server
npm run dev
```

You should see:

```text
MongoDB connected
SkillBarter server running on port 5000
```

## 4. Start frontend

Open another terminal in the project root:

```bash
npm run dev
```

Open the Vite URL shown in the terminal.

## User flow

1. Create an account with a unique username such as `kathir`.
2. Log in using `kathir` + password.
3. Complete the profile and add teaching/learning skills.
4. Search another registered user in **Find Matches**.
5. Open `/profile/username`.
6. Click **Add Friend**.
7. The recipient sees the request on the dashboard/notification badge.
8. Recipient clicks **Accept** or **Reject**.
9. After acceptance, **Message** becomes available.
10. Messages are stored in MongoDB and delivered through Socket.IO.

## Important

The ZIP does not contain a real MongoDB database or credentials. You must create/configure your own MongoDB connection in `server/.env`.

Never commit `server/.env` to GitHub.
