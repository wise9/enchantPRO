
if (enchant.pro != undefined) {
    (function(){
		/**
		 * ColladaデータからSprite3Dを作成する
		 * @example
		 *   var scene = new Scene3D();
		 *   Sprite3D.loadCollada("hoge.dae",　function(model){
		 *       scene.addChild(model);
		 *   });
		 * @param {String} url コラーダモデルのURL
		 * @param {function(enchant.pro.Sprite3D)} onload ロード完了時のコールバック 引数にはモデルから生成されたSprite3Dが渡される
		 * @static
		 */
        enchant.pro.Sprite3D.loadCollada = function(url, onload){
            var _this = this;
            this.url = url;
            if (typeof onload != "function") {
                throw new Error('Argument must be function');
                return null;
            }
            else {
                _this.onload = onload;
            }
            var collada = new Collada();
            collada.onload = function(model){
                var root = new Sprite3D();
                root.vertices = 0;
                for (var i = 0; i < model.geometries.length; i++) {
                    var geometry = model.geometries[i];
                    for (var j = 0; j < model.geometries[i].meshes.length; j++) {
                        var mesh = model.geometries[i].meshes[j];
                        var ep_mesh = new Sprite3D();
                        var surface = new Surface3D();
                        var material = mesh.material;

                        surface.src = material.src;
                        
                        //This was the reason of black texture problem
                        //surface.ambient = material.ambient;
                        //surface.diffuse = material.diffuse;
                        //                        surface.specular = material.specular;
                        //                        surface.emission = material.emission;
                        //                        surface.shininess = material.shininess;
                        ep_mesh.surface = surface;
                        
                        ep_mesh.vertices = mesh.vertices;
                        if(mesh.normals && mesh.normals.length > 0){
                        	ep_mesh.normals = mesh.normals;
                        }else{
                        	ep_mesh.normals = mesh.vertices;
                        }
                        //ep_mesh.normals = mesh.normals;
                        if(mesh.uv && mesh.uv.length > 0){
	                        ep_mesh.texCoords = mesh.uv;
                        }
                        ep_mesh.indices = mesh.indices;
                        if(geometry){
                        	if(geometry.translation){
		                        ep_mesh.x = geometry.translation[0];
		                        ep_mesh.y = geometry.translation[1];
		                        ep_mesh.z = geometry.translation[2];
                        	}
	                        ep_mesh.rotation = geometry.rotation;
	                        if(geometry.scale){
		                        ep_mesh.scaleX = geometry.scale[0];
		                        ep_mesh.scaleY = geometry.scale[1];
		                        ep_mesh.scaleZ = geometry.scale[2];
	                        }
	                        ep_mesh.name = geometry.id;
                        }
                        root.addChild(ep_mesh);
                    }
                }
                _this.onload(root);
            };
            collada.loadModel(url);
        }
        
        /**
         * ColladafNX
         */
        function Collada(){
            var _this = this;
            this.debug = true;
            this.materials = new Array();
            this.geometries = new Array();
            this.effects = new Array();
            this.images = new Array();
            
            function getParentDirectory(path){
                var strary = path.split("/");
                var result = "";
                for (var i = 0; i < strary.length - 1; i++) {
                    result += strary[i] + "/";
                }
                return result;
            }
            
            function parseFloatArray(str){
                var array = new Array();
                var floatStrings = str.split(" ");
                for (var k = 0; k < floatStrings.length; k++) {
                    array.push(parseFloat(floatStrings[k]));
                }
                return array;
            }
            function parseIntArray(str){
                var array = new Array();
                var intStrings = str.split(" ");
                for (var k = 0; k < intStrings.length; k++) {
                    array.push(parseInt(intStrings[k]));
                }
                return array;
            }
            
            this.loadModel = function(url){
                var req = new XMLHttpRequest();
                req.open("GET", url, true);
                req.onload = function(){
                    var xml = req.responseXML;
                    loadImage(xml, url);
                    loadMaterials(xml);
                    loadEffects(xml);
                    loadGeometries(xml);
                    loadVisualScenes(xml);
                    var model = _this.convert();
                    _this.onload(model);
                }
                req.send(null); // Sending Request
            }
            
            function loadGeometries(xml){
                var geometries = xml.getElementsByTagName("library_geometries")[0].getElementsByTagName("geometry");
                for (var i = 0; i < geometries.length; i++) {
                    _this.geometries.push(new Geometry(geometries[i]));
                }
            }
            function Geometry(xml){
                var _this = this;
                this.id = xml.getAttribute("id");
                this.meshes = new Array();
                var meshes = xml.getElementsByTagName("mesh");
                for (var i = 0; i < meshes.length; i++) {
                    var mesh = meshes[i];
                    this.meshes.push(new Mesh(mesh));
                }
                function Mesh(xml){
                    var _this = this;
                    
                    var triangles = xml.getElementsByTagName("triangles")[0];
                    this.triangles = new Triangles(triangles);
                    var vertices = xml.getElementsByTagName("vertices")[0];
                    this.verticesInfo = new Vertices(vertices);
                    
                    var sources = xml.getElementsByTagName("source");
                    for (var i = 0; i < sources.length; i++) {
                        var source = sources[i];
                        var id = source.getAttribute("id");
                        if (id == this.verticesInfo.positionId) {
                            this.vertices = parseFloatArray(source.getElementsByTagName("float_array")[0].firstChild.nodeValue);
                        }
                        else if (id == this.triangles.normalId) {
                            this.normals = parseFloatArray(source.getElementsByTagName("float_array")[0].firstChild.nodeValue);
                        }else if (id == this.triangles.uvId) {
                            this.uv = parseFloatArray(source.getElementsByTagName("float_array")[0].firstChild.nodeValue);
                        }
                    }
                    
                    function Triangles(xml){
                        
                        var _this = this;
                        this.count = xml.getAttribute("count");
                        this.material = xml.getAttribute("material");
                        
                        var inputs = xml.getElementsByTagName("input");
                        this.stride = inputs.length;
                        
                        this.vertexOffset = -1;
                        this.normalOffset = -1;
                        this.uvOffset = -1;
                        for (var i = 0; i < inputs.length; i++) {
                            var input = inputs[i];
                            var semantic = input.getAttribute("semantic");
                            if (semantic == "VERTEX") {
                                var vo = parseFloat(input.getAttribute("offset"));
                                if (vo || vo == 0) {
                                    _this.vertexOffset = vo;
                                }
                                _this.vertexId = input.getAttribute("source").replace("#", "");
                            }else if (semantic == "NORMAL") {
                                var no = parseFloat(input.getAttribute("offset"));
                                if (no || no == 0) {
                                    _this.normalOffset = no;
                                }
                                _this.normalId = input.getAttribute("source").replace("#", "");
                            }else if (semantic == "TEXCOORD") {
                                var uo = parseFloat(input.getAttribute("offset"));
                                if (uo || uo == 0) {
                                    _this.uvOffset = uo;
                                }
                                _this.uvId = input.getAttribute("source").replace("#", "");
                            }
                        }
                        this.primitive = parseFloatArray(xml.getElementsByTagName("p")[0].firstChild.nodeValue);
                        
                    }
                    function Vertices(xml){
                        var _this = this;
                        var inputs = xml.getElementsByTagName("input");
                        for (var i = 0; i < inputs.length; i++) {
                            var input = inputs[i];
                            var semantic = input.getAttribute("semantic");
                            if (semantic == "POSITION") {
                                this.positionId = input.getAttribute("source").replace("#", "");
                            }else if (semantic == "NORMAL") {
                                this.normalId = input.getAttribute("source").replace("#", "");
                            }
                        }
                    }
                }
            }
            
            function loadImage(xml, url){
                var lib_images = xml.getElementsByTagName("library_images")[0];
                var imgs = lib_images.getElementsByTagName("image");
                for (var i = 0; i < imgs.length; i++) {
                    _this.images.push(new Image(imgs[i], url));
                }
            }
            
            function Image(xml, url){
                this.id = xml.getAttribute("id");
                this.name = xml.getAttribute("name");
                var init_from = xml.getElementsByTagName("init_from")[0];
                if (init_from) {
                    this.initFrom = init_from.firstChild.nodeValue;
                    if (this.initFrom.substr(0, 4) != "http") {
                        if (this.initFrom.substr(0, 2) == "./") {
                            this.initFrom = this.initFrom.substr(2, this.initFrom.length - 2);
                        }
                        this.initFrom = getParentDirectory(url) + this.initFrom;
                    }
                }
            }
            
            function loadEffects(xml){
                var effects = xml.getElementsByTagName("effect");
                for (var i = 0; i < effects.length; i++) {
                    _this.effects.push(new Effect(effects[i]));
                }
                
            }
            
            function Effect(xml){
                var _this = this;
                this.id = xml.getAttribute("id");
                var profile_common = xml.getElementsByTagName("profile_COMMON")[0];
                this.profileCommon = new ProfileCommon(profile_common);
                function ProfileCommon(xml){
                    var _this = this;
                    this.technique;
                    this.surface;
                    
                    var technique = xml.getElementsByTagName("technique")[0];
                    if (technique) {
                        this.technique = new Technique(technique);
                    }
                    
                    var newParams = xml.getElementsByTagName("newparam");
                    for (var i = 0; i < newParams.length; i++) {
                        var surface = newParams[i].getElementsByTagName("surface")[0];
                        if (surface) {
                            this.surface = new Surface(surface);
                        }
                    }
                    function Surface(xml){
                        var _this = this;
                        
                        this.type = xml.getAttribute("type");
                        var initFrom = xml.getElementsByTagName("init_from")[0];
                        if (initFrom) {
                            this.initFrom = initFrom.firstChild.nodeValue;
                        }
                        var format = xml.getElementsByTagName("format")[0];
                        if (format) {
                            this.format = format.firstChild.nodeValue;
                        }
                    }
                    
                    function Technique(xml){
                        var _this = this;
                        
                        var phong = xml.getElementsByTagName("phong")[0];
                        if (phong) {
                            this.phong = new Phong(phong);
                        }
                        function Phong(xml){
                            var _this = this;
                            this.emission = [0, 0, 0, 0];
                            this.ambient = [0, 0, 0, 0];
                            this.diffuse = [0, 0, 0, 0];
                            this.specular = [0, 0, 0, 0];
                            this.shininess = 0;
                            this.reflective = [0, 0, 0, 0];
                            this.reflectivity = 0;
                            this.transparent = [0, 0, 0, 0];
                            this.transparency = 0;
                            var temp = xml.getElementsByTagName("emission")[0].getElementsByTagName("color")[0].firstChild.nodeValue;
                            if (temp) {
                                this.emission = parseFloatArray(temp);
                            }
                            temp = 0;
                            
                            temp = xml.getElementsByTagName("ambient")[0].getElementsByTagName("color")[0].firstChild.nodeValue;
                            if (temp) {
                                this.ambient = parseFloatArray(temp);
                            }
                            temp = 0;
                            
                            temp = xml.getElementsByTagName("diffuse")[0].getElementsByTagName("color")[0];
                            if (temp) {
                                temp = temp.firstChild.nodeValue;
                            }
                            if (temp) {
                                this.diffuse = parseFloatArray(temp);
                            }
                            temp = 0;
                            
                            temp = xml.getElementsByTagName("specular")[0].getElementsByTagName("color")[0].firstChild.nodeValue;
                            if (temp) {
                                this.specular = parseFloatArray(temp);
                            }
                            temp = 0;
                            
                            temp = xml.getElementsByTagName("shininess")[0].getElementsByTagName("float")[0].firstChild.nodeValue;
                            if (temp) {
                                this.shininess = parseFloat(temp);
                            }
                            temp = 0;
                            
                            temp = xml.getElementsByTagName("reflective")[0].getElementsByTagName("color")[0].firstChild.nodeValue;
                            if (temp) {
                                this.reflective = parseFloatArray(temp);
                            }
                            temp = 0;
                            
                            temp = xml.getElementsByTagName("reflectivity")[0].getElementsByTagName("float")[0].firstChild.nodeValue;
                            if (temp) {
                                this.reflectivity = parseFloat(temp);
                            }
                            temp = 0;
                            
                            temp = xml.getElementsByTagName("transparent")[0].getElementsByTagName("color")[0].firstChild.nodeValue;
                            if (temp) {
                                this.transparent = parseFloatArray(temp);
                            }
                            temp = 0;
                            
                            temp = xml.getElementsByTagName("transparency")[0].getElementsByTagName("float")[0].firstChild.nodeValue;
                            if (temp) {
                                this.transparency = parseFloat(temp);
                            }
                            temp = 0;
                        }
                    }
                }
            }
            
            function loadMaterials(xml){
                var materials = xml.getElementsByTagName("library_materials")[0].getElementsByTagName("material");
                for (var i = 0; i < materials.length; i++) {
                    _this.materials.push(new Material(materials[i]));
                }
            }
            
            function Material(xmlMaterial){
                var _this = this;
                var instance_effects_xml = xmlMaterial.getElementsByTagName("instance_effect");
                this.id = xmlMaterial.getAttribute("id");
                this.name = xmlMaterial.getAttribute("name");
                this.instanceEffect = new InstanceEffect(instance_effects_xml[0]);
                this.emission = [0, 0, 0, 0];
                this.ambient = [0, 0, 0, 0];
                this.diffuse = [0, 0, 0, 0];
                this.specular = [0, 0, 0, 0];
                this.shininess = [0, 0, 0, 0];
                
                var setParams = xmlMaterial.getElementsByTagName("setparam");
                for (var i = 0; i < setParams.length; i++) {
                    var param = setParams[i];
                    var ref = param.getAttribute("ref");
                    var val = param.firstChild.nodevalue;
                    if (ref == "DIFFUSE") {
                        _this.diffuse = parseFloatArray(val);
                    }else if (ref == "AMBIENT") {
                    	_this.ambient = parseFloatArray(val);
                    }else if (ref == "EMISSION") {
	                	_this.emission = parseFloatArray(val);
                    }else if (ref == "SPECULAR") {
                    	_this.specular = parseFloatArray(val);
                    }else if (ref == "SHININESS") {
                    	_this.shininess = parseFloatArray(val);
                    }
                }
                
                function InstanceEffect(xml){
                    var _this = this;
                    this.url = xml.getAttribute("url");
                    this.url = this.url.slice(1);
                }
            }
            
            function loadVisualScenes(xml){
                var visualScenes = xml.getElementsByTagName("visual_scene");
                _this.visualScenes = new Array();
                for (var i = 0; i < visualScenes.length; i++) {
                    var visualScene = visualScenes[i];
                    _this.visualScenes.push(new VisualScene(visualScene));
                }
            }
            
            function VisualScene(xml){
                var _this = this;
                this.id = xml.getAttribute("id");
                this.name = xml.getAttribute("name");
                this.nodes = new Array();
                var nodes = xml.getElementsByTagName("node");
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    this.nodes.push(new Node(node));
                }
                /**
                 params
                 id
                 name
                 translate
                 rotateX
                 rotateY
                 rotateZ
                 scale
                 url
                 **/
                function Node(xml){
                    var _this = this;
                    this.id = xml.getAttribute("id");
                    this.name = xml.getAttribute("name");
                    
                    var translate = xml.getElementsByTagName("translate")[0];
                    if (translate) {
                        this.translate = parseFloatArray(translate.firstChild.nodeValue);
                    }
                    var rotates = xml.getElementsByTagName("rotate");
                    for (var i = 0; i < rotates.length; i++) {
                        var rotate = rotates[i];
                        var sid = rotate.getAttribute("sid");
                        if (sid == "rotateZ") {
                            this.rotateZ = parseFloatArray(rotate.firstChild.nodeValue);
                        }else if (sid == "rotateY") {
                            this.rotateY = parseFloatArray(rotate.firstChild.nodeValue);
                        }else if (sid == "rotateX") {
                            this.rotateX = parseFloatArray(rotate.firstChild.nodeValue);
                        }
                    }
                    var scale = xml.getElementsByTagName("scale")[0];
                    if (scale) {
                        this.scale = parseFloatArray(scale.firstChild.nodeValue);
                    }
                    
                    var instance_geometry = xml.getElementsByTagName("instance_geometry")[0];
                    if (instance_geometry) {
                        var url = instance_geometry.getAttribute("url");
                        if (url) {
                            this.url = url.replace("#", "");
                        }
                    }
                }
                
            }
            
            this.onload = function(){
            }
            
            this.convert = function(){
                var model = new EPModel();
                var resultGeometries = new Array();
                for (var i = 0; i < _this.geometries.length; i++) {
                    var geometry = _this.geometries[i];
                    var resultGeometry = new Object();
                    //id
                    resultGeometry.id = geometry.id;
                    //mesh
                    resultGeometry.meshes = new Array();
                    for (var j = 0; j < geometry.meshes.length; j++) {
                    
                        var mesh = geometry.meshes[j];
                        var resultMesh = new Object();
                        var triangles = mesh.triangles;
                        resultMesh.vertices = new Array();
                        resultMesh.normals = new Array();
                        resultMesh.uv = new Array();
                        resultMesh.indices = new Array();
                        for (var k = 0; k < triangles.primitive.length; k += triangles.stride) {
                            if (triangles.vertexOffset >= 0) {
                                var index = triangles.primitive[k + triangles.vertexOffset] * 3;
                                resultMesh.vertices.push(mesh.vertices[index], mesh.vertices[index + 1], mesh.vertices[index + 2]);
                            }
                            if (triangles.normalOffset >= 0) {
                                var index = triangles.primitive[k + triangles.normalOffset] * 3;
                                resultMesh.normals.push(mesh.normals[index], mesh.normals[index + 1], mesh.normals[index + 2]);
                            }
                            if (triangles.uvOffset >= 0) {
                                var index = triangles.primitive[k + triangles.uvOffset] * 2;
                                resultMesh.uv.push(mesh.uv[index], 1.0 - mesh.uv[index + 1]);
                            }
                        }
                        
                        for (var k = 0; k < triangles.primitive.length / triangles.stride; k++) {
                            resultMesh.indices.push(k);
                        }
                        
                        var material = false;
                        for (k = 0; k < _this.materials.length; k++) {
                            if (_this.materials[k].id == triangles.material) {
                                material = _this.materials[k];
                            }
                        }
                        if (material) {
                            var effect = false;
                            for (var k = 0; k < _this.effects.length; k++) {
                                if (_this.effects[k].id == material.instanceEffect.url) {
                                    effect = _this.effects[k];
                                    break;
                                }
                            }
                            if (effect) {
                                var profileCommon = effect.profileCommon;
                                var technique = profileCommon.technique;
                                var phong = technique.phong;
                                var rm = [];
                                var initfrom = profileCommon.surface.initFrom;
                                var images = _this.images;
                                for (var l = 0; l < images.length; l++) {
                                    if (images[l].id == initfrom) {
                                        rm.src = images[l].initFrom;
                                        break;
                                    }
                                }
                                
                                rm.emission = material.emission;
                                rm.ambient = material.ambient;
                                rm.diffuse = material.diffuse;
                                rm.specular = material.specular;
                                rm.shininess = material.shininess
                                resultMesh.material = rm;
                            }
                        }
                        resultGeometry.meshes.push(resultMesh);
                    }
                    resultGeometries.push(resultGeometry);
                }
                model.geometries = resultGeometries;
                
                var visualScene = _this.visualScenes[0];
                if (visualScene) {
                    for (var i = 0; i < visualScene.nodes.length; i++) {
                        var node = visualScene.nodes[i];
                        for (var j = 0; j < model.geometries.length; j++) {
                            var geometry = model.geometries[j];
                            if (node.url == geometry.id) {
                                geometry.translation = node.translate;
                                var rotation = new Array();
                                rotation.push(node.rotateX[0], node.rotateY[0], node.rotateZ[0], 0);
                                rotation.push(node.rotateX[1], node.rotateY[1], node.rotateZ[1], 0);
                                rotation.push(node.rotateX[2], node.rotateY[2], node.rotateZ[2], 0);
                                rotation.push(0, 0, 0, 1);
                                geometry.rotation = rotation;
                                geometry.scale = node.scale;
                            }
                        }
                    }
                }
                
                return model;
            }
            
            
            function EPModel(){
                var _this = this;
                this.geometries = new Array();
                
                
                function Geometry(){
                    this.meshes = new Array();
                }
                function Mesh(){
                    this.vertices = new Array();
                    this.normals = new Array();
                    this.uv = new Array();
                    this.indices = new Array();
                    this.material;
                }
                function Material(){
                    this.emission = [0, 0, 0, 0];
                    this.ambient = [0, 0, 0, 0];
                    this.diffuse = [0, 0, 0, 0];
                    this.specular = [0, 0, 0, 0];
                    this.shininess = [0, 0, 0, 0];
                }
            }
            
        }
        
        
    })();
}
