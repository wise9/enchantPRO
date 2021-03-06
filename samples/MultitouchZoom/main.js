enchant();
window.onload = function() {
	var game = new Game(320,320);
	game.preload('assets/robot.png');
	game.onload = function(){
		var label = new Label('not touched');
		label.font = '32px sans-serif';
		label.x = 10;
		label.y = 10;
		game.rootScene.addChild(label);

		var bear = new Sprite(128,128);
		bear.image = game.assets['assets/robot.png'];
		bear.x=90;
		bear.y=90;
		var basex1;
		var basex2;
		var basedx;
		var basedy;
		var basey1;
		var basey2;
		var basescaleX;
		var basescaleY;
		bear.addEventListener('touchstart',function(e){
			label.text='touchstart';
			console.log(e.identifier);
			if(e.identifier==0){
				basescaleX=bear.scaleX;
				basescaleY=bear.scaleY;
				basex1=e.localX;
				basey1=e.localY;
			}
			if(e.identifier==1){
				basex2=e.localX;
				basey2=e.localY;
				basedx=basex1-basex2;
				basedy=basey1-basey2;
			}
		});
		var zoomx1;
		var zoomy1;
		var zoomx2;
		var zoomy2;
		var zoomf1=false;
		var zoomf2=false;
		bear.addEventListener('touchmove',function(e){
			if(e.identifier==0){
				zoomx1=e.x;
				zoomy1=e.y;
				zoomf1=true;
			}
			if(e.identifier==1){
				zoomx2=e.x;
				zoomy2=e.y;
				zoomf2=true;
			}
			if(zoomf1&&zoomf2){
					var zoomdx;
					var zoomdy;
					zoomdx=zoomx1-zoomx2;
					zoomdy=zoomy1-zoomy2;
					var rate;
					var based;
					based=Math.sqrt(basedx*basedx+basedy*basedy);
					rate=Math.sqrt(zoomdx*zoomdx+zoomdy*zoomdy)/based;
					bear.scaleX=basescaleX*Math.pow(rate,1.2);
					bear.scaleY=basescaleY*Math.pow(rate,1.2);
			}else if(!zoomf2){
				bear.x=e.x-basex1;
				bear.y=e.y-basey1;
			}
			label.text="touchmove";
		});
		bear.addEventListener('touchend',function(e){
			label.text='not touched';
			zoomf1=false;
			zoomf2=false;
		});
		game.rootScene.addChild(bear);
	};
	game.start();
};