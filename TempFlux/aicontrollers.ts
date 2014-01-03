class EnemySpawnerController extends Controller {
    enableSpawning: boolean;

    minPlayerDistance: number = 200;
    minPlayerDistanceSqr: number = this.minPlayerDistance * this.minPlayerDistance;

    spawners: SpawnWorker[];
    freeSpawners: number[];

    spawnPoints: TSM.vec3[];

    enemyMap: string[];

    player: GameObject;

    constructor() {
        super(null);

        this.enableSpawning = true;

        this.enemyMap = [];
        this.enemyMap[0] = "red_square";
        this.enemyMap[1] = "green_triangle";
        this.enemyMap[2] = "starburst";

        this.spawnPoints = [];
        for (var i = 0; i < 5; ++i) {
            for (var j = 0; j < 5; ++j) {
                var sx = i - 2;
                var sy = j - 2;
                this.spawnPoints.push(new TSM.vec3([sx * game.worldWidth / 6, sy * game.worldHeight / 6, 0]));
            }
        }

        this.spawners = [];
        this.freeSpawners = [];
        for (var i = 0; i < 10; ++i) {
            this.spawners.push(new SpawnWorker(this, i));
            this.freeSpawners.push(i);
        }
    }

    initialize() {
        this.player = game.playerController.gameObject;

        this.startSpawnRun(100, 0, this.chooseSpawnPoint(), 1, 1, true, true);
        this.startSpawnRun(100, 0, this.chooseSpawnPoint(), 1, 1, true, true);
        this.startSpawnRun(100, 0, this.chooseSpawnPoint(), 1, 1, true, true);
    }

    update(dt: number) {
        if (!this.enableSpawning) {
            return;
        }

        //if (game.input.getKeyDown(Keys.ONE)) {
        //    this.startSpawnRun(100, 0, this.chooseSpawnPoint(), 1, 1, true, true);
        //    this.startSpawnRun(100, 0, this.chooseSpawnPoint(), 1, 1, true, true);
        //    this.startSpawnRun(100, 0, this.chooseSpawnPoint(), 1, 1, true, true);
        //}
        //if (game.input.getKeyDown(Keys.TWO)) {
        //    game.enemies.createEnemy(this.enemyMap[1], this.getRandomSpawnPosition());
        //}
        //if (game.input.getKey(Keys.THREE)) {
        //    game.enemies.createEnemy(this.enemyMap[2], this.getRandomSpawnPosition());
        //}

        //if (game.input.getKeyDown(Keys.E)) {
        //    this.enableSpawning = !this.enableSpawning;
        //}

        for (var i = 0, len = this.spawners.length; i < len; ++i) {
            this.spawners[i].update(dt);
        }
    }

    startSpawnRun(amount: number, enemyType: number, spawnerIndex: number, spawnDelay: number, enemiesPerSpawn: number = 1, randomizeEnemy: boolean = false, randomizeSpawner: boolean = false): boolean {
        if (this.freeSpawners.length <= 0) {
            return false;
        }

        var s = this.freeSpawners.pop();
        this.spawners[s].spawnRun(amount, enemyType, spawnerIndex, spawnDelay, enemiesPerSpawn, randomizeEnemy, randomizeSpawner);

        return true;
    }

    spawnerComplete(index: number) {
        this.freeSpawners.push(index);
    }

    chooseSpawnPoint(): number {
        var s: number;
        do {
            s = Util.randomRange(0, this.spawnPoints.length - 1);
        } while (!this.spawnPointValid(this.spawnPoints[s]));
        return s;
    }

    spawnPointValid(spawnPosition: TSM.vec3): boolean {
        if (TSM.vec3.squaredDistance(spawnPosition, this.player.position) < this.minPlayerDistanceSqr) {
            return false;
        }

        return true;
    }

    getRandomSpawnPosition(): TSM.vec3 {
        var x = Util.randomRange(-game.worldWidth / 2 + 64, game.worldWidth / 2 - 64);
        var y = Util.randomRange(-game.worldHeight / 2 + 64, game.worldHeight / 2 - 64);

        return new TSM.vec3([x, y, 0]);
    }

    spawnLocationValid(position: TSM.vec3): boolean {
        return true;
    }
}

