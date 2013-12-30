class RenderManager {
    lastVertexBuffer: RenderBuffer;
    lastColorBuffer: RenderBuffer;
    lastTexCoordBuffer: RenderBuffer;
    lastIndexBuffer: RenderBuffer;

    alphaEnabled: boolean;

    constructor() {
        this.lastVertexBuffer = null;
        this.lastColorBuffer = null;
        this.lastTexCoordBuffer = null;
        this.lastIndexBuffer = null;

        this.alphaEnabled = false;
        game.gl.blendEquation(game.gl.FUNC_ADD);
        game.gl.blendFunc(game.gl.SRC_ALPHA, game.gl.ONE_MINUS_SRC_ALPHA);

        game.gl.enable(game.gl.CULL_FACE);
        game.gl.cullFace(game.gl.FRONT);

        game.gl.enable(game.gl.DEPTH_TEST);
        game.gl.depthFunc(game.gl.LEQUAL);
    }

    setAlpha(alpha: boolean) {
        if (this.alphaEnabled != alpha) {
            this.alphaEnabled = alpha;
            if (this.alphaEnabled) {
                game.gl.enable(game.gl.BLEND);
            } else {
                game.gl.disable(game.gl.BLEND);
            }
        } 
    }

    render(shader: Shader, verts: RenderBuffer, colors: RenderBuffer, texCoords: RenderBuffer, indices: RenderBuffer) {
        if (this.lastVertexBuffer == null || this.lastVertexBuffer.id != verts.id) {
            game.gl.bindBuffer(game.gl.ARRAY_BUFFER, verts.glBuffer);
            game.gl.vertexAttribPointer(shader.attribs["position"],
                verts.itemSize,
                game.gl.FLOAT,
                false,
                0, 0);
            this.lastVertexBuffer = verts;
        }

        if (this.lastColorBuffer == null || this.lastColorBuffer.id != colors.id) {
            game.gl.bindBuffer(game.gl.ARRAY_BUFFER, colors.glBuffer);
            game.gl.vertexAttribPointer(shader.attribs["color"],
                colors.itemSize,
                game.gl.FLOAT,
                false,
                0, 0);
            this.lastColorBuffer = colors;
        }

        if (this.lastTexCoordBuffer == null || this.lastTexCoordBuffer.id != texCoords.id) {
            game.gl.bindBuffer(game.gl.ARRAY_BUFFER, texCoords.glBuffer);
            game.gl.vertexAttribPointer(shader.attribs["uv"],
                texCoords.itemSize,
                game.gl.FLOAT,
                false,
                0, 0);
            this.lastTexCoordBuffer = texCoords;
        }

        if (this.lastIndexBuffer == null || this.lastIndexBuffer.id != indices.id) {
            game.gl.bindBuffer(game.gl.ELEMENT_ARRAY_BUFFER, indices.glBuffer);
            this.lastIndexBuffer = indices;
        }

        game.gl.drawElements(game.gl.TRIANGLES, indices.count, game.gl.UNSIGNED_SHORT, 0);
    }
} 