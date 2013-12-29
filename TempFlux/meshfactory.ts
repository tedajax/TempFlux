class MeshFactory {
    quads: Mesh[][];

    constructor() {
        this.quads = [];
    }

    createQuad(width: number, height: number, tx: number = 1, ty: number = 1, color: number[] = [1, 1, 1, 1]): Mesh {
        if (this.quads[width] == null) {
            this.quads[width] = [];
        }

        if (this.quads[width][height] != null) {
            return this.quads[width][height];
        }

        var quad = new Mesh();

        var verts = [
            0,      0,      0,
            0,      height, 0,
            width,  height, 0,
            width,  0,      0
        ];

        var colors = [
            color[0], color[1], color[2], color[3],
            color[0], color[1], color[2], color[3],
            color[0], color[1], color[2], color[3],
            color[0], color[1], color[2], color[3]
        ];

        var texCoords = [
            0, 0,
            0, ty,
            tx, ty,
            tx, 0
        ];

        var indices = [
            0, 2, 1,
            0, 3, 2
        ];

        quad.buildMesh(verts, colors, texCoords, indices);
        this.quads[width][height] = quad;

        return quad;
    }
} 