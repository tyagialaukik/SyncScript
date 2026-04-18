require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { connectDB, getBackend } = require("./config/db");
const { createAdapter } = require("@socket.io/redis-adapter");
const Redis = require("ioredis");
const WebSocket = require("ws");
const WebSocketJSONStream = require("@teamwork/websocket-json-stream");
const docRoutes = require("./routes/doc");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const pubClient = new Redis(process.env.REDIS_URL)
const subClient = pubClient.duplicate()
pubClient.on('error', err => console.error('Redis pub:', err))
subClient.on('error', err => console.error('Redis sub:', err))
io.adapter(createAdapter(pubClient, subClient))

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/docs", docRoutes);

// Socket.io initialization
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-doc", async (docId) => {
    socket.join(docId)
    socket.to(docId).emit("user-joined", { userId: socket.id })
    
    // Load doc from ShareDB and send to joining user
    const connection = getBackend().connect()
    const doc = connection.get("documents", docId)
    doc.fetch((err) => {
      if (doc.type) {
        socket.emit("load-doc", doc.data.content)
      } else {
        doc.create({ content: "" }, () => {
          socket.emit("load-doc", "")
        })
      }
    })
  })

  socket.on("doc-update", ({ docId, content }) => {
    // Broadcast to everyone else in the room
    socket.to(docId).emit("receive-update", { content })
    
    // Persist to ShareDB
    const connection = getBackend().connect()
    const doc = connection.get("documents", docId)
    doc.fetch((err) => {
      if (doc.type) {
        doc.submitOp([{ p: ["content"], od: doc.data.content, oi: content }])
      }
    })
  })
  socket.on("cursor-update", ({ docId, position, color }) => {
    socket.to(docId).emit("cursor-update", { userId: socket.id, position, color })
  })
  socket.on("leave-doc", (docId) => {
    socket.leave(docId)
    socket.to(docId).emit("user-left", { userId: socket.id })
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const wss = new WebSocket.Server({ server, path: "/doc" });
wss.on("connection", (ws) => {
  const stream = new WebSocketJSONStream(ws);
  getBackend().listen(stream);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
