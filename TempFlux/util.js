var Util = (function () {
    function Util() {
    }
    Util.toDegrees = function (radians) {
        return radians * Util.rad2Deg;
    };

    Util.toRadians = function (degrees) {
        return degrees * Util.deg2Rad;
    };

    Util.arrayMove = function (A, oldIndex, newIndex) {
        if (oldIndex < 0 || oldIndex >= A.length || newIndex < 0 || newIndex >= A.length) {
            return A;
        }
        A.splice(newIndex, 0, A.splice(oldIndex, 1)[0]);
        return A;
    };

    Util.clamp = function (val, min, max) {
        if (val < min) {
            val = min;
        } else if (val > max) {
            val = max;
        }
        return val;
    };

    Util.nextPowerOf2 = function (value, pow) {
        if (typeof pow === "undefined") { pow = 1; }
        while (pow < value) {
            pow *= 2;
        }
        return pow;
    };

    Util.direction2D = function (v1, v2) {
        var v1flat = new TSM.vec3([v1.x, v1.y, 0]);
        var v2flat = new TSM.vec3([v2.x, v2.y, 0]);
        return TSM.vec3.direction(v1flat, v2flat);
    };

    Util.randomRange = function (min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    };

    Util.randomRangeF = function (min, max) {
        return Math.random() * (max - min) + min;
    };

    Util.lerp = function (a, b, t) {
        return a + (b - a) * t;
    };

    Util.vec3Lerp = function (a, b, t) {
        return new TSM.vec3([
            Util.lerp(a.x, b.x, t),
            Util.lerp(a.y, b.y, t),
            Util.lerp(a.z, b.z, t)]);
    };

    Util.vec3LerpNoZ = function (a, b, t) {
        return new TSM.vec3([
            Util.lerp(a.x, b.x, t),
            Util.lerp(a.y, b.y, t),
            a.z]);
    };
    Util.deg2Rad = 0.0174532925;
    Util.rad2Deg = 57.2957795;
    return Util;
})();

var PoolArray = (function () {
    function PoolArray(capacity) {
        if (typeof capacity === "undefined") { capacity = 64; }
        this.maxIndex = 0;
        this.array = new Array(capacity);
        this.freeStack = [];
        for (var i = capacity - 1; i >= 0; --i) {
            this.freeStack.push(i);
        }
    }
    Object.defineProperty(PoolArray.prototype, "length", {
        get: function () {
            return this.array.length;
        },
        enumerable: true,
        configurable: true
    });

    PoolArray.prototype.push = function (obj) {
        var index = -1;
        if (this.freeStack.length > 0) {
            index = this.freeStack.pop();
        }
        if (index > 0) {
            this.array[index] = obj;
        } else {
            index = this.array.push(obj) - 1;
        }

        if (index > this.maxIndex) {
            this.maxIndex = index;
        }

        return index;
    };

    PoolArray.prototype.removeAt = function (index) {
        if (this.array[index] != null) {
            this.array[index] = null;
            this.freeStack.push(index);
        }
    };

    PoolArray.prototype.at = function (index) {
        return this.array[index];
    };
    return PoolArray;
})();

var Rectangle = (function () {
    function Rectangle(position, width, height) {
        if (typeof width === "undefined") { width = 0; }
        if (typeof height === "undefined") { height = 0; }
        var pos = position || TSM.vec2.zero;
        this.position = new TSM.vec2([pos.x, pos.y]);
        this.width = width;
        this.height = height;
    }
    Rectangle.prototype.clone = function () {
        return new Rectangle(new TSM.vec2([this.position.x, this.position.y]), this.width, this.height);
    };

    Rectangle.prototype.left = function () {
        return this.position.x;
    };

    Rectangle.prototype.right = function () {
        return this.position.x + this.width;
    };

    Rectangle.prototype.top = function () {
        return this.position.y;
    };

    Rectangle.prototype.bottom = function () {
        return this.position.y + this.height;
    };

    Rectangle.prototype.xDist = function (other) {
        return Math.max(Math.max(other.left() - this.right(), this.left() - other.right()), 0);
    };

    Rectangle.prototype.yDist = function (other) {
        return Math.max(Math.max(other.top() - this.bottom(), this.top() - other.bottom()), 0);
    };

    Rectangle.prototype.minDist = function (other) {
        var a = this.xDist(other);
        var b = this.yDist(other);

        return Math.sqrt(a * a + b * b);
    };

    Rectangle.prototype.intersects = function (other) {
        return (this.xDist(other) <= 0 && this.yDist(other) <= 0);
    };

    Rectangle.prototype.intersectsCircle = function (circ) {
        return circ.intersectsRectangle(this);
    };

    Rectangle.prototype.pointInside = function (point) {
        var x = point[0], y = point[1];
        return (x >= this.left() && x <= this.right() && y >= this.top() && y <= this.bottom());
    };

    Rectangle.prototype.inflate = function (amount) {
        this.position.x -= amount;
        this.position.y -= amount;
        this.width += amount * 2;
        this.height += amount * 2;
        return this;
    };
    return Rectangle;
})();

var Circle = (function () {
    function Circle(position, radius) {
        if (typeof radius === "undefined") { radius = 0; }
        this.position = position || new TSM.vec2([0, 0]);
        this.radius = radius;
    }
    Circle.prototype.clone = function () {
        return new Circle(new TSM.vec2([this.position.x, this.position.y]), this.radius);
    };

    Circle.prototype.left = function () {
        return this.position.x - this.radius;
    };

    Circle.prototype.right = function () {
        return this.position.x + this.radius;
    };

    Circle.prototype.top = function () {
        return this.position.y - this.radius;
    };

    Circle.prototype.bottom = function () {
        return this.position.y + this.radius;
    };

    Circle.prototype.intersects = function (other) {
        return (TSM.vec2.distance(this.position, other.position) <= this.radius + other.radius);
    };

    Circle.prototype.intersectsRectangle = function (rect) {
        return rect.clone().inflate(this.radius).pointInside(this.position.xy);
    };

    Circle.prototype.pointInside = function (point) {
        var x = point[0], y = point[1];
        var distSqr = Math.pow(x - this.position.x, 2) + Math.pow(y - this.position.y, 2);
        return (distSqr <= this.radius * this.radius);
    };
    return Circle;
})();
//# sourceMappingURL=util.js.map
