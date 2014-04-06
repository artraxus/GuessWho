var GuessWho= {};

// socketIO
(function(GW){
    var host = 'http://localhost:8080';
    GW.socketIO = io.connect(host);    
})(GuessWho);

// Card Object
(function(GW){
    GW.Card = function(data){
		var _self = this;
		//properties
		_self.url = data.imgUrl;
		_self.enable = true;
	};
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
					GW.gameViewModel.cards.push(new GW.Card(card));					
					});
            GW.socketIO.emit('joingame', {
                gameId: gameId,
                playerName: playerName
            });
			
			// must be handling by routing framework...
			GW.gameViewModel.isVisible(true);			
			_self.isVisible(false);
        });
    };	
 };
 
GW.logInViewModel = new LogInViewModel(); 
})(GuessWho);

// GameViewModel
(function (GW) { 
	 var GameViewModel = function(){ 
		var _self = this;
	 
		// properties	
		_self.isVisible = ko.observable(false);
		_self.messages = ko.observableArray([]);
		_self.cards = ko.observableArray([]);
		
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
		
		_self.toggleImage = function(card, event){
		if(card.enable){
		event.target.style.opacity = 0.2;
		}
		else{
		event.target.style.opacity = 1;
		}
		card.enable = !card.enable;
		};
		
		 GW.socketIO.on('subscribeMessage', function (data) {
        _self.messages.push(data);
    });  
		
		
	 };
	 
	GW.gameViewModel = new GameViewModel(); 
})(GuessWho);

ko.applyBindings(GuessWho);