$(document).ready( function() {
  var socket = io.connect('http://localhost:8080');

  function insertMessage(data) {
    $('#messages').append('<h1>' + data + '</h1>');
  }

  socket.on('connect', function(data) {
    $('#status').html('Connected to chat');
    nickname = prompt("What is your nickname?");
    socket.emit("join", nickname);
  });

  socket.on('add person', function(name) {
    var person = '<li data-name=' + name + '>' + name + '</li>';
    $('#people').append(person);
  });

  socket.on('remove person', function(name) {
    $('#people li[data-name=' + name + ']').remove();
  });

  socket.on('messages', function(data) {
    insertMessage(data);
  });

  $('#chat_form').submit(function(e) {
    e.preventDefault();
    var message = $('#chat_input').val();
    socket.emit('messages', message);
  });

});
