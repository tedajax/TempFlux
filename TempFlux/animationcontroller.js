var AnimationController = (function () {
    function AnimationController(klass, animations) {
        this.klass = klass;
        this.animations = [];
        if (animations != null) {
            this.addAnimations(animations);
        }
    }
    AnimationController.prototype.addAnimation = function (name) {
        var anim = game.animationFactory.getAnimation(this.klass, name);
        if (anim != null) {
            if (this.defaultAnimationFrame == null) {
                this.defaultAnimationFrame = anim.frameImages[0];
            }
            if (this.animations[name] == null) {
                this.animations[name] = anim;
            }
        }
    };

    AnimationController.prototype.addAnimations = function (names) {
        for (var i = 0, len = names.length; i < len; ++i) {
            this.addAnimation(names[i]);
        }
    };

    AnimationController.prototype.play = function (name, loop) {
        if (typeof loop === "undefined") { loop = false; }
        if (this.animations[name] != null) {
            this.animations[name].play(loop);
        }
    };

    AnimationController.prototype.stop = function (name) {
        if (this.animations[name] != null) {
            this.animations[name].stop();
        }
    };

    AnimationController.prototype.update = function (dt) {
        for (var key in this.animations) {
            var anim = this.animations[key];
            anim.update(dt);
        }
    };

    AnimationController.prototype.getCurrentTexture = function () {
        var maxPriority = -10000;
        var texture;
        for (var key in this.animations) {
            var anim = this.animations[key];
            if (anim.playing) {
                if (anim.priority > maxPriority) {
                    maxPriority = anim.priority;
                    texture = anim.getTexture();
                }
            }
        }

        if (texture == null) {
            return this.defaultAnimationFrame;
        } else {
            return texture;
        }
    };
    return AnimationController;
})();
//# sourceMappingURL=animationcontroller.js.map
