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
        this.displayAmount = Util.lerp(this.displayAmount, this.current, 10 * dt);
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

    update(dt: number) {
        this.health.current = game.playerController.health.current / game.playerController.health.max;
        this.health.update(dt);
    }

    render() {
        game.spriteShader.unlockFromCamera();

        this.health.render();
        //this.energy.render();
    }
}