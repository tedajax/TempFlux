class SlidingSprite {
    leftCap: Sprite;
    rightCap: Sprite;
    middle: Sprite;

    fillPercentage_: number;

    set fillPercentage(value: number) {
        this.fillPercentage_ = value;
    }

    constructor(position: TSM.vec2, height: number, sliceName: string, capName: string) {
        
    }
}

class StatusBar {
    max: number;
    current: number;
    displayAmount: number;

    width: number;
    height: number;

    background: Sprite;
    foreground: Sprite;

    position: TSM.vec2;

    constructor(position: TSM.vec2, width: number, height: number) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.displayAmount = 1;
    }

    update(dt: number) {
        this.displayAmount = Util.lerp(this.displayAmount, this.current, 0.1);
        this.displayAmount = this.current;
        this.foreground.position.x = (game.width / 2) - (700 * (1 - this.displayAmount)) / 2;
        this.foreground.scale.x = 700 * this.displayAmount;
    }

    render() {
        this.background.render();
        this.foreground.render();
    }
} 

class GameHUD {
    health: StatusBar;
    energy: StatusBar;

    constructor() {
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

        var energyBG = new Sprite(700, 8, 1, 1);
        energyBG.setTexture(game.textures.getTexture("statusbar_bg_slice"));
        energyBG.setShader(game.spriteShader);
        energyBG.alpha = true;
        energyBG.position.x = (game.width + healthBG.width) / 2;
        energyBG.position.y = 520;

        var energyFG = new Sprite(1, 6, 1, 1);
        energyFG.setTexture(game.textures.getTexture("energy_fg"));
        energyFG.setShader(game.spriteShader);
        energyFG.alpha = true;
        energyFG.scale.x = 700;
        energyFG.position.x = game.width / 2;
        energyFG.position.y = 519;

        this.energy = new StatusBar(new TSM.vec2([0, 0]), 512, 32);
        this.energy.background = energyBG;
        this.energy.foreground = energyFG;
    }

    update(dt: number) {
        this.health.current = game.playerController.health.current / game.playerController.health.max;
        this.health.update(dt);

        this.energy.current = game.playerController.energy / game.playerController.energyMax;
        this.energy.update(dt);
    }

    render() {
        game.spriteShader.unlockFromCamera();

        this.health.render();
        this.energy.render();
    }
}