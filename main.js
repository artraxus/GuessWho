var express = require('express');
var http = require('http');
var path = require('path');
var socketIo = require('socket.io');
var gameEngine = require('./server/gameEngine.js');
var __dirname = '.';
var publicDirectory = 'public';

var games = [];

var app = express();
app.use(express.static(path.join(__dirname, publicDirectory)));
app.use(express.bodyParser());

app.get('/', function (request, response) {
    response.render('index.html');
});

app.post('/joingame', function (request, response) {
    if (games.length <= 0 || games[games.length - 1].players.length >= 2) {
        games.push(new gameEngine.Game());
    }

    var game = games[games.length - 1];
    var playerName = request.body.playerName;
    game.players.push({ name: playerName });

    response.send(game);
});

/*
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
*/

//app.listen(8080);
console.log('server is running...');

var server = http.createServer(app);
io = socketIo.listen(server);
server.listen(8080);

io.sockets.on('connection', function (socket) {
    socket.on('subscribeMessage', function (data) {
        socket.get('playerName', function (err, playerName) {
            socket.broadcast.to(data.gameId).emit('subscribeMessage', playerName + ': ' + data.message);
        });
    });
    socket.on('joingame', function (data) {
        socket.join(data.gameId);
        socket.set('gameId', data.gameId);
        socket.set('playerName', data.playerName);
    });
    socket.on('leavegame', function (gameId) { socket.leave(gameId); });
});
