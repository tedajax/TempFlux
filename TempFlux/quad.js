var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Sprite = (function (_super) {
    __extends(Sprite, _super);
    function Sprite(width, height) {
        if (typeof width === "undefined") { width = Sprite.defaultWidth; }
        if (typeof height === "undefined") { height = Sprite.defaultHeight; }
        _super.call(this);

        this.alpha = false;

        this.width = width;
        this.height = height;

        this.bindTexture = true;
    }
    Sprite.prototype.setTexture = function (texture) {
        this.texture = texture;
    };

    Sprite.prototype.setBindTexture = function (bind) {
        this.bindTexture = bind;
    };

    Sprite.prototype.render = function () {
        game.gl.useProgram(this.shader.program);

        var spriteShader = this.shader;
        spriteShader.worldMatrix = this.buildWorldMatrix();
        spriteShader.objectDrawSetup();
        if (this.bindTexture) {
            spriteShader.texture = this.texture;
            spriteShader.bindTexture();
        }

        if (this.alpha) {
            game.gl.blendFunc(game.gl.SRC_ALPHA, game.gl.ONE_MINUS_SRC_ALPHA);
            game.gl.enable(game.gl.BLEND);
        }

        game.gl.bindBuffer(game.gl.ARRAY_BUFFER, this.vertexBuffer.glBuffer);
        game.gl.vertexAttribPointer(this.shader.attribs["position"], this.vertexBuffer.itemSize, game.gl.FLOAT, false, 0, 0);

        game.gl.bindBuffer(game.gl.ARRAY_BUFFER, this.texCoordBuffer.glBuffer);
        game.gl.vertexAttribPointer(this.shader.attribs["uv"], this.texCoordBuffer.itemSize, game.gl.FLOAT, false, 0, 0);

        game.gl.bindBuffer(game.gl.ARRAY_BUFFER, this.colorBuffer.glBuffer);
        game.gl.vertexAttribPointer(this.shader.attribs["color"], this.colorBuffer.itemSize, game.gl.FLOAT, false, 0, 0);

        game.gl.bindBuffer(game.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer.glBuffer);
        game.gl.drawElements(game.gl.TRIANGLES, this.indexBuffer.count, game.gl.UNSIGNED_SHORT, 0);
    };
    Sprite.defaultWidth = 1;
    Sprite.defaultHeight = 1;
    return Sprite;
})(Renderable);
//# sourceMappingURL=quad.js.map
