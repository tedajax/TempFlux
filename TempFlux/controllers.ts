class Controller {
    gameObject: GameObject;
    health: Health;

    position: TSM.vec3;
    velocity: TSM.vec3;
    rotation: TSM.vec3;
    angularVelocity: TSM.vec3;

    worldBoundary: Rectangle;

    constructor(gameObject: GameObject) {
        this.gameObject = gameObject;
        if (this.gameObject != null) {
            this.gameObject.setController(this);
            this.generateWorldBoundary();
        }

        this.position = new TSM.vec3([0, 0, 0]);
        this.velocity = new TSM.vec3([0, 0, 0]);
        this.rotation = new TSM.vec3([0, 0, 0]);
        this.angularVelocity = new TSM.vec3([0, 0, 0]);

        this.health = new Health(3);
    }

    generateWorldBoundary() {
        if (this.gameObject == null) {
            return;
        }

        this.worldBoundary = new Rectangle();
        this.worldBoundary.position.xy = game.worldBoundary.position.xy;
        this.worldBoundary.position.x += this.gameObject.sprite.width;
        this.worldBoundary.position.y += this.gameObject.sprite.height;
        this.worldBoundary.width = game.worldBoundary.width - this.gameObject.sprite.width;
        this.worldBoundary.height = game.worldBoundary.height - this.gameObject.sprite.height;
    }

    posess(gameObject: GameObject) {
        if (gameObject == null) {
            return;
        }

        if (this.gameObject != null) {
            this.gameObject.setController(null);
        }

        this.gameObject = gameObject;
        this.gameObject.setController(this);
        this.gameObject.position = this.position;
        this.generateWorldBoundary();
    }

    unposess() {
        this.gameObject.setController(null);
        this.gameObject = null;
    }

    requestUpdate(dt) {
        if (this.gameObject == null) {
            return;
        } else {
            this.requestUpdate(dt);
        }
    }

    update(dt) {
    }

    onCollisionEnter(collider: Collider) {
    }

    onCollisionStay(collider: Collider) {
    }

    onCollisionExit(collider: Collider) {
    }

    constrainToBoundaries() {
        if (this.position.x < this.worldBoundary.left()) {
            this.position.x = this.worldBoundary.left();
            this.hitWall();
        }
        if (this.position.x > this.worldBoundary.right()) {
            this.position.x = this.worldBoundary.right();
            this.hitWall();
        }

        if (this.position.y < this.worldBoundary.top()) {
            this.position.y = this.worldBoundary.top();
            this.hitWall();
        }
        if (this.position.y > this.worldBoundary.bottom()) {
            this.position.y = this.worldBoundary.bottom();
            this.hitWall();
        }
    }

    hitWall() {

    }

    nudgeAway(other: Controller, amount: number = 1) {
        var dir = new TSM.vec2([this.position.x - other.position.x,
            this.position.y - other.position.y]);
        this.nudge(dir.normalize(), amount);
    }

    nudge(direction: TSM.vec2, amount: number = 1) {
        this.position.x += direction.x * amount;
        this.position.y += direction.y * amount;
    }
}

class MouseCursorController extends Controller {
    update(dt) {
        super.update(dt);

        var mx = game.input.getMouseX() + game.camera.position.x;
        var my = game.input.getMouseY() + game.camera.position.y;

        this.gameObject.position.x = mx;
        this.gameObject.position.y = my;
    }
}

class BulletController extends Controller {
    speed: number = 100;
    worldBoundary: Rectangle;
    
    update(dt) {
        super.update(dt);

        this.position.x += this.velocity.x * this.speed * dt;
        this.position.y += this.velocity.y * this.speed * dt;

        if (!this.worldBoundary.pointInside(this.position.xy)) {
            this.gameObject.destroy();
        }

        this.gameObject.position = this.position;
    }

    onCollisionEnter(collider: Collider) {
        this.gameObject.destroy();
    }
}

class LocalPlayerState {
    position: TSM.vec3;
    rotation: number;
    firedThisFrame: boolean;

    constructor() {
        this.position = new TSM.vec3;
        this.rotation = 0;
        this.firedThisFrame = false;
    }
}

class LocalPlayerController extends Controller {
    attacking: boolean;
    speed: number;
    fireDelay: number;
    fireTimer: number;
    firedThisFrame: boolean;

    playerConfig: any;

    stateRecord: LocalPlayerState[];

    testTween: Tween;

    constructor(gameObject: GameObject) {
        super(gameObject);

        this.playerConfig = game.config["player"];
        this.speed = this.playerConfig["speed"];
        this.fireDelay = this.playerConfig["fire_delay"];
        this.fireTimer = this.fireDelay;
        this.firedThisFrame = false;

        this.stateRecord = [];

        this.testTween = new Tween(TweenFunctions.bounceIn, 1, 5, 1, TweenLoopMode.PingPong, 0);
    }

