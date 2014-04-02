(function () {
    var host = 'http://localhost:8080';
    var socket = io.connect(host);
    var gameId;

    socket.on('subscribeMessage', function (data) {
        $("#chat").append("<span>" + data + "</span><br/>");
    });

    $(document).ready(function () {
        $('#sendMessageButton').click(sendMessage);
        $('#joinGameButton').click(joinGame);
    });

    function sendMessage() {
        socket.emit('subscribeMessage', {
            gameId: gameId,
            message: $("#chatMessage").val()
        });
    }

    function joinGame() {
        var playerName = $('#playerName').val();
        $.post(host + '/joingame', { playerName: playerName }).done(function (game) {
            gameId = game.id;
            socket.emit('joingame', {
                gameId: gameId,
                playerName: playerName
            });
        });
    }
})();