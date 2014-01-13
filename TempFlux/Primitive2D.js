var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Primitive2D = (function (_super) {
    __extends(Primitive2D, _super);
    function Primitive2D() {
        _super.call(this);

        this.points = [];
        this.color = new Float32Array([1, 1, 1, 1]);
        //this.setShader(game.lineShader);
    }
    Primitive2D.prototype.addPoint = function (point) {
        this.points.push(point);
    };

    Primitive2D.prototype.rebuildMesh = function () {
        this.mesh = game.meshFactory.createPolygonMesh(this.points);
    };

    Primitive2D.prototype.render = function () {
        if (this.hidden) {
            return;
        }

        var lineShader = this.shader;
        lineShader.color = this.color;
        lineShader.worldMatrix = this.buildWorldMatrix();
        lineShader.objectDrawSetup();

        this.mesh.render(this.shader);
    };
    return Primitive2D;
})(Renderable);
//# sourceMappingURL=primitive2d.js.map
