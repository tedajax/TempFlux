var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var EnemySpawnerController = (function (_super) {
    __extends(EnemySpawnerController, _super);
    function EnemySpawnerController() {
        _super.call(this, null);

        this.spawnDelay = Util.randomRangeF(0, 5);
        this.spawnDelayTimer = this.spawnDelay;

        this.enableSpawning = true;

        this.enemyMap = [];
        this.enemyMap[0] = "red_square";
        this.enemyMap[1] = "green_triangle";
    }
    EnemySpawnerController.prototype.update = function (dt) {
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
    };

    EnemySpawnerController.prototype.getRandomSpawnPosition = function () {
        var x = Util.randomRange(-game.worldWidth / 2, game.worldWidth / 2);
        var y = Util.randomRange(-game.worldHeight / 2, game.worldHeight / 2);

        return new TSM.vec3([x, y, 0]);
    };

    EnemySpawnerController.prototype.spawnLocationValid = function (position) {
        return true;
    };
    return EnemySpawnerController;
})(Controller);

var AIState;
(function (AIState) {
    AIState[AIState["Idle"] = 0] = "Idle";
    AIState[AIState["Defensive"] = 1] = "Defensive";
    AIState[AIState["Aggressive"] = 2] = "Aggressive";
})(AIState || (AIState = {}));

var AIController = (function (_super) {
    __extends(AIController, _super);
    function AIController(gameObject) {
        var _this = this;
        _super.call(this, gameObject);

        this.aiState = 0 /* Idle */;
        this.stateStarted = false;

        this.health.onDeath = function () {
            _this.gameObject.destroy();
        };
    }
    AIController.prototype.update = function (dt) {
        if (game.playerController.gameObject != null) {
            AIController.player = game.playerController.gameObject;
        }

        this.stateMachine(dt);

        this.constrainToBoundaries();

        this.gameObject.position = this.position;
        this.gameObject.rotation = this.rotation;
    };

    AIController.prototype.turnToFace = function (point, maxDegreesPerSecond) {
        if (typeof maxDegreesPerSecond === "undefined") { maxDegreesPerSecond = 10; }
        var angleDiff = Util.wrapRadians(Util.angleTo(this.position, point));
        this.rotation.z = Util.lerpRadians(this.rotation.z, angleDiff, 0.1);
    };

    AIController.prototype.stateMachine = function (dt) {
        switch (this.aiState) {
            default:
            case 0 /* Idle */:
                if (!this.stateStarted) {
                    this.stateStartIdle();
                    this.stateStarted = true;
                }
                this.stateIdle(dt);
                break;

            case 1 /* Defensive */:
                if (!this.stateStarted) {
                    this.stateStartDefensive();
                    this.stateStarted = true;
                }
                this.stateDefensive(dt);
                break;

            case 2 /* Aggressive */:
                if (!this.stateStarted) {
                    this.stateStartAggressive();
                    this.stateStarted = true;
                }
                this.stateAggressive(dt);
                break;
        }

        this.stateTransition(dt);
    };

    AIController.prototype.stateTransition = function (dt) {
        var previousState = this.aiState;
        switch (this.aiState) {
            default:
            case 0 /* Idle */:
                this.aiState = this.stateTransitionIdle(dt);
                break;

            case 1 /* Defensive */:
                this.aiState = this.stateTransitionDefensive(dt);
                break;

            case 2 /* Aggressive */:
                this.aiState = this.stateTransitionAggressive(dt);
                break;
        }

        if (previousState != this.aiState) {
            this.stateStarted = false;
        }
    };

    AIController.prototype.stateStartIdle = function () {
    };

    AIController.prototype.stateStartDefensive = function () {
    };

    AIController.prototype.stateStartAggressive = function () {
    };

    AIController.prototype.stateIdle = function (dt) {
    };

    AIController.prototype.stateDefensive = function (dt) {
    };

    AIController.prototype.stateAggressive = function (dt) {
    };

    AIController.prototype.stateTransitionIdle = function (dt) {
        return 0 /* Idle */;
    };

    AIController.prototype.stateTransitionDefensive = function (dt) {
        return 1 /* Defensive */;
    };

    AIController.prototype.stateTransitionAggressive = function (dt) {
        return 2 /* Aggressive */;
    };

    AIController.prototype.onCollisionEnter = function (collider) {
        if (collider.parent.tag == "bullet") {
            this.health.damage(1);
        }
    };

    AIController.prototype.onCollisionStay = function (collider) {
        if (collider.parent.tag == "enemy") {
            this.nudgeAway(collider.parent.controller, 2);
        }
    };
    return AIController;
})(Controller);