class SpawnWorker {
    enabled: boolean;

    enemyType: number;
    spawnerIndex: number;
    spawnController: EnemySpawnerController;
    spawnWorkerIndex: number;

    spawnDelay: number;
    spawnTimer: number;

    spawnRunCount: number;
    spawnCounter: number;
    enemiesPerSpawn: number;
    randomizeEnemy: boolean;
    randomizeSpawner: boolean;

    constructor(spawnController: EnemySpawnerController, index: number) {
        this.spawnController = spawnController;
        this.spawnWorkerIndex = index;
        this.enemyType = 0;
        this.spawnerIndex = 0;
        this.enabled = false;
        this.spawnDelay = 0;
        this.enemiesPerSpawn = 0;
        this.spawnTimer = this.spawnDelay;
    }

    on() {
        this.enabled = true;
    }

    off() {
        this.enabled = false;
    }

    spawnRun(amount: number, enemyType: number, spawnerIndex: number, spawnDelay: number, enemiesPerSpawn: number = 1, randomizeEnemy: boolean = false, randomizeSpawner: boolean = false) {
        this.spawnCounter = 0;
        this.spawnRunCount = amount;
        this.randomizeEnemy = randomizeEnemy;
        this.randomizeSpawner = randomizeSpawner;
        this.enemyType = enemyType;
        this.spawnerIndex = spawnerIndex;
        this.spawnDelay = spawnDelay;
        this.enemiesPerSpawn = enemiesPerSpawn;

        this.enabled = true;
    }

    update(dt: number) {
        if (!this.enabled) {
            return;
        }

        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            for (var i = 0; i < this.enemiesPerSpawn; ++i) {
                var pos = this.spawnController.spawnPoints[this.spawnerIndex].copy();
                pos.x += Util.randomRange(-50, 50);
                pos.y += Util.randomRange(-50, 50);
                game.enemies.createEnemy(this.spawnController.enemyMap[this.enemyType], pos);
                this.spawnCounter++;
            }

            this.spawnTimer = this.spawnDelay;           

            if (this.spawnCounter >= this.spawnRunCount) {
                this.enabled = false;
                this.spawnController.spawnerComplete(this.spawnWorkerIndex);
            }

            if (this.randomizeEnemy) {
                this.enemyType = Util.randomRange(0, this.spawnController.enemyMap.length - 1);
            }

            if (this.randomizeSpawner) {
                this.spawnerIndex = this.spawnController.chooseSpawnPoint();
            }
        }
    }
}

enum AIState {
    Idle,
    Defensive,
    Aggressive
}

class AIController extends Controller {
    aiState: AIState;
    stateStarted: boolean;
    static player: GameObject;

    damageFlashTime: number = 0.1;
    damageFlashTimer: number = 0;

    spawnTween: Tween;

    constructor(gameObject: GameObject) {
        super(gameObject);

        this.aiState = AIState.Idle;
        this.stateStarted = false;

        this.health.onDeath = () => {
            this.onDeath();
        };

        this.spawnTween = TweenManager.register(new Tween(TweenFunctions.easeOutQuad, 0, 1, 0.5));
    }

    onDeath() {
        game.audio.playSound("enemy_death");
        this.gameObject.destroy();

        var emitter = game.particles.createEmitter(5, game.textures.getTexture("smoke"));
        emitter.position.xyz = this.position.xyz;
        emitter.position.x += this.gameObject.sprite.width;
        emitter.position.y += this.gameObject.sprite.height;
        emitter.lifetime = 0.5;
    }
    
    onDamage() {
        super.onDamage();
        sleep(5);
        game.camera.shake(0.1, 5);
        this.damageColorFlash();
    }

