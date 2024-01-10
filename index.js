import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './dbconfig.js';
import Message from './features/messages/message.schema.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500", // Adjust this to your client's origin
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

app.use(cors());


const connectedUsers = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('newUserJoined', async (userName) => {
    const user = {
      id: socket.id,
      name: userName,
    };
    connectedUsers.push(user);

    // Broadcast to all clients the updated user list
    io.emit('usersListUpdated', connectedUsers);

    // Send previous messages to the newly joined user
    try {
      const previousMessages = await Message.find();
      socket.emit('prevChats', previousMessages);
    } catch (error) {
      console.error('Error fetching previous messages:', error.message);
    }

    // Broadcast to all clients that a new user has joined
    socket.broadcast.emit('broadcast_msg', {
      id: socket.id,
      userName: 'System',
      msg: `${userName} joined the chat.`,
    });
  });

  socket.on('new_message_received', async (msgText) => {
    // Broadcast the new message to all clients
    io.emit('broadcast_msg', {
      id: socket.id,
      userName: connectedUsers.find(user => user.id === socket.id)?.name,
      msg: msgText,
    });

    // Save the new message to the database
    const newMessage = new Message({
     userName: connectedUsers.find(user => user.id === socket.id)?.name,
      userMsg: msgText,
    });
    

    try {
      await newMessage.save();
    } catch (error) {
      console.error('Error saving the new message:', error.message);
    }
  });

  // ... (rest of the code remains unchanged)
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove the disconnected user from the connectedUsers array
    const disconnectedUser = connectedUsers.find(user => user.id === socket.id);
    if (disconnectedUser) {
      connectedUsers.splice(connectedUsers.indexOf(disconnectedUser), 1);
    }

    // Broadcast to all clients the updated user list after a user disconnects
    io.emit('usersListUpdated', connectedUsers);
  });
});

// Move server.listen outside of the io.on('connection', ...) event handler
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
