class EnemySpawnerController extends Controller {
    enableSpawning: boolean;
    spawnDelayTimer: number;
    spawnDelay: number;

    constructor() {
        super(null);

        this.spawnDelay = Util.randomRangeF(0, 5);
        this.spawnDelayTimer = this.spawnDelay;

        this.enableSpawning = true;
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

            var x = Util.randomRange(-400, 400);
            var y = Util.randomRange(-300, 300);

            game.enemies.createEnemy("green_triangle", new TSM.vec3([x, y, 0]));
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

    nudgeAway(other: Controller, amount: number = 1) {
        var dir = new TSM.vec2([this.position.x - other.position.x,
            this.position.y - other.position.y]);
        this.nudge(dir.normalize(), amount);
    }

    nudge(direction: TSM.vec2, amount: number = 1) {
        this.position.x += direction.x * amount;
        this.position.y += direction.y * amount;
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
        var speed = 50;
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

    aggressivePauseTime: number = 0.5;
    aggressivePauseTimer: number = this.aggressivePauseTime;
    aggressiveDirection: TSM.vec3;
    aggressiveSpeed: number = 0;
    aggressiveMaxSpeed: number = 600;
    aggressiveSpeedTween: Tween;
    aggressiveMaxDistance: number = 750;
    aggressiveDistanceTraveled: number;
    
    stateIdle(dt: number) {
        var angle = Math.atan2(this.position.y - AIController.player.position.y, this.position.x - AIController.player.position.x);
        this.rotation.z = angle - Math.PI / 2;

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

        var angle = Math.atan2(this.position.y - AIController.player.position.y, this.position.x - AIController.player.position.x);
        this.rotation.z = angle - Math.PI / 2;

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
        var angle = Math.atan2(this.position.y - AIController.player.position.y, this.position.x - AIController.player.position.x);
        this.rotation.z = angle - Math.PI / 2;

        this.aggressiveDirection = new TSM.vec3([Math.cos(angle + Math.PI), Math.sin(angle + Math.PI), 0]);
        this.aggressiveDistanceTraveled = 0;
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