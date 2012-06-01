enchant();
window.onload = function(){
	var game = new Game(320, 320);
	game.preload('assets/bgm.wav', 'assets/chara1.gif', 'assets/bar.png');
	game.onload = function(){
		var sound = game.assets['assets/bgm.wav'].clone();
		var button = new Label('Play');
        button.font = '32px sans-serif';
        button.x = 10;
        button.y = 10;
		button.addEventListener('touchend', function(){
			if(this.text == 'Play'){
				sound.play();
				this.text = 'Pause';
			}else{
				sound.pause();
				this.text = 'Play';
			}
		});
		game.rootScene.addChild(button);
		
        var counter = new Label('0s/0s');
        counter.font = '32px sans-serif';
        counter.x = 10;
        counter.y = 80;
		counter.addEventListener('enterframe', function(){
			this.text = 'time:' + parseInt(sound.currentTime) + 's/' + parseInt(sound.duration) + 's';
		});
        game.rootScene.addChild(counter);
        
        var volume = new Label('volume:1.0');
        volume.font = '32px sans-serif';
        volume.x = 10;
        volume.y = 150;
        volume.addEventListener('enterframe', function(){
        	this.text = 'volume:' + sound.volume;
        });
        game.rootScene.addChild(volume);
        
		var Slider = Class.create(Group, {
			initialize:function(w){
				Group.call(this);
				var bar = new Sprite(w, 16);
				bar.image = game.assets['assets/bar.png'];
				bar.y = 8;
				this.addChild(bar);
				this._bar = bar;
				
				var pointer = new Sprite(32, 32);
				pointer.image = game.assets['assets/chara1.gif'];
				this.addChild(pointer);
				var that = this;
				pointer.addEventListener('touchmove', function(e){
					that.value = (e.x - that.x) / that._bar.width;
					that.dispatchEvent(new Event('valuechange'));
				});
				this._pointer = pointer;
			},
			value:{
				get:function(){
					return this._value;
				},
				set:function(value){
					if(value > 1.0) value = 1.0;
					else if(value < 0.0) value = 0.0;
					this._pointer.x = this._bar.width * value - this._pointer.width / 2;
					this._pointer.frame = [0, 1, 0, 2][~~(this._bar.width * value) % 4];
					this._value = value;
				}
			}
		});
		var timeSlider = new Slider(280);
		timeSlider.x = 20;
		timeSlider.y = 48;
		timeSlider.addEventListener('valuechange', function(){
			sound.currentTime = sound.duration * this.value;
		});
		timeSlider.addEventListener('enterframe', function(){
			this.value = sound.currentTime / sound.duration;
		});
		game.rootScene.addChild(timeSlider);

		var volumeSlider = new Slider(100);
		volumeSlider.x = 20;
		volumeSlider.y = 118;
		volumeSlider.addEventListener('valuechange', function(e){
			sound.volume = this.value;
		});
		volumeSlider.value = sound.volume;
		game.rootScene.addChild(volumeSlider);
	};
	game.start();
};