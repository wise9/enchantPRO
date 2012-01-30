enchant();

var game;
window.onload = function(){
    game = new Game(320, 320);
    game.onload = function(){
        var scene = new Scene3D();
        var camera = new Camera3D();
        camera.x = 0;
        camera.y = -50;
        camera.z = 50;
   		camera.upVectorX = 0;
   		camera.upVectorY = 1;
   		camera.upVectorZ = 0;
   		camera.centerX = 0;
   		camera.centerY = 0;
   		camera.centerZ = 0;
        scene.setCamera(camera);
        var light = new Light3D(1);
        light.x = 0;
        light.y = 0;
        light.z = 100;
        light.directionX = 0;
        light.directionY = 0;
        light.directionZ = -1;
//        scene.addLight(light);
        var timecount = 0;
        Sprite3D.loadCollada("./model/negimiku.dae", function(model){
            if (model) {
//            	model.scaleX = 0.05;
//            	model.scaleY = 0.05;
//            	model.scaleZ = 0.05;
            	model.addEventListener("enterframe", function(){
            		timecount += 0.016;
            		camera.x = Math.cos(timecount) * 50;
            		camera.y = Math.sin(timecount) * 50;
        		});
                scene.addChild(model);
            }else {
                console.log("the loaded model did not pass if(model) for some unknown reasons.");
            }
        });
    }
    game.preload();
    game.start();
}
