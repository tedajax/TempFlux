class Particle extends Sprite {
    particleId: number = 0;

    startLifetime: number;
    lifetime: number = 0;
    direction: TSM.vec3 = TSM.vec3.zero;
    speed: number = 10;
    angularVelocity: number = 0;

    shouldDestroy: boolean = false;

    start() {
        this.startLifetime = this.lifetime;
    }

    update(dt: number) {
        this.lifetime -= dt;
        if (this.lifetime < 0) {
            this.shouldDestroy = true;
        }

        this.tintColor[3] = this.lifetime / this.startLifetime;

        this.position.x += this.direction.x * this.speed * dt;
        this.position.y += this.direction.y * this.speed * dt;

        this.rotation.z += (this.angularVelocity * Util.deg2Rad) * dt;
    }
}

class ParticleEmitter {
    emitterId: number = 0;

    particles: {};
    removeQueue: number[];

    currentParticleId: number = 0;

    particleTexture: ImageTexture;

    position: TSM.vec3;
    scale: TSM.vec2;

    emissionRate: number = 2;
    emitTimer: number = 0;
    particlesPerEmission: number = 5;
    emissionAngle: number = 0;
    emissionAngleWidth: number = 360;
    emissionRadius: number = 0;

    particleStartAngle: number = 0;

    startSpeed: number = 50;

    startLifetime: number = 1;

    lifetime: number = 0;
    shouldDestroy: boolean = false;

    particleCount: number = 0;

    constructor(lifetime: number, texture: ImageTexture, sx: number = 1, sy: number = 1) {
        this.position = new TSM.vec3([0, 0, 0]);
        this.scale = new TSM.vec2([sx, sy]);
        this.particleTexture = texture;
        this.particles = {};
        this.removeQueue = [];

        this.lifetime = lifetime;
    }

    createParticle() {
        var particle = new Particle(this.particleTexture.image.width * this.scale.x, this.particleTexture.image.height * this.scale.y);
        particle.setShader(game.spriteShader);
        particle.bindTexture = true;
        particle.alpha = true;
        particle.texture = this.particleTexture;
        particle.position = this.getParticleStartPosition();
        particle.direction = this.getParticleStartDirection();
        particle.rotation.z = this.particleStartAngle;
        particle.speed = this.startSpeed;
        particle.lifetime = this.startLifetime;
        particle.angularVelocity = Util.randomRangeF(-50, 50);
        particle.start();

        var particleId = this.currentParticleId++;

        particle.particleId = particleId;
        this.particles[particleId] = particle;
        this.particleCount++;
    }

    getParticleStartPosition(): TSM.vec3 {
        var result = new TSM.vec3([0, 0, 0]);

        var angle = Util.randomRangeF(this.emissionAngle - this.emissionAngleWidth / 2, this.emissionAngle + this.emissionAngleWidth / 2);
        var radius = Util.randomRangeF(0, this.emissionRadius);
        var mx = Math.cos(angle * Util.deg2Rad) * radius;
        var my = Math.sin(angle * Util.deg2Rad) * radius;

        result.xyz = this.position.xyz;
        result.x += mx;
        result.y += my;

        return result;
    }

    getParticleStartDirection(): TSM.vec3 {
        var angle = Util.randomRangeF(this.emissionAngle - this.emissionAngleWidth / 2, this.emissionAngle + this.emissionAngleWidth / 2);
        var dx = Math.cos(angle * Util.deg2Rad);
        var dy = Math.sin(angle * Util.deg2Rad);

        return new TSM.vec3([dx, dy, 0]);
    }

    update(dt: number) {
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
    }

    render() {
        var particleArray = [];
        for (var i in this.particles) {
            particleArray.push(this.particles[i]);
        }

        for (var p = particleArray.length - 1; p >= 0; --p) {
            particleArray[p].render();
        }
    }
}

class ParticleEmitterManager {
    emitters: {};
    removeQueue: number[];
    currentEmitterId: number = 0;

    constructor() {
        this.emitters = {};
        this.removeQueue = [];
    }

    createEmitter(lifetime: number, texture: ImageTexture): ParticleEmitter {
        var emitterId = this.currentEmitterId++;
        var emitter = new ParticleEmitter(lifetime, texture);
        this.emitters[emitterId] = emitter;
        return emitter;
    }

    update(dt) {
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
    }

    render() {
        for (var i in this.emitters) {
            this.emitters[i].render();
        }
    }
}