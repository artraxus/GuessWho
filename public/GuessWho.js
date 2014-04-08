var GuessWho = {};

// socketIO
(function (GW) {
    var host = 'http://localhost:8080';
    GW.socketIO = io.connect(host);
})(GuessWho);

// Card Object
(function (GW) {
    GW.Card = function (data) {
        var _self = this;
        //properties
        _self.name = data.name;
        _self.url = data.imgUrl;
        _self.enable = true;
    };
})(GuessWho);

// LogInViewModel
(function (GW) {
    var host = 'http://localhost:8080';

    var LogInViewModel = function () {
        var _self = this;
        // properties
        _self.username = ko.observable();
        _self.isVisible = ko.observable(true);

        //commands
        _self.joinGame = function () {
            var playerName = $('#playerName').val();
            $.post(host + '/joingame', { playerName: _self.username })
                .done(function (data) {
                    data.cards.forEach(function (card) {
                        GW.gameViewModel.cards.push(new GW.Card(card));
                    });
                    GW.socketIO.emit('joingame', {
                        gameId: data.gameId,
                        playerId: data.playerId,
                        playerName: playerName
                    });

                    // must be handling by routing framework...
                    GW.gameViewModel.gameId = data.gameId;
                    GW.gameViewModel.isVisible(true);
                    GW.gameViewModel.targetCard(new GW.Card(data.targetCard));

                    data.playerNames.forEach(function (pName) {
                        GW.gameViewModel.playerNames.push(pName);
                    });

                    _self.isVisible(false);
                });
        };
    };

    GW.logInViewModel = new LogInViewModel();
})(GuessWho);

// GameViewModel
(function (GW) {
    var GameViewModel = function () {
        var _self = this;

        // properties	
        _self.gameId = null;
        _self.isVisible = ko.observable(false);
        _self.messages = ko.observableArray([]);
        _self.cards = ko.observableArray([]);
        _self.targetCard = ko.observable({});
        _self.playerNames = ko.observableArray([]);
        _self.guessName = ko.observable('');
        _self.hoverName = ko.observable('');

        //commands	
        _self.sendMessage = function () {
            var msgContent = $("#chatMessage").val();
            $("#chatMessage").val("");

            if (msgContent !=null && msgContent.trim() != '') {
                _self.messages.push("moi: " + msgContent);
                resetFocusOnChat();

                GW.socketIO.emit('subscribeMessage', {
                    gameId: _self.gameId,
                    message: msgContent
                });
            }
        };
        _self.sendGuess = function () {
            GW.socketIO.emit('guess', _self.guessName());
        };

        _self.toggleImage = function (card, event) {
            if (card.enable) {
                event.target.style.opacity = 0.2;
            }
            else {
                event.target.style.opacity = null;
            }
            card.enable = !card.enable;
        };

        _self.onCardHover = function(card) {
            _self.hoverName(card.name);
        };

        _self.onCardOut = function() {
            _self.hoverName('');
        };

        GW.socketIO.on('subscribeMessage', function (data) {
            _self.messages.push(data);
            resetFocusOnChat();
        });

        GW.socketIO.on('playerJoin', function (playerName) {
            _self.playerNames.push(playerName);
        });

        GW.socketIO.on('guess', function (message) {
            alert(message);
        });

        function resetFocusOnChat() {
            $('#messagesContainer li').last().addClass('active-li').focus();
        }

    };

    GW.gameViewModel = new GameViewModel();
})(GuessWho);

ko.applyBindings(GuessWho);