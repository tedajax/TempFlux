/// <reference path="tsm-0.7.d.ts" />

class Camera2D {
    position: TSM.vec3;
    lookAt: TSM.vec3;
    up: TSM.vec3;
    followOffset: TSM.vec2;
    gameObjectToFollow: GameObject;
    positionToFollow: TSM.vec3;
    positionOffset: TSM.vec3;
    
    constructor() {
        this.position = new TSM.vec3([0, 0, 1]);
        this.lookAt = new TSM.vec3([0, 0, 0]);
        this.up = new TSM.vec3([0, 1, 0]);

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
} 