var AIRedSquareController = (function (_super) {
    __extends(AIRedSquareController, _super);
    function AIRedSquareController() {
        _super.apply(this, arguments);
    }
    AIRedSquareController.prototype.stateTransitionIdle = function (dt) {
        return 2 /* Aggressive */;
    };

    AIRedSquareController.prototype.stateAggressive = function (dt) {
        var direction = Util.direction2D(AIController.player.position, this.position);
        var speed = 100;
        this.velocity.x = direction.x * speed;
        this.velocity.y = direction.y * speed;

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    };
    return AIRedSquareController;
})(AIController);

var AIGreenTriangleController = (function (_super) {
    __extends(AIGreenTriangleController, _super);
    function AIGreenTriangleController() {
        _super.apply(this, arguments);
        this.idleTime = 2;
        this.idleTimer = this.idleTime;
        this.defensiveTime = Util.randomRangeF(3, 4);
        this.defensiveTimer = this.defensiveTime;
        this.targetPosition = new TSM.vec3([0, 0, 0]);
        this.defensiveRadius = Util.randomRangeF(250, 300);
        this.defensiveAngle = 0;
        this.defensiveAngleVelocity = 0;
        this.aggressivePauseTime = 0.25;
        this.aggressivePauseTimer = this.aggressivePauseTime;
        this.aggressiveSpeed = 0;
        this.aggressiveMaxSpeed = 700;
    }
    AIGreenTriangleController.prototype.stateIdle = function (dt) {
        this.turnToFace(AIController.player.position, 2);

        this.idleTimer -= dt;
    };

    AIGreenTriangleController.prototype.stateTransitionIdle = function (dt) {
        if (TSM.vec3.distance(AIController.player.position, this.position) < 300) {
            return 1 /* Defensive */;
        }

        if (this.idleTimer <= 0) {
            this.idleTimer = this.idleTime;
            return 1 /* Defensive */;
        }

        return 0 /* Idle */;
    };

    AIGreenTriangleController.prototype.stateStartDefensive = function () {
        this.defensiveAngle = Math.atan2(this.position.y - AIController.player.position.y, this.position.x - AIController.player.position.x);
        this.defensiveAngleVelocity = Util.randomRangeF(-1, 1) * Util.deg2Rad;
    };

    AIGreenTriangleController.prototype.stateDefensive = function (dt) {
        this.defensiveAngle += this.defensiveAngleVelocity;

        this.turnToFace(AIController.player.position, 2);

        this.targetPosition.xyz = AIController.player.position.xyz;
        this.targetPosition.x += Math.cos(this.defensiveAngle) * this.defensiveRadius;
        this.targetPosition.y += Math.sin(this.defensiveAngle) * this.defensiveRadius;

        this.position = Util.vec3LerpNoZ(this.position, this.targetPosition, 2 * dt);
    };

    AIGreenTriangleController.prototype.stateTransitionDefensive = function (dt) {
        this.defensiveTimer -= dt;
        if (this.defensiveTimer < 0) {
            this.defensiveTimer = this.defensiveTime;
            return 2 /* Aggressive */;
        }

        return 1 /* Defensive */;
    };

    AIGreenTriangleController.prototype.stateStartAggressive = function () {
        var _this = this;
        this.aggressivePauseTimer = this.aggressivePauseTime;

        this.aggressiveSpeed = 0;

        this.aggressiveSpeedTween = new Tween(TweenFunctions.parabolic, 0, 800, 1, 0 /* None */, this.aggressivePauseTime);
        this.aggressiveSpeedTween.doneCallback = function () {
            _this.aiState = 0 /* Idle */;
        };
    };

    AIGreenTriangleController.prototype.stateAggressive = function (dt) {
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
    };

    AIGreenTriangleController.prototype.hitWall = function () {
        if (this.aiState == 2 /* Aggressive */) {
            this.aiState = 0 /* Idle */;
        }
    };
    return AIGreenTriangleController;
})(AIController);
//# sourceMappingURL=aicontrollers.js.map
