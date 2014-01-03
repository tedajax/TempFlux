﻿var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Controller = (function () {
    function Controller(gameObject) {
        var _this = this;
        this.gameObject = gameObject;
        if (this.gameObject != null) {
            this.gameObject.setController(this);
            this.generateWorldBoundary();
        }

        this.position = new TSM.vec3([0, 0, 0]);
        this.velocity = new TSM.vec3([0, 0, 0]);
        this.rotation = new TSM.vec3([0, 0, 0]);

        this.health = new Health(3);
        this.health.onDamage = function () {
            _this.onDamage();
        };
    }
    Controller.prototype.onDamage = function () {
    };

    Controller.prototype.generateWorldBoundary = function (w, h) {
        if (typeof w === "undefined") { w = this.gameObject.sprite.width; }
        if (typeof h === "undefined") { h = this.gameObject.sprite.height; }
        if (this.gameObject == null) {
            return;
        }

        this.worldBoundary = new Rectangle();
        this.worldBoundary.position.xy = game.worldBoundary.position.xy;
        this.worldBoundary.position.x += w;
        this.worldBoundary.position.y += w;
        this.worldBoundary.width = game.worldBoundary.width - w;
        this.worldBoundary.height = game.worldBoundary.height - w;
    };

    Controller.prototype.posess = function (gameObject) {
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
    };

    Controller.prototype.unposess = function () {
        this.gameObject.setController(null);
        this.gameObject = null;
    };

    Controller.prototype.requestUpdate = function (dt) {
        if (this.gameObject == null) {
            return;
        } else {
            this.requestUpdate(dt);
        }
    };

    Controller.prototype.update = function (dt) {
    };

    Controller.prototype.onCollisionEnter = function (collider) {
    };

    Controller.prototype.onCollisionStay = function (collider) {
    };

    Controller.prototype.onCollisionExit = function (collider) {
    };

    Controller.prototype.constrainToBoundaries = function () {
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
    };

    Controller.prototype.hitWall = function () {
    };

    Controller.prototype.nudgeAway = function (other, amount) {
        if (typeof amount === "undefined") { amount = 1; }
        var dir = new TSM.vec2([
            this.position.x - other.position.x,
            this.position.y - other.position.y]);
        this.nudge(dir.normalize(), amount);
    };

    Controller.prototype.nudge = function (direction, amount) {
        if (typeof amount === "undefined") { amount = 1; }
        this.position.x += direction.x * amount;
        this.position.y += direction.y * amount;
    };
    return Controller;
})();

var MouseCursorController = (function (_super) {
    __extends(MouseCursorController, _super);
    function MouseCursorController() {
        _super.apply(this, arguments);
    }
    MouseCursorController.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);

        var mx = game.input.getMouseX() + game.camera.position.x;
        var my = game.input.getMouseY() + game.camera.position.y;

        this.gameObject.position.x = mx;
        this.gameObject.position.y = my;
    };
    return MouseCursorController;
})(Controller);

var BulletController = (function (_super) {
    __extends(BulletController, _super);
    function BulletController() {
        _super.apply(this, arguments);
        this.speed = 100;
        this.angle = 0;
        this.platformVelocity = TSM.vec2.zero;
        this.angularVelocity = 0;
    }
    BulletController.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);

        this.angle += this.angularVelocity * dt;

        this.velocity.x = Math.cos(this.angle * Util.deg2Rad) * this.speed;
        this.velocity.y = Math.sin(this.angle * Util.deg2Rad) * this.speed;
        this.velocity.x += this.platformVelocity.x;
        this.velocity.y += this.platformVelocity.y;

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        if (!this.worldBoundary.pointInside(this.position.xy)) {
            this.gameObject.destroy();
        }

        this.lifetime -= dt;
        if (this.lifetime < 0) {
            this.gameObject.destroy();
        }

        this.gameObject.position = this.position;
    };

    BulletController.prototype.onCollisionEnter = function (collider) {
        if (collider.parent.tag != 3 /* Enemy */) {
            return;
        }

        if (!this.gameObject.shouldDestroy) {
            game.audio.playSound("hit_enemy");
        }
        this.gameObject.destroy();
    };
    return BulletController;
})(Controller);

