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

app.get('/guess', function (request, response) {
    var gameId = request.query.gameId;
    var playerId = request.query.playerId;
    var guessId = request.query.guessId;
    var isWin = false;

    var game = getGame(gameId);
    var opponentPlayer = game.getOpponent(playerId, game.players);

    if (opponentPlayer.targetCard == guessId) {
        response.send('you win !!');
    }
    else {
        response.send('bouh you loose');
    }
});

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
        socket.broadcast.to(data.gameId).emit('playerJoin', data.playerName);
    });
});

// Returns the game with the specified Id or null if not found
function getGame(id) {
    for (var i = 0; i < games.length; i++) {
        if (games[i].id == id) {
            return games[i];
        }
    }

    return null;
};