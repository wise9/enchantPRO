/**
 * pro.enchant.js v1.0.8
 *
 * Copyright (c) Ubiquitous Entertainment Inc.
 * Dual licensed under the MIT or GPL Version 3 licenses
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
function supportsEnchantPRO(){
	return (typeof _supportsEnchantPRO != 'undefined') && _supportsEnchantPRO;
}

if(supportsEnchantPRO()) (function() {
	"use strict";
	/**
#ifdef
	 * enchantにenchantPROライブラリのクラスをエクスポートする.
#else
	 * imports enchantPRO library into enchant.
#endif
	 */
	enchant.pro = {};
                    
    /**
     * @scope enchant.pro.Sensor.prototype
     */
    enchant.pro.Sensor = enchant.Class.create(enchant.EventTarget, {
    	/**
    	 * センサークラス
    	 * @constructs
    	 */
    	initialize: function(className){
    		if (enchant.pro[className].instance) {
    			return enchant.pro[className].instance;
    		}
    		if(this instanceof enchant.pro[className]) {
    			enchant.pro[className].instance = this;
    		} else {
    			return new enchant.pro[className];
    		}
    		enchant.EventTarget.call(this);
	    	var sensorList = EP_SENSOR.getSensor(className).getSensorsList();
	    	if(sensorList.size() > 0){
	    		this._sensor = sensorList.get(0);
	    	}
	    	if(this._sensor){
	    		this._sensor.setCallback("enchant.pro." + className + ".onUpdate");
	    	}
	    	
	    	enchant.pro[className].onUpdate = function(data){
		        if (enchant.pro[className].instance) {
		            var e = new Event('update');
		            e.data = data;
		            enchant.pro[className].instance.dispatchEvent(e);
		        }
	    	};
    	},
    	/**
   		 * センサーが利用可能かを返す
   		 * @return {Boolean} 
   		 */
   		isAvailable: function(){
   			return this._sensor;
   		},
   		/**
   		 * センサーからの読み取りを開始
   		 */
   		start: function(){
   			if(this._sensor){
    			this._sensor.enable();
   			}
   		},
   		/**
   		 * センサーからの読み取りを終了
   		 */
   		stop: function(){
   			if(this._sensor){
   				this._sensor.disable();
   			}
   		}
   	});
   	
   	/**
   	 * @scope enchant.pro.Accelerometer.prototype
   	 */
   	enchant.pro.Accelerometer = enchant.Class.create(enchant.pro.Sensor, {
   		/**
   		 * 加速度センサークラス
	     * @constructs
	     * @extends enchant.pro.Sensor
   		 */
   		initialize: function(){
   			enchant.pro.Sensor.call(this, 'Accelerometer');
   		}
   	});

   	/**
   	 * @scope enchant.pro.Orientation.prototype
   	 */
   	enchant.pro.Orientation = enchant.Class.create(enchant.pro.Sensor, {
   		/**
   		 * 方位センサークラス
	     * @constructs
	     * @extends enchant.pro.Sensor
   		 */
   		initialize: function(){
   			enchant.pro.Sensor.call(this, 'Orientation');
   		}
   	});
   	

   	/**
   	 * @scope enchant.pro.MagneticField.prototype
   	 */
   	enchant.pro.MagneticField = enchant.Class.create(enchant.pro.Sensor, {
   		/**
   		 * 磁気センサークラス
	     * @constructs
	     * @extends enchant.pro.Sensor
   		 */
   		initialize: function(){
   			enchant.pro.Sensor.call(this, 'MagneticField');
   		}
   	});

   	/**
   	 * @scope enchant.pro.Gravity.prototype
   	 */
   	enchant.pro.Gravity = enchant.Class.create(enchant.pro.Sensor, {
   		/**
   		 * 重力センサークラス
	     * @constructs
	     * @extends enchant.pro.Sensor
   		 */
   		initialize: function(){
   			enchant.pro.Sensor.call(this, 'Gravity');
   		}
   	});
   	

   	/**
   	 * @scope enchant.pro.Gyroscope.prototype
   	 */
   	enchant.pro.Gyroscope = enchant.Class.create(enchant.pro.Sensor, {
   		/**
   		 * ジャイロセンサークラス
	     * @constructs
	     * @extends enchant.pro.Sensor
   		 */
   		initialize: function(){
   			enchant.pro.Sensor.call(this, 'Gyroscope');
   		}
   	});

    /**
     * @scope enchant.pro.Camera.prototype
     */
    enchant.pro.Camera = enchant.Class.create(enchant.EventTarget, {
    	/**
    	 * カメラクラス
    	 * @example
    	 *   var scene = new Scene3D();
    	 *   var camera = new Camera();
    	 *   scene.setCamera(camera);
	     * @constructs
	     * @extends enchant.EventTarget
    	 */
    	initialize:function(){
    		if(enchant.pro.Camera.instance){
    			return enchant.pro.Camera.instance;
    		}
    		enchant.EventTarget.call(this);
    		enchant.pro.Camera.instance = this;
    	},
        /**
         * カメラプレビューを開始する.
         * @param {function} callback 開始時のコールバック関数
         */
        startPreview:function(callback) {
        	if(typeof callback != 'function') {
        		throw new Error('Argument must be function');
        	}
        	enchant.pro.Camera.onPreviewStartedCallback = callback;
        	console.log('callback:' + callback);
        	EP_CAMERA.startPreview();
        },
        /**
         * カメラプレビューを終了する.
         * @param {function} callback 終了時のコールバック関数
         */
        stopPreview:function(callback) {
        	if(typeof callback != 'function') {
        		throw new Error('Argument must be function');
        	}
        	enchant.pro.Camera.onPreviewStoppedCallback = callback;
        	EP_CAMERA.stopPreview();
        },
        /**
         * 写真を撮影する.
         * カメラプレビューが開始されていないときにはなにもしない.
         * @param {function} callback 撮影時のコールバック関数
         */
        takePicture:function(callback) {
        	if(typeof callback != 'function') {
        		throw new Error('Argument must be function');
        	}
        	enchant.pro.Camera.onPictureTakenCallback = callback;
        	EP_CAMERA.takePicture();
        },
        /**
         * オートフォーカスを行う.
         * カメラプレビューが開始されていないときにはなにもしない.
         */
        autoFocus:function(){
        	EP_CAMERA.autoFocus();
        },
        /**
         * 左右方向のカメラの視野角を取得する(degree).
         */
        getFieldOfViewX:function(){
        	return EP_CAMERA.getFieldOfViewX();
        },
        /**
         * 上下方向のカメラの視野角を取得する(degree).
         */
        getFieldOfViewY:function(){
        	return EP_CAMERA.getFieldOfViewY();
        },
        /**
         * ARマーカーの認識を開始する.
         * カメラプレビューが開始されていないときにはなにもしない.
         */
        startARMarkerDetection:function() {
            this.state = 'armarker';
            EP_AR.startDetection();
        },
        /**
         * 認識処理を終了する.
         */
        stopDetection:function() {
            switch (this.state) {
                case 'armarker':
                    EP_AR.stopDetection();
                    break;
            }
        }
    });

    enchant.pro.Camera.onDetect = function(data) {
        if (enchant.pro.Camera.instance) {
            var e = new Event('detect');
            e.data = data ? data : [];
            enchant.pro.Camera.instance.dispatchEvent(e);
        }
    };
    EP_AR.setOnDetection('enchant.pro.Camera.onDetect');

    enchant.pro.Camera.onPictureTaken = function(data) {
        if (enchant.pro.Camera.instance) {
            var surface = enchant.Surface.load(data);
            surface.addEventListener('load', function() {
                if (enchant.pro.Camera.onPictureTakenCallback != null) {
                    enchant.pro.Camera.onPictureTakenCallback.call(null, surface);
                }
            });
        }
    };
    EP_CAMERA.setOnPictureTakenCallback('enchant.pro.Camera.onPictureTaken');

    enchant.pro.Camera.onPreviewStarted = function() {
        if (enchant.pro.Camera.instance) {
        }
    };
    EP_CAMERA.setOnPreviewStarted('enchant.pro.Camera.onPreviewStartedCallback');

    enchant.pro.Camera.onPreviewStopped = function() {
        if (enchant.pro.Camera.instance) {
        }
    };
    EP_CAMERA.setOnPreviewStopped('enchant.pro.Camera.onPreviewStoppedCallback');

    enchant.Event.DETECT = 'detect';

	/**
	 * 端末内に保存されている画像にアクセスする
	 * @param {function} callback コールバック
	 */
    enchant.Surface.browse = function(callback) {
        if (typeof callback != 'function') {
            throw new Error('Argument must be function');
        }
        EP_MEDIA.pickImage();
        enchant.Surface.onImagePickedCallback = callback;
    };

    enchant.Surface.onImagePicked = function(data) {
        if (enchant.Surface.onImagePickedCallback) {
            var surface = enchant.Surface.load(data);
            surface.addEventListener('load', function() {
                enchant.Surface.onImagePickedCallback.call(null, surface);
            });
        }
    };
    EP_MEDIA.setOnImagePicked('enchant.Surface.onImagePicked');

    enchant.Sound.load = function(src, mimetype) {
        var sound = Object.create(enchant.Sound.prototype);
        enchant.EventTarget.call(sound);
        var id = 'enchant-audio' + enchant.Game.instance._soundID++;
        var player = EP_SOUND.createSoundPlayer(src, id);
        sound.addEventListener('load', function() {
            Object.defineProperties(sound, {
                currentTime: {
                    get: function() { return player.getCurrentTime() },
                    set: function(time) { player.setCurrentTime(time) }
                },
                volume: {
                    get: function() { return player.getVolume() },
                    set: function(volume) { player.setVolume(volume) }
                }
            });
            sound._element = player;
            sound.duration = player.getDuration();
        });
        return sound;
    };
    
    enchant.Sound.prototype.clone = function() {
        var clone = Object.create(enchant.Sound.prototype, {
        	_element: { value: this._element.clone() },
        	duration: { value: this.duration }
        });
        enchant.EventTarget.call(clone);
        return clone;
    };

	if(navigator.userAgent.indexOf('Android') != -1){
	    var touches = [null, null, null, null, null];
	    ['start', 'move', 'end'].forEach(function(type) {
	        window['androidTouch' + capitalize(type)] = function(touch) {
	        	if (touches[touch.identifier]) {
	                touch.target = touches[touch.identifier].target;    
	            } else {
	                touch.target = document.elementFromPoint(touch.pageX, touch.pageY);
	            }
	
	            if (type == 'end') {
	                touches[touch.identifier] = null;
	            } else {
	                touches[touch.identifier] = touch;
	            }
	
	            var e = document.createEvent('MouseEvent');
	            e.emulated = true;
	            
	            e.initMouseEvent('touch' + type, true, false, window, 0,
	                touch.pageX, touch.pageY, touch.pageX, touch.pageY, false, false, true, false, 0, null);
	            e.touches=touches.filter(function(i) { return i && i.target == this; }, touch.target);
	            e.changedTouches = [touch];
	            touch.target.dispatchEvent(e);
	        };
	    });
	}

    var listener = function(e) {
        e.preventDefault();
        if (!e.emulated) e.stopPropagation();
    };
    document.addEventListener('touchstart', listener, true);
    document.addEventListener('touchmove', listener, true);
    document.addEventListener('touchend', listener, true);

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
})();