    update(dt: number) {
        if (game.playerController.gameObject != null) {
            AIController.player = game.playerController.gameObject;
        }

        this.gameObject.sprite.scale.x = this.spawnTween.evaluate();
        this.gameObject.sprite.scale.y = this.spawnTween.evaluate();

        this.stateMachine(dt);

        this.constrainToBoundaries();
        this.damageFlashUpdate(dt);        

        this.gameObject.position = this.position;
        this.gameObject.rotation = this.rotation;
    }

    turnToFace(point: TSM.vec3, maxDegreesPerSecond: number = 10) {
        var angleDiff = Util.wrapRadians(Util.angleTo(this.position, point));
        this.rotation.z = Util.lerpRadians(this.rotation.z, angleDiff, 0.1);
    }

    stateMachine(dt: number) {
        switch (this.aiState) {
            default:
            case AIState.Idle:
                if (!this.stateStarted) {
                    this.stateStartIdle();
                    this.stateStarted = true;
                }
                this.stateIdle(dt);
                break;

            case AIState.Defensive:
                if (!this.stateStarted) {
                    this.stateStartDefensive();
                    this.stateStarted = true;
                }
                this.stateDefensive(dt);
                break;

            case AIState.Aggressive:
                if (!this.stateStarted) {
                    this.stateStartAggressive();
                    this.stateStarted = true;
                }
                this.stateAggressive(dt);
                break;
        }

        this.stateTransition(dt);
    }

    stateTransition(dt: number) {
        var previousState = this.aiState;
        switch (this.aiState) {
            default:
            case AIState.Idle:
                this.aiState = this.stateTransitionIdle(dt);
                break;

            case AIState.Defensive:
                this.aiState = this.stateTransitionDefensive(dt);
                break;

            case AIState.Aggressive:
                this.aiState = this.stateTransitionAggressive(dt);
                break;
        }

        if (previousState != this.aiState) {
            this.stateStarted = false;
        }
    }

    setState(state: AIState) {
        if (this.aiState != state) {
            this.aiState = state;
            this.stateStarted = false;
        }        
    }

    stateStartIdle() {
    }

    stateStartDefensive() {
    }

    stateStartAggressive() {
    }

    stateIdle(dt: number) {
    }

    stateDefensive(dt: number) {
    }

    stateAggressive(dt: number) {
    }

    stateTransitionIdle(dt: number): AIState {
        return AIState.Idle;
    }

    stateTransitionDefensive(dt: number): AIState {
        return AIState.Defensive;
    }

    stateTransitionAggressive(dt: number): AIState {
        return AIState.Aggressive;
    }

    onCollisionEnter(collider: Collider) {
        if (collider.parent.tag == GameObjectTag.Bullet) {
            this.health.damage(1);
        } else if (collider.parent.tag == GameObjectTag.Player) {
            this.health.damage(100);
        }
    }
    
    damageFlashUpdate(dt: number) {
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= dt;
            this.gameObject.sprite.invertColor = !this.gameObject.sprite.invertColor;
            if (this.damageFlashTimer <= 0) {
                this.gameObject.sprite.invertColor = false;
            }
        }
    }

    damageColorFlash() {
        this.damageFlashTimer = this.damageFlashTime;
        this.gameObject.sprite.invertColor = true;
    }
}

class AIRedSquareController extends AIController {
    stateTransitionIdle(dt: number): AIState {
        return AIState.Aggressive;
    }

    stateAggressive(dt: number) {
        var direction = Util.direction2D(AIController.player.position, this.position);
        var speed = 100;
        this.velocity.x = direction.x * speed;
        this.velocity.y = direction.y * speed;

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }
}

class AIGreenTriangleController extends AIController {
    idleTime: number = 2;
    idleTimer: number = this.idleTime;
    defensiveTime: number = Util.randomRangeF(3, 4);
    defensiveTimer: number = this.defensiveTime;

    targetPosition: TSM.vec3 = new TSM.vec3([0, 0, 0]);
    
    defensiveRadius: number = Util.randomRangeF(250, 300);
    defensiveAngle: number = 0;
    defensiveAngleVelocity: number = 0;

