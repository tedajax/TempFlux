class Sprite extends Renderable {
    texture: ImageTexture;
    alpha: boolean;
    tintColor: Float32Array;
    addColor: Float32Array;
    invertColor: boolean;
    width: number;
    height: number;
    bindTexture: boolean;

    static defaultWidth: number = 1;
    static defaultHeight: number = 1;

    constructor(width: number = Sprite.defaultWidth, height: number = Sprite.defaultHeight, tx: number = 1, ty: number = 1, ox: number = 0.5, oy: number = 0.5) {
        super();

        this.mesh = game.meshFactory.createQuad(width, height, tx, ty);

        this.alpha = false;
        this.tintColor = new Float32Array([1, 1, 1, 1]);
        this.addColor = new Float32Array([0, 0, 0, 1]);

        this.width = width;
        this.height = height;

        this.scale.x = 1;
        this.scale.y = 1;

        this.origin = new TSM.vec2([this.width * ox, this.height * oy]);

        this.bindTexture = true;
    }

    setTexture(texture: ImageTexture) {
        this.texture = texture;
    }

    setBindTexture(bind: boolean) {
        this.bindTexture = bind;
    }

    render() {
        var spriteShader = <SpriteShader>this.shader;
        spriteShader.tintColor = this.tintColor;
        spriteShader.addColor = this.addColor;
        spriteShader.invertColor = this.invertColor;
        spriteShader.worldMatrix = this.buildWorldMatrix();
        spriteShader.objectDrawSetup();
        if (this.bindTexture) {
            spriteShader.texture = this.texture;
            spriteShader.bindTexture();
        }

        game.renderer.setAlpha(this.alpha);

        this.mesh.render(this.shader);
    }
} 