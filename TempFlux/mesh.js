var RenderBuffer = (function () {
    function RenderBuffer() {
    }
    RenderBuffer.prototype.clear = function () {
        if (this.glBuffer != null) {
            game.gl.deleteBuffer(this.glBuffer);
        }
        this.count = 0;
        this.itemSize = 0;
    };
    return RenderBuffer;
})();

var Mesh = (function () {
    function Mesh() {
        this.vertexBuffer = new RenderBuffer();
        this.indexBuffer = new RenderBuffer();
        this.colorBuffer = new RenderBuffer();
        this.texCoordBuffer = new RenderBuffer();
    }
    Mesh.prototype.createBuffer = function (buffer, data, bufferType, drawMode, itemSize) {
        buffer.id = Mesh.currentBufferId++;
        buffer.glBuffer = game.gl.createBuffer();
        game.gl.bindBuffer(bufferType, buffer.glBuffer);
        game.gl.bufferData(bufferType, (bufferType === game.gl.ARRAY_BUFFER) ? new Float32Array(data) : new Uint16Array(data), drawMode);
        buffer.itemSize = itemSize;
        buffer.count = data.length / itemSize;
        return buffer;
    };

    Mesh.prototype.buildMesh = function (verts, colors, texCoords, indices) {
        this.setVertices(verts);
        this.setColors(colors);
        this.setTexCoords(texCoords);
        this.setIndices(indices);
    };

    Mesh.prototype.setVertices = function (verts) {
        this.vertexBuffer.clear();

        this.vertices = verts;
        this.createBuffer(this.vertexBuffer, this.vertices, game.gl.ARRAY_BUFFER, game.gl.STATIC_DRAW, 3);
    };

    Mesh.prototype.setColors = function (colors) {
        this.colorBuffer.clear();

        this.colors = colors;
        this.createBuffer(this.colorBuffer, this.colors, game.gl.ARRAY_BUFFER, game.gl.STATIC_DRAW, 4);
    };

    Mesh.prototype.setTexCoords = function (texCoords) {
        this.texCoordBuffer.clear();

        this.texCoords = texCoords;
        this.createBuffer(this.texCoordBuffer, this.texCoords, game.gl.ARRAY_BUFFER, game.gl.STATIC_DRAW, 2);
    };

    Mesh.prototype.setIndices = function (indices) {
        this.indexBuffer.clear();

        this.indices = indices;
        this.createBuffer(this.indexBuffer, this.indices, game.gl.ELEMENT_ARRAY_BUFFER, game.gl.STATIC_DRAW, 1);
    };

    Mesh.prototype.render = function (shader) {
        game.renderer.render(shader, this.vertexBuffer, this.colorBuffer, this.texCoordBuffer, this.indexBuffer);
    };
    Mesh.currentBufferId = 1;
    return Mesh;
})();
//# sourceMappingURL=mesh.js.map
