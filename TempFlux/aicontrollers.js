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
        this.minPlayerDistance = 200;
        this.minPlayerDistanceSqr = this.minPlayerDistance * this.minPlayerDistance;

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
    EnemySpawnerController.prototype.update = function (dt) {
        if (this.player == null && game.playerController.gameObject != null) {
            this.player = game.playerController.gameObject;
        }

        if (!this.enableSpawning) {
            return;
        }

        if (game.input.getKeyDown(Keys.ONE)) {
            this.startSpawnRun(100, 0, this.chooseSpawnPoint(), 1, 1, true, true);
            this.startSpawnRun(100, 0, this.chooseSpawnPoint(), 1, 1, true, true);
            this.startSpawnRun(100, 0, this.chooseSpawnPoint(), 1, 1, true, true);
        }
        if (game.input.getKeyDown(Keys.TWO)) {
            game.enemies.createEnemy(this.enemyMap[1], this.getRandomSpawnPosition());
        }
        if (game.input.getKey(Keys.THREE)) {
            game.enemies.createEnemy(this.enemyMap[2], this.getRandomSpawnPosition());
        }

        if (game.input.getKeyDown(Keys.E)) {
            this.enableSpawning = !this.enableSpawning;
        }

        for (var i = 0, len = this.spawners.length; i < len; ++i) {
            this.spawners[i].update(dt);
        }
    };

    EnemySpawnerController.prototype.startSpawnRun = function (amount, enemyType, spawnerIndex, spawnDelay, enemiesPerSpawn, randomizeEnemy, randomizeSpawner) {
        if (typeof enemiesPerSpawn === "undefined") { enemiesPerSpawn = 1; }
        if (typeof randomizeEnemy === "undefined") { randomizeEnemy = false; }
        if (typeof randomizeSpawner === "undefined") { randomizeSpawner = false; }
        if (this.freeSpawners.length <= 0) {
            return false;
        }

        var s = this.freeSpawners.pop();
        this.spawners[s].spawnRun(amount, enemyType, spawnerIndex, spawnDelay, enemiesPerSpawn, randomizeEnemy, randomizeSpawner);

        return true;
    };

    EnemySpawnerController.prototype.spawnerComplete = function (index) {
        this.freeSpawners.push(index);
    };

    EnemySpawnerController.prototype.chooseSpawnPoint = function () {
        var s;
        do {
            s = Util.randomRange(0, this.spawnPoints.length - 1);
        } while(!this.spawnPointValid(this.spawnPoints[s]));
        return s;
    };

    EnemySpawnerController.prototype.spawnPointValid = function (spawnPosition) {
        if (TSM.vec3.squaredDistance(spawnPosition, this.player.position) < this.minPlayerDistanceSqr) {
            return false;
        }

        return true;
    };

    EnemySpawnerController.prototype.getRandomSpawnPosition = function () {
        var x = Util.randomRange(-game.worldWidth / 2 + 64, game.worldWidth / 2 - 64);
        var y = Util.randomRange(-game.worldHeight / 2 + 64, game.worldHeight / 2 - 64);

        return new TSM.vec3([x, y, 0]);
    };

    EnemySpawnerController.prototype.spawnLocationValid = function (position) {
        return true;
    };
    return EnemySpawnerController;
})(Controller);

