var express = require('express');
var http = require('http');
var path = require('path');
var uuid = require('node-uuid');
var socketIo = require('socket.io');

var __dirname = '.';
var publicDirectory = 'public';

var games = [];

function Game() {
    return {
        id: uuid.v4(),
        title: 'totor',
        players: []
    };
};

var app = express();
app.use(express.static(path.join(__dirname, publicDirectory)));

app.get('/', function (request, response) {
    response.render('index.html');
});

app.get('/games', function (request, response) {
    response.send(games);
});

app.get('/games/:id', function (request, response) {
    var i = 0;
    while (games[i].id != request.params.id) {
        i++;
    }
    response.send(games[i]);
});

app.post('/games', function (request, response) {
    var game = new Game();
    games.push(game);
    response.send(game);
});

//app.listen(8080);
console.log('server is running...');

var server = http.createServer(app);
io = socketIo.listen(server);
server.listen(8080);

io.sockets.on('connection', function (socket) {
    socket.on('subscribeMessage', function (data) {
        io.sockets.emit('subscribeMessage', data);
    });
});
