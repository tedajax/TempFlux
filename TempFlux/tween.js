var TweenFunctions = (function () {
    function TweenFunctions() {
    }
    //all tweening functions are represented as
    //t current time, d duration,
    //b start value, c change in value
    TweenFunctions.linear = function (t, b, c, d) {
        return c * t / d + b;
    };

    TweenFunctions.easeInQuad = function (t, b, c, d) {
        t /= d;
        return c * t * t + b;
    };

    TweenFunctions.easeOutQuad = function (t, b, c, d) {
        t /= d;
        return -c * t * (t - 2) + b;
    };

    TweenFunctions.easeInOutQuad = function (t, b, c, d) {
        t /= d / 2;
        if (t < 1)
            return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };

    TweenFunctions.easeInCubic = function (t, b, c, d) {
        t /= d;
        return c * t * t * t + b;
    };

    TweenFunctions.easeOutCubic = function (t, b, c, d) {
        t /= d;
        t--;
        return c * (t * t * t + 1) + b;
    };

    TweenFunctions.easeInOutCubic = function (t, b, c, d) {
        t /= d / 2;
        if (t < 1)
            return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    };

    TweenFunctions.easeInQuart = function (t, b, c, d) {
        t /= d;
        return c * t * t * t * t + b;
    };

    TweenFunctions.easeOutQuart = function (t, b, c, d) {
        t /= d;
        t--;
        return -c * (t * t * t * t - 1) + b;
    };

    TweenFunctions.easeInOutQuart = function (t, b, c, d) {
        t /= d / 2;
        if (t < 1)
            return c / 2 * t * t * t * t + b;
        t -= 2;
        return -c / 2 * (t * t * t * t - 2) + b;
    };

    TweenFunctions.easeOutQuint = function (t, b, c, d) {
        t /= d;
        t--;
        return c * (t * t * t * t * t + 1) + b;
    };

    TweenFunctions.easeInOutQuint = function (t, b, c, d) {
        t /= d / 2;
        if (t < 1)
            return c / 2 * t * t * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t * t * t + 2) + b;
    };

    TweenFunctions.easeInSine = function (t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    };

    TweenFunctions.easeOutSine = function (t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    };

    TweenFunctions.easeInOutSine = function (t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    };

    TweenFunctions.easeInExpo = function (t, b, c, d) {
        return c * Math.pow(2, 10 * (t / d - 1)) + b;
    };

    TweenFunctions.easeOutExpo = function (t, b, c, d) {
        return c * (-Math.pow(2, -10 * t / d) + 1) + b;
    };

    TweenFunctions.easeInOutExpo = function (t, b, c, d) {
        t /= d / 2;
        if (t < 1)
            return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        t--;
        return c / 2 * (-Math.pow(2, -10 * t) + 2) + b;
    };

    TweenFunctions.easeInCirc = function (t, b, c, d) {
        t /= d;
        return -c * (Math.sqrt(1 - t * t) - 1) + b;
    };

    TweenFunctions.easeOutCirc = function (t, b, c, d) {
        t /= d;
        t--;
        return c * Math.sqrt(1 - t * t) + b;
    };

    TweenFunctions.easeInOutCirc = function (t, b, c, d) {
        t /= d / 2;
        if (t < 1)
            return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        t -= 2;
        return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
    };

    TweenFunctions.parabolic = function (t, b, c, d) {
        return ((-4 * (b + c)) / (d * d)) * t * (t - d);
    };

    TweenFunctions.bounceIn = function (t, b, c, d) {
        return c - TweenFunctions.bounceOut(d - t, 0, c, d) + b;
    };

    TweenFunctions.bounceOut = function (t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
    };

    TweenFunctions.bounceInOut = function (t, b, c, d) {
        if (t < d / 2) {
            return TweenFunctions.bounceIn(t * 2, 0, c, d) * 0.5 + b;
        } else {
            return TweenFunctions.bounceOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }
    };
    return TweenFunctions;
})();

var TweenDirection;
(function (TweenDirection) {
    TweenDirection[TweenDirection["Forward"] = 0] = "Forward";
    TweenDirection[TweenDirection["Reverse"] = 1] = "Reverse";
})(TweenDirection || (TweenDirection = {}));

var TweenLoopMode;
(function (TweenLoopMode) {
    TweenLoopMode[TweenLoopMode["None"] = 0] = "None";
    TweenLoopMode[TweenLoopMode["Repeat"] = 1] = "Repeat";
    TweenLoopMode[TweenLoopMode["PingPong"] = 2] = "PingPong";
})(TweenLoopMode || (TweenLoopMode = {}));

var Tween = (function () {
    function Tween(func, start, end, duration, loopMode, delay) {
        if (typeof loopMode === "undefined") { loopMode = 0 /* None */; }
        if (typeof delay === "undefined") { delay = 0; }
        this.tweenFunc = func;
        this.start = start;
        this.end = end;
        this.duration = duration;
        this.delay = delay;
        this.loopMode = loopMode;
        this.time = 0;
        this.direction = 0 /* Forward */;
        this.done = false;
        TweenManager.register(this);
    }
    Tween.prototype.pause = function () {
        this.paused = true;
    };

    Tween.prototype.resume = function () {
        this.paused = false;
    };

    Tween.prototype.restart = function () {
        this.done = false;
        this.paused = false;
        this.time = 0;
    };

    Tween.prototype.evaluate = function () {
        var t = this.tweenFunc(this.time, this.start, (this.end - this.start), this.duration);
        return t;
    };

    Tween.prototype.incrementTime = function (dt) {
        if (this.done || this.paused) {
            return;
        }

        if (this.delay > 0) {
            this.delay -= dt;
            return;
        }

        var t = (this.direction == 0 /* Forward */) ? dt : -dt;
        this.time += t;

        switch (this.loopMode) {
            case 0 /* None */:
                if (this.direction == 0 /* Forward */) {
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

            case 1 /* Repeat */:
                if (this.direction == 0 /* Forward */) {
                    while (this.time > this.duration) {
                        this.time -= this.duration;
                    }
                } else {
                    while (this.time < 0) {
                        this.time += this.duration;
                    }
                }
                break;

            case 2 /* PingPong */:
                if (this.time > this.duration) {
                    this.time = this.duration;
                    if (this.direction == 0 /* Forward */) {
                        this.direction = 1 /* Reverse */;
                    }
                }

                if (this.time < 0) {
                    this.time = 0;
                    if (this.direction == 1 /* Reverse */) {
                        this.direction = 0 /* Forward */;
                    }
                }
                break;
        }
    };
    return Tween;
})();

var TweenManager = (function () {
    function TweenManager() {
    }
    TweenManager.register = function (tween) {
        var id = TweenManager.currentId++;
        tween.tweenId = id;
        TweenManager.tweens[id] = tween;
    };

    TweenManager.update = function (dt) {
        for (var id in TweenManager.tweens) {
            var tween = TweenManager.tweens[id];
            tween.incrementTime(dt);
        }
    };
    TweenManager.tweens = {};
    TweenManager.destroyQueue = {};
    TweenManager.currentId = 0;
    return TweenManager;
})();
//# sourceMappingURL=tween.js.map
