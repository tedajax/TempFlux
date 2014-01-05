enum GameObjectTag {
    Default,
    Player,
    Bullet,
    Enemy,
    Powerup
}

class GameObject {
    name: string;
    tag: GameObjectTag;
    sprite: Sprite;
    position: TSM.vec3;
    rotation: TSM.vec3;
    controller: Controller;
    activeAnimation: string;
    animations: AnimationController;
    entityId: number;
    renderOrderIndex: number;

    shouldDestroy: boolean;

    collider: Collider;

    constructor(klass?: string, animations?: string[], name: string = "default", sprite?: Sprite) {
        this.name = name;
        this.tag = GameObjectTag.Default;
        this.shouldDestroy = false;
        this.entityId = -1;

        if (sprite != null) {
            this.sprite = sprite;
            this.position = sprite.position;
            this.rotation = sprite.rotation;
            return;
        }

        this.sprite = new Sprite(32, 32);
        this.sprite.setShader(game.spriteShader);
        this.position = new TSM.vec3([0, 0, 1]);
        this.rotation = new TSM.vec3([0, 0, 0]);
        this.activeAnimation = null;

        var anims = animations && animations || ["idle"];
        this.animations = new AnimationController(klass, anims);
    }

    destroy() {
        this.shouldDestroy = true;
    }

    onDestroy() {
        game.collision.release(this.entityId);
    }

    addCollider(collider: Collider) {
        this.collider = collider;
        game.collision.register(this.collider);
    }

    addCircleCollider(layer: CollisionLayer = CollisionLayer.Default, radius: number = this.sprite.width / 2, offset: TSM.vec2 = new TSM.vec2([-this.sprite.width / 2, -this.sprite.height / 2])) {
        var circ = new CircleCollider(this, radius, offset, layer);
        this.addCollider(circ);
    }

    addRectangleCollider(layer: CollisionLayer = CollisionLayer.Default,
        width: number = this.sprite.width,
        height: number = this.sprite.height,
        offset: TSM.vec2 = new TSM.vec2([-this.sprite.width, -this.sprite.height])) {
            var rect = new RectangleCollider(this, width, height, offset, layer);
            this.addCollider(rect);
    }

    playAnimation(name: string, loop: boolean = false) {
        this.animations.play(name, loop);
    }
    
    updateAnimation(dt: number) {
        if (this.animations != null) {
            this.animations.update(dt);
            this.sprite.texture = this.animations.getCurrentTexture();
        }
    }

    setController(controller: Controller) {
        this.controller = controller;
    }

    update(dt: number) {
        if (this.controller != null) {
            this.controller.update(dt);
        }

        this.updateAnimation(dt);
        
        this.sprite.position = this.position;
        this.sprite.rotation = this.rotation;
    }

    render() {
        if (this.controller != null) {
            this.controller.render();
        }

        this.sprite.render();
    }

    onCollisionEnter(collider: Collider) {
        if (this.controller != null) {
            this.controller.onCollisionEnter(collider);
        }
    }

    onCollisionStay(collider: Collider) {
        if (this.controller != null) {
            this.controller.onCollisionStay(collider);
        }
    }

    onCollisionExit(collider: Collider) {
        if (this.controller != null) {
            this.controller.onCollisionExit(collider);
        }
    }
} 