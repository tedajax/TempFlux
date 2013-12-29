/// <reference path="WebGL.d.ts" />
var Game = (function () {
    function Game(canvas) {
        var _this = this;
        this.useFullWindow = false;

        this.canvas = canvas;
        if (this.useFullWindow) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.fullscreen = false;

        this.gl = this.canvas.getContext("webgl", { alpha: true });
        if (!this.gl) {
            console.log("reverting to experimental-webgl");
            this.gl = this.canvas.getContext("experimental-webgl", { alpha: true });
        }
        this.gl.viewport(0, 0, this.width, this.height);

        this.camera = new Camera2D();
        this.renderedFrames = 0;
        this.elapsedTime = 0;

        this.input = new Input();
        document.onkeydown = function (event) {
            return _this.input.onKeyDown(event);
        };
        document.onkeyup = function (event) {
            return _this.input.onKeyUp(event);
        };
        document.onmousedown = function (event) {
            return _this.input.onMouseDown(event);
        };
        document.onmouseup = function (event) {
            return _this.input.onMouseUp(event);
        };
        document.onmousemove = function (event) {
            return _this.input.onMouseMove(event);
        };
        window.onresize = function () {
            return _this.onResize();
        };

        document.addEventListener("keydown", function (e) {
            if (e.keyCode == Keys.F) {
                ["requestFullscreen", "msRequestFullscreen", "webkitRequestFullscreen", "mozRequestFullscreen"].forEach(function (name) {
                    if (_this.canvas[name] != null) {
                        game.fullscreen = true;
                        _this.canvas[name]();
                        return false;
                    }
                });
            }
        });
    }
    Game.prototype.initialize = function () {
        this.gl.clearColor(0, 0, 0, 1);

        this.config = loadJsonFile("config.json")["game_config"];

        this.renderer = new RenderManager();

        this.initializeTextures();
        this.initializeAnimations();

        this.meshFactory = new MeshFactory();

        this.enemies = new EnemyFactory();
        this.aiDirector = new EnemySpawnerController();

        this.spriteShader = new SpriteShader();
        this.spriteShader.initialize();
        this.spriteShader.initLocales();

        this.gameObjects = new GameObjectManager();

        this.collision = new CollisionManager();

        this.initializeBackground();

        var go = this.gameObjects.add(new GameObject("bit", ["idle"], "Player"));
        go.playAnimation("idle", true);
        go.sprite.alpha = true;
        this.camera.gameObjectToFollow = go;
        this.playerController = new LocalPlayerController(go);
        this.recordingControllers = [];
    };

    Game.prototype.initializeTextures = function () {
        this.textures = new TextureManager();
        var resourceMap = this.config["resource_map"];
        for (var key in resourceMap) {
            var value = resourceMap[key];
            var url = value["url"];
            var mode = value["mode"];
            var texMode = (mode == "wrap") ? 1 /* Wrap */ : 0 /* Clamp */;
            this.textures.loadTexture(key, url, texMode);
        }
    };

    Game.prototype.initializeAnimations = function () {
        this.animationFactory = new AnimationFactory();

        this.animationFactory.createAnimation("bit", "idle", "bitIdle", 1);
    };

    Game.prototype.initializeBackground = function () {
        var tileWidth = 64;
        var tileHeight = 64;
        var tilesX = game.config["world_width"];
        var tilesY = game.config["world_height"];
        var worldWidth = tileWidth * tilesX;
        var worldHeight = tileHeight * tilesY;
        this.worldBoundary = new Rectangle(new TSM.vec2([-worldWidth / 2, -worldHeight / 2]), worldWidth, worldHeight);

        var gridBG = new Sprite(worldWidth, worldHeight, tilesX, tilesY);
        gridBG.setShader(this.spriteShader);
        gridBG.setTexture(this.textures.getTexture("grid1"));
        gridBG.position.xyz = [0, 0, -1];
        this.gameObjects.add(new GameObject("ignore", [], "GridBG", gridBG));

        var gridTop = new Sprite(worldWidth, tileHeight, tilesX, 1);
        gridTop.setShader(this.spriteShader);
        gridTop.setTexture(this.textures.getTexture("gridedge_top"));
        gridTop.position.xyz = [0, -worldHeight / 2 - tileHeight / 2, -1];
        this.gameObjects.add(new GameObject("ignore", [], "GridBGTop", gridTop));

        var gridBottom = new Sprite(worldWidth, tileHeight, tilesX, 1);
        gridBottom.setShader(this.spriteShader);
        gridBottom.setTexture(this.textures.getTexture("gridedge_bottom"));
        gridBottom.position.xyz = [0, worldHeight / 2 + tileHeight / 2, -1];
        this.gameObjects.add(new GameObject("ignore", [], "GridBGBottom", gridBottom));

        var gridRight = new Sprite(tileWidth, worldHeight, 1, tilesY);
        gridRight.setShader(this.spriteShader);
        gridRight.setTexture(this.textures.getTexture("gridedge_right"));
        gridRight.position.xyz = [worldWidth / 2 + tileWidth / 2, 0, -1];
        this.gameObjects.add(new GameObject("ignore", [], "GridBGRight", gridRight));

        var gridLeft = new Sprite(tileWidth, worldHeight, 1, tilesY);
        gridLeft.setShader(this.spriteShader);
        gridLeft.setTexture(this.textures.getTexture("gridedge_left"));
        gridLeft.position.xyz = [-worldWidth / 2 - tileWidth / 2, 0, -1];
        this.gameObjects.add(new GameObject("ignore", [], "GridLeft", gridLeft));
    };

    Game.prototype.update = function (dt) {
        if (game.input.getKeyDown(Keys.R)) {
            for (var i = 0, len = this.recordingControllers.length; i < len; ++i) {
                this.recordingControllers[i].rewind();
            }

            var recordController = new PlayerRecordingController(this.playerController.gameObject, this.playerController.stateRecord);
            this.recordingControllers.push(recordController);

            var go = this.gameObjects.add(new GameObject("bit", ["idle"], "Player"));
            go.playAnimation("idle", true);
            go.sprite.alpha = true;
            this.camera.gameObjectToFollow = go;
            this.playerController = new LocalPlayerController(go);
        }

        this.gameObjects.update(dt);
        this.aiDirector.update(dt);
        this.collision.update(dt);

        this.camera.update(dt);

        TweenManager.update(dt);

        this.input.update();

        this.elapsedTime += dt;
    };

    Game.prototype.render = function () {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.spriteShader.frameDrawSetup();
        this.gameObjects.render();
        ++this.renderedFrames;
    };

    Game.prototype.onResize = function () {
        if (this.useFullWindow) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            this.width = this.canvas.width;
            this.height = this.canvas.height;

            this.gl.viewport(0, 0, this.width, this.height);
        }
    };
    return Game;
})();
//# sourceMappingURL=game.js.map
