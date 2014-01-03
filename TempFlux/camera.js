/// <reference path="tsm-0.7.d.ts" />
var Camera2D = (function () {
    function Camera2D() {
        this.position = new TSM.vec3([0, 0, 1]);
        this.lookAt = new TSM.vec3([0, 0, 0]);
        this.up = new TSM.vec3([0, 1, 0]);

        this.shakeOffset = new TSM.vec2([0, 0]);
        this.shakeMagnitude = new TSM.vec2([0, 0]);

        this.kickOffset = new TSM.vec2([0, 0]);

        this.positionToFollow = new TSM.vec3([0, 0, 0]);
    }
    Camera2D.prototype.update = function (dt) {
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
    };

    Camera2D.prototype.getProjectionMatrix = function () {
        return TSM.mat4.orthographic(0, game.width, game.height, 0, 0, 100);
    };

    Camera2D.prototype.getViewMatrix = function () {
        return TSM.mat4.lookAt(this.position, this.lookAt, this.up);
    };

    Camera2D.prototype.getFrozenViewMatrix = function () {
        return TSM.mat4.lookAt(TSM.vec3.forward, TSM.vec3.zero, this.up);
    };

    Camera2D.prototype.shake = function (time, magX, magY) {
        if (typeof magY === "undefined") { magY = magX; }
        this.shakeMagnitude.x = magX;
        this.shakeMagnitude.y = magY;
        this.shakeTime = time;
    };

    Camera2D.prototype.kick = function (angle, magnitude) {
        angle += Math.PI;
        this.kickOffset.x = Math.cos(angle) * magnitude;
        this.kickOffset.y = Math.sin(angle) * magnitude;
    };
    return Camera2D;
})();
//# sourceMappingURL=camera.js.map
