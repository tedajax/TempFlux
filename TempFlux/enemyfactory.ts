class EnemyFactory {
    enemyConstructors: {};

    constructor() {
        this.enemyConstructors = {};
        this.enemyConstructors["red_square"] = this.createRedSquare;
        this.enemyConstructors["green_triangle"] = this.createGreenTriangle;
        this.enemyConstructors["starburst"] = this.createStarburst;
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
        go.tag = GameObjectTag.Enemy;
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
        go.tag = GameObjectTag.Enemy;
        var controller = new AIGreenTriangleController(null);
        controller.position.xy = position.xy;
        controller.posess(go);

        game.gameObjects.add(go);
        go.addRectangleCollider();
    }

    createStarburstPoint(position: TSM.vec3, side: Side2D, parentController: AIStarburstController) {
        var vertical: boolean = (side == Side2D.Top || side == Side2D.Bottom);

        var sx = vertical ? 4 : 25;
        var sy = vertical ? 25 : 4;

        var pos = new TSM.vec3([position.x, position.y, position.z]);

        if (vertical) {
            if (side == Side2D.Top) {
                pos.y -= sy;
            } else {
                pos.y += sy;
            }
            pos.x -= 11;
        } else {
            if (side == Side2D.Right) {
                pos.x += sx;
            } else {
                pos.x -= sx;
            }
            pos.y -= 11;
        }

        var sprite = new Sprite(sx, sy);
        sprite.position.xy = pos.xy;
        sprite.setShader(game.spriteShader);
        sprite.setTexture(game.textures.getTexture((vertical) ? "starburst_vertical" : "starburst_horizontal"));
        sprite.alpha = true;

        var go = new GameObject(null, null, "StarBurstPoint_" + side, sprite);
        go.tag = GameObjectTag.Enemy;
        var controller = new AIStarburstPointController(null, parentController, side);
        controller.position.xy = pos.xy;
        controller.posess(go);

        game.gameObjects.add(go);
        go.addRectangleCollider();
    }

    createStarburst(position: TSM.vec3) {
        var sprite = new Sprite(26, 26);
        sprite.position.xy = position.xy;
        sprite.setShader(game.spriteShader);
        sprite.setTexture(game.textures.getTexture("starburst_center"));
        sprite.alpha = true;

        var go = new GameObject(null, null, "StarburstCenter", sprite);
        go.tag = GameObjectTag.Enemy;
        var controller = new AIStarburstController(null);
        controller.position.xy = position.xy;
        controller.posess(go);

        game.gameObjects.add(go);
        go.addRectangleCollider();

        game.enemies.createStarburstPoint(position, Side2D.Right, controller);
        game.enemies.createStarburstPoint(position, Side2D.Left, controller);
        game.enemies.createStarburstPoint(position, Side2D.Top, controller);
        game.enemies.createStarburstPoint(position, Side2D.Bottom, controller);
    }
} 