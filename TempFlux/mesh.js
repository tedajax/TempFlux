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
        this.renderMode = game.gl.TRIANGLES;
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
        if (verts == null) {
            return;
        }

        if (this.vertexBuffer != null) {
            this.vertexBuffer.clear();
        } else {
            this.vertexBuffer = new RenderBuffer();
        }

        this.vertices = verts;
        this.createBuffer(this.vertexBuffer, this.vertices, game.gl.ARRAY_BUFFER, game.gl.STATIC_DRAW, 3);
    };

    Mesh.prototype.setColors = function (colors) {
        if (colors == null) {
            return;
        }

        if (this.colorBuffer != null) {
            this.colorBuffer.clear();
        } else {
            this.colorBuffer = new RenderBuffer();
        }

        this.colors = colors;
        this.createBuffer(this.colorBuffer, this.colors, game.gl.ARRAY_BUFFER, game.gl.STATIC_DRAW, 4);
    };

    Mesh.prototype.setTexCoords = function (texCoords) {
        if (texCoords == null) {
            return;
        }

        if (this.texCoordBuffer != null) {
            this.texCoordBuffer.clear();
        } else {
            this.texCoordBuffer = new RenderBuffer();
        }

        this.texCoords = texCoords;
        this.createBuffer(this.texCoordBuffer, this.texCoords, game.gl.ARRAY_BUFFER, game.gl.STATIC_DRAW, 2);
    };

    Mesh.prototype.setIndices = function (indices) {
        if (indices == null) {
            return;
        }

        if (this.indexBuffer != null) {
            this.indexBuffer.clear();
        } else {
            this.indexBuffer = new RenderBuffer();
        }

        this.indices = indices;
        this.createBuffer(this.indexBuffer, this.indices, game.gl.ELEMENT_ARRAY_BUFFER, game.gl.STATIC_DRAW, 1);
    };

    Mesh.prototype.render = function (shader) {
        game.renderer.render(shader, this.vertexBuffer, this.colorBuffer, this.texCoordBuffer, this.indexBuffer, this.renderMode);
    };
    Mesh.currentBufferId = 1;
    return Mesh;
})();
//# sourceMappingURL=mesh.js.map
