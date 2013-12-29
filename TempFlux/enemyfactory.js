var EnemyFactory = (function () {
    function EnemyFactory() {
        this.enemyConstructors = {};
        this.enemyConstructors["red_square"] = this.createRedSquare;
        this.enemyConstructors["green_triangle"] = this.createGreenTriangle;
    }
    EnemyFactory.prototype.createEnemy = function (name, position) {
        if (this.enemyConstructors[name] != null) {
            this.enemyConstructors[name](position);
        } else {
            console.error("Enemy constructor could not be found for \'" + name + "\'");
        }
    };

    EnemyFactory.prototype.createRedSquare = function (position) {
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
    };

    EnemyFactory.prototype.createGreenTriangle = function (position) {
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
    };
    return EnemyFactory;
})();
//# sourceMappingURL=enemyfactory.js.map
