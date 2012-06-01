/**
 * pro.enchant.js v1.0.1
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
if(navigator.userAgent.indexOf('iPhone enchantPRO') != -1){
	window['_supportsEnchantPRO'] = true;
}

function supportsEnchantPRO(){
	return (typeof _supportsEnchantPRO != 'undefined') && _supportsEnchantPRO;
}

if(supportsEnchantPRO()) (function() {
	"use strict";
	if(navigator.userAgent.indexOf('iPhone') != -1){
		var sendMessageToiPhone = function(message){
			var iframe = document.createElement("iframe");
			iframe.setAttribute("src", message);
			document.documentElement.appendChild(iframe);
			iframe.parentNode.removeChild(iframe);
			iframe = null;    
		};
		console.log = function(str){
			sendMessageToiPhone('log:' + str);
		};
		var njID = 0;
		var NJObject = enchant.Class.create({
			initialize:function(className){
				this._className = className;
				this._njId = ++njID;
				NJObject.runCommand(this._className, "alloc", this._njId);
			},
			runCommand:function(){
				if(arguments.length == 0) return;
				var message = this._className + "." + arguments[0] + "(_" + this._njId;
				for(var i = 1; i < arguments.length; i++){
					message += ",";
					if(arguments[i] instanceof NJObject){
						message += "_" + arguments[i]._njId;
					}else{
						message += arguments[i];
					}
				}
				message += ");";
				console.log(message);
				sendMessageToiPhone('command:' + message);
			}
		});
		NJObject.runCommand = function(){
			if(arguments.length < 1) return;
			var message = "Class_" + arguments[0] + "." + arguments[1] + "(";
			for(var i = 2; i < arguments.length; i++){
				if(i != 2) message += ",";
				if(arguments[i] instanceof NJObject){
					message += "_" + arguments[i]._njId;
				}else{
					message += arguments[i];
				}
			}
			message += ");";
			sendMessageToiPhone('command:' + message);
		}
		window['EP_MEDIA'] = {
			setOnImagePicked:function(str){
			}
		};
		var NJZXing = enchant.Class.create(NJObject, {
			initialize:function(){
				NJObject.call(this, "NJZXing");
			},
			setDetectOnce:function(once){
				this._once = once;
			},
			setOnDetection:function(callback){
				this.runCommand("setOnDetection", "\"" + callback + "\"");
			}
		});
		'startDetection stopDetection enableQRCodeDetection enableBarCodeDetection'.split(' ').forEach(function(func){
			NJZXing.prototype[func] = function(){
				this.runCommand(func);
			};
		});
		window['EP_ZXING'] = new NJZXing();
		var meshID = 0;
		var NJSprite3D = enchant.Class.create(NJObject, {
			initialize:function(){
				NJObject.call(this, "NJSprite3D");
				this._meshID = ++meshID;
				this.runCommand("setMeshID", this._meshID);
			},
			getMeshId:function(){
				return this._meshID;
			},
			setName:function(name){
				this._name = name;
			}
		});
		'addChild removeChild setMaterial'.split(' ').forEach(function(name){
			NJSprite3D.prototype[name] = function(obj){
				this.runCommand(name, obj);
			}
		});
		'translation scale rotation matrix vertices indices normals texCoords colors'.split(' ').forEach(function(name){
			var methodName = "set" + capitalize(name) + "JSON";
			NJSprite3D.prototype[methodName] = function(json){
				this.runCommand(methodName, json);
			};
		});
		var NJSurface3D = enchant.Class.create(NJObject, {
			initialize:function(){
				NJObject.call(this, "NJSurface3D");
			},
			setTextureURL:function(url){
				var absoluteURL = location.hostname+location.pathname.substr(0, location.pathname.lastIndexOf("/")) + "/" + url;
				this.runCommand("setTextureURL", "\"" + absoluteURL + "\"");
			}
		});
		'ambient diffuse specular emission shininess'.split(' ').forEach(function(name) {
			var methodName = "set" + capitalize(name) + "JSON";
			NJSurface3D.prototype[methodName] = function(json){
				this.runCommand(methodName,  json);
			};
		});
		var NJLight3D = enchant.Class.create(NJObject, {
			initialize:function(id){
				NJObject.call(this, "NJLight3D");
				this._lightId = id;
				this.runCommand('setLightID', this._lightId);
			},
			enable:function(){
				NJObject.runCommand('NJScene3D', 'addLight', this);
			},
			disable:function(){
				NJObject.runCommand('NJScene3D', 'removeLight', this);
			}
		});
		'position spotDirection'.split(' ').forEach(function(name){
			var methodName = "set" + capitalize(name) + "JSON";
			NJLight3D.prototype[methodName] = function(json){
				this.runCommand(methodName, json);
			};
		});
		var NJScene3D = enchant.Class.create(NJObject, {
			initialize:function(){
				NJObject.call(this, "NJScene3D");
			}
		});
		'add remove'.split(' ').forEach(function(name){
			NJScene3D.prototype[name] = function(sprite){
				this.runCommand(name + "Child", sprite);
			};
		});
		window['EP_GL'] = {
			getFactory:function(){
				return {
					createMesh:function(){
						return new NJSprite3D();
					},
					createMaterial:function(){
						return new NJSurface3D();
					}
				};
			},
			getMeshManager:function(){
				return new NJScene3D();
			},
			getLight:function(id){
				return new NJLight3D(id);
			},
			getLightCount:function(){
				return 8;
			}
		};
		var NJCamera = enchant.Class.create(NJObject, {
			initialize:function(){
				NJObject.call(this, "NJCamera");
			}
		});
		'startPreview stopPreview autoFocus takePicture'.split(' ').forEach(function(func){
			NJCamera.prototype[func] = function(){
				this.runCommand(func);
			};
		});	
		'previewStarted previewStopped pictureTakenCallback'.split(' ').forEach(function(func){
			func = 'setOn' + capitalize(func);
			NJCamera.prototype[func] = function(str){
				this.runCommand(func, "\"" + str + "\"");
			}
		});
		window['EP_CAMERA'] = new NJCamera();
		var NJKARTDetector = enchant.Class.create(NJObject, {
			initialize:function(){
				NJObject.call(this, "NJKARTDetector");
			},
			setOnDetection:function(str){
				this.runCommand("setOnDetection", "\"" + str + "\"");
			}
		});
		'start stop'.split(' ').forEach(function(func){
			func = func + 'Detection';
			NJKARTDetector.prototype[func] = function(){
				this.runCommand(func);
			}
		});
		window['EP_AR'] = new NJKARTDetector();
		var NJSoundElement = enchant.Class.create(NJObject, {
			initialize:function(src, id){
				NJObject.call(this, "NJSoundElement");
				this._id = id;
				this.runCommand("setSoundID", id);
				this._src = src;
				this.runCommand("setSoundURL", "\"" + src + "\"");
			},
			getCurrentTime:function(){
				return 0;
			},
			clone:function(){
				return EP_SOUND.createSoundPlayer(this._src, this._id);
			}
		});
		'currentTime volume'.split(' ').forEach(function(prop){
			var setterName = 'set' + capitalize(prop);
			NJSoundElement.prototype[setterName] = function(value){
				this['_' + prop] = value;
				this.runCommand(setterName, value);
			};
			var getterName = 'get' + capitalize(prop);
			NJSoundElement.prototype[getterName] = function(){
				return this['_' + prop];
			};
		});
		'play pause preload'.split(' ').forEach(function(prop){
			NJSoundElement.prototype[prop] = function(){
				this.runCommand(prop);
			};
		});
		window['EP_SOUND'] = {
			createSoundPlayer:function(src, id){
				return new NJSoundElement(src, id);
			}
		};
		var sensors = {};
		'Accelerometer Orientation MagneticField Gyroscope'.split(' ').forEach(function(className){
			var tempClass = enchant.Class.create(NJObject, {
				initialize:function(){
					NJObject.call(this, "NJ" + className);
				},
				setCallback:function(str){
					this.runCommand("setCallback", "\"" + str + "\"");
				}
			});
			'enable disable'.split(' ').forEach(function(func){
				tempClass.prototype[func] = function(){
					this.runCommand(func);
				};
			});
			sensors[className] = {
				getSensorsList:function(){
					return {
						size:function(){
							return 1;
						},
						get:function(index){
							return new tempClass();
						}
					};
				}
			};
		});
		window['EP_SENSOR'] = {
			getSensor:function(name){
				return sensors[name];
			}
		};
	}
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
	     * 3Dオブジェクト表示機能を持ったクラス.
	     * <p>デフォルトではenchantPROのロゴのテクスチャが貼られた立方体がロードされる.</p>
	     * <p>{@link enchant.pro.Scene3D}のインスタンスに追加することで, 画面上に表示することができる.
	     * {@link enchant.pro.Sprite3D#vertices}, {@link enchant.pro.Sprite3D#indices},
	     * {@link enchant.pro.Sprite3D#normals}などを変更することで、任意の3Dオブジェクトを描画することもでき,
	     * テクスチャなども貼付けることができる.</p>
	     * <p>また、別3Dオブジェクトを子として追加することも可能で、子は全て親を基準とした座標系で描画される.</p>
	     * @example
	     *   //シーンの初期化
	     *   var scene = new Scene3D();
	     *   //3Dオブジェクトの初期化
	     *   var sprite = new Sprite3D();
	     *   //3Dオブジェクトをシーンに追加
	     *   scene.addChild(sprite);
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
            
            this.vertices = [
            	 0.5,  0.5,  0.5,
            	-0.5,  0.5,  0.5,
            	-0.5,  0.5, -0.5,
            	 0.5,  0.5, -0.5,
            	 0.5, -0.5,  0.5,
            	-0.5, -0.5,  0.5,
            	-0.5, -0.5, -0.5,
            	 0.5, -0.5, -0.5
            ];
            this.colors = [
            	1.0, 1.0, 1.0, 1.0,
            	1.0, 1.0, 1.0, 1.0,
            	1.0, 1.0, 1.0, 1.0,
            	1.0, 1.0, 1.0, 1.0,
            	1.0, 1.0, 1.0, 1.0,
            	1.0, 1.0, 1.0, 1.0,
            	1.0, 1.0, 1.0, 1.0,
            	1.0, 1.0, 1.0, 1.0
            ];
            this.normals = this.vertices;
            this.texCoords = [
            	1.0, 1.0,
            	0.0, 1.0,
            	0.0, 0.0,
            	1.0, 0.0,
            	0.0, 0.0,
            	1.0, 0.0,
            	1.0, 1.0,
            	0.0, 1.0,
            ];
            this.indices = [
            	0, 1, 2,
            	2, 3, 0,
            	4, 7, 6,
            	6, 5, 4,
            	0, 3, 7,
            	7, 4, 0,
            	1, 0, 4,
            	4, 5, 1,
            	2, 1, 5,
            	5, 6, 2,
            	3, 2, 6,
            	6, 7, 3
            ];
            /**
             * 子3Dオブジェクト要素の配列.
             * この要素に子として追加されている3Dオブジェクトの一覧を取得できる.
             * 子を追加したり削除したりする場合には、この配列を直接操作せずに,
             * {@link enchant.pro.Sprite3D#addChild}や{@link enchant.pro.Sprite3D#removeChild}を利用する.
             * @type enchant.pro.Sprite3D[]
             * @see enchant.pro.Sprite3D#addChild
             * @see enchant.pro.Sprite3D#removeChild
             */
            this.childNodes = [];
            /**
             * この3Dオブジェクトが現在追加されているシーンオブジェクト.
             * どのシーンにも追加されていないときにはnull.
             * @type enchant.pro.Scene3D
             * @see enchant.pro.Scene3D#addChild
             */
            this.scene = null;

            /**
             * 3Dオブジェクトの親要素.
             * 親が存在しない場合にはnull.
             * @type enchant.pro.Sprite3D|enchant.pro.Scene3D
             */
            this.parentNode = null;

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
                enchant.Game.instance.addEventListener('exitframe', render);
            });
            this.addEventListener('removedfromscene', function() {
                enchant.Game.instance.removeEventListener('exitframe', render);
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
                if (this._changedRotation) {
                	var c1 = Math.cos(this._rotationX);
                	var s1 = Math.sin(this._rotationX);
                	var c2 = Math.cos(this._rotationY);
                	var s2 = Math.sin(this._rotationY);
                	var c3 = Math.cos(this._rotationZ);
                	var s3 = Math.sin(this._rotationZ);
                	this.rotation = [
                		c2*c3,				-c2*s3, 			s2, 	0,
                		s1*c2*c3+c1*s3,		-s1*s2*s3+c1*c3,	-s1*c2, 0,
                		-c1*s2*c3+s1*s3,	c1*s2*s3+s1*c3,		c1*c2,	0,
                		0,					0,					0,		1
                	];
                	this._changedRotation = false;
                }
            });
        },
	    /**
	     * 子3Dオブジェクトを追加する.
	     * 追加が完了すると、子3Dオブジェクトに対してaddedイベントが発生する.
	     * 親が既にシーンに追加されていた場合には、そのシーンに追加され,
	     * addedtosceneイベントが発生する.
	     * @param {enchant.pro.Sprite3D} sprite 追加する子3Dオブジェクト.
	     * @example
	     *   var parent = new Sprite3D();
	     *   var child = new Sprite3D();
	     *   //3Dオブジェクトを別の3Dオブジェクトに子として追加
	     *   parent.addChild(child);
	     * @see enchant.pro.Sprite3D#removeChild
	     * @see enchant.pro.Sprite3D#childNodes
	     * @see enchant.pro.Sprite3D#parentNode
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
	     * 指定された子3Dオブジェクトを削除する.
	     * 削除が完了すると、子3Dオブジェクトに対してremovedイベントが発生する.
	     * シーンに追加されていた場合には, そのシーンからも削除され,
	     * removedfromsceneイベントが発生する.
	     * @param {enchant.pro.Sprite3D} sprite 削除する子3Dオブジェクト.
	     * @example
	     *   var scene = new Scene3D();
	     *   //sceneの一番目の子を削除
	     *   scene.removeChild(scene.childNodes[0]);
	     * @see enchant.pro.Sprite3D#addChild
	     * @see enchant.pro.Sprite3D#childNodes
	     * @see enchant.pro.Sprite3D#parentNode
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
         * 3Dオブジェクトを平行移動する.
         * 現在表示されている位置から, 各軸に対して指定された分だけ平行移動をする.
         * @param {Number} x x軸方向の平行移動量
         * @param {Number} y y軸方向の平行移動量
         * @param {Number} z z軸方向の平行移動量
         * @example
         *   var sprite = new Sprite3D();
         *   //x軸方向に10, y軸方向に3, z軸方向に-20平行移動
         *   sprite.translate(10, 3, -20);
         * @see enchant.pro.Sprite3D#x
         * @see enchant.pro.Sprite3D#y
         * @see enchant.pro.Sprite3D#z
         * @see enchant.pro.Sprite3D#scale
         */
        translate: function(x, y, z) {
            this._x += x;
            this._y += y;
            this._z += z;
            this._changedTranslation = true;
        },
        /**
         * 3Dオブジェクトを拡大縮小する.
         * 現在の拡大率から, 各軸に対して指定された倍率分だけ拡大縮小をする.
         * @param {Number} x x軸方向の拡大率
         * @param {Number} y y軸方向の拡大率
         * @param {Number} z z軸方向の拡大率
         * @example
         *   var sprite = new Sprite3D();
         *   //x軸方向に2.0倍, y軸方向に3.0倍, z軸方向に0.5倍に拡大する
         *   sprite.scale(2,0, 3.0, 0.5);
         * @see enchant.pro.Sprite3D#scaleX
         * @see enchant.pro.Sprite3D#scaleY
         * @see enchant.pro.Sprite3D#scaleZ
         * @see enchant.pro.Sprite3D#translate
         */
        scale: function(x, y, z) {
            this._scaleX *= x;
            this._scaleY *= y;
            this._scaleZ *= z;
            this._changedScale = true;
        },
        /**
         * 3Dオブジェクトの回転行列.
         * 配列は長さ16の一次元配列であり, 行優先の4x4行列として解釈される.
         * @example
         *   var sprite = new Sprite3D();
         *   //x軸周りに45度回転
         *   var rotX = Math.PI() / 4;
         *   sprite.rotation = [
		 *       1, 0, 0, 0,
		 *       0, Math.cos(rotX), -Math.sin(rotX), 0,
		 *       0, Math.sin(rotX), Math.cos(rotX), 0,
		 *       0, 0, 0, 1
		 *   ];
         * @type Number[]
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
         * 3Dオブジェクトに適用する変換行列.
         * @deprecated
         * @type Number[]
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
         * 3Dオブジェクトに貼付けられるテクスチャオブジェクト.
         * テクスチャのマッピングは{@link enchant.pro.Sprite3D#texCoords}にて設定可能である.
         * @type enchant.pro.Surface3D
         * @example
         *   var sprite = new Sprite3D();
         *   var surface = new Surface3D();
         *   surface.url = "texture.png";
         *   sprite.surface = surface;
         * @see enchant.pro.Sprite3D#texCoords
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
         * 3Dオブジェクトの名前
         * @type String
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
    });

    /**
     * 3Dオブジェクトのx座標.
     * @default 0
     * @type Number
     * @see enchant.pro.Sprite3D#translate
     */
    enchant.pro.Sprite3D.prototype.x = 0;
    
    /**
     * 3Dオブジェクトのy座標.
     * @default 0
     * @type Number
     * @see enchant.pro.Sprite3D#translate
     */
    enchant.pro.Sprite3D.prototype.y = 0;
    
    /**
     * 3Dオブジェクトのz座標.
     * @default 0
     * @type Number
     * @see enchant.pro.Sprite3D#translate
     */
    enchant.pro.Sprite3D.prototype.z = 0;
    
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
    });

    /**
     * 3Dオブジェクトのx軸方向に対する拡大率
     * @default 1.0
     * @type Number
     * @see enchant.pro.Sprite3D#scale
     */
    enchant.pro.Sprite3D.prototype.scaleX = 1;

    /**
     * 3Dオブジェクトのy軸方向に対する拡大率
     * @default 1.0
     * @type Number
     * @see enchant.pro.Sprite3D#scale
     */
    enchant.pro.Sprite3D.prototype.scaleY = 1;
    /**
     * 3Dオブジェクトのz軸方向に対する拡大率
     * @default 1.0
     * @type Number
     * @see enchant.pro.Sprite3D#scale
     */
    enchant.pro.Sprite3D.prototype.scaleZ = 1;
    
    'rotationX rotationY rotationZ'.split(' ').forEach(function(prop) {
        Object.defineProperty(enchant.pro.Sprite3D.prototype, prop, {
            get: function() {
                return this['_' + prop];
            },
            set: function(scale) {
                this['_' + prop] = scale;
                this._changedRotation = true;
            }
        });
    });

    /**
     * 3Dオブジェクトのx軸に関する回転量
     * @default 1.0
     * @type Number
     * @see enchant.pro.Sprite3D#scale
     */
    enchant.pro.Sprite3D.prototype.rotationX = 0;

    /**
     * 3Dオブジェクトのy軸に関する回転量
     * @default 1.0
     * @type Number
     * @see enchant.pro.Sprite3D#scale
     */
    enchant.pro.Sprite3D.prototype.rotationY = 0;
    /**
     * 3Dオブジェクトのz軸に関する回転量
     * @default 1.0
     * @type Number
     * @see enchant.pro.Sprite3D#scale
     */
    enchant.pro.Sprite3D.prototype.rotationZ = 0;
        
    'vertices indices normals texCoords colors'.split(' ').forEach(function(prop) {
        Object.defineProperty(enchant.pro.Sprite3D.prototype, prop, {
            get: function() {
                return this['_' + prop];
            },
            set: function(ary) {
                this['_' + prop] = ary;
                if(this._mesh) this._mesh['set' + capitalize(prop) + 'JSON'](JSON.stringify(this['_' + prop]));
            }
        });
    });
    /**
     * 3Dオブジェクトの頂点配列.
     * 3つの要素を一組として頂点を指定する. 全体の要素数は, 頂点の個数nに対して3nとなる.
     * 3n, 3n+1, 3n+2番目の要素はそれぞれ, n番目の頂点のx, y, z座標である.
     * @example
     *   var sprite = new Sprite3D();
     *   //頂点配列を代入
     *   //データはx, y, z, x, y, z...の順に格納する
     *   sprite.vertices = [
     *       0.0, 0.0, 0.0,  //0番目の頂点(0.0, 0.0, 0.0)
     *       1.0, 0.0, 0.0,  //1番目の頂点(1.0, 0.0, 0.0)
     *       1.0, 1.0, 0.0,  //2番目の頂点(1.0, 1.0, 0.0)
     *       0.0, 1.0, 0.0   //3番目の頂点(0.0, 1.0, 0.0)
     *   ];
     * @type Number[]
     * @see enchant.pro.Sprite3D#indices
     * @see enchant.pro.Sprite3D#normals
     * @see enchant.pro.Sprite3D#texCoords
     */
    enchant.pro.Sprite3D.prototype.vertices = enchant.pro.Sprite3D.prototype.vertices;
    /**
     * 3Dオブジェクトの頂点インデックス配列.
     * 3つの要素を一組として三角形を指定する.全体の要素数は, 三角形の個数nに対して3nとなる.
     * インデックスの値は、{@link enchant.pro.Sprite3D#vertices}で指定した頂点の番号である.
     * @example
     *   var sprite = new Sprite3D();
     *   //頂点配列を代入
     *   //データはx, y, z, x, y, z...の順に格納する
     *   sprite.vertices = [
     *       0.0, 0.0, 0.0,  //0番目の頂点(0.0, 0.0, 0.0)
     *       1.0, 0.0, 0.0,  //1番目の頂点(1.0, 0.0, 0.0)
     *       1.0, 1.0, 0.0,  //2番目の頂点(1.0, 1.0, 0.0)
     *       0.0, 1.0, 0.0   //3番目の頂点(0.0, 1.0, 0.0)
     *   ];
     *
     *   //頂点インデックスを代入
     *   //3要素一組として、三角形を描画する
     *   //この例では(0,0,0), (1,0,0), (1,1,0)の三角形と
     *   //(1,1,0), (0,1,0), (0,0,0)の三角形の計二つを描画する
     *   sprite.indices = [
     *       0, 1, 2,
     *       2, 3, 0
     *   ];
     *   var scene = new Scene3D();
     *   scene.addChild(sprite);
     * @type Integer[]
     * @see enchant.pro.Sprite3D#vertices
     * @see enchant.pro.Sprite3D#normals
     * @see enchant.pro.Sprite3D#texCoords
     */
    enchant.pro.Sprite3D.prototype.indices = enchant.pro.Sprite3D.prototype.indices;
    /**
     * 3Dオブジェクトの頂点法線ベクトル配列.
     * 3つの要素を一組として法線ベクトルを指定する. 全体の要素数は, 法線ベクトルの個数nに対して3nとなる.
     * 3n, 3n+1, 3n+2番目の要素はそれぞれ, n番目の頂点の法線ベクトルのx, y, z成分である.
     * 法線ベクトルはライティングの影の計算に利用される.
     * @example
     *   var sprite = new Sprite3D();
     *   //頂点配列を代入
     *   //データはx, y, z, x, y, z...の順に格納する
     *   sprite.vertices = [
     *       0.0, 0.0, 0.0,  //0番目の頂点(0.0, 0.0, 0.0)
     *       1.0, 0.0, 0.0,  //1番目の頂点(1.0, 0.0, 0.0)
     *       1.0, 1.0, 0.0,  //2番目の頂点(1.0, 1.0, 0.0)
     *       0.0, 1.0, 0.0   //3番目の頂点(0.0, 1.0, 0.0)
     *   ];
     *
     *   //法線ベクトル配列を代入
     *   //データはx, y, z, x, y, z...の順に格納する
     *   sprite.normals = [
     *       0.0, 0.0, 0.0,  //0番目の頂点の法線ベクトル(0.0, 0.0, 0.0)
     *       1.0, 0.0, 0.0,  //1番目の頂点の法線ベクトル(1.0, 0.0, 0.0)
     *       1.0, 1.0, 0.0,  //2番目の頂点の法線ベクトル(1.0, 1.0, 0.0)
     *       0.0, 1.0, 0.0   //3番目の頂点の法線ベクトル(0.0, 1.0, 0.0)
     *   ];
     * @type Number[]
     * @see enchant.pro.Sprite3D#vertices
     * @see enchant.pro.Sprite3D#indices
     * @see enchant.pro.Sprite3D#texCoords
     */
    enchant.pro.Sprite3D.prototype.normals = enchant.pro.Sprite3D.prototype.normals;
    
    /**
     * 3Dオブジェクトのテクスチャマッピング配列.
     * 2つの要素を一組としてuv座標を指定する. 全体の要素数は, 頂点の個数nに対して2nとなる.
     * 2n, 2n+1番目の要素はそれぞれ, n番目の頂点のテクスチャのu, v座標である.
     * それぞれの座標のとりうる値は0<=u,v<=1である.
     * @example
     *   var sprite = new Sprite3D();
     *   var surface = new Surface3D();
     *   surface.url = "texture.png";
     *   sprite.surface = surface;
     *
     *   //頂点配列を代入
     *   //データはx, y, z, x, y, z...の順に格納する
     *   sprite.vertices = [
     *       0.0, 0.0, 0.0,  //0番目の頂点(0.0, 0.0, 0.0)
     *       1.0, 0.0, 0.0,  //1番目の頂点(1.0, 0.0, 0.0)
     *       1.0, 1.0, 0.0,  //2番目の頂点(1.0, 1.0, 0.0)
     *       0.0, 1.0, 0.0   //3番目の頂点(0.0, 1.0, 0.0)
     *   ];
     *
     *   //uv座標配列を代入
     *   //データはu, v, u, v...の順に格納する
     *   sprite.texCoords = [
     *       0.0, 0.0,  //0番目の頂点のuv座標(0.0, 0.0)
     *       1.0, 0.0,  //1番目の頂点のuv座標(1.0, 0.0)
     *       1.0, 1.0,  //2番目の頂点のuv座標(1.0, 1.0)
     *       0.0, 1.0   //3番目の頂点のuv座標(0.0, 1.0)
     *   ];
     * @type Number[]
     * @see enchant.pro.Sprite3D#vertices
     * @see enchant.pro.Sprite3D#indices
     * @see enchant.pro.Sprite3D#normals
     * @see enchant.pro.Sprite3D#surface
     */
    enchant.pro.Sprite3D.prototype.texCoords = enchant.pro.Sprite3D.prototype.texCoords;

    /**
     * @scope enchant.pro.Scene3D.prototype
     */
    enchant.pro.Scene3D = enchant.Class.create(enchant.EventTarget, {
	    /**
	     * 表示3Dオブジェクトツリーのルートになるクラス.
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
            /**
             * 子要素の配列.
             * このシーンに子として追加されている3Dオブジェクトの一覧を取得できる.
             * 子を追加したり削除したりする場合には、この配列を直接操作せずに,
             * {@link enchant.pro.Scene3D#addChild}や{@link enchant.pro.Scene3D#removeChild}を利用する.
             * @type enchant.pro.Sprite3D[]
             */
            this.childNodes = [];
            /**
             * 照明の配列.
             * このシーンに追加されている光源の一覧を取得する.
             * 照明を追加したり削除したりする場合には, この配列を直接操作せずに,
             * {@link enchant.pro.Scene3D#addLight}や{@link enchant.pro.Scene3D#removeLight}を利用する.
             * @type enchant.pro.Light3D[]
             */
            this.lights = [];
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
            	if(that._camera){
            		if(that._camera._changedPosition){
            			EP_GL.getCamera().setPositionJSON(
            				"[" + that._camera.x + "," + that._camera.y + "," + that._camera.z + "]");
            			that._camera._changedPosition = false;
            		}
            		if(that._camera._changedCenter){
	            		EP_GL.getCamera().setCenterJSON(
	            			"[" + that._camera.centerX + "," + that._camera.centerY + "," + that._camera.centerZ + "]");
   						that._camera._changedCenter = false;
            		}
            		if(that._camera._changedUpVector){
	            		EP_GL.getCamera().setUpVectorJSON(
	            			"[" + that._camera.upVectorX + "," + that._camera.upVectorY + "," + that._camera.upVectorZ + "]");
	            		that._camera._changedUpVector = false;
            		}
            	}
            	nodes = that.lights.slice();
            	while(nodes.length) {
            		var node = nodes.pop();
            		if(node._changedPosition){
            			EP_GL.getLight(node._id).setPositionJSON(
            				"[" + node.x + "," + node.y + "," + node.z + "]");
            			node._changedPosition = false;
            		}
            		if(node._changedDirection){
            			EP_GL.getLight(node._id).setSpotDirectionJSON(
            				"[" + node.directionX + "," + node.directionY + "," + node.directionZ + "]");
            			node._changedDirection = false;
            		}
            	}
            });
        },
        /**
         * シーンに3Dオブジェクトを追加する.
         * 引数に渡された3Dオブジェクトと、その子を全てシーンに追加する.
         * シーンに追加されると自動的に3Dオブジェクトは画面上に表示される.
         * 一度追加したオブジェクトを削除するには{@link enchant.pro.Scene3D#removeChild}を利用する.
         * @param {enchant.pro.Sprite3D} sprite 追加する3Dオブジェクト
         * @see enchant.pro.Scene3D#removeChild
         * @see enchant.pro.Scene3D#childNodes
         */
        addChild: function(sprite) {
        	this.childNodes.push(sprite);
            this._manager.add(sprite._mesh);
            sprite.parentNode = sprite.scene = this;
            sprite.dispatchEvent(new enchant.Event('added'));
            sprite.dispatchEvent(new enchant.Event('addedtoscene'));
        },
        /**
         * シーンから3Dオブジェクトを削除する.
         * シーンから指定された3Dオブジェクトを削除する.
         * 削除された3Dオブジェクトは画面上に表示されなくなる.
         * 3Dオブジェクトを追加するには{@link enchant.pro.Scene3D#addChild}を利用する.
         * @param {enchant.pro.Sprite3D} sprite 削除する3Dオブジェクト
         * @see enchant.pro.Scene3D#addChild
         * @see enchant.pro.Scene3D#childNodes
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
        },
        /**
         * シーンのカメラ位置をセットする.
         * @param {enchant.pro.Camera3D} camera セットするカメラ
         * @see enchant.pro.Camera3D
         */
        setCamera: function(camera) {
        	camera._changedPosition = true;
        	camera._changedCenter = true;
        	camera._changedUpVector = true;
        	this._camera = camera;
        },
        
        /**
         * シーンに照明を追加する
         * @param {enchant.pro.Light3D} light 追加する照明
         * @see enchant.pro.Light3D
         */
        addLight: function(light){
        	this.lights.push(light);
        	EP_GL.getLight(light._id).enable();
        },
        
        /**
         * シーンから照明を削除する
         * @param {enchant.pro.Light3D} light 削除する照明
         * @see enchant.pro.Light3D
         */
        removeLight: function(light){
            var i;
            if ((i = this.lights.indexOf(light)) != -1) {
                this.lights.splice(i, 1);
            }
            EP_GL.getLight(light._id).disable();
        }
    });

    /**
     * @scope enchant.pro.Surface3D.prototype
     */
    enchant.pro.Surface3D = enchant.Class.create({
    	/**
    	 * 3Dオブジェクトのテクスチャ情報を格納するクラス.
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
         * @type String
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
                if(this._material) this._material['set' + capitalize(prop) + 'JSON'](JSON.stringify(this['_' + prop]));
            }
        });
    });
    
    /**
     * 環境光のパラメータ
     * @type Number[]
     */
    enchant.pro.Surface3D.prototype.ambient = [0.2, 0.2, 0.2, 0.2];
    
    /**
     * 拡散光のパラメータ
     * @type Number[]
     */
    enchant.pro.Surface3D.prototype.diffuse = [0.2, 0.2, 0.2, 0.2];
    
    /**
     * 光の反射量
     * @type Number[]
     */
    enchant.pro.Surface3D.prototype.specular = [0.4, 0.4, 0.4, 0.4];
    
    /**
     * 光の発光量
     * @type Number[]
     */
    enchant.pro.Surface3D.prototype.emission = [0.01, 0.01, 0.01, 0.01];
    
    /**
     * 鏡面計数
     * @type Number[]
     */
    enchant.pro.Surface3D.prototype.shininess = [0.2, 0.2, 0.2, 0.2];
    
    /**
     * @scope enchant.pro.Camera3D.prototype
     */
     enchant.pro.Camera3D = enchant.Class.create({
    	/**
    	 * 3Dシーンのカメラを設定するクラス
    	 * @example
    	 * var scene = new Scene3D();
    	 * var camera = new Camera3D();
    	 * camera.x = 0;
    	 * camera.y = 0;
    	 * camera.z = 10;
    	 * scene.setCamera(camera);
	     * @constructs
    	 */
    	initialize: function(){
    		this._changedPosition = false;
    		this._changedCenter = false;
    		this._changedUpVector = false;
    	}
    });
    
    'x y z'.split(' ').forEach(function(prop) {
        Object.defineProperty(enchant.pro.Camera3D.prototype, prop, {
            get: function() {
                return this['_' + prop];
            },
            set: function(n) {
                this['_' + prop] = n;
                this._changedPosition = true;
            }
        });
    });
    
    /**
     * カメラのx座標
     * @type Number
     */
    enchant.pro.Camera3D.prototype.x = 0;
    
    /**
     * カメラのy座標
     * @type Number
     */
    enchant.pro.Camera3D.prototype.y = 0;
    
    /**
     * カメラのz座標
     * @type Number
     */
    enchant.pro.Camera3D.prototype.z = 0;
    
    'centerX centerY centerZ'.split(' ').forEach(function(prop) {
        Object.defineProperty(enchant.pro.Camera3D.prototype, prop, {
            get: function() {
                return this['_' + prop];
            },
            set: function(n) {
                this['_' + prop] = n;
                this._changedCenter = true;
            }
        });
    });
    
    /**
     * カメラの視点のx座標
     * @type Number
     */
    enchant.pro.Camera3D.prototype.centerX = 0;
    
    /**
     * カメラの視点のy座標
     * @type Number
     */
    enchant.pro.Camera3D.prototype.centerY = 0;
    
    /**
     * カメラの視点のz座標
     * @type Number
     */
    enchant.pro.Camera3D.prototype.centerZ = 0;
    
    'upVectorX upVectorY upVectorZ'.split(' ').forEach(function(prop) {
        Object.defineProperty(enchant.pro.Camera3D.prototype, prop, {
            get: function() {
                return this['_' + prop];
            },
            set: function(n) {
                this['_' + prop] = n;
                this._changedUpVector = true;
            }
        });
    });
    
    /**
     * カメラの上方向ベクトルのx成分
     * @type Number
     */
    enchant.pro.Camera3D.prototype.upVectorX = 0;
    
    /**
     * カメラの上方向ベクトルのy成分
     * @type Number
     */
    enchant.pro.Camera3D.prototype.upVectorY = 1;
    
    /**
     * カメラの上方向ベクトルのz成分
     * @type Number
     */
    enchant.pro.Camera3D.prototype.upVectorZ = 0;
    
    /**
     * @scope enchant.pro.Light3D.prototype
     */
    enchant.pro.Light3D = enchant.Class.create(enchant.EventTarget, {
	    /**
	     * 3Dシーンでの光源を設定するクラス.
	     *
	     * @example
	     *   var scene = new Scene3D();
	     *   var light = new Light3D(1);
	     *   light.x = 0;
	     *   light.y = 0;
	     *   light.z = 100;
	     *   scene.addLight(light);
	     *
	     * @constructs
	     * @param id 光源ID 0からmaxLightID()より小さな値まで利用可能。ID0はデフォルトでシーンに追加されている。
	     * @extends enchant.EventTarget
	     */
	     initialize: function(id){
    		if(id >= EP_GL.getLightCount()) throw new Error('id must be less than ' + EP_GL.getLightCount());
    		this._id = id;
    	}
    });
    
    /**
     * Light3DのIDの最大インデックスを返す
     * @static
     * @returns {Number}
     */
    enchant.pro.Light3D.maxLightID = function(){
    	return EP_GL.getLightCount();
    };
    
    'x y z'.split(' ').forEach(function(prop) {
        Object.defineProperty(enchant.pro.Light3D.prototype, prop, {
            get: function() {
                return this['_' + prop];
            },
            set: function(n) {
                this['_' + prop] = n;
                this._changedPosition = true;
            }
        });
        enchant.pro.Light3D.prototype[prop] = 0;
    });
    
    /**
     * 光源のx座標
     * @type Number
     */
    enchant.pro.Light3D.prototype.x = 0;
    
    /**
     * 光源のy座標
     * @type Number
     */
    enchant.pro.Light3D.prototype.y = 0;
    
    /**
     * 光源のz座標
     * @type Number
     */
    enchant.pro.Light3D.prototype.z = 0;
    
    /**
     * Light3Dの照射方向
     * @type {Number}
     */
    'directionX directionY directionZ'.split(' ').forEach(function(prop) {
        Object.defineProperty(enchant.pro.Light3D.prototype, prop, {
            get: function() {
                return this['_' + prop];
            },
            set: function(n) {
                this['_' + prop] = n;
                this._changedDirection = true;
            }
        });
        enchant.pro.Light3D.prototype[prop] = 0;
    });
    
    /**
     * 光源の照射方向のx成分
     * @type Number
     */
    enchant.pro.Light3D.prototype.directionX = 0;
    
    /**
     * 光源の照射方向のy成分
     * @type Number
     */
    enchant.pro.Light3D.prototype.directionY = 0;
    
    /**
     * 光源の照射方向のz成分
     * @type Number
     */
    enchant.pro.Light3D.prototype.directionZ = 0;
                    
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
            console.log('detect!' + e.data);
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