enum BulletStreamType {
    Bullet,
    Missile
}

class BulletStream {
    speed: number;
    angleOffset: number;
    angularVelocity: number;
    angleOscillation: number;
    angleOscillationRate: number;
    delay: number;
    lifetime: number;
    type: BulletStreamType
    shootSkips: number;
    currentSkipCount: number;
    
    constructor(speed: number, angleOffset: number, angularVelocity: number, angleOscillation: number, angleOscillationRate: number, delay: number, lifetime: number, type: BulletStreamType = BulletStreamType.Bullet, shootSkips: number = 0) {
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

    getTexture() {
        switch (this.type) {
            default:
            case BulletStreamType.Bullet:
                return game.textures.getTexture("player_bullet");
                break;

            case BulletStreamType.Missile:
                return game.textures.getTexture("missile");
                break;
        }
    }

    shoot(position: TSM.vec2, angle: number, platformVelocity: TSM.vec2) {
        if (++this.currentSkipCount > this.shootSkips) {
            this.currentSkipCount = 0;
        } else {
            return;
        }

        setTimeout(() => {
            var w = 24;
            var h = 12;

            if (this.type == BulletStreamType.Missile) {
                w = 48;
                h = 12;
            }

            var sprite = new Sprite(w, h);
            sprite.position.xy = position.xy;
            sprite.position.x += w / 2;
            sprite.position.y += h / 2;
            sprite.rotation.z = (angle + this.angleOffset) * Util.deg2Rad;
            sprite.setShader(game.spriteShader);
            sprite.setTexture(this.getTexture());
            sprite.alpha = true;
            var go = new GameObject(null, null, "Bullet", sprite);
            go.tag = GameObjectTag.Bullet;

            switch (this.type) {
                default:
                case BulletStreamType.Bullet:
                    var bulletController = new BulletController(null);
                    bulletController.platformVelocity = platformVelocity;
                    bulletController.position.xy = position.xy;
                    bulletController.position.x += w / 2;
                    bulletController.position.y += h / 2;
                    bulletController.speed = this.speed;
                    bulletController.angle = angle + this.angleOffset + Math.sin(game.elapsedTime * this.angleOscillationRate) * this.angleOscillation;
                    bulletController.angularVelocity = this.angularVelocity;
                    bulletController.lifetime = this.lifetime;
                    bulletController.posess(go);
                    break;

                case BulletStreamType.Missile:
                    var missileController = new MissileController(null);
                    missileController.position.xy = position.xy;
                    missileController.position.x += w / 2;
                    missileController.position.y += h / 2;
                    missileController.speed = this.speed;
                    missileController.angle = angle + this.angleOffset + Math.sin(game.elapsedTime * this.angleOscillationRate) * this.angleOscillation;
                    missileController.lifetime = this.lifetime;
                    missileController.posess(go);
                    break;
            }

            game.gameObjects.add(go);
            go.addCircleCollider();
        }, this.delay * 1000);
    }
}

class BulletPattern {
    streams: BulletStream[];
    fireDelay: number;

    constructor(fireDelay: number) {
        this.streams = [];
        this.fireDelay = fireDelay;
    }

    addStream(speed: number, angleOffset: number, angularVelocity: number, angleOscillation: number, angleOscillationRate: number, delay: number, lifetime: number = 120, type: BulletStreamType = BulletStreamType.Bullet, shootSkips: number = 0) {
        this.streams.push(new BulletStream(speed, angleOffset, angularVelocity, angleOscillation, angleOscillationRate, delay, lifetime, type, shootSkips));
        return this;
    }

    shoot(position: TSM.vec2, angle: number, platformVelocity: TSM.vec2) {
        for (var i = 0, len = this.streams.length; i < len; ++i) {
            this.streams[i].shoot(position, angle, platformVelocity);
        }
        return this.fireDelay;
    }
}

class Armory {
    patterns: BulletPattern[];

    constructor() {
        this.patterns = [];
    }

    addPattern(pattern: BulletPattern) {
        this.patterns.push(pattern);
        return this;
    }

    shoot(patternIndex: number, position: TSM.vec2, angle: number, platformVelocity: TSM.vec2) {
        if (this.patterns[patternIndex] != null) {
            return this.patterns[patternIndex].shoot(position, angle, platformVelocity);
        }
    }
}

function buildStandardArmory() {
    return new Armory().addPattern(
        new BulletPattern(0.1).addStream(900, 0, 0, 8, 10, 0, 100, BulletStreamType.Bullet).
            addStream(900, -2, 0, 8, 10, 0.025).
            addStream(900, 2, 0, 8, 10, 0.025).
            addStream(500, 4, 0, 0, 0, 0, 10, BulletStreamType.Missile, 5).
            addStream(500, -4, 0, 0, 0, 0, 10, BulletStreamType.Missile, 5)
        ).addPattern(
        new BulletPattern(0.05).addStream(900, 0, 0, 0, 0, 0).
            addStream(500, -2, -100, 0, 0, 0, 2).
            addStream(500, 2, 100, 0, 0, 0, 2)
        ).addPattern(
        new BulletPattern(0.05).addStream(900, -2, -300, 0, 0, 0, 0.5).
            addStream(900, 2, 300, 0, 0, 0, 0.5).
            addStream(900, -4, -600, 0, 0, 0, 0.5).
            addStream(900, 4, 600, 0, 0, 0, 0.5)
        );
}