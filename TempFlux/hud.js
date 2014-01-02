var SlidingSprite = (function () {
    function SlidingSprite(position, height, sliceName, capName) {
    }
    Object.defineProperty(SlidingSprite.prototype, "fillPercentage", {
        set: function (value) {
            this.fillPercentage_ = value;
        },
        enumerable: true,
        configurable: true
    });
    return SlidingSprite;
})();

var StatusBar = (function () {
    function StatusBar(position, width, height) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.displayAmount = 1;
    }
    StatusBar.prototype.update = function (dt) {
        this.displayAmount = Util.lerp(this.displayAmount, this.current, 10 * dt);
        this.foreground.position.x = (game.width / 2) - (700 * (1 - this.displayAmount)) / 2;
        this.foreground.scale.x = 700 * this.displayAmount;
    };

    StatusBar.prototype.render = function () {
        this.background.render();
        this.foreground.render();
    };
    return StatusBar;
})();

var GameHUD = (function () {
    function GameHUD() {
        var healthBG = new Sprite(700, 16, 1, 1);
        healthBG.setTexture(game.textures.getTexture("statusbar_bg_slice"));
        healthBG.setShader(game.spriteShader);
        healthBG.alpha = true;
        healthBG.position.x = (game.width + healthBG.width) / 2;
        healthBG.position.y = 500;

        var healthFG = new Sprite(1, 14, 1, 1);
        healthFG.setTexture(game.textures.getTexture("health_fg"));
        healthFG.setShader(game.spriteShader);
        healthFG.alpha = true;
        healthFG.scale.x = 700;
        healthFG.position.x = game.width / 2;
        healthFG.position.y = 499;

        this.health = new StatusBar(new TSM.vec2([0, 0]), 512, 32);
        this.health.background = healthBG;
        this.health.foreground = healthFG;
    }
    GameHUD.prototype.update = function (dt) {
        this.health.current = game.playerController.health.current / game.playerController.health.max;
        this.health.update(dt);
    };

    GameHUD.prototype.render = function () {
        game.spriteShader.unlockFromCamera();

        this.health.render();
        //this.energy.render();
    };
    return GameHUD;
})();
//# sourceMappingURL=hud.js.map
