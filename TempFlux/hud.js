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
        this.displayAmount = Util.lerp(this.displayAmount, this.current, 0.1);
        this.displayAmount = this.current;
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
        var healthBG = new Sprite(700, 8, 1, 1);
        healthBG.setTexture(game.textures.getTexture("statusbar_bg_slice"));
        healthBG.setShader(game.spriteShader);
        healthBG.alpha = true;
        healthBG.position.x = (game.width + healthBG.width) / 2;
        healthBG.position.y = 512;

        var healthFG = new Sprite(1, 6, 1, 1);
        healthFG.setTexture(game.textures.getTexture("health_fg"));
        healthFG.setShader(game.spriteShader);
        healthFG.alpha = true;
        healthFG.scale.x = 700;
        healthFG.position.x = game.width / 2;
        healthFG.position.y = 511;

        this.health = new StatusBar(new TSM.vec2([0, 0]), 512, 32);
        this.health.background = healthBG;
        this.health.foreground = healthFG;

        var energyBG = new Sprite(700, 12, 1, 1);
        energyBG.setTexture(game.textures.getTexture("statusbar_bg_slice"));
        energyBG.setShader(game.spriteShader);
        energyBG.alpha = true;
        energyBG.position.x = (game.width + healthBG.width) / 2;
        energyBG.position.y = 520;

        var energyFG = new Sprite(1, 10, 1, 1);
        energyFG.setTexture(game.textures.getTexture("energy_fg"));
        energyFG.setShader(game.spriteShader);
        energyFG.alpha = true;
        energyFG.scale.x = 700;
        energyFG.position.x = game.width / 2;
        energyFG.position.y = 519;

        this.energy = new StatusBar(new TSM.vec2([0, 0]), 512, 32);
        this.energy.background = energyBG;
        this.energy.foreground = energyFG;

        this.comboMeter = game.text.add(new TextObject("x0", "combo"));
        this.comboMeter.position = new TSM.vec3([800, 100, 0]);
    }
    GameHUD.prototype.resetCombo = function () {
        this.comboMeter.hidden = true;
    };

    GameHUD.prototype.increaseCombo = function () {
        this.comboMeterTween = TweenManager.register(new Tween(TweenFunctions.easeOutQuad, 3, 1, 0.25, 0 /* None */, 0));
        this.comboMeter.hidden = false;
        this.comboMeter.setText("x" + game.killCombo);
    };

    GameHUD.prototype.update = function (dt) {
        this.health.current = game.playerController.health.current / game.playerController.health.max;
        this.health.update(dt);

        this.energy.current = game.playerController.health.current / game.playerController.health.max;
        this.energy.update(dt);

        if (this.comboMeterTween != null) {
            var s = this.comboMeterTween.evaluate();
            this.comboMeter.scale = new TSM.vec3([s, s, 1]);
        }
    };

    GameHUD.prototype.render = function () {
        //this.health.render();
        this.energy.render();
    };
    return GameHUD;
})();
//# sourceMappingURL=hud.js.map
