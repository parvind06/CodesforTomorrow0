require('dotenv').config();
const errorHandler = require('./middleware/errorHandler').handleError;
const db = require('./models');
const createError = require('http-errors');
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const fileUpload = require('express-fileupload');
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

// Session tracking for active users
const activeSessions = {}; 

// CORS configuration
const corsOpts = {
  origin: "*", 
  methods: ["GET", "POST", "PUT"],
};

app.use(cors(corsOpts));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
global.socketio = io;  // Make io accessible globally

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

// Handle 404 errors
app.use(function (req, res, next) {
  next(createError(404));
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.user?.email || "Unknown user"} (ID: ${socket.id})`);

  // Handle room joining
  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`${socket.user?.email} joined room: ${room}`);
  });

  // Broadcast messages to a room
  socket.on("message", (data) => {
    const { room, message } = data;
    io.to(room).emit("message", { user: socket.user?.email, message });
  });

  // Handle forced logout (disconnection)
  socket.on("forceLogout", () => {
    const user = socket.user?.email;
    delete activeSessions[user];  // Remove user session from activeSessions
    socket.disconnect(true);  // Disconnect the socket
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.user?.email || "Unknown user"} (ID: ${socket.id})`);
  });
});

// Synchronize database (optional for development)
/*db.sequelize.sync({ force: false }).then(() => {
  console.log("Database synced.");
}); */

// Use the error handler middleware
app.use(errorHandler);

// Start the server
server.listen(process.env.APP_PORT, function () {
  console.clear();
  console.log('App Server is running on port ' + process.env.APP_PORT);
});

module.exports = app;
