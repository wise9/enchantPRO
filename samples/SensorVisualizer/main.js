enchant();
window.onload = function(){
	var game = new Game(320, 320);
	game.onload = function(){
		//enchantPRO対応ブラウザか確認
		if(typeof _supportsEnchantPRO == 'undefined'){
			game.rootScene.addChild(new Label('This browser does not support enchantPRO'));
		}else{
			//3Dシーンの初期化
			var scene = new Scene3D();
			var boxRoot = new Sprite3D();
			var boxX = new Sprite3D();
			boxX.scale(0.1, 0.1, 0.1);
			var boxY = new Sprite3D();
			boxY.scale(0.1, 0.1, 0.1);
			var boxZ = new Sprite3D();
			boxZ.scale(0.1, 0.1, 0.1);
			boxRoot.addChild(boxX);
			boxRoot.addChild(boxY);
			boxRoot.addChild(boxZ);
			
			//カメラの初期化
			var camera = new Camera();
			//マーカー検出時のコールバック
			camera.addEventListener('detect', function(e){
				if(boxRoot.parentNode && e.data.length == 0){
					boxRoot.parentNode.removeChild(boxRoot);
				}else if(!boxRoot.parentNode && e.data.length > 0){
					scene.addChild(boxRoot);
				}
				if(e.data.length > 0){
					boxRoot.matrix = e.data[0]["afTransform"];
				}
			});
			
            var sensor = new Orientation();
            if(sensor && sensor.isAvailable()){
               	sensor.addEventListener('update', function(e){
               		boxX.scaleX = (e.data[0] / 3 + 1);
               		boxX.x = boxX.scaleX / 2;
               		boxY.scaleY = (e.data[1] / 3 + 1);
               		boxY.y = boxY.scaleY / 2;
               		boxZ.scaleZ = (e.data[2] / 3 + 1);
               		boxZ.z = boxZ.scaleZ / 2;
               	});
				sensor.start();
			}
			
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
