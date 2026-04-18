# SyncScript
A real-time collaborative code editor built with React, Node.js, Socket.io, Redis, and MongoDB.

![Status](https://img.shields.io/badge/status-live-brightgreen) ![Stack](https://img.shields.io/badge/stack-MERN%20%2B%20Redis-blue)

## Features
- Real-time multi-user code editing with sub-50ms sync
- Live cursor presence with colored user avatars
- Room-based collaboration via shareable URLs
- Multi-language syntax highlighting (JS, TS, Python, Java, C++)
- In-browser JavaScript code execution
- Persistent documents via MongoDB + ShareDB OT engine
- Horizontally scalable via Redis pub/sub adapter

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Monaco Editor |
| Backend | Node.js, Express, Socket.io |
| Real-time | Socket.io, Redis pub/sub |
| Database | MongoDB Atlas, ShareDB |
| Deploy | Render + Vercel |

## Getting Started

Clone and install:
cd server && npm install
cd ../client && npm install

Create server/.env:
MONGO_URI=your_mongodb_uri
REDIS_URL=your_redis_url
PORT=3001

Run locally:
Terminal 1: cd server && npx nodemon index.js
Terminal 2: cd client && npm run dev

Open http://localhost:5173, enter your name and room code, share URL to collaborate.

## Resume Highlight
Engineered a real-time collaborative engine using Socket.io and Redis, maintaining state synchronization across 100+ concurrent clients with sub-50ms latency.

## License
MIT
