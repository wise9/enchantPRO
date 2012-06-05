enchant();
window.onload = function(){
	var game = new Game(320, 320);
	game.fps = 30;
	game.onload = function(){
		//enchantPRO対応ブラウザか確認
		if(typeof _supportsEnchantPRO == 'undefined'){
			game.rootScene.addChild(new Label('This browser does not support enchantPRO'));
			return;
		}
		
		//3Dシーンの初期化
		var scene = new Scene3D();
		scene.backgroundColor = [0.0, 0.0, 0.0, 0.0];
		var box = new Cube();
		box.x = 0;
		box.y = 0;
		box.z = 0;
		//カメラの初期化
		var camera = new Camera();
		var sprites = [];
		for(var i = 0; i < 4; i++){
			var sprite = new Sprite(32, 32);
			sprite._style.backgroundColor = '#ff0000';
			sprite.x = game.width - 32;
			sprites.push(sprite);
			game.rootScene.addChild(sprite);
		}
		//マーカー検出時のコールバック
		camera.addEventListener('detect', function(e){
			//マーカーの上にのせるための行列をboxにセット
			if(e.data.length > 0){
				box.rotation = e.data[0]["afTransform"];
				for(var i = 0; i < 4; i++){
					sprites[i].x = e.data[0]['afMarkerPos'][i * 2] - sprites[i].width / 2;
					sprites[i].y = e.data[0]['afMarkerPos'][i * 2 + 1] - sprites[i].height / 2;
				}
			}
		});
		scene.addChild(box);

		var camera3d = new Camera3D();
		camera3d.x = camera3d.y = camera3d.z = 0;
		mat4.perspective(camera.getFieldOfViewY() / 2, game.width / game.height, 1.0, 1000.0, camera3d.projMat);
		scene.setCamera(camera3d);
		
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
				camera.stopDetection();
				camera.stopPreview(function(){
					button.text = 'Start AR';
				});
			}
		});
		game.rootScene.addChild(button);
	};
	game.start();
};
