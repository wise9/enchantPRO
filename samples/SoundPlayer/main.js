enchant();
window.onload = function(){
	var audio = 'bgm.wav';
	var game = new Game(320, 320);
	game.preload(audio);
	game.onload = function(){
		var button = new Label('Play');
        button.font = '32px sans-serif';
        button.x = 10;
        button.y = 10;
		button.addEventListener('touchend', function(){
			if(this.text == 'Play'){
				game.assets[audio].play();
				this.text = 'Stop';
			}else{
				game.assets[audio].stop();
				this.text = 'Play';
			}
		});
		game.rootScene.addChild(button);
		
        var counter = new Label('0s/0s');
        counter.font = '32px sans-serif';
        counter.x = 10;
        counter.y = 60;
		counter.addEventListener('enterframe', function(){
			var sound = game.assets[audio];
			this.text = parseInt(sound.currentTime) + 's/' + parseInt(sound.duration) + 's';
		});
        game.rootScene.addChild(counter);
	};
	game.start();
};