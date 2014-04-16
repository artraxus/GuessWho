var uuid = require('node-uuid');
var fs = require('fs');
var path = require('path');
var utils = require('./utils.js');

var __dirname = '.';
var publicDirectory = 'public';

var games = [];

function Game() {
    var self = this;

    self.id = uuid.v4();
    self.title = 'Game blblblb';
    self.players = [];
    self.cards = getCards(24);

    // Returns a random cards from an array of cards or null if no cards
    self.getTargetCard = function () {
        if (self.cards != null && self.cards.length > 0) {
            var randomIndex = utils.getRandomInt(0, self.cards.length - 1);
            return self.cards[randomIndex];
        }
        throw new Error('cards is null or empty');
    };

    // Returns the opponent of the player with the specified id
    self.getOpponent = function (id) {
        if (self.players[0].id == id) {
            return self.players[1];
        }

        return self.players[0];
    };

    function getCards(cardCount) {
        var fileContent = fs.readFileSync('server/database.txt', { encoding: 'utf8' });
        var cards = JSON.parse(fileContent);
        var cardsDeck = [];

        for (var i = 0; i < cardCount; i++) {
            cardsDeck.push(cards.splice(utils.getRandomInt(0, cards.length - 1), 1)[0]);
        }

        return cardsDeck;
    }
};

function Player(name, targetCard) {
    var self = this;
    self.id = uuid.v4();
    self.name = name;
    self.targetCard = targetCard;
}

function Card(imgUrl) {
    var self = this;
    self.id = uuid.v4();
    self.imgUrl = imgUrl;
}

// Returns the game with the specified Id or null if not found
function getGame(id) {
    for (var i = 0, length = games.length; i < length ; i++) {
        if (games[i].id == id) {
            return games[i];
        }
    }

    return null;
};

// Returns the last game if ther is only one player or create a new game
function getOrCreateGame() {
    if (games.length <= 0 || games[games.length - 1].players.length >= 2) {
        games.push(new Game());
    }

    console.log('iuergerè_uegr ' + games.length);

    return games[games.length - 1];
};

function removeGame(gameId) {
    var gameIndex = 0;
    var game = null;

    for (var i = 0, length = games.length; i < length ; i++) {
        if (games[i].id == gameId) {
            gameIndex = i;
            game = games[i];
        }
    }

    if (game != null) {
        games.splice(gameIndex, 1);
        delete game;
    }
};

exports.Game = Game;
exports.Player = Player;
exports.getGame = getGame;
exports.getOrCreateGame = getOrCreateGame;
exports.removeGame = removeGame;
