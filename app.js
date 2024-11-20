require('dotenv').config();
const errorHandler = require('./middleware/errorHandler').handleError;
let db = require('./models');
var createError = require('http-errors');
var express = require('express');
const jwt = require('jsonwebtoken');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
var app = express();
const fileUpload = require('express-fileupload');
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

// Session tracking
const activeSessions = {}; 

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
global.socketio = io;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Define Routes
var usersRouter = require('./routes/users');
app.use('/users', usersRouter);

// Handle 404 errors
app.use(function (req, res, next) {
  next(createError(404));
});

// Middleware for WebSocket authentication
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = payload; // Attach user info to socket
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Socket.IO: Connection and event handling
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.user.email} (ID: ${socket.id})`);

  // Handle room joining
  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`${socket.user.email} joined room: ${room}`);
  });

  // Broadcast messages to a room
  socket.on("message", (data) => {
    const { room, message } = data;
    io.to(room).emit("message", { user: socket.user.email, message });
  });

  // Handle forced logout
  socket.on("forceLogout", () => {
    const user = socket.user.email;
    delete activeSessions[user]; // Remove session from activeSessions
    socket.disconnect(true);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.user.email} (ID: ${socket.id})`);
  });
});

// Synchronize database
/* Uncomment if needed
db.sequelize.sync({ force: false }).then(() => {
  console.log("Drop and re-sync db.");
});
*/
app.use(errorHandler);

server.listen(process.env.APP_PORT, function () {
  console.clear();
  console.log('App Server is running on port ' + process.env.APP_PORT);
});

module.exports = app;
