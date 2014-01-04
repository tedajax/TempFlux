class BulletStream {
    speed: number;
    angleOffset: number;
    angularVelocity: number;
    angleOscillation: number;
    angleOscillationRate: number;
    delay: number;
    lifetime: number;
    
    constructor(speed: number, angleOffset: number, angularVelocity: number, angleOscillation: number, angleOscillationRate: number, delay: number, lifetime: number) {
        this.speed = speed;
        this.angleOffset = angleOffset;
        this.angularVelocity = angularVelocity;
        this.angleOscillation = angleOscillation;
        this.angleOscillationRate = angleOscillationRate;
        this.delay = delay;
        this.lifetime = lifetime;
    }

    shoot(position: TSM.vec2, angle: number, platformVelocity: TSM.vec2) {
        
        setTimeout(() => {
            var sprite = new Sprite(24, 12);
            sprite.position.xy = position.xy;
            sprite.position.x += 6;
            sprite.position.y += 3;
            sprite.rotation.z = (angle + this.angleOffset) * Util.rad2Deg;
            sprite.setShader(game.spriteShader);
            sprite.setTexture(game.textures.getTexture("player_bullet"));
            sprite.alpha = true;
            var go = new GameObject(null, null, "Bullet", sprite);
            go.tag = GameObjectTag.Bullet;
            var bulletController = new BulletController(null);
            bulletController.platformVelocity = platformVelocity;
            bulletController.position.xy = position.xy;
            bulletController.position.x += 6;
            bulletController.position.y += 3;
            bulletController.speed = this.speed;
            bulletController.angle = angle + this.angleOffset + Math.sin(game.elapsedTime * this.angleOscillationRate) * this.angleOscillation;
            bulletController.angularVelocity = this.angularVelocity;
            bulletController.lifetime = this.lifetime;
            bulletController.posess(go);

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

    addStream(speed: number, angleOffset: number, angularVelocity: number, angleOscillation: number, angleOscillationRate: number, delay: number, lifetime: number = 120) {
        this.streams.push(new BulletStream(speed, angleOffset, angularVelocity, angleOscillation, angleOscillationRate, delay, lifetime));
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
        new BulletPattern(0.1).addStream(900, 0, 0, 8, 10, 0).
            addStream(900, -2, 0, 8, 10, 0.025).
            addStream(900, 2, 0, 8, 10, 0.025)
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