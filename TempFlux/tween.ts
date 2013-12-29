class TweenFunctions {
    //all tweening functions are represented as
    //t current time, d duration,
    //b start value, c change in value

    static linear(t: number, b: number, c: number, d: number) {
        return c * t / d + b;
    }

    static easeInQuad(t: number, b: number, c: number, d: number) {
        t /= d;
        return c * t * t + b;
    }

    static easeOutQuad(t: number, b: number, c: number, d: number) {
        t /= d;
        return -c * t * (t - 2) + b;
    }

    static easeInOutQuad(t: number, b: number, c: number, d: number) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    static easeInCubic(t: number, b: number, c: number, d: number) {
        t /= d;
        return c * t * t * t + b;
    }

    static easeOutCubic(t: number, b: number, c: number, d: number) {
        t /= d;
        t--;
        return c * (t * t * t + 1) + b;
    }

    static easeInOutCubic(t: number, b: number, c: number, d: number) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    }
    
    static easeInQuart(t: number, b: number, c: number, d: number) {
        t /= d;
        return c * t * t * t * t + b;
    }

    static easeOutQuart(t: number, b: number, c: number, d: number) {
        t /= d;
        t--;
        return -c * (t * t * t * t - 1) + b;
    }
    
    static easeInOutQuart(t: number, b: number, c: number, d: number) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t * t + b;
        t -= 2;
        return -c / 2 * (t * t * t * t - 2) + b;
    }

    static easeOutQuint(t: number, b: number, c: number, d: number) {
        t /= d;
        t--;
        return c * (t * t * t * t * t + 1) + b;
    }

    static easeInOutQuint(t: number, b: number, c: number, d: number) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t * t * t + 2) + b;
    }

    static easeInSine(t: number, b: number, c: number, d: number) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    }
    
    static easeOutSine(t: number, b: number, c: number, d: number) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    }
    
    static easeInOutSine(t: number, b: number, c: number, d: number) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    }
    
    static easeInExpo(t: number, b: number, c: number, d: number) {
        return c * Math.pow(2, 10 * (t / d - 1)) + b;
    }

    static easeOutExpo(t: number, b: number, c: number, d: number) {
        return c * (-Math.pow(2, -10 * t / d) + 1) + b;
    }

    static easeInOutExpo(t: number, b: number, c: number, d: number) {
        t /= d / 2;
        if (t < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        t--;
        return c / 2 * (-Math.pow(2, -10 * t) + 2) + b;
    }

    static easeInCirc(t: number, b: number, c: number, d: number) {
        t /= d;
        return -c * (Math.sqrt(1 - t * t) - 1) + b;
    }

    static easeOutCirc(t: number, b: number, c: number, d: number) {
        t /= d;
        t--;
        return c * Math.sqrt(1 - t * t) + b;
    }

    static easeInOutCirc(t: number, b: number, c: number, d: number) {
        t /= d / 2;
        if (t < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        t -= 2;
        return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
    }

    static parabolic(t: number, b: number, c: number, d: number) {
        return ((-4 * (b + c)) / (d * d)) * t * (t - d);
    }
}

enum TweenDirection {
    Forward,
    Reverse
}

enum TweenLoopMode {
    None,
    Repeat,
    PingPong
}

class Tween {
    time: number;
    duration: number;
    delay: number;
    tweenFunc: Function;
    doneCallback: Function;
    start: number;
    end: number;
    tweenId: number;
    loopMode: TweenLoopMode;
    direction: TweenDirection;
    done: boolean;
    paused: boolean;

    constructor(func: Function, start: number, end: number, duration: number, loopMode: TweenLoopMode = TweenLoopMode.None, delay: number = 0) {
        this.tweenFunc = func;
        this.start = start;
        this.end = end;
        this.duration = duration;
        this.delay = delay;
        this.loopMode = loopMode;
        this.time = 0;
        this.direction = TweenDirection.Forward;
        this.done = false;
        TweenManager.register(this);
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    restart() {
        this.done = false;
        this.paused = false;
        this.time = 0;
    }

    evaluate(): number {
        var t = this.tweenFunc(this.time, this.start, (this.end - this.start), this.duration);
        return t;
    }

    incrementTime(dt: number) {
        if (this.done || this.paused) {
            return;
        }

        if (this.delay > 0) {
            this.delay -= dt;
            return;
        }

        var t = (this.direction == TweenDirection.Forward) ? dt : -dt;
        this.time += t;

        switch (this.loopMode) {
            case TweenLoopMode.None:
                if (this.direction == TweenDirection.Forward) {
                    if (this.time > this.duration) {
                        this.time = this.duration;
                        this.done = true;
                        if (this.doneCallback != null) {
                            this.doneCallback();
                        }
                    }
                } else {
                    if (this.time < 0) {
                        this.time = 0;
                        this.done = true;
                        if (this.doneCallback != null) {
                            this.doneCallback();
                        }
                    }
                }
                break;

            case TweenLoopMode.Repeat:
                if (this.direction == TweenDirection.Forward) {
                    while (this.time > this.duration) {
                        this.time -= this.duration;
                    }
                } else {
                    while (this.time < 0) {
                        this.time += this.duration;
                    }
                }
                break;

            case TweenLoopMode.PingPong:
                if (this.time > this.duration) {
                    this.time = this.duration;
                    if (this.direction == TweenDirection.Forward) {
                        this.direction = TweenDirection.Reverse;
                    }
                }

                if (this.time < 0) {
                    this.time = 0;
                    if (this.direction == TweenDirection.Reverse) {
                        this.direction = TweenDirection.Forward;
                    }
                }
                break;
        }
    }
}

class TweenManager {
    static tweens: {} = {};
    static destroyQueue: {} = {};
    static currentId: number = 0;

    static register(tween: Tween) {
        var id = TweenManager.currentId++;
        tween.tweenId = id;
        TweenManager.tweens[id] = tween;
    }

    static update(dt: number) {
        for (var id in TweenManager.tweens) {
            var tween = TweenManager.tweens[id];
            tween.incrementTime(dt);
        }
    }
}