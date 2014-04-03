var uuid = require('node-uuid');
var fs = require('fs');
var path = require('path');

var __dirname = '.';
var publicDirectory = 'public';

function Game() {
    return {
        id: uuid.v4(),
        title: 'Game blblblb',
        players: [],
        cards: getCards(5)
    };
};

function Player(name) {
    return {
        name: name,
        targetCard: null
    };
}

function Card(imgUrl) {
    return {
        id: uuid.v4(),
        imgUrl: imgUrl
    };
}

function getCards(cardCount) {
    var cardsDirectory = path.join(__dirname, publicDirectory, 'cards');
    var cardPaths = fs.readdirSync(cardsDirectory);
    var cards = [];

    for (var i = 0; i < cardCount; i++) {
        cards.push(new Card(path.join('cards', cardPaths[i])));
    }

    return cards;
}

exports.Game = Game;
