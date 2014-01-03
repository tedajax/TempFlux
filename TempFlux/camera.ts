/// <reference path="tsm-0.7.d.ts" />

class Camera2D {
    position: TSM.vec3;
    lookAt: TSM.vec3;
    up: TSM.vec3;
    followOffset: TSM.vec2;
    gameObjectToFollow: GameObject;
    positionToFollow: TSM.vec3;
    positionOffset: TSM.vec3;

    shakeOffset: TSM.vec2;
    shakeTime: number;
    shakeMagnitude: TSM.vec2;

    kickOffset: TSM.vec2;
    
    constructor() {
        this.position = new TSM.vec3([0, 0, 1]);
        this.lookAt = new TSM.vec3([0, 0, 0]);
        this.up = new TSM.vec3([0, 1, 0]);

        this.shakeOffset = new TSM.vec2([0, 0]);
        this.shakeMagnitude = new TSM.vec2([0, 0]);

        this.kickOffset = new TSM.vec2([0, 0]);

        this.positionToFollow = new TSM.vec3([0, 0, 0]);
    }

    update(dt: number) {
        if (this.gameObjectToFollow != null) {
            this.positionToFollow.xyz = this.gameObjectToFollow.position.xyz;
            this.positionToFollow.x -= game.width / 2;
            this.positionToFollow.y -= game.height / 2;

            var mx = game.input.getMouseX() - game.width / 2;
            var my = game.input.getMouseY() - game.height / 2;

            this.positionToFollow.x += mx / 4;
            this.positionToFollow.y += my / 4;

            if (this.shakeTime > 0) {
                this.shakeTime -= dt;

                this.shakeOffset.x = Util.randomRangeF(-this.shakeMagnitude.x, this.shakeMagnitude.x);
                this.shakeOffset.y = Util.randomRangeF(-this.shakeMagnitude.y, this.shakeMagnitude.y);

                this.positionToFollow.x += this.shakeOffset.x;
                this.positionToFollow.y += this.shakeOffset.y;
            }

            this.positionToFollow.x += this.kickOffset.x;
            this.positionToFollow.y += this.kickOffset.y;

            this.kickOffset.x = 0;
            this.kickOffset.y = 0;
        }

        this.position.xy = this.positionToFollow.xy;
        this.lookAt.xy = this.position.xy;
        this.lookAt.z = 0;        
    }

    getProjectionMatrix() {
        return TSM.mat4.orthographic(0, game.width, game.height, 0, 0, 100);
    }

    getViewMatrix() {
        return TSM.mat4.lookAt(this.position,
            this.lookAt,
            this.up);
    }

    getFrozenViewMatrix() {
        return TSM.mat4.lookAt(TSM.vec3.forward,
            TSM.vec3.zero,
            this.up);
    }

    shake(time: number, magX: number, magY: number = magX) {
        this.shakeMagnitude.x = magX;
        this.shakeMagnitude.y = magY;
        this.shakeTime = time; 
    }

    kick(angle: number, magnitude: number) {
        angle += Math.PI;
        this.kickOffset.x = Math.cos(angle) * magnitude;
        this.kickOffset.y = Math.sin(angle) * magnitude;
    }
} 