var express = require('express');
var app = express();
var server = require('http').createServer(app);
var ejs = require('ejs');
var io = require('socket.io')(server);
var redis = require('redis');
var redisClient = redis.createClient();
app.use("/js", express.static(__dirname + "/js"));
var messages = [];
var storeMessage = function(name, data){
  var message = JSON.stringify({name: name, data: data});
  redisClient.lpush("messages", message, function(err, response) {
    redisClient.ltrim("messages", 0, 9);
  });
}
io.on('connection', function(client) {
  client.on('join', function(name) {
    client.nickname = name;
    client.broadcast.emit("add person", name);
    redisClient.smembers('names', function(err, names) {
      names.forEach(function(name) {
        console.log(name);
        client.emit('add person', name);
      });
    });
    redisClient.sadd("names", name);
    redisClient.lrange("messages", 0, -1, function(err, messages) {
      messages = messages.reverse();
      messages.forEach(function(message) {
        message = JSON.parse(message);
        client.emit("messages", message.name + ": " + message.data);
      });
    });
  });
  client.on('disconnect', function(name) {
    client.broadcast.emit('remove person', client.nickname);
    redisClient.srem('names', name);
  });
  client.on('messages', function(data) {
    var nickname = client.nickname;
    client.broadcast.emit('messages', nickname + ": " + data);
    client.emit('messages', data);
    storeMessage(nickname, data);
  });
});

app.get('/', function(req, res, next) {
  res.locals = { scripts: ['https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js', 'js/chat.js', '/socket.io/socket.io.js'] };
  res.render('index.ejs');
});

server.listen(8080);
