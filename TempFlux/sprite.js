var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Sprite = (function (_super) {
    __extends(Sprite, _super);
    function Sprite(width, height, tx, ty, ox, oy) {
        if (typeof width === "undefined") { width = Sprite.defaultWidth; }
        if (typeof height === "undefined") { height = Sprite.defaultHeight; }
        if (typeof tx === "undefined") { tx = 1; }
        if (typeof ty === "undefined") { ty = 1; }
        if (typeof ox === "undefined") { ox = 0.5; }
        if (typeof oy === "undefined") { oy = 0.5; }
        _super.call(this);

        this.mesh = game.meshFactory.createQuad(width, height, tx, ty);

        this.alpha = false;
        this.tintColor = new Float32Array([1, 1, 1, 1]);
        this.addColor = new Float32Array([0, 0, 0, 0]);

        this.width = width;
        this.height = height;

        this.scale.x = 1;
        this.scale.y = 1;

        this.origin = new TSM.vec2([this.width * ox, this.height * oy]);

        this.bindTexture = true;
    }
    Sprite.prototype.setTexture = function (texture) {
        this.texture = texture;
    };

    Sprite.prototype.setBindTexture = function (bind) {
        this.bindTexture = bind;
    };

    Sprite.prototype.render = function () {
        var spriteShader = this.shader;
        spriteShader.tintColor = this.tintColor;
        spriteShader.addColor = this.addColor;
        spriteShader.worldMatrix = this.buildWorldMatrix();
        spriteShader.objectDrawSetup();
        if (this.bindTexture) {
            spriteShader.texture = this.texture;
            spriteShader.bindTexture();
        }

        game.renderer.setAlpha(this.alpha);

        this.mesh.render(this.shader);
    };
    Sprite.defaultWidth = 1;
    Sprite.defaultHeight = 1;
    return Sprite;
})(Renderable);
//# sourceMappingURL=sprite.js.map
