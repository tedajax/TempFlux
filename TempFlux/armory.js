var BulletStream = (function () {
    function BulletStream(speed, angleOffset, angularVelocity, delay, lifetime) {
        this.speed = speed;
        this.angleOffset = angleOffset;
        this.angularVelocity = angularVelocity;
        this.delay = delay;
        this.lifetime = lifetime;
    }
    BulletStream.prototype.shoot = function (position, angle, platformVelocity) {
        var _this = this;
        setTimeout(function () {
            var sprite = new Sprite(24, 12);
            sprite.position.xy = position.xy;
            sprite.position.x += 6;
            sprite.position.y += 3;
            sprite.rotation.z = (angle + _this.angleOffset) * Util.rad2Deg;
            sprite.setShader(game.spriteShader);
            sprite.setTexture(game.textures.getTexture("player_bullet"));
            sprite.alpha = true;
            var go = new GameObject(null, null, "Bullet", sprite);
            go.tag = 2 /* Bullet */;
            var bulletController = new BulletController(null);
            bulletController.platformVelocity = platformVelocity;
            bulletController.position.xy = position.xy;
            bulletController.position.x += 6;
            bulletController.position.y += 3;
            bulletController.speed = _this.speed;
            bulletController.angle = angle + _this.angleOffset;
            bulletController.angularVelocity = _this.angularVelocity;
            bulletController.lifetime = _this.lifetime;
            bulletController.posess(go);

            game.gameObjects.add(go);
            go.addCircleCollider();
        }, this.delay * 1000);
    };
    return BulletStream;
})();

var BulletPattern = (function () {
    function BulletPattern(fireDelay) {
        this.streams = [];
        this.fireDelay = fireDelay;
    }
    BulletPattern.prototype.addStream = function (speed, angleOffset, angularVelocity, delay, lifetime) {
        if (typeof lifetime === "undefined") { lifetime = 120; }
        this.streams.push(new BulletStream(speed, angleOffset, angularVelocity, delay, lifetime));
        return this;
    };

    BulletPattern.prototype.shoot = function (position, angle, platformVelocity) {
        for (var i = 0, len = this.streams.length; i < len; ++i) {
            this.streams[i].shoot(position, angle, platformVelocity);
        }
        return this.fireDelay;
    };
    return BulletPattern;
})();

var Armory = (function () {
    function Armory() {
        this.patterns = [];
    }
    Armory.prototype.addPattern = function (pattern) {
        this.patterns.push(pattern);
        return this;
    };

    Armory.prototype.shoot = function (patternIndex, position, angle, platformVelocity) {
        if (this.patterns[patternIndex] != null) {
            return this.patterns[patternIndex].shoot(position, angle, platformVelocity);
        }
    };
    return Armory;
})();

function buildStandardArmory() {
    return new Armory().addPattern(new BulletPattern(0.1).addStream(900, 0, 0, 0).addStream(900, -2, -1, 0.025).addStream(900, 2, 1, 0.025)).addPattern(new BulletPattern(0.05).addStream(900, 0, 0, 0).addStream(500, -2, -100, 0, 2).addStream(500, 2, 100, 0, 2));
}
//# sourceMappingURL=armory.js.map