var LocalPlayerState = (function () {
    function LocalPlayerState() {
        this.position = new TSM.vec3;
        this.rotation = 0;
        this.firedThisFrame = false;
    }
    return LocalPlayerState;
})();

var LocalPlayerController = (function (_super) {
    __extends(LocalPlayerController, _super);
    function LocalPlayerController(gameObject) {
        _super.call(this, gameObject);

        this.playerConfig = game.config["player"];
        this.speed = this.playerConfig["speed"];
        this.firedThisFrame = false;
        this.fireTimer = 0;
        this.weapon = 0;

        this.health.setMax(100);

        this.stateRecord = [];
    }
    LocalPlayerController.prototype.update = function (dt) {
        _super.prototype.update.call(this, dt);

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

        if (game.input.getKey(Keys.Z)) {
            this.weapon--;
            if (this.weapon < 0) {
                this.weapon = 0;
            }
        }
        if (game.input.getKey(Keys.X)) {
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
    };

    LocalPlayerController.prototype.onDamage = function () {
        _super.prototype.onDamage.call(this);

        game.camera.shake(0.2, 10);
    };

    LocalPlayerController.prototype.recordCurrentState = function () {
        var record = new LocalPlayerState();
        record.position.xyz = this.position.xyz;
        record.rotation = this.rotation.z;
        record.firedThisFrame = this.firedThisFrame;
        this.stateRecord.push(record);
    };

    LocalPlayerController.prototype.resetStateRecord = function () {
        this.stateRecord = [];
    };

    LocalPlayerController.prototype.shoot = function () {
        this.firedThisFrame = true;

        game.camera.kick(this.rotation.z, 2);

        var startPos = new TSM.vec2([this.position.x - this.gameObject.sprite.origin.x + 4, this.position.y - this.gameObject.sprite.origin.y + 4]);
        startPos.x += Math.cos(this.rotation.z) * 16;
        startPos.y += Math.sin(this.rotation.z) * 16;

        this.fireTimer = game.armory.shoot(this.weapon, startPos, this.rotation.z * Util.rad2Deg, TSM.vec2.zero);
        game.audio.playSound("shoot");
        //go.collider.continuousCollision = true;
    };

    LocalPlayerController.prototype.onCollisionEnter = function (collider) {
        if (collider.parent.tag == 3 /* Enemy */) {
            this.gameObject.sprite.invertColor = true;
            this.health.damage(5);
        }
    };

    LocalPlayerController.prototype.onCollisionExit = function (collider) {
        if (collider.parent.tag == 3 /* Enemy */) {
            this.gameObject.sprite.invertColor = false;
        }
    };
    return LocalPlayerController;
})(Controller);

var PlayerRecordingController = (function (_super) {
    __extends(PlayerRecordingController, _super);
    function PlayerRecordingController(gameObject, recording) {
        _super.call(this, gameObject);

        this.recording = recording;
        this.recordIndex = 0;
    }
    PlayerRecordingController.prototype.rewind = function () {
        this.recordIndex = 0;
        this.gameObject.sprite.tintColor[0] = 1;
        this.gameObject.sprite.tintColor[1] = 1;
        this.gameObject.sprite.tintColor[2] = 1;
    };

    PlayerRecordingController.prototype.update = function (dt) {
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
    };

    PlayerRecordingController.prototype.shoot = function () {
        var startPos = new TSM.vec2([this.position.x - this.gameObject.sprite.origin.x + 4, this.position.y - this.gameObject.sprite.origin.y + 4]);
        startPos.x += Math.cos(this.rotation.z) * 16;
        startPos.y += Math.sin(this.rotation.z) * 16;
        //go.collider.continuousCollision = true;
    };
    return PlayerRecordingController;
})(Controller);
//# sourceMappingURL=controllers.js.map
