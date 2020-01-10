var express     = require('express');
var bodyParser  = require('body-parser');
var passport	= require('passport');
var mongoose    = require('mongoose');
var Sentiment = require("sentiment");
var sentiment = new Sentiment();
var spamcheck = require("spam-detection");
var config      = require('./config/config');
var Message = require('./models/message');
var cors = require('cors')
var app = express()
 
app.use(cors())

// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use the passport package in our application
app.use(passport.initialize());
var passportMiddleware = require('./middleware/passport');
passport.use(passportMiddleware);
 
// Demo Route (GET http://localhost:5000)
app.get('/', function(req, res) {
  return res.send('Hello! The API is at http://localhost:' + port + '/api');
});

var routes = require('./routes');
app.use('/api', routes);

mongoose.connect(config.db, { useNewUrlParser: true , useUnifiedTopology: true , useCreateIndex: true});

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('MongoDB database connection established successfully!');
});

connection.on('error', (err) => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    process.exit();
});
 
// Start socket implementation 

let server = require('http').createServer(app);
let io = require('socket.io')(server);
 
io.on('connection', (socket) => {
 
  socket.on('disconnect', (name) =>{
    console.log("user logout");
    io.emit('users-changed', {user: name, event: 'left'});   
  });

  socket.on('set-name', (name) => {
    socket.username = name;
    console.log(name +"user logined");
    io.emit('users-changed', {user: name, event: 'joined'});    
  });
  
  socket.on('send-message', (message) => {
    var x = sentiment.analyze(message.message);
    message.score = x.score;
    message.spamcheck = spamcheck.detect(message.message);
    let newMessage = Message(message);
    console.log("message")
    newMessage.save(function (err,data) {
      if (err) console.log(err);
      if(data) console.log(data);
    });
    io.emit('message', {message: message.message, to: message.to, from: message.from, createdAt: new Date()});    
  });
});
 
var port = process.env.PORT || 5000;
 
server.listen(port, function(){
   console.log('listening in http://localhost:' + port);
});