var SpawnWorker = (function () {
    function SpawnWorker(spawnController, index) {
        this.spawnController = spawnController;
        this.spawnWorkerIndex = index;
        this.enemyType = 0;
        this.spawnerIndex = 0;
        this.enabled = false;
        this.spawnDelay = 0;
        this.enemiesPerSpawn = 0;
        this.spawnTimer = this.spawnDelay;
    }
    SpawnWorker.prototype.on = function () {
        this.enabled = true;
    };

    SpawnWorker.prototype.off = function () {
        this.enabled = false;
    };

    SpawnWorker.prototype.spawnRun = function (amount, enemyType, spawnerIndex, spawnDelay, enemiesPerSpawn, randomizeEnemy, randomizeSpawner) {
        if (typeof enemiesPerSpawn === "undefined") { enemiesPerSpawn = 1; }
        if (typeof randomizeEnemy === "undefined") { randomizeEnemy = false; }
        if (typeof randomizeSpawner === "undefined") { randomizeSpawner = false; }
        this.spawnCounter = 0;
        this.spawnRunCount = amount;
        this.randomizeEnemy = randomizeEnemy;
        this.randomizeSpawner = randomizeSpawner;
        this.enemyType = enemyType;
        this.spawnerIndex = spawnerIndex;
        this.spawnDelay = spawnDelay;
        this.enemiesPerSpawn = enemiesPerSpawn;

        this.enabled = true;
    };

    SpawnWorker.prototype.update = function (dt) {
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
    };
    return SpawnWorker;
})();

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
        this.damageFlashTime = 0.1;
        this.damageFlashTimer = 0;

        this.aiState = 0 /* Idle */;
        this.stateStarted = false;

        this.health.onDeath = function () {
            _this.onDeath();
        };

        this.health.onDamage = function () {
            _this.onDamage();
        };
    }
    AIController.prototype.onDeath = function () {
        this.gameObject.destroy();
    };

    AIController.prototype.onDamage = function () {
        this.damageColorFlash();
    };

    AIController.prototype.update = function (dt) {
        if (game.playerController.gameObject != null) {
            AIController.player = game.playerController.gameObject;
        }

        this.stateMachine(dt);

        this.constrainToBoundaries();
        this.damageFlashUpdate(dt);

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

    AIController.prototype.setState = function (state) {
        if (this.aiState != state) {
            this.aiState = state;
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
        if (collider.parent.tag == 2 /* Bullet */) {
            this.health.damage(1);
        } else if (collider.parent.tag == 1 /* Player */) {
            this.health.damage(100);
        }
    };

    AIController.prototype.damageFlashUpdate = function (dt) {
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= dt;
            this.gameObject.sprite.invertColor = !this.gameObject.sprite.invertColor;
            if (this.damageFlashTimer <= 0) {
                this.gameObject.sprite.invertColor = false;
            }
        }
    };

    AIController.prototype.damageColorFlash = function () {
        this.damageFlashTimer = this.damageFlashTime;
        this.gameObject.sprite.invertColor = true;
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
    function AIGreenTriangleController(gameObject) {
        _super.call(this, gameObject);
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

        this.health.setMax(1);
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

        this.position = Util.lerpVec3NoZ(this.position, this.targetPosition, 2 * dt);
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

var AIStarburstController = (function (_super) {
    __extends(AIStarburstController, _super);
    function AIStarburstController(gameObject) {
        _super.call(this, gameObject);
        this.distanceThreshold = 200;
        this.distanceThresholdSqr = this.distanceThreshold * this.distanceThreshold;
        this.chargeTime = 1;

        this.health.setMax(8);

        this.children = [];
    }
    AIStarburstController.prototype.onDeath = function () {
        _super.prototype.onDeath.call(this);

        for (var i = 0, len = this.children.length; i < len; ++i) {
            this.children[i].gameObject.sprite.invertColor = false;
        }
    };

    AIStarburstController.prototype.onDamage = function () {
        _super.prototype.onDamage.call(this);

        this.setState(2 /* Aggressive */);

        if (this.health.isDead) {
            for (var i = 0, len = this.children.length; i < len; ++i) {
                this.children[i].gameObject.destroy();
            }
        }
    };

    AIStarburstController.prototype.registerChild = function (child) {
        this.children.push(child);
    };

    AIStarburstController.prototype.stateStartIdle = function () {
        this.targetPosition = this.getRandomLocation();
    };

    AIStarburstController.prototype.getRandomLocation = function () {
        var x = Util.randomRange(-game.worldWidth / 2 + 32, game.worldWidth / 2 - 32);
        var y = Util.randomRange(-game.worldHeight / 2 + 32, game.worldHeight / 2 - 32);

        return new TSM.vec3([x, y, 0]);
    };

    AIStarburstController.prototype.stateIdle = function (dt) {
        var dir = TSM.vec3.difference(this.targetPosition, this.position).normalize();
        var mx = dir.x * 50 * dt;
        var my = dir.y * 50 * dt;
        this.position.x += mx;
        this.position.y += my;
        this.moveChildren(mx, my);

        if (TSM.vec3.difference(this.targetPosition, this.position).length() < 2) {
            this.targetPosition = this.getRandomLocation();
        }
    };

    AIStarburstController.prototype.moveChildren = function (mx, my) {
        for (var i = 0, len = this.children.length; i < len; ++i) {
            this.children[i].position.x += mx;
            this.children[i].position.y += my;
        }
    };

    AIStarburstController.prototype.stateTransitionIdle = function () {
        if (Util.distanceSqr2D(AIController.player.position, this.position) < this.distanceThresholdSqr) {
            return 2 /* Aggressive */;
        }
        return 0 /* Idle */;
    };

    AIStarburstController.prototype.stateStartAggressive = function () {
        this.chargeTween = TweenManager.register(new Tween(TweenFunctions.sineWave, 1, 1.5, this.chargeTime, 1 /* Repeat */));
    };

    AIStarburstController.prototype.stateAggressive = function (dt) {
        this.chargeTime -= dt;

        var s = this.chargeTween.evaluate();
        this.gameObject.sprite.scale.x = s;
        this.gameObject.sprite.scale.y = s;

        if (this.chargeTime <= 0) {
            this.gameObject.destroy();

            for (var i = 0, len = this.children.length; i < len; ++i) {
                this.children[i].gameObject.sprite.invertColor = false;
                this.children[i].setState(2 /* Aggressive */);
            }
        }
    };

    AIStarburstController.prototype.damageFlashUpdate = function (dt) {
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
    };

    AIStarburstController.prototype.damageColorFlash = function () {
        this.damageFlashTimer = this.damageFlashTime;
        this.gameObject.sprite.invertColor = true;
        for (var i = 0, len = this.children.length; i < len; ++i) {
            this.children[i].gameObject.sprite.invertColor = true;
        }
    };
    return AIStarburstController;
})(AIController);

var AIStarburstPointController = (function (_super) {
    __extends(AIStarburstPointController, _super);
    function AIStarburstPointController(gameObject, parent, side) {
        _super.call(this, gameObject);
        this.speed = 400;

        this.parent = parent;
        this.parent.registerChild(this);

        this.health.setMax(1);

        this.side = side;
    }
    AIStarburstPointController.prototype.stateStartIdle = function () {
        this.gameObject.collider.enabled = false;
    };

    AIStarburstPointController.prototype.stateStartAggressive = function () {
        this.gameObject.collider.enabled = true;
        switch (this.side) {
            case 0 /* Left */:
                this.velocity.x = -this.speed;
                break;

            case 1 /* Right */:
                this.velocity.x = this.speed;
                break;

            case 2 /* Top */:
                this.velocity.y = -this.speed;
                break;

            case 3 /* Bottom */:
                this.velocity.y = this.speed;
                break;
        }
    };

    AIStarburstPointController.prototype.stateAggressive = function (dt) {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    };

    AIStarburstPointController.prototype.hitWall = function () {
        this.gameObject.destroy();
    };
    return AIStarburstPointController;
})(AIController);
//# sourceMappingURL=aicontrollers.js.map
