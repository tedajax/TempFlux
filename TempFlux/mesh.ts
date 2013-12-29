class RenderBuffer {
    id: number;
    glBuffer: WebGLBuffer;
    count: number;
    itemSize: number;

    clear() {
        if (this.glBuffer != null) {
            game.gl.deleteBuffer(this.glBuffer);
        }
        this.count = 0;
        this.itemSize = 0;
    }
}

class Mesh {
    vertices: number[];
    indices: number[];
    colors: number[];
    texCoords: number[];

    vertexBuffer: RenderBuffer;
    indexBuffer: RenderBuffer;
    colorBuffer: RenderBuffer;
    texCoordBuffer: RenderBuffer;

    static currentBufferId = 1;

    constructor() {
        this.vertexBuffer = new RenderBuffer();
        this.indexBuffer = new RenderBuffer();
        this.colorBuffer = new RenderBuffer();
        this.texCoordBuffer = new RenderBuffer();
    }

    createBuffer(buffer: RenderBuffer, data: number[], bufferType: number, drawMode: number, itemSize: number): RenderBuffer {
        buffer.id = Mesh.currentBufferId++;
        buffer.glBuffer = game.gl.createBuffer();
        game.gl.bindBuffer(bufferType, buffer.glBuffer);
        game.gl.bufferData(bufferType,
            (bufferType === game.gl.ARRAY_BUFFER) ? new Float32Array(data) : new Uint16Array(data),
            drawMode);
        buffer.itemSize = itemSize;
        buffer.count = data.length / itemSize;
        return buffer;
    }

    buildMesh(verts: number[], colors: number[], texCoords: number[], indices: number[]) {
        this.setVertices(verts);
        this.setColors(colors);
        this.setTexCoords(texCoords);
        this.setIndices(indices);
    }

    setVertices(verts: number[]) {
        this.vertexBuffer.clear();

        this.vertices = verts;
        this.createBuffer(this.vertexBuffer, this.vertices, game.gl.ARRAY_BUFFER, game.gl.STATIC_DRAW, 3);
    }

    setColors(colors: number[]) {
        this.colorBuffer.clear();

        this.colors = colors;
        this.createBuffer(this.colorBuffer, this.colors, game.gl.ARRAY_BUFFER, game.gl.STATIC_DRAW, 4);
    }

    setTexCoords(texCoords: number[]) {
        this.texCoordBuffer.clear();

        this.texCoords = texCoords;
        this.createBuffer(this.texCoordBuffer, this.texCoords, game.gl.ARRAY_BUFFER, game.gl.STATIC_DRAW, 2);
    }

    setIndices(indices: number[]) {
        this.indexBuffer.clear();

        this.indices = indices;
        this.createBuffer(this.indexBuffer, this.indices, game.gl.ELEMENT_ARRAY_BUFFER, game.gl.STATIC_DRAW, 1);
    }

    render(shader: Shader) {
        game.renderer.render(shader, this.vertexBuffer, this.colorBuffer, this.texCoordBuffer, this.indexBuffer);
    }
}