var uuid = require('node-uuid');
var fs = require('fs');
var path = require('path');
var utils = require('./utils.js');

var __dirname = '.';
var publicDirectory = 'public';

function Game() {

    // Returns a random cards from an array of cards or null if no cards
    function getTargetCard(cards) {
        if (cards != null && cards.length > 0) {
            var randomIndex = utils.getRandomInt(0, cards.length - 1);
            return cards[randomIndex];
        }
        throw new Error('cards is null or empty');
    }

    // Returns the opponent of the player with the specified id
    function getOpponent(id, players) {
        if (players[0].id == id) {
            return players[1];
        }

        return players[0];
    }

    return {
        id: uuid.v4(),
        title: 'Game blblblb',
        players: [],
        cards: getCards(24),
        getTargetCard: getTargetCard,
        getOpponent: getOpponent
    };
};

function Player(name, targetCard) {
    return {
        id: uuid.v4(),
        name: name,
        targetCard: targetCard
    };
}

function Card(imgUrl) {
    return {
        id: uuid.v4(),
        imgUrl: imgUrl
    };
}

function getCards(cardCount) {
    var fileContent = fs.readFileSync('server/database.txt', { encoding: 'utf8' });
    var cards = JSON.parse(fileContent);
    var cardsDeck = [];

    for (var i = 0; i < cardCount; i++) {
        cardsDeck.push(cards.splice(utils.getRandomInt(0, cards.length - 1), 1)[0]);
    }

    return cardsDeck;
}

exports.Game = Game;
exports.Player = Player;
