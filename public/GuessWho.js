var GuessWho= {};

// socketIO
(function(GW){
    var host = 'http://localhost:8080';
    GW.socketIO = io.connect(host);    
})(GuessWho);

// LogInViewModel
(function (GW) {
  var host = 'http://localhost:8080';
 
	 var LogInViewModel = function(){ 
	 var _self = this;
	// properties
	_self.username = ko.observable(); 	
	_self.isVisible = ko.observable(true);
	
	//commands
	_self.joinGame = function () {
        var playerName = $('#playerName').val();
        $.post(host + '/joingame', { playerName: _self.username })
			.done(function (game) {		
				gameId = game.id;
				game.cards.forEach(function (card) {
					$('#cardContainer').append('<img src="' + card.imgUrl + '" class="img-thumbnail"/>');
				});
            GW.socketIO.emit('joingame', {
                gameId: gameId,
                playerName: playerName
            });
			
			// must be handling by routing framework...
			GW.GameViewModel.isVisible(true);			
			_self.isVisible(false);
        });
    };	
 };
 
GW.LogInViewModel = new LogInViewModel(); 
})(GuessWho);

// GameViewModel
(function (GW) { 
	 var GameViewModel = function(){ 
		var _self = this;
	 
		// properties	
		_self.isVisible = ko.observable(false);
		_self.messages = ko.observableArray([]);
		
		//commands	
		_self.sendMessage = function(){
		var msgContent = $("#chatMessage").val();
		$("#chatMessage").val("");
		_self.messages.push("moi: " + msgContent);
		 GW.socketIO.emit('subscribeMessage', {
            gameId: gameId,
            message: msgContent
        });
		};
		
		 GW.socketIO.on('subscribeMessage', function (data) {
        _self.messages.push(data);
    });  
		
		
	 };
	 
	GW.GameViewModel = new GameViewModel(); 
})(GuessWho);

ko.applyBindings(GuessWho);