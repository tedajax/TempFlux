/// <reference path="WebGL.d.ts" />
/// <reference path="tsm-0.7.d.ts" />
var Renderable = (function () {
    function Renderable(depth) {
        if (typeof depth === "undefined") { depth = 0; }
        this.position = new TSM.vec3([0, 0, 0]);
        this.origin = new TSM.vec2([0, 0]);
        this.scale = new TSM.vec2([1, 1]);
        this.rotation = new TSM.vec3([0, 0, 0]);
        this.depth = depth;
    }
    Renderable.prototype.setShader = function (shader) {
        this.shader = shader;
    };

    Renderable.prototype.hide = function () {
        this.hidden = true;
    };

    Renderable.prototype.show = function () {
        this.hidden = false;
    };

    Renderable.prototype.requestRender = function () {
        if (!this.hidden) {
            render();
        }
    };

    Renderable.prototype.render = function () {
    };

    Renderable.prototype.buildWorldMatrix = function () {
        var scale = new TSM.mat4().setIdentity();
        scale.scale(new TSM.vec3([this.scale.x, this.scale.y, 1]));

        var rotation = new TSM.mat4().setIdentity();
        rotation.rotate(this.rotation.z, TSM.vec3.forward);

        var translation = new TSM.mat4().setIdentity();
        translation.translate(new TSM.vec3([this.position.x - this.origin.x, this.position.y - this.origin.y, this.position.z]));

        var origin = new TSM.mat4().setIdentity();
        origin.translate(new TSM.vec3([-this.origin.x, -this.origin.y, 0]));

        return translation.multiply(rotation.multiply(scale.multiply(origin)));
    };
    return Renderable;
})();
//# sourceMappingURL=renderable.js.map