    aggressivePauseTime: number = 0.25;
    aggressivePauseTimer: number = this.aggressivePauseTime;
    aggressiveDirection: TSM.vec3;
    aggressiveSpeed: number = 0;
    aggressiveMaxSpeed: number = 700;
    aggressiveSpeedTween: Tween;

    constructor(gameObject: GameObject) {
        super(gameObject);

        this.health.setMax(1);
    }
    
    stateIdle(dt: number) {
        this.turnToFace(AIController.player.position, 2);

        this.idleTimer -= dt;
    }

    stateTransitionIdle(dt: number): AIState {
        if (TSM.vec3.distance(AIController.player.position, this.position) < 300) {
            return AIState.Defensive;
        }

        if (this.idleTimer <= 0) {
            this.idleTimer = this.idleTime;
            return AIState.Defensive;
        }

        return AIState.Idle;
    }

    stateStartDefensive() {
        this.defensiveAngle = Math.atan2(this.position.y - AIController.player.position.y, this.position.x - AIController.player.position.x);
        this.defensiveAngleVelocity = Util.randomRangeF(-1, 1) * Util.deg2Rad;
    }

    stateDefensive(dt: number) {
        this.defensiveAngle += this.defensiveAngleVelocity;

        this.turnToFace(AIController.player.position, 2);

        this.targetPosition.xyz = AIController.player.position.xyz;
        this.targetPosition.x += Math.cos(this.defensiveAngle) * this.defensiveRadius;
        this.targetPosition.y += Math.sin(this.defensiveAngle) * this.defensiveRadius;

        this.position = Util.lerpVec3NoZ(this.position, this.targetPosition, 2 * dt);
    }

    stateTransitionDefensive(dt: number): AIState {
        this.defensiveTimer -= dt;
        if (this.defensiveTimer < 0) {
            this.defensiveTimer = this.defensiveTime;
            return AIState.Aggressive;
        }

        return AIState.Defensive;
    }

    stateStartAggressive() {
        this.aggressivePauseTimer = this.aggressivePauseTime;

        this.aggressiveSpeed = 0;

        this.aggressiveSpeedTween = new Tween(TweenFunctions.parabolic, 0, 800, 1, TweenLoopMode.None, this.aggressivePauseTime);
        this.aggressiveSpeedTween.doneCallback = () => {
            this.aiState = AIState.Idle;
        };
    }

    stateAggressive(dt: number) {
        if (this.aggressivePauseTimer > 0) {
            this.aggressivePauseTimer -= dt;

            var angle = Util.angleTo(this.position, AIController.player.position);
            this.turnToFace(AIController.player.position, 2);

            this.aggressiveDirection = new TSM.vec3([Math.cos(angle - Math.PI / 2), Math.sin(angle - Math.PI / 2), 0]);

            return;
        }

        this.aggressiveSpeed = this.aggressiveSpeedTween.evaluate();

        this.velocity.x = this.aggressiveDirection.x * this.aggressiveSpeed;
        this.velocity.y = this.aggressiveDirection.y * this.aggressiveSpeed;

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }

    hitWall() {
        if (this.aiState == AIState.Aggressive) {
            this.aiState = AIState.Idle;
        }
    }
}

class AIStarburstController extends AIController {
    children: AIStarburstPointController[];

    targetPosition: TSM.vec3;
    distanceThreshold: number = 200;
    distanceThresholdSqr: number = this.distanceThreshold * this.distanceThreshold;
    chargeTime: number = 1;
    chargeTween: Tween;

    constructor(gameObject: GameObject) {
        super(gameObject);

        this.health.setMax(8);
        
        this.children = [];
    }

    onDeath() {
        super.onDeath();

        for (var i = 0, len = this.children.length; i < len; ++i) {
            this.children[i].gameObject.sprite.invertColor = false;
        }
    }
    
    onDamage() {
        super.onDamage();

        this.setState(AIState.Aggressive);

        if (this.health.isDead) {
            for (var i = 0, len = this.children.length; i < len; ++i) {
                this.children[i].gameObject.destroy();
            }
        }
    }

