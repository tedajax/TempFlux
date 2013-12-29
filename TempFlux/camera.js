/// <reference path="tsm-0.7.d.ts" />
var Camera2D = (function () {
    function Camera2D() {
        this.position = new TSM.vec3([0, 0, 1]);
        this.lookAt = new TSM.vec3([0, 0, 0]);
        this.up = new TSM.vec3([0, 1, 0]);

        this.positionToFollow = new TSM.vec3([0, 0, 0]);
    }
    Camera2D.prototype.update = function (dt) {
        if (this.gameObjectToFollow != null) {
            this.positionToFollow.xyz = this.gameObjectToFollow.position.xyz;
            this.positionToFollow.x -= game.width / 2;
            this.positionToFollow.y -= game.height / 2;
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
    return Camera2D;
})();
//# sourceMappingURL=camera.js.map
