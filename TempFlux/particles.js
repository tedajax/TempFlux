var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Particle = (function (_super) {
    __extends(Particle, _super);
    function Particle() {
        _super.apply(this, arguments);
        this.particleId = 0;
        this.lifetime = 0;
        this.direction = TSM.vec3.zero;
        this.speed = 10;
        this.angularVelocity = 0;
        this.shouldDestroy = false;
    }
    Particle.prototype.start = function () {
        this.startLifetime = this.lifetime;
    };

    Particle.prototype.update = function (dt) {
        this.lifetime -= dt;
        if (this.lifetime < 0) {
            this.shouldDestroy = true;
        }

        this.tintColor[3] = this.lifetime / this.startLifetime;

        this.position.x += this.direction.x * this.speed * dt;
        this.position.y += this.direction.y * this.speed * dt;

        this.rotation.z += (this.angularVelocity * Util.deg2Rad) * dt;
    };
    return Particle;
})(Sprite);

var ParticleEmitter = (function () {
    function ParticleEmitter(lifetime, texture) {
        this.emitterId = 0;
        this.currentParticleId = 0;
        this.emissionRate = 2;
        this.emitTimer = 0;
        this.particlesPerEmission = 5;
        this.emissionAngle = 0;
        this.emissionAngleWidth = 360;
        this.emissionRadius = 0;
        this.startSpeed = 50;
        this.startLifetime = 1;
        this.lifetime = 0;
        this.shouldDestroy = false;
        this.particleCount = 0;
        this.position = new TSM.vec3([0, 0, 0]);
        this.scale = new TSM.vec2([0.5, 0.5]);
        this.particleTexture = texture;
        this.particles = {};
        this.removeQueue = [];

        this.lifetime = lifetime;
    }
    ParticleEmitter.prototype.createParticle = function () {
        var particle = new Particle(this.particleTexture.image.width * this.scale.x, this.particleTexture.image.height * this.scale.y);
        particle.setShader(game.spriteShader);
        particle.bindTexture = true;
        particle.alpha = true;
        particle.texture = this.particleTexture;
        particle.position = this.getParticleStartPosition();
        particle.direction = this.getParticleStartDirection();
        particle.speed = this.startSpeed;
        particle.lifetime = this.startLifetime;
        particle.angularVelocity = Util.randomRangeF(-50, 50);
        particle.start();

        var particleId = this.currentParticleId++;

        particle.particleId = particleId;
        this.particles[particleId] = particle;
        this.particleCount++;
    };

    ParticleEmitter.prototype.getParticleStartPosition = function () {
        var result = new TSM.vec3([0, 0, 0]);

        var angle = Util.randomRangeF(this.emissionAngle - this.emissionAngleWidth / 2, this.emissionAngle + this.emissionAngleWidth / 2);
        var radius = Util.randomRangeF(0, this.emissionRadius);
        var mx = Math.cos(angle * Util.deg2Rad) * radius;
        var my = Math.sin(angle * Util.deg2Rad) * radius;

        result.xyz = this.position.xyz;
        result.x += mx;
        result.y += my;

        return result;
    };

    ParticleEmitter.prototype.getParticleStartDirection = function () {
        var angle = Util.randomRangeF(this.emissionAngle - this.emissionAngleWidth / 2, this.emissionAngle + this.emissionAngleWidth / 2);
        var dx = Math.cos(angle * Util.deg2Rad);
        var dy = Math.sin(angle * Util.deg2Rad);

        return new TSM.vec3([dx, dy, 0]);
    };

    ParticleEmitter.prototype.update = function (dt) {
        if (this.lifetime > 0) {
            this.lifetime -= dt;
        }

        for (var i in this.particles) {
            this.particles[i].update(dt);
            if (this.particles[i].shouldDestroy) {
                this.removeQueue.push(i);
            }
        }

        while (this.removeQueue.length > 0) {
            delete this.particles[this.removeQueue.pop()];
            this.particleCount--;
        }

        if (this.lifetime <= 0) {
            if (this.particleCount <= 0) {
                this.shouldDestroy = true;
            }
            return;
        }

        this.emitTimer -= dt;
        if (this.emitTimer <= 0) {
            this.emitTimer = 1 / this.emissionRate;

            for (var p = 0; p < this.particlesPerEmission; ++p) {
                this.createParticle();
            }
        }
    };

    ParticleEmitter.prototype.render = function () {
        var particleArray = [];
        for (var i in this.particles) {
            particleArray.push(this.particles[i]);
        }

        for (var p = particleArray.length - 1; p >= 0; --p) {
            particleArray[p].render();
        }
    };
    return ParticleEmitter;
})();

var ParticleEmitterManager = (function () {
    function ParticleEmitterManager() {
        this.currentEmitterId = 0;
        this.emitters = {};
        this.removeQueue = [];
    }
    ParticleEmitterManager.prototype.createEmitter = function (lifetime, texture) {
        var emitterId = this.currentEmitterId++;
        var emitter = new ParticleEmitter(lifetime, texture);
        this.emitters[emitterId] = emitter;
        return emitter;
    };

    ParticleEmitterManager.prototype.update = function (dt) {
        for (var i in this.emitters) {
            var e = this.emitters[i];
            e.update(dt);
            if (e.shouldDestroy) {
                this.removeQueue.push(i);
            }
        }

        while (this.removeQueue.length > 0) {
            delete this.emitters[this.removeQueue.pop()];
        }
    };

    ParticleEmitterManager.prototype.render = function () {
        for (var i in this.emitters) {
            this.emitters[i].render();
        }
    };
    return ParticleEmitterManager;
})();
//# sourceMappingURL=particles.js.map
