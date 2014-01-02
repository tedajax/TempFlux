var BulletStream = (function () {
    function BulletStream(speed, angleOffset, angularVelocity, lifetime) {
        this.speed = speed;
        this.angleOffset = angleOffset;
        this.angularVelocity = angularVelocity;
        this.lifetime = lifetime;
    }
    BulletStream.prototype.shoot = function (position, angle) {
        var sprite = new Sprite(8, 8);
        sprite.position.xy = position.xy;
        sprite.setShader(game.spriteShader);
        sprite.setTexture(game.textures.getTexture("player_bullet"));
        sprite.alpha = true;
        var go = new GameObject(null, null, "Bullet", sprite);
        go.tag = "bullet";
        var bulletController = new BulletController(null);
        bulletController.position.xy = position.xy;
        bulletController.speed = this.speed;
        bulletController.angle = angle + this.angleOffset;
        bulletController.angularVelocity = this.angularVelocity;
        bulletController.lifetime = this.lifetime;
        bulletController.posess(go);

        game.gameObjects.add(go);
        go.addCircleCollider();
    };
    return BulletStream;
})();

var BulletPattern = (function () {
    function BulletPattern() {
        this.streams = [];
    }
    BulletPattern.prototype.addStream = function (speed, angleOffset, angularVelocity, lifetime) {
        if (typeof lifetime === "undefined") { lifetime = 120; }
        this.streams.push(new BulletStream(speed, angleOffset, angularVelocity, lifetime));
    };

    BulletPattern.prototype.shoot = function (position, angle) {
        for (var i = 0, len = this.streams.length; i < len; ++i) {
            this.streams[i].shoot(position, angle);
        }
    };
    return BulletPattern;
})();
//# sourceMappingURL=bulletpattern.js.map
