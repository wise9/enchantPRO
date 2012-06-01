enchant();
window.onload = function(){
	var game = new Game(320, 320);
	game.onload = function(){
		if(typeof _supportsEnchantPRO == 'undefined'){
			game.rootScene.addChild(new Label('This browser does not support enchantPRO'));
		}else{
			var label = new Label('Loading...');
            label.font = '32px sans-serif';
            label.x = 10;
            label.y = 10;
            game.rootScene.addChild(label);
            var sensor = new Orientation();
            if(sensor && sensor.isAvailable()){
               	sensor.addEventListener('update', function(e){
               		var text = "";
               		for(var i = 0; i < e.data.length; i++){
               			text += e.data[i] + "<br>";
               		}
               		label.text = text;
               	});
				sensor.start();
			}else{
				label.text = 'this sensor is unavailable.';
			}
		}
	};
	game.start();
};