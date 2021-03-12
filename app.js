var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose")
// var session = require("express-session")
// var connectRedis = require('connect-redis')
// var Redis = require("ioredis")
var cors = require('cors')
const crawlerRouter = require("./routes/crawler.route")
const userRouter = require("./routes/user.route")
const categoryRouter = require('./routes/category.route')
const ratingRouter = require("./routes/rating.route")
const itemRouter = require("./routes/item.route")
const versionRouter = require("./routes/oldversion.route")
const passport = require("passport");
const flash = require('connect-flash');

const MONGO_Options = require("./config/db")

const connect = mongoose.connect(MONGO_Options.MONGO_URI, MONGO_Options.MONGO_Option)
  .then(() => console.log("connect MongoDb"))
  .catch(err => console.log(err)
  )
// const RedisStore = connectRedis(session)
//   const client = new Redis(Redis_option.Redis_Option)
//   const store = new RedisStore({ client })
var app = express();
app.use(cors())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use("/", crawlerRouter)
app.use("/", categoryRouter)
app.use("/", itemRouter)
app.use('/', userRouter)
app.use('/', ratingRouter)
app.use("/", versionRouter)

// app.use(
//   session({ ...Session_Option,
//     store:new RedisStore({client})
//   })
// )

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
