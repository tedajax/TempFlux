class AnimationController {
    klass: string;
    animations: Animation[];

    //In case no animation is playing we should default to this
    defaultAnimationFrame: ImageTexture;
        
    constructor(klass: string, animations?: string[]) {
        this.klass = klass;
        this.animations = [];
        if (animations != null) {
            this.addAnimations(animations);
        }
    }

    addAnimation(name: string) {
        var anim = <Animation>game.animationFactory.getAnimation(this.klass, name);
        if (anim != null) {
            if (this.defaultAnimationFrame == null) {
                this.defaultAnimationFrame = anim.frameImages[0];
            }
            if (this.animations[name] == null) {
                this.animations[name] = anim;
            }
        }
    }

    addAnimations(names: string[]) {
        for (var i = 0, len = names.length; i < len; ++i) {
            this.addAnimation(names[i]);
        }
    }

    play(name: string, loop: boolean = false) {
        if (this.animations[name] != null) {
            this.animations[name].play(loop);
        }
    }

    stop(name: string) {
        if (this.animations[name] != null) {
            this.animations[name].stop();
        }
    }

    update(dt: number) {
        for (var key in this.animations) {
            var anim: Animation = <Animation>this.animations[key];
            anim.update(dt);
        }
    }

    getCurrentTexture() {
        var maxPriority = -10000;
        var texture: ImageTexture;
        for (var key in this.animations) {
            var anim = <Animation>this.animations[key];
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
    }
}