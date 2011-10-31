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
			var box = new Sprite3D();
			
			//カメラの初期化
			var camera = new Camera();
			//マーカー検出時のコールバック
			var isFirst = true;
			camera.addEventListener('detect', function(e){
				if(isFirst){
					scene.addChild(box);
					isFirst = false;
				}
				//マーカーの上にのせるための行列をboxにセット
				box.matrix = e.data[0]["afTransform"];
			});
			
			//UI
			var button = new Label('Start AR');
            button.font = '32px sans-serif';
            button.x = 10;
            button.y = 10;
			button.addEventListener('touchend', function(){
				if(button.text == 'Start AR'){
					camera.startPreview(function(){
						button.text = 'Stop AR';
						camera.startARMarkerDetection();
					});
				}else{
					scene.removeChild(box);
					camera.stopDetection();
					camera.stopPreview(function(){
						button.text = 'Start AR';
					});
				}
			});
			game.rootScene.addChild(button);
		}
	};
	game.start();
};
