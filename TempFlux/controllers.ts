class Controller {
    gameObject: GameObject;
    health: Health;

    position: TSM.vec3;
    velocity: TSM.vec3;
    rotation: TSM.vec3;

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

        this.health = new Health(3);
        this.health.onDamage = () => {
            this.onDamage();
        }
    }

    onDamage() {
    }

    generateWorldBoundary(w: number = this.gameObject.sprite.width, h: number = this.gameObject.sprite.height) {
        if (this.gameObject == null) {
            return;
        }

        this.worldBoundary = new Rectangle();
        this.worldBoundary.position.xy = game.worldBoundary.position.xy;
        this.worldBoundary.position.x += w;
        this.worldBoundary.position.y += w;
        this.worldBoundary.width = game.worldBoundary.width - w;
        this.worldBoundary.height = game.worldBoundary.height - w;
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

    render() {
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
    angle: number = 0;
    platformVelocity: TSM.vec2 = TSM.vec2.zero;
    angularVelocity: number = 0;
    worldBoundary: Rectangle;
    lifetime: number;
        
    update(dt) {
        super.update(dt);

        this.angle += this.angularVelocity * dt;

        this.velocity.x = Math.cos(this.angle * Util.deg2Rad) * this.speed;
        this.velocity.y = Math.sin(this.angle * Util.deg2Rad) * this.speed;
        this.velocity.x += this.platformVelocity.x;
        this.velocity.y += this.platformVelocity.y;

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        this.rotation.z = this.angle * Util.deg2Rad;

        if (!this.worldBoundary.pointInside(this.position.xy)) {
            this.gameObject.destroy();
            this.spark();
        }

        this.lifetime -= dt;
        if (this.lifetime < 0) {
            this.gameObject.destroy();
            this.spark();
        }        

        this.gameObject.position = this.position;
        this.gameObject.rotation = this.rotation;
    }

    onCollisionEnter(collider: Collider) {
        if (collider.parent.tag != GameObjectTag.Enemy) {
            return;
        }

        if (!this.gameObject.shouldDestroy) {
            game.audio.playSound("hit_enemy");
        }
        this.gameObject.destroy();
        this.spark();
    }

    spark() {
        var emitter = game.particles.createEmitter(0.1, game.textures.getTexture("spark"));
        emitter.emissionRate = 100;
        emitter.particlesPerEmission = 1;
        emitter.startLifetime = 0.1;
        emitter.startSpeed = 250;
        emitter.position.xyz = this.position.xyz;
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
    fireTimer: number;
    firedThisFrame: boolean;
    weapon: number;

    playerConfig: any;

    stateRecord: LocalPlayerState[];

    muzzleFlash: Sprite;

    constructor(gameObject: GameObject) {
        super(gameObject);

        this.playerConfig = game.config["player"];
        this.speed = this.playerConfig["speed"];
        this.firedThisFrame = false;
        this.fireTimer = 0;
        this.weapon = 0;

        this.health.setMax(100);

        this.stateRecord = [];

        this.muzzleFlash = new Sprite(32, 32);
        this.muzzleFlash.setTexture(game.textures.getTexture("muzzle_flash"));
        this.muzzleFlash.setShader(game.spriteShader);
        this.muzzleFlash.alpha = true;
        this.muzzleFlash.position.z = 0.5;
        this.muzzleFlash.hidden = true;
    }

    update(dt) {
        super.update(dt);
        this.muzzleFlash.hidden = true;

        this.firedThisFrame = false;
        this.velocity.x = 0;
        this.velocity.y = 0;
        if (game.input.getKey(Keys.A)) {
            this.velocity.x = -1;
        }
        if (game.input.getKey(Keys.D)) {
            this.velocity.x = 1;
        }
        if (game.input.getKey(Keys.W)) {
            this.velocity.y = -1;
        }
        if (game.input.getKey(Keys.S)) {
            this.velocity.y = 1;
        }
        this.velocity.normalize();
        this.velocity.x *= this.speed;
        this.velocity.y *= this.speed;

        if (game.input.getKeyDown(Keys.Z)) {
            this.weapon--;
            if (this.weapon < 0) {
                this.weapon = 0;
            }
        }
        if (game.input.getKeyDown(Keys.X)) {
            this.weapon++;
            if (this.weapon >= game.armory.patterns.length) {
                this.weapon = game.armory.patterns.length - 1;
            }
        }

        if (game.input.getMouseButton(MouseButtons.RIGHT)) {
            timeScale = 0.25;
        } else {
            timeScale = 1;
        }

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        var mx = game.input.getMouseX() + game.camera.position.x;
        var my = game.input.getMouseY() + game.camera.position.y;

        this.rotation.z = Math.atan2(this.position.y - this.gameObject.sprite.height / 2 - my, this.position.x - this.gameObject.sprite.width / 2 - mx) + Math.PI;

        var muzzlePos = new TSM.vec2([this.position.x - this.gameObject.sprite.origin.x + 16, this.position.y - this.gameObject.sprite.origin.y + 16]);
        muzzlePos.x += Math.cos(this.rotation.z) * 32;
        muzzlePos.y += Math.sin(this.rotation.z) * 32;
        this.muzzleFlash.position.x = muzzlePos.x;
        this.muzzleFlash.position.y = muzzlePos.y;
        this.muzzleFlash.rotation.z = this.rotation.z;
        
        this.constrainToBoundaries();

        this.gameObject.position = this.position;
        this.gameObject.rotation = this.rotation;

        if (this.fireTimer > 0) {
            this.fireTimer -= dt;
        }

        if (game.input.getMouseButton(MouseButtons.LEFT)) {            
            if (this.fireTimer <= 0) {
                this.shoot();
            }
        }

        this.recordCurrentState();
    }

    render() {
        this.muzzleFlash.render();
    }

    onDamage() {
        super.onDamage();

        game.audio.playSound("get_hit");
        game.camera.shake(0.2, 10);
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
        //this.muzzleFlash.hidden = false;

        game.camera.kick(this.rotation.z, 2);

        var startPos = new TSM.vec2([this.position.x - this.gameObject.sprite.origin.x + 4, this.position.y - this.gameObject.sprite.origin.y + 4]);
        startPos.x += Math.cos(this.rotation.z) * 16;
        startPos.y += Math.sin(this.rotation.z) * 16;

        this.fireTimer = game.armory.shoot(this.weapon, startPos, this.rotation.z * Util.rad2Deg, TSM.vec2.zero);
        game.audio.playSound("shoot");
        
        //go.collider.continuousCollision = true;
    }

    onCollisionEnter(collider: Collider) {
        if (collider.parent.tag == GameObjectTag.Enemy) {
            this.gameObject.sprite.invertColor = true;
            this.health.damage(5);
        }
    }

    onCollisionExit(collider: Collider) {
        if (collider.parent.tag == GameObjectTag.Enemy) {
            this.gameObject.sprite.invertColor = false;
        }
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

        //go.collider.continuousCollision = true;
    }
}