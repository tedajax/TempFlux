class EnemyFactory {
    enemyConstructors: {};

    constructor() {
        this.enemyConstructors = {};
        this.enemyConstructors["red_square"] = this.createRedSquare;
        this.enemyConstructors["green_triangle"] = this.createGreenTriangle;
    }

    createEnemy(name: string, position: TSM.vec3) {
        if (this.enemyConstructors[name] != null) {
            this.enemyConstructors[name](position);
        } else {
            console.error("Enemy constructor could not be found for \'" + name + "\'");
        }
    }

    createRedSquare(position: TSM.vec3) {
        var sprite = new Sprite(32, 32);
        sprite.position.xy = position.xy;
        sprite.setShader(game.spriteShader);
        sprite.setTexture(game.textures.getTexture("redsquare"));
        sprite.alpha = true;

        var go = new GameObject(null, null, "RedSquare", sprite);
        go.tag = "enemy";
        var controller = new AIRedSquareController(null);
        controller.position.xy = position.xy;
        controller.posess(go);

        game.gameObjects.add(go);
        go.addRectangleCollider();
    }

    createGreenTriangle(position: TSM.vec3) {
        var sprite = new Sprite(32, 32);
        sprite.position.xy = position.xy;
        sprite.setShader(game.spriteShader);
        sprite.setTexture(game.textures.getTexture("greentriangle"));
        sprite.alpha = true;

        var go = new GameObject(null, null, "GreenTriangle", sprite);
        go.tag = "enemy";
        var controller = new AIGreenTriangleController(null);
        controller.position.xy = position.xy;
        controller.posess(go);

        game.gameObjects.add(go);
        go.addRectangleCollider();
    }
} 