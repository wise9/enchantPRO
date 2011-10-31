/**
 * pro.enchant.js v0.5.0
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
	 * enchantにenchantPROライブラリのクラスをエクスポートする.
	 */
    enchant.pro = {};

	enchant.pro.Sprite3DTable = [];
    /**
     * @scope enchant.pro.Sprite3D.prototype
     */
    enchant.pro.Sprite3D = enchant.Class.create(enchant.EventTarget, {
	    /**
	     * 3Dポリゴン表示機能を持ったクラス.
	     *
	     * @example
	     *   var bear = new Sprite();
	     *   bear.image = game.assets['chara1.gif'];
	     *
	     * @constructs
	     * @extends enchant.EventTarget
	     */
        initialize: function() {
            enchant.EventTarget.call(this);

            this._mesh = EP_GL.getFactory().createMesh();
            this._meshId = this._mesh.getMeshId();
            enchant.pro.Sprite3DTable[this._meshId] = this;
            this._x = 0;
            this._y = 0;
            this._z = 0;
            this.childNodes = [];
            this.scene = null;

            var listener = function(e) {
                for (var i = 0, len = this.childNodes.length; i < len; i++) {
                    var sprite = this.childNodes[i];
                    sprite.dispatchEvent(e);
                }
            };
            this.addEventListener('added', listener);
            this.addEventListener('removed', listener);
            this.addEventListener('addedtoscene', listener);
            this.addEventListener('removedfromscene', listener);

			var that = this;
            var render = function() {
                that.dispatchEvent(new enchant.Event('render'));
            };
            this.addEventListener('addedtoscene', function() {
                render();
                game.addEventListener('exitframe', render);
            });
            this.addEventListener('removedfromscene', function() {
                game.removeEventListener('exitframe', render);
            });

            this.addEventListener('render', function() {
                if (this._changedTranslation) {
                    this._mesh.setTranslationJSON(JSON.stringify([this._x, this._y, this._z]));
                    this._changedTranslation = false;
                }
                if (this._changedScale) {
                    this._mesh.setScaleJSON(JSON.stringify([this._scaleX, this._scaleY, this._scaleZ]));
                    this._changedScale = false;
                }
            });
        },
	    /**
	     * 子ポリゴンを追加する.
	     * @param {Sprite3D} sprite 追加する子ポリゴン.
	     */
        addChild: function(sprite) {
            this.childNodes.push(sprite);
            this._mesh.addChild(sprite._mesh);
            sprite.parentNode = this;
            sprite.dispatchEvent(new enchant.Event('added'));
            if (this.scene) {
                sprite.scene = this.scene;
                sprite.dispatchEvent(new enchant.Event('addedtoscene'));
            }
        },
	    /**
	     * 指定された子ポリゴンを削除する.
	     * @param {Sprite3D} sprite 削除する子ポリゴン.
	     */
        removeChild: function(sprite) {
            var i;
            if ((i = this.childNodes.indexOf(sprite)) != -1) {
                this.childNodes.splice(i, 1);
            }
            this._mesh.removeChild(sprite._mesh);
            sprite.parentNode = null;
            sprite.dispatchEvent(new enchant.Event('removed'));
            if (this.scene) {
                sprite.scene = null;
                sprite.dispatchEvent(new enchant.Event('removedfromscene'));
            }
        },
        /**
         * Sprite3Dを平行移動する.
         * @param {Number} x
         * @param {Number} y
         * @param {Number} z
         */
        translate: function(x, y, z) {
            this._x += x;
            this._y += y;
            this._z += z;
            this._changedTranslation = true;
        },
        /**
         * Sprite3Dを拡大縮小する.
         * @param {Number} x
         * @param {Number} y
         * @param {Number} z
         */
        scale: function(x, y, z) {
            this._scaleX *= x;
            this._scaleY *= y;
            this._scaleZ *= z;
            this._changedScale = true;
        },
        /**
         * Sprite3Dの回転行列
         * @type {Array.<Number>}
         */
        rotation: {
            get: function() {
                return this._rotation;
            },
            set: function(rotation) {
                this._rotation = rotation;
                this._mesh.setRotationJSON(JSON.stringify(rotation));
            }
        },
        /**
         * Sprite3Dの変換行列
         * @type {Array.<Number>}
         */
        matrix: {
            get: function() {
                return this._matrix;
            },
            set: function(matrix) {
                this._matrix = matrix;
                this._mesh.setMatrixJSON(JSON.stringify(matrix));
            }
        },
        /**
         * Sprite3Dのテクスチャ
         * @type {Surface}
         */
        surface: {
            get: function() {
                return this._surface;
            },
            set: function(surface) {
                this._surface = surface;
                this._mesh.setMaterial(this._surface._material);
            }
        },
        /**
         * Sprite3Dの名前
         * @type {String}
         */
        name: {
            get: function() {
                return this._name;
            },
            set: function(surface) {
                this._mesh.setName(this._name = name);
            }
        }
    });
    /**
     * Sprite3Dの各軸に対する平行移動量
     * @type {Number}
     */
    'x y z'.split(' ').forEach(function(prop) {
        Object.defineProperty(enchant.pro.Sprite3D.prototype, prop, {
            get: function() {
                return this['_' + prop];
            },
            set: function(n) {
                this['_' + prop] = n;
                this._changedTranslation = true;
            }
        });
        enchant.pro.Sprite3D.prototype[prop] = 0;
    });
    /**
     * Sprite3Dの各軸に対する拡大率
     * @type {Number}
     */
    'scaleX scaleY scaleZ'.split(' ').forEach(function(prop) {
        Object.defineProperty(enchant.pro.Sprite3D.prototype, prop, {
            get: function() {
                return this['_' + prop];
            },
            set: function(scale) {
                this['_' + prop] = scale;
                this._changedScale = true;
            }
        });
        enchant.pro.Sprite3D.prototype[prop] = 1;
    });
    /**
     * Sprite3Dの頂点情報
     * @type {Array.<Number>}
     */
    'vertices indices normals'.split(' ').forEach(function(prop) {
        Object.defineProperty(enchant.pro.Sprite3D.prototype, prop, {
            get: function() {
                return this['_' + prop];
            },
            set: function(ary) {
                this['_' + prop] = ary;
                this._mesh['set' + capitalize(prop) + 'JSON'](JSON.stringify(this['_' + prop]));
            }
        });
    });

    /*
     * @scope enchant.pro.Scene3D.prototype
     */
    enchant.pro.Scene3D = enchant.Class.create(enchant.EventTarget, {
	    /**
	     * 表示ポリゴンツリーのルートになるクラス.
	     *
	     * @example
	     *   var scene = new Scene3D();
	     *   var sprite = new Sprite3D();
	     *   scene.addChild(sprite);
	     *
	     * @constructs
	     * @extends enchant.EventTarget
	     */
	     initialize: function() {
            enchant.EventTarget.call(this);

            this._manager = EP_GL.getMeshManager();
            this.childNodes = [];
            var that = this;
            enchant.Game.instance.addEventListener('enterframe', function(e) {
                var nodes = that.childNodes.slice();
                var push = Array.prototype.push;
                while (nodes.length) {
                    var node = nodes.pop();
                    node.dispatchEvent(e);
                    if (node.childNodes) {
                        push.apply(nodes, node.childNodes);
                    }
                }
            });
        },
        /**
         * Scene3Dにポリゴンを追加する.
         * @param {enchant.Sprite3D}
         */
        addChild: function(sprite) {
            this._manager.add(sprite._mesh);
            sprite.parentNode = sprite.scene = this;
            sprite.dispatchEvent(new enchant.Event('added'));
            sprite.dispatchEvent(new enchant.Event('addedtoscene'));
        },
        /**
         * Scene3Dからポリゴンを削除する.
         * @param {enchant.Sprite3D}
         */
        removeChild: function(sprite) {
            var i;
            if ((i = this.childNodes.indexOf(sprite)) != -1) {
                this.childNodes.splice(i, 1);
            }
            this._manager.remove(sprite._mesh);
            sprite.parentNode = sprite.scene = null;
            sprite.dispatchEvent(new enchant.Event('removed'));
            sprite.dispatchEvent(new enchant.Event('removedfromscene'));
        }
    });

    /**
     * @scope enchant.pro.Surface3D.prototype
     */
    enchant.pro.Surface3D = enchant.Class.create({
    	/**
    	 * ポリゴンのテクスチャ情報を格納するクラス.
    	 * @example
    	 *   var sprite = new Sprite3D();
    	 *   var surface = new Surface3D();
    	 *   surface.src = "http://example.com/surface.png";
    	 *   sprite.surface = surface;
	     * @constructs
    	 */
        initialize: function() {
            this._material = EP_GL.getFactory().createMaterial();

            /* TODO
            this._ambient = [...];
            ...
            */
        },
        /**
         * テクスチャ画像のURL
         * @type {String}
         */
        src: {
            get: function() {
                return this._src;
            },
            set: function(src) {
                this._material.setTextureURL(this._src = src);
            }
        }
    });
    'ambient diffuse specular emission shininess'.split(' ').forEach(function(prop) {
        Object.defineProperty(enchant.pro.Surface3D.prototype, prop, {
            get: function() {
                return this['_' + prop];
            },
            set: function() {
                this['_' + prop] = Array.prototype.slice.call(arguments);
                this._material['set' + capitalize(prop) + 'JSON'](JSON.stringify(this['_' + prop]));
            }
        });
    });
    
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
    	 *   var camera = new Camera();
	     * @constructs
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
         * QRコードの認識を開始する.
         * カメラプレビューが開始されていないときにはなにもしない.
         * @param {Boolean} once 一度だけ読んで終了する場合はtrue
         */
        startQRCodeDetection:function(once) {
            this.state = 'code';
            EP_ZXING.setDetectOnce(!!once);
            EP_ZXING.enableQRCodeDetection();
            EP_ZXING.startDetection();
        },
        /**
         * バーコードの認識を開始する.
         * カメラプレビューが開始されていないときにはなにもしない.
         * @param {Boolean} once 一度だけ読んで終了する場合はtrue
         */
        startBarcodeDetection:function(once) {
            this.state = 'code';
            EP_ZXING.setDetectOnce(!!once);
            EP_ZXING.enableBarcodeDetection();
            EP_ZXING.startDetection();
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
                case 'code':
                    EP_ZXING.stopDetection();
                    break;
                case 'armarker':
                    EP_AR.stopDetection();
                    break;
            }
        }
    });

    enchant.pro.Camera.onDetect = function(data) {
        if (enchant.pro.Camera.instance) {
            var e = new Event('detect');
            e.data = data;
            enchant.pro.Camera.instance.dispatchEvent(e);
        }
    };
    EP_ZXING.setOnDetection('enchant.pro.Camera.onDetect');
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

    enchant.Sound.load = function(src) {
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
