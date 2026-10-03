import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import studyRoutes from './routes/studyRoutes.js';

dotenv.config();
await connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET','POST','PUT'] }
});
app.set('io', io);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (_, res) => res.json({ message: 'SkillBarter API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/study', studyRoutes);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new Error('Unauthorized'));
    socket.userId = user._id.toString();
    next();
  } catch { next(new Error('Unauthorized')); }
});

io.on('connection', socket => {
  socket.join(`user:${socket.userId}`);
  socket.on('join-conversation', id => socket.join(`conversation:${id}`));
  socket.on('join-study-room', roomId => {
    socket.join(`study:${roomId}`);
    socket.to(`study:${roomId}`).emit('study-peer-ready');
  });
  socket.on('webrtc-offer', ({ roomId, offer }) => socket.to(`study:${roomId}`).emit('webrtc-offer', offer));
  socket.on('webrtc-answer', ({ roomId, answer }) => socket.to(`study:${roomId}`).emit('webrtc-answer', answer));
  socket.on('webrtc-ice-candidate', ({ roomId, candidate }) => socket.to(`study:${roomId}`).emit('webrtc-ice-candidate', candidate));
  socket.on('leave-study-room', roomId => socket.leave(`study:${roomId}`));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`SkillBarter server running on port ${PORT}`));
