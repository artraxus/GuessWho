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
    var targetCard = game.getTargetCard(game.cards);
    var player = new gameEngine.Player(playerName, targetCard);
    game.players.push(player);

    response.send({ gameId: game.id, playerId: player.id, cards: game.cards, targetCard: targetCard, playerNames: game.players.map(function (p) { return p.name; }) });
});

//app.listen(8080);
console.log('server is running...');

var server = http.createServer(app);
io = socketIo.listen(server);
server.listen(8080);

io.sockets.on('connection', function (socket) {
    socket.on('subscribeMessage', function (data) {
        socket.get('playerData', function (err, playerData) {
            socket.broadcast.to(data.gameId).emit('subscribeMessage', playerData.playerName + ': ' + data.message);
        });
    });
    socket.on('joingame', function (data) {
        socket.join(data.gameId);
        socket.set('playerData', data);
        socket.broadcast.to(data.gameId).emit('playerJoin', data.playerName);
    });
    socket.on('guess', function (guessId) {
        socket.get('playerData', function (err, data) {
            var game = getGame(data.gameId);
            var opponentPlayer = game.getOpponent(data.playerId, game.players);

            if (opponentPlayer.targetCard.id == guessId) {
                socket.emit('guess', 'you win !!');
                socket.broadcast.to(data.gameId).emit('guess', 'You LOOSE ');
            }
            else {
                socket.emit('guess', 'LOOZER');
                socket.broadcast.to(data.gameId).emit('guess', 'You win');
            }
        });
    });

    socket.on('gameReady', function (data) {
        socket.broadcast.to(data.gameId).emit('gameReady');
    });
});

// Returns the game with the specified Id or null if not found
function getGame(id) {
    for (var i = 0, length = games.length; i < length ; i++) {
        if (games[i].id == id) {
            return games[i];
        }
    }

    return null;
};