    registerChild(child: AIStarburstPointController) {
        this.children.push(child);
    }

    stateStartIdle() {
        this.targetPosition = this.getRandomLocation();
    }

    getRandomLocation(): TSM.vec3 {
        var x = Util.randomRange(-game.worldWidth / 2 + 32, game.worldWidth / 2 - 32);
        var y = Util.randomRange(-game.worldHeight / 2 + 32, game.worldHeight / 2 - 32);

        return new TSM.vec3([x, y, 0]);
    }

    stateIdle(dt: number) {
        var dir = TSM.vec3.difference(this.targetPosition, this.position).normalize();
        var mx = dir.x * 50 * dt;
        var my = dir.y * 50 * dt;
        this.position.x += mx;
        this.position.y += my;
        this.moveChildren(mx, my);

        if (TSM.vec3.difference(this.targetPosition, this.position).length() < 2) {
            this.targetPosition = this.getRandomLocation();
        }
    }

    moveChildren(mx: number, my: number) {
        for (var i = 0, len = this.children.length; i < len; ++i) {
            this.children[i].position.x += mx;
            this.children[i].position.y += my;
        }
    }

    stateTransitionIdle(): AIState {
        if (Util.distanceSqr2D(AIController.player.position, this.position) < this.distanceThresholdSqr) {
            return AIState.Aggressive;
        }
        return AIState.Idle;
    }

    stateStartAggressive() {
        this.chargeTween = TweenManager.register(new Tween(TweenFunctions.sineWave, 1, 1.5, this.chargeTime, TweenLoopMode.Repeat));
    }

    stateAggressive(dt: number) {
        this.chargeTime -= dt;

        var s = this.chargeTween.evaluate();
        this.gameObject.sprite.scale.x = s;
        this.gameObject.sprite.scale.y = s;

        if (this.chargeTime <= 0) {
            this.gameObject.destroy();

            for (var i = 0, len = this.children.length; i < len; ++i) {
                this.children[i].gameObject.sprite.invertColor = false;
                this.children[i].setState(AIState.Aggressive);
            }
        }
    }

    damageFlashUpdate(dt: number) {
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= dt;
            this.gameObject.sprite.invertColor = !this.gameObject.sprite.invertColor;
            for (var i = 0, len = this.children.length; i < len; ++i) {
                this.children[i].gameObject.sprite.invertColor = !this.children[i].gameObject.sprite.invertColor;
            }
            if (this.damageFlashTimer <= 0) {
                this.gameObject.sprite.invertColor = false;
                for (var i = 0, len = this.children.length; i < len; ++i) {
                    this.children[i].gameObject.sprite.invertColor = false;
                }
            }
        }
    }

    damageColorFlash() {
        this.damageFlashTimer = this.damageFlashTime;
        this.gameObject.sprite.invertColor = true;
        for (var i = 0, len = this.children.length; i < len; ++i) {
            this.children[i].gameObject.sprite.invertColor = true;
        }
    }
}

class AIStarburstPointController extends AIController {
    parent: AIStarburstController;
    side: Side2D;
    speed: number = 400;

    constructor(gameObject: GameObject, parent: AIStarburstController, side: Side2D) {
        super(gameObject);

        this.parent = parent;
        this.parent.registerChild(this);

        this.health.setMax(1);

        this.side = side;
    }

    stateStartIdle() {
        this.gameObject.collider.enabled = false;
    }

    stateStartAggressive() {
        this.gameObject.collider.enabled = true;
        switch (this.side) {
            case Side2D.Left:
                this.velocity.x = -this.speed;
                break;

            case Side2D.Right:
                this.velocity.x = this.speed;
                break;

            case Side2D.Top:
                this.velocity.y = -this.speed;
                break;

            case Side2D.Bottom:
                this.velocity.y = this.speed;
                break;
        }
    }

    stateAggressive(dt: number) {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }

    hitWall() {
        this.gameObject.destroy();
    }
}