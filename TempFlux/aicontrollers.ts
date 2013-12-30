class EnemySpawnerController extends Controller {
    enableSpawning: boolean;
    spawnDelayTimer: number;
    spawnDelay: number;

    enemyMap: {};

    constructor() {
        super(null);

        this.spawnDelay = Util.randomRangeF(0, 5);
        this.spawnDelayTimer = this.spawnDelay;

        this.enableSpawning = true;

        this.enemyMap = [];
        this.enemyMap[0] = "red_square";
        this.enemyMap[1] = "green_triangle";
    }

    update(dt: number) {
        if (game.input.getKeyDown(Keys.E)) {
            this.enableSpawning = !this.enableSpawning;
        }

        if (this.spawnDelay > 0.0 && this.enableSpawning) {
            this.spawnDelay -= dt;
        }

        if (this.spawnDelay <= 0.0) {
            this.spawnDelay = Util.randomRangeF(0, 5);
            this.spawnDelayTimer = this.spawnDelay;

            game.enemies.createEnemy(this.enemyMap[Util.randomRange(0, 1)], this.getRandomSpawnPosition());
        }
    }

    getRandomSpawnPosition(): TSM.vec3 {
        var x = Util.randomRange(-game.worldWidth / 2, game.worldWidth / 2);
        var y = Util.randomRange(-game.worldHeight / 2, game.worldHeight / 2);

        return new TSM.vec3([x, y, 0]);
    }

    spawnLocationValid(position: TSM.vec3): boolean {
        return true;
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

    constructor(gameObject: GameObject) {
        super(gameObject);

        this.aiState = AIState.Idle;
        this.stateStarted = false;
    }

    update(dt: number) {
        if (game.playerController.gameObject != null) {
            AIController.player = game.playerController.gameObject;
        }

        this.stateMachine(dt);

        this.constrainToBoundaries();

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
        if (collider.parent.tag == "bullet") {
            this.gameObject.destroy();
        }
    }

    onCollisionStay(collider: Collider) {
        if (collider.parent.tag == "enemy") {
            this.nudgeAway(collider.parent.controller);
        }
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
    defensiveAngleTimer: number = Util.randomRange(2, 5);

    aggressivePauseTime: number = 0.25;
    aggressivePauseTimer: number = this.aggressivePauseTime;
    aggressiveDirection: TSM.vec3;
    aggressiveSpeed: number = 0;
    aggressiveMaxSpeed: number = 700;
    aggressiveSpeedTween: Tween;
    
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
    }

    stateDefensive(dt: number) {
        this.defensiveAngleTimer -= dt;
        if (this.defensiveAngleTimer < 0) {
            this.defensiveAngleTimer = Util.randomRange(2, 5);
            this.defensiveAngle += Util.randomRangeF(-30 * Util.deg2Rad, 30 * Util.deg2Rad);
        }

        this.turnToFace(AIController.player.position, 2);

        this.targetPosition.xyz = AIController.player.position.xyz;
        this.targetPosition.x += Math.cos(this.defensiveAngle) * this.defensiveRadius;
        this.targetPosition.y += Math.sin(this.defensiveAngle) * this.defensiveRadius;

        this.position = Util.vec3LerpNoZ(this.position, this.targetPosition, 2 * dt);
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
        var angle = Util.angleTo(this.position, AIController.player.position);
        this.turnToFace(AIController.player.position, 2);

        this.aggressiveDirection = new TSM.vec3([Math.cos(angle - Math.PI / 2), Math.sin(angle - Math.PI / 2), 0]);
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