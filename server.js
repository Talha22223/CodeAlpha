const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIO = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: '*' }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Socket.IO setup
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected: ' + socket.id);

  socket.on('userOnline', (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on('sendFriendRequest', (data) => {
    // Support both old and new payloads
    if (data.receiverSocketId) {
      io.to(data.receiverSocketId).emit('receiveFriendRequest', data);
    } else if (data.receiverId && data.senderId) {
      const receiverSocket = onlineUsers.get(data.receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit('friendRequestReceived', { senderId: data.senderId });
      }
    }
  });

  socket.on('newLike', ({ postId, userId }) => {
    socket.broadcast.emit('postLiked', { postId, userId });
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log('User disconnected: ' + socket.id);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  server.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
}).catch(err => console.error(err));

