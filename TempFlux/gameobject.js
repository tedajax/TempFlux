var GameObjectTag;
(function (GameObjectTag) {
    GameObjectTag[GameObjectTag["Default"] = 0] = "Default";
    GameObjectTag[GameObjectTag["Player"] = 1] = "Player";
    GameObjectTag[GameObjectTag["Bullet"] = 2] = "Bullet";
    GameObjectTag[GameObjectTag["Enemy"] = 3] = "Enemy";
    GameObjectTag[GameObjectTag["Powerup"] = 4] = "Powerup";
})(GameObjectTag || (GameObjectTag = {}));

var GameObject = (function () {
    function GameObject(klass, animations, name, sprite) {
        if (typeof name === "undefined") { name = "default"; }
        this.name = name;
        this.tag = 0 /* Default */;
        this.shouldDestroy = false;
        this.entityId = -1;

        if (sprite != null) {
            this.sprite = sprite;
            this.position = sprite.position;
            this.rotation = sprite.rotation;
            return;
        }

        this.sprite = new Sprite(32, 32);
        this.sprite.setShader(game.spriteShader);
        this.position = new TSM.vec3([0, 0, 1]);
        this.rotation = new TSM.vec3([0, 0, 0]);
        this.activeAnimation = null;

        var anims = animations && animations || ["idle"];
        this.animations = new AnimationController(klass, anims);
    }
    GameObject.prototype.destroy = function () {
        this.shouldDestroy = true;
    };

    GameObject.prototype.onDestroy = function () {
        game.collision.release(this.entityId);
    };

    GameObject.prototype.addCollider = function (collider) {
        this.collider = collider;
        game.collision.register(this.collider);
    };

    GameObject.prototype.addCircleCollider = function (layer, radius, offset) {
        if (typeof layer === "undefined") { layer = 1 /* Default */; }
        if (typeof radius === "undefined") { radius = this.sprite.width / 2; }
        if (typeof offset === "undefined") { offset = new TSM.vec2([-this.sprite.width / 2, -this.sprite.height / 2]); }
        var circ = new CircleCollider(this, radius, offset, layer);
        this.addCollider(circ);
    };

    GameObject.prototype.addRectangleCollider = function (layer, width, height, offset) {
        if (typeof layer === "undefined") { layer = 1 /* Default */; }
        if (typeof width === "undefined") { width = this.sprite.width; }
        if (typeof height === "undefined") { height = this.sprite.height; }
        if (typeof offset === "undefined") { offset = new TSM.vec2([-this.sprite.width, -this.sprite.height]); }
        var rect = new RectangleCollider(this, width, height, offset, layer);
        this.addCollider(rect);
    };

    GameObject.prototype.playAnimation = function (name, loop) {
        if (typeof loop === "undefined") { loop = false; }
        this.animations.play(name, loop);
    };

    GameObject.prototype.updateAnimation = function (dt) {
        if (this.animations != null) {
            this.animations.update(dt);
            this.sprite.texture = this.animations.getCurrentTexture();
        }
    };

    GameObject.prototype.setController = function (controller) {
        this.controller = controller;
    };

    GameObject.prototype.update = function (dt) {
        if (this.controller != null) {
            this.controller.update(dt);
        }

        this.updateAnimation(dt);

        this.sprite.position = this.position;
        this.sprite.rotation = this.rotation;
    };

    GameObject.prototype.render = function () {
        if (this.controller != null) {
            this.controller.render();
        }

        this.sprite.render();
    };

    GameObject.prototype.onCollisionEnter = function (collider) {
        if (this.controller != null) {
            this.controller.onCollisionEnter(collider);
        }
    };

    GameObject.prototype.onCollisionStay = function (collider) {
        if (this.controller != null) {
            this.controller.onCollisionStay(collider);
        }
    };

    GameObject.prototype.onCollisionExit = function (collider) {
        if (this.controller != null) {
            this.controller.onCollisionExit(collider);
        }
    };
    return GameObject;
})();
//# sourceMappingURL=gameobject.js.map
