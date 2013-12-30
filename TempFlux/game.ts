/// <reference path="WebGL.d.ts" />

class Game {
    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;
    camera: Camera2D;
    input: Input;
    width: number;
    height: number;
    useFullWindow: boolean;
    fullscreen: boolean;
    renderedFrames: number;
    elapsedTime: number;
    config: Object;

    worldWidth: number;
    worldHeight: number;

    renderer: RenderManager;
    textures: TextureManager;
    gameObjects: GameObjectManager;
    playerController: LocalPlayerController;
    recordingControllers: PlayerRecordingController[];
    animationFactory: AnimationFactory;
    meshFactory: MeshFactory;
    enemies: EnemyFactory;
    aiDirector: EnemySpawnerController;
    collision: CollisionManager;

    spriteShader: SpriteShader;
    worldBoundary: Rectangle;

    reticule: GameObject;

    constructor(canvas: HTMLCanvasElement) {
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
        document.onkeydown = (event: KeyboardEvent) => this.input.onKeyDown(event);
        document.onkeyup = (event: KeyboardEvent) => this.input.onKeyUp(event);
        document.onmousedown = (event: MouseEvent) => this.input.onMouseDown(event);
        document.onmouseup = (event: MouseEvent) => this.input.onMouseUp(event);
        document.onmousemove = (event: MouseEvent) => this.input.onMouseMove(event);
        window.onresize = () => this.onResize();

        document.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.keyCode == Keys.F) {
                ["requestFullscreen", "msRequestFullscreen", "webkitRequestFullscreen", "mozRequestFullscreen"].forEach((name: string) => {
                    if (this.canvas[name] != null) {
                        game.fullscreen = true;
                        this.canvas[name]();
                        return false;
                    }
                });
            }
        });
    }

    initialize() {
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
        go.position.x = go.sprite.width / 2;
        go.position.y = go.sprite.height / 2;
        this.camera.gameObjectToFollow = go;
        this.playerController = new LocalPlayerController(go);
        this.recordingControllers = [];
    }

    initializeTextures() {
        this.textures = new TextureManager();
        var resourceMap = this.config["resource_map"];
        for (var key in resourceMap) {
            var value = resourceMap[key];
            var url: string = value["url"]
            var mode: string = value["mode"]
            var texMode: TextureWrapMode = (mode == "wrap") ? TextureWrapMode.Wrap : TextureWrapMode.Clamp;
            this.textures.loadTexture(key, url, texMode);
        }
    }

    initializeAnimations() {
        this.animationFactory = new AnimationFactory();

        this.animationFactory.createAnimation("bit", "idle", "bitIdle", 1);
    }

    initializeBackground() {
        var tileWidth = 64;
        var tileHeight = 64;
        var tilesX = game.config["world_width"];
        var tilesY = game.config["world_height"];
        var worldWidth = tileWidth * tilesX;
        var worldHeight = tileHeight * tilesY;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.worldBoundary = new Rectangle(new TSM.vec2([-worldWidth / 2, -worldHeight / 2]), worldWidth, worldHeight);

        var gridBG = new Sprite(worldWidth, worldHeight, tilesX, tilesY);
        gridBG.setShader(this.spriteShader);
        gridBG.setTexture(this.textures.getTexture("grid1"));
        gridBG.position.xyz = [worldWidth / 2, worldHeight / 2, -1];
        this.gameObjects.add(new GameObject("ignore", [], "GridBG", gridBG));

        var gridTop = new Sprite(worldWidth, tileHeight, tilesX, 1);
        gridTop.setShader(this.spriteShader);
        gridTop.setTexture(this.textures.getTexture("gridedge_top"));
        gridTop.position.xyz = [worldWidth / 2, -worldHeight / 2, -1];
        this.gameObjects.add(new GameObject("ignore", [], "GridBGTop", gridTop));

        var gridBottom = new Sprite(worldWidth, tileHeight, tilesX, 1);
        gridBottom.setShader(this.spriteShader);
        gridBottom.setTexture(this.textures.getTexture("gridedge_bottom"));
        gridBottom.position.xyz = [worldWidth / 2, worldHeight / 2 + tileHeight, -1];
        this.gameObjects.add(new GameObject("ignore", [], "GridBGBottom", gridBottom));

        var gridRight = new Sprite(tileWidth, worldHeight, 1, tilesY);
        gridRight.setShader(this.spriteShader);
        gridRight.setTexture(this.textures.getTexture("gridedge_right"));
        gridRight.position.xyz = [worldWidth / 2 + tileWidth, worldHeight / 2, -1];
        this.gameObjects.add(new GameObject("ignore", [], "GridBGRight", gridRight));

        var gridLeft = new Sprite(tileWidth, worldHeight, 1, tilesY);
        gridLeft.setShader(this.spriteShader);
        gridLeft.setTexture(this.textures.getTexture("gridedge_left"));
        gridLeft.position.xyz = [-worldWidth / 2, worldHeight / 2, -1];
        this.gameObjects.add(new GameObject("ignore", [], "GridLeft", gridLeft));
    }

    update(dt: number) {
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
    }

    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.spriteShader.frameDrawSetup();
        this.gameObjects.render();
        ++this.renderedFrames;
    }

    onResize() {
        if (this.useFullWindow) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            this.width = this.canvas.width;
            this.height = this.canvas.height;

            this.gl.viewport(0, 0, this.width, this.height);
        }
    }
}
