class MeshFactory {
    quads: Mesh[][];
    textQuads: Mesh[][];

    constructor() {
        this.quads = [];
        this.textQuads = [];
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

    createTextQuad(width: number, height: number, fontName: string, char: string, color: number[]= [1, 1, 1, 1]): Mesh {
        var font = game.fonts.getFont(fontName);
        if (font == null) {
            return;
        }

        if (this.textQuads[fontName] == null) {
            this.textQuads[fontName] = [];
        }
        if (this.textQuads[fontName][char] != null) {
            return this.textQuads[fontName][char];
        }

        var quad = new Mesh();

        var verts = [
            0, 0, 0,
            0, height, 0,
            width, height, 0,
            width, 0, 0
        ];

        var colors = [
            color[0], color[1], color[2], color[3],
            color[0], color[1], color[2], color[3],
            color[0], color[1], color[2], color[3],
            color[0], color[1], color[2], color[3]
        ];

        var uvs = font.getCodeUVs(char);

        var texCoords = [
            uvs.u1, uvs.v1,
            uvs.u1, uvs.v2,
            uvs.u2, uvs.v2,
            uvs.u2, uvs.v1
        ];

        var indices = [
            0, 2, 1,
            0, 3, 2
        ];

        var quad = new Mesh();
        quad.buildMesh(verts, colors, texCoords, indices);
        this.textQuads[fontName][char] = quad;

        return quad;
    }

    createPolygonMesh(points: TSM.vec3[]) {
        var polygon = new Mesh();

        var verts = [];

        for (var i = 0, len = points.length; i < len; ++i) {
            var p = points[i];
            verts.push(p.x);
            verts.push(p.y);
            verts.push(p.z);
        }

        var indices = [];
        for (var i = 0, len = points.length; i < len; ++i) {
            indices.push(i);
        }

        indices.push(0);

        polygon.renderMode = game.gl.LINE_STRIP;
        polygon.buildMesh(verts, null, null, indices);

        return polygon;
    }
} 