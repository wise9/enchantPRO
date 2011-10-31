enchant();
window.onload = function(){
	var game = new Game(320, 320);
	game.onload = function(){
		//enchantPRO対応ブラウザか確認
		if(typeof _supportsEnchantPRO == 'undefined'){
			game.rootScene.addChild(new Label('This browser does not support enchantPRO'));
		}else{
			//カメラの初期化
			var camera = new Camera();
			
			//UI
			var button = new Label('Start Preview');
	        button.font = '32px sans-serif';
	        button.x = 10;
	        button.y = 10;
			button.addEventListener('touchend', function(){
				if(button.text == 'Start Preview'){
					camera.startPreview(function(){
						button.text = 'Stop Preview';
					});
				}else{
					camera.stopPreview(function(){
						button.text = 'Start Preview';
					});
				}
			});
			game.rootScene.addChild(button);
		}
	};
	game.start();
};