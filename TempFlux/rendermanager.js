var RenderManager = (function () {
    function RenderManager() {
        this.lastBoundVertexBuffer = null;
        this.lastBoundColorBuffer = null;
        this.lastBoundTexCoordBuffer = null;
        this.lastBoundIndexBuffer = null;

        this.alphaEnabled = false;
        game.gl.blendEquation(game.gl.FUNC_ADD);
        game.gl.blendFunc(game.gl.SRC_ALPHA, game.gl.ONE_MINUS_SRC_ALPHA);

        game.gl.enable(game.gl.CULL_FACE);
        game.gl.cullFace(game.gl.FRONT);

        game.gl.enable(game.gl.DEPTH_TEST);
        game.gl.depthFunc(game.gl.LEQUAL);
    }
    RenderManager.prototype.setAlpha = function (alpha) {
        if (this.alphaEnabled != alpha) {
            this.alphaEnabled = alpha;
            if (this.alphaEnabled) {
                game.gl.enable(game.gl.BLEND);
            } else {
                game.gl.disable(game.gl.BLEND);
            }
        }
    };

    RenderManager.prototype.render = function (shader, verts, colors, texCoords, indices) {
        if (this.lastBoundVertexBuffer == null || this.lastBoundVertexBuffer.id != verts.id) {
            game.gl.bindBuffer(game.gl.ARRAY_BUFFER, verts.glBuffer);
            game.gl.vertexAttribPointer(shader.attribs["position"], verts.itemSize, game.gl.FLOAT, false, 0, 0);
            this.lastBoundVertexBuffer = verts;
        }

        if (this.lastBoundColorBuffer == null || this.lastBoundColorBuffer.id != colors.id) {
            game.gl.bindBuffer(game.gl.ARRAY_BUFFER, colors.glBuffer);
            game.gl.vertexAttribPointer(shader.attribs["color"], colors.itemSize, game.gl.FLOAT, false, 0, 0);
            this.lastBoundColorBuffer = colors;
        }

        if (this.lastBoundTexCoordBuffer == null || this.lastBoundTexCoordBuffer.id != texCoords.id) {
            game.gl.bindBuffer(game.gl.ARRAY_BUFFER, texCoords.glBuffer);
            game.gl.vertexAttribPointer(shader.attribs["uv"], texCoords.itemSize, game.gl.FLOAT, false, 0, 0);
            this.lastBoundTexCoordBuffer = texCoords;
        }

        if (this.lastBoundIndexBuffer == null || this.lastBoundIndexBuffer.id != indices.id) {
            game.gl.bindBuffer(game.gl.ELEMENT_ARRAY_BUFFER, indices.glBuffer);
            this.lastBoundIndexBuffer = indices;
        }

        game.gl.drawElements(game.gl.TRIANGLES, indices.count, game.gl.UNSIGNED_SHORT, 0);
    };
    return RenderManager;
})();
//# sourceMappingURL=rendermanager.js.map
