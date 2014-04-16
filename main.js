var express = require('express');
var http = require('http');
var path = require('path');
var socketIo = require('socket.io');
var gameEngine = require('./server/gameEngine.js');
var __dirname = '.';
var publicDirectory = 'public';


var app = express();
app.use(express.static(path.join(__dirname, publicDirectory)));
app.use(express.bodyParser());

app.get('/', function (request, response) {
    response.render('index.html');
});

app.post('/joingame', function (request, response) {
    var game = gameEngine.getOrCreateGame();
    var playerName = request.body.playerName;
    var targetCard = game.getTargetCard();
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
        var game = gameEngine.getGame(data.gameId);
        if (game.players.length > 1) {
            socket.broadcast.to(data.gameId).emit('gameReady');
        }
    });
    socket.on('guess', function (guessId) {
        socket.get('playerData', function (err, data) {
            var game = gameEngine.getGame(data.gameId);
            var opponentPlayer = game.getOpponent(data.playerId);

            if (opponentPlayer.targetCard.id == guessId) {
                socket.emit('guess', true);
                socket.broadcast.to(data.gameId).emit('guess', false);
            }
            else {
                socket.emit('guess', false);
                socket.broadcast.to(data.gameId).emit('guess', true);
            }
        });
    });
    socket.on('disconnect', function () {
        socket.get('playerData', function (err, data) {
            if (data != null) {
                socket.broadcast.to(data.gameId).emit('opponentdisconnect');
                gameEngine.removeGame(data.gameId);
            }
        });
    });
});