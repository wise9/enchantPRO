enchant();
var game;
window.onload = function(){
	game = new Game(320, 320);
	game.onload = function(){
		var nfc = new NFCReader();
		var label = new Label('タッチして読み取りを開始');
		var reading = false;
		label.addEventListener('touchstart', function(){
			if(!reading){
				label.text = '読み取り中';
				reading = true;
				nfc.startDetection();
			}else{
				label.text = 'タッチして読み取りを開始';
				reading = false;
				nfc.stopDetection();
			}
		});
		nfc.addEventListener('detect', function(e){
			label.text = e.nfcId + 'だよ';
			console.log('id:' + e.nfcId);
		});
		game.rootScene.addChild(label);
	};
	game.start();
};
