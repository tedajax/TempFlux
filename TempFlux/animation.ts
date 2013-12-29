class Animation {
    maxFrames: number;
    frameNames: string[];
    frameImages: ImageTexture[];
    frameDelays: number[];
    currentFrame: number;
    currentTimer: number;
    loop: boolean;
    playing: boolean;
    priority: number;

    constructor(imageNames: string[], delays: number[], priority: number = 0) {
        this.maxFrames = imageNames.length;
        this.currentFrame = 0;
        this.currentTimer = 0;
        this.frameDelays = delays.slice(0);
        this.loop = false;
        this.playing = false;
        this.priority = priority;

        this.frameNames = [];
        this.frameImages = [];
        for (var i = 0; i < this.maxFrames; ++i) {
            this.frameNames[i] = imageNames[i];
            this.frameImages[i] = game.textures.getTexture(imageNames[i]);
        }
    }

    clone(): Animation {
        return new Animation(this.frameNames, this.frameDelays, this.priority); 
    }

    play(loop: boolean = false) {
        this.playing = true;
        this.loop = loop;
        this.currentFrame = 0;
        this.currentTimer = 0;
    }

    resume() {
        this.playing = true;
    }

    pause() {
        this.playing = false;
    }

    stop() {
        this.playing = false;
        this.currentFrame = 0;
        this.currentTimer = 0;
    }

    update(dt) {
        if (!this.playing) {
            return;
        }

        this.currentTimer += dt;
        if (this.currentTimer >= this.frameDelays[this.currentFrame]) {
            this.currentFrame++;
            if (this.currentFrame >= this.maxFrames) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame--;
                    this.pause();
                }
            }
            this.currentTimer = 0;
        }
    }

    getTexture() {
        return this.frameImages[this.currentFrame];
    }
}