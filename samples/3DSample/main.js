enchant();
var game;
window.onload = function(){
	game = new Game(320, 320);
	game.onload = function(){
		//enchantPRO対応ブラウザか確認
		if(typeof _supportsEnchantPRO == 'undefined'){
			game.rootScene.addChild(new Label('This browser does not support enchantPRO'));
		}else{
			//3Dシーンの初期化
			var scene = new Scene3D();
			for(var i = 0; i < 5; i++){
				var box = new Sprite3D();
				box.x = Math.random() * 4 - 2;
				box.y = Math.random() * 4 - 2;
				box.z = -15 - Math.random() * 15;
				box.rotX = 0;
				
				box.addEventListener('touch', function(e){
					this.x = Math.random() * 4 - 2;
					this.y = Math.random() * 4 - 2;
				});
				
				box.speed = 0.3 * Math.random();
				box.vx = box.speed;
				box.vy = box.speed;
				box.addEventListener('render', function(e){
					this.rotX += 0.1;
					this.rotation = [
						1, 0, 0, 0,
						0, Math.cos(this.rotX), -Math.sin(this.rotX), 0,
						0, Math.sin(this.rotX), Math.cos(this.rotX), 0,
						0, 0, 0, 1
					];
					if(this.x > 2) this.vx = -this.speed;
					else if(this.x < -2) this.vx = this.speed;
					if(this.y > 2) this.vy = -this.speed;
					else if(this.y < -2) this.vy = this.speed;
					this.translate(this.vx, this.vy, 0.0);
				});
				scene.addChild(box);
			}
		}
	};
	game.start();
};