    update(dt) {
        super.update(dt);

        this.firedThisFrame = false;
        this.velocity.x = 0;
        this.velocity.y = 0;
        if (game.input.getKey(Keys.A)) {
            this.velocity.x = -this.speed;
        }
        if (game.input.getKey(Keys.D)) {
            this.velocity.x = this.speed;
        }
        if (game.input.getKey(Keys.W)) {
            this.velocity.y = -this.speed;
        }
        if (game.input.getKey(Keys.S)) {
            this.velocity.y = this.speed;
        }

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        //this.gameObject.sprite.scale.x = this.testTween.evaluate();
        //this.gameObject.sprite.scale.y = this.testTween.evaluate();

        var mx = game.input.getMouseX() + game.camera.position.x;
        var my = game.input.getMouseY() + game.camera.position.y;

        this.rotation.z = Math.atan2(this.position.y - my, this.position.x - mx) + Math.PI;
        
        this.constrainToBoundaries();

        this.gameObject.position = this.position;
        this.gameObject.rotation = this.rotation;

        if (this.fireTimer > 0) {
            this.fireTimer -= dt;
        }

        if (game.input.getMouseButton(MouseButtons.LEFT)) {            
            if (this.fireTimer <= 0) {
                this.fireTimer = this.fireDelay;
                this.shoot();
            }
        }

        this.recordCurrentState();
    }

    recordCurrentState() {
        var record = new LocalPlayerState();
        record.position.xyz = this.position.xyz;
        record.rotation = this.rotation.z;
        record.firedThisFrame = this.firedThisFrame;
        this.stateRecord.push(record);
    }

    resetStateRecord() {
        this.stateRecord = [];
    }

    shoot() {
        this.firedThisFrame = true;

        var startPos = new TSM.vec2([this.position.x - this.gameObject.sprite.origin.x + 4, this.position.y - this.gameObject.sprite.origin.y + 4]);
        startPos.x += Math.cos(this.rotation.z) * 16;
        startPos.y += Math.sin(this.rotation.z) * 16;

        var sprite = new Sprite(8, 8);
        sprite.position.xy = startPos.xy;
        sprite.setShader(game.spriteShader);
        sprite.setTexture(game.textures.getTexture("player_bullet"));
        sprite.alpha = true;
        var go = new GameObject(null, null, "Bullet", sprite);
        go.tag = "bullet";
        var bulletController = new BulletController(null);
        bulletController.position.xy = startPos.xy;
        bulletController.speed = this.playerConfig["bullet_speed"];
        bulletController.velocity = new TSM.vec3([Math.cos(this.rotation.z), Math.sin(this.rotation.z), 0]);
        bulletController.posess(go);
        
        game.gameObjects.add(go);
        go.addCircleCollider();
        //go.collider.continuousCollision = true;
    }
}

class PlayerRecordingController extends Controller {
    recording: LocalPlayerState[];
    recordIndex: number;

    constructor(gameObject: GameObject, recording: LocalPlayerState[]) {
        super(gameObject);

        this.recording = recording;
        this.recordIndex = 0;
    }

    rewind() {
        this.recordIndex = 0;
        this.gameObject.sprite.tintColor[0] = 1;
        this.gameObject.sprite.tintColor[1] = 1;
        this.gameObject.sprite.tintColor[2] = 1;
    }

    update(dt) {
        if (this.recordIndex >= this.recording.length) {
            this.gameObject.sprite.tintColor[0] = 0.25;
            this.gameObject.sprite.tintColor[1] = 0.25;
            this.gameObject.sprite.tintColor[2] = 0.25;
            return;
        }

        var state = this.recording[this.recordIndex++];

        this.position.x = state.position.x;
        this.position.y = state.position.y;
        this.rotation.z = state.rotation;

        this.gameObject.position = this.position;
        this.gameObject.rotation = this.rotation;

        if (state.firedThisFrame) {
            this.shoot();
        }
    }

    shoot() {
        var startPos = new TSM.vec2([this.position.x - this.gameObject.sprite.origin.x + 4, this.position.y - this.gameObject.sprite.origin.y + 4]);
        startPos.x += Math.cos(this.rotation.z) * 16;
        startPos.y += Math.sin(this.rotation.z) * 16;

        var sprite = new Sprite(8, 8);
        sprite.position.xy = startPos.xy;
        sprite.setShader(game.spriteShader);
        sprite.setTexture(game.textures.getTexture("player_bullet"));
        sprite.alpha = true;
        var go = new GameObject(null, null, "Bullet", sprite);
        go.tag = "bullet";
        var bulletController = new BulletController(null);
        bulletController.position.xy = startPos.xy;
        bulletController.speed = game.config["player"]["bullet_speed"];
        bulletController.velocity = new TSM.vec3([Math.cos(this.rotation.z), Math.sin(this.rotation.z), 0]);
        bulletController.posess(go);

        game.gameObjects.add(go);
        go.addCircleCollider();
        go.collider.continuousCollision = true;
    }
}