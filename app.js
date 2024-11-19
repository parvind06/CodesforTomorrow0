require('dotenv').config()
let db =require('./models')
var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
var app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

const corsOpts = {
  origin: "*",
  methods: ["GET", "POST", "PUT"],
//   allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOpts));

var usersRouter = require('./routes/users');
app.use(fileUpload());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
global.socketio = io;

app.use('/users', usersRouter);           //define routes ..

app.use(function(req, res, next) {
  next(createError(404));
});

// Synchronizes the database schema with the models re-sync db.
 /* db.sequelize.sync({ force: false }).then(() => {
    console.log("Drop and re-sync db.");
 }); */


app.use(function(err, req, res, next) {              // error handler
  res.locals.message = err.message;
  res.locals.error =  err ?? {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


io.on("connection", (socket) => {
  console.log("scoketID:", socket.id);
})


 server.listen(process.env.APP_PORT, function () {
  console.clear();
  console.log('App Server is running on  !' + process.env.APP_PORT)
})


module.exports = app;
