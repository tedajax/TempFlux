var BulletStreamType;
(function (BulletStreamType) {
    BulletStreamType[BulletStreamType["Bullet"] = 0] = "Bullet";
    BulletStreamType[BulletStreamType["Missile"] = 1] = "Missile";
})(BulletStreamType || (BulletStreamType = {}));

var BulletStream = (function () {
    function BulletStream(speed, angleOffset, angularVelocity, angleOscillation, angleOscillationRate, delay, lifetime, type, shootSkips) {
        if (typeof type === "undefined") { type = 0 /* Bullet */; }
        if (typeof shootSkips === "undefined") { shootSkips = 0; }
        this.speed = speed;
        this.angleOffset = angleOffset;
        this.angularVelocity = angularVelocity;
        this.angleOscillation = angleOscillation;
        this.angleOscillationRate = angleOscillationRate;
        this.delay = delay;
        this.lifetime = lifetime;
        this.type = type;
        this.shootSkips = shootSkips;
        this.currentSkipCount = 0;
    }
    BulletStream.prototype.getTexture = function () {
        switch (this.type) {
            default:
            case 0 /* Bullet */:
                return game.textures.getTexture("player_bullet");
                break;

            case 1 /* Missile */:
                return game.textures.getTexture("missile");
                break;
        }
    };

    BulletStream.prototype.shoot = function (position, angle, platformVelocity) {
        var _this = this;
        if (++this.currentSkipCount > this.shootSkips) {
            this.currentSkipCount = 0;
        } else {
            return;
        }

        setTimeout(function () {
            var w = 24;
            var h = 12;

            if (_this.type == 1 /* Missile */) {
                w = 48;
                h = 24;
            }

            var sprite = new Sprite(w, h);
            sprite.position.xy = position.xy;
            sprite.position.x += w / 2;
            sprite.position.y += h / 2;
            sprite.rotation.z = (angle + _this.angleOffset) * Util.deg2Rad;
            sprite.setShader(game.spriteShader);
            sprite.setTexture(_this.getTexture());
            sprite.alpha = true;
            var go = new GameObject(null, null, "Bullet", sprite);
            go.tag = 2 /* Bullet */;

            switch (_this.type) {
                default:
                case 0 /* Bullet */:
                    var bulletController = new BulletController(null);
                    bulletController.platformVelocity = platformVelocity;
                    bulletController.position.xy = position.xy;
                    bulletController.position.x += w / 2;
                    bulletController.position.y += h / 2;
                    bulletController.speed = _this.speed;
                    bulletController.angle = angle + _this.angleOffset + Math.sin(game.elapsedTime * _this.angleOscillationRate) * _this.angleOscillation;
                    bulletController.angularVelocity = _this.angularVelocity;
                    bulletController.lifetime = _this.lifetime;
                    bulletController.posess(go);
                    break;

                case 1 /* Missile */:
                    var missileController = new MissileController(null);
                    missileController.position.xy = position.xy;
                    missileController.position.x += w / 2;
                    missileController.position.y += h / 2;
                    missileController.speed = _this.speed;
                    missileController.angle = angle + _this.angleOffset + Math.sin(game.elapsedTime * _this.angleOscillationRate) * _this.angleOscillation;
                    missileController.lifetime = _this.lifetime;
                    missileController.posess(go);
                    break;
            }

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
    BulletPattern.prototype.addStream = function (speed, angleOffset, angularVelocity, angleOscillation, angleOscillationRate, delay, lifetime, type, shootSkips) {
        if (typeof lifetime === "undefined") { lifetime = 120; }
        if (typeof type === "undefined") { type = 0 /* Bullet */; }
        if (typeof shootSkips === "undefined") { shootSkips = 0; }
        this.streams.push(new BulletStream(speed, angleOffset, angularVelocity, angleOscillation, angleOscillationRate, delay, lifetime, type, shootSkips));
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
    return new Armory().addPattern(new BulletPattern(0.1).addStream(900, 0, 0, 8, 10, 0, 100, 0 /* Bullet */).addStream(900, -2, 0, 8, 10, 0.025).addStream(900, 2, 0, 8, 10, 0.025).addStream(500, 4, 0, 0, 0, 0, 10, 1 /* Missile */, 5).addStream(500, -4, 0, 0, 0, 0, 10, 1 /* Missile */, 5)).addPattern(new BulletPattern(0.05).addStream(900, 0, 0, 0, 0, 0).addStream(500, -2, -100, 0, 0, 0, 2).addStream(500, 2, 100, 0, 0, 0, 2)).addPattern(new BulletPattern(0.05).addStream(900, -2, -300, 0, 0, 0, 0.5).addStream(900, 2, 300, 0, 0, 0, 0.5).addStream(900, -4, -600, 0, 0, 0, 0.5).addStream(900, 4, 600, 0, 0, 0, 0.5));
}
//# sourceMappingURL=armory.js.map
