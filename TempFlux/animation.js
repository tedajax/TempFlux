var Animation = (function () {
    function Animation(imageNames, delays, priority) {
        if (typeof priority === "undefined") { priority = 0; }
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
    Animation.prototype.clone = function () {
        return new Animation(this.frameNames, this.frameDelays, this.priority);
    };

    Animation.prototype.play = function (loop) {
        if (typeof loop === "undefined") { loop = false; }
        this.playing = true;
        this.loop = loop;
        this.currentFrame = 0;
        this.currentTimer = 0;
    };

    Animation.prototype.resume = function () {
        this.playing = true;
    };

    Animation.prototype.pause = function () {
        this.playing = false;
    };

    Animation.prototype.stop = function () {
        this.playing = false;
        this.currentFrame = 0;
        this.currentTimer = 0;
    };

    Animation.prototype.update = function (dt) {
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
    };

    Animation.prototype.getTexture = function () {
        return this.frameImages[this.currentFrame];
    };
    return Animation;
})();
//# sourceMappingURL=animation.js.map
