class Primitive2D extends Renderable {
    color: Float32Array;

    points: TSM.vec3[];

    constructor() {
        super();

        this.points = [];
        this.color = new Float32Array([1, 1, 1, 1]);
        //this.setShader(game.lineShader);
    }

    addPoint(point: TSM.vec3) {
        this.points.push(point);
    }

    rebuildMesh() {
        this.mesh = game.meshFactory.createPolygonMesh(this.points);
    }

    render() {
        if (this.hidden) {
            return;
        }

        var lineShader = <LineShader>this.shader;
        lineShader.color = this.color;
        lineShader.worldMatrix = this.buildWorldMatrix();
        lineShader.objectDrawSetup();

        this.mesh.render(this.shader);
    }
} 