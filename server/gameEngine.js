var uuid = require('node-uuid');

function Game() {
    return {
        id: uuid.v4(),
        title: 'Game blblblb',
        players: []
    };
};

exports.Game = Game;
