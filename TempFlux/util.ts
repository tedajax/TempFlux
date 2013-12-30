class Util {
    static deg2Rad: number = 0.0174532925;
    static rad2Deg: number = 57.2957795;
    static PiOver2: number = Math.PI / 2;
    static TwoPi: number = Math.PI * 2;

    static toDegrees(radians: number) {
        return radians * Util.rad2Deg;
    }

    static toRadians(degrees: number) {
        return degrees * Util.deg2Rad;
    }

    static arrayMove(A: any[], oldIndex: number, newIndex: number) {
        if (oldIndex < 0 || oldIndex >= A.length ||
            newIndex < 0 || newIndex >= A.length) {
                return A;
        }
        A.splice(newIndex, 0, A.splice(oldIndex, 1)[0]);
        return A;
    }

    static clamp(val: number, min: number, max: number) {
        if (val < min) {
            val = min;
        } else if (val > max) {
            val = max;
        }
        return val;
    }

    static nextPowerOf2(value: number, pow: number = 1) {
        while (pow < value) {
            pow *= 2;
        }
        return pow;
    }

    static direction2D(v1: TSM.vec3, v2: TSM.vec3) {
        var l = Util.distance2D(v1, v2);
        return new TSM.vec3([(v1.x - v2.x) / l, (v1.y - v2.y) / l, 0]);
    }

    static distance2D(v1: TSM.vec3, v2: TSM.vec3): number {
        return Math.sqrt(Util.distanceSqr2D(v1, v2));
    }

    static distanceSqr2D(v1: TSM.vec3, v2: TSM.vec3): number {
        return Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2);
    }

    static angleTo(from: TSM.vec3, to: TSM.vec3): number {
        return Util.wrapRadians((Math.atan2(to.y - from.y, to.x - from.x) + Util.PiOver2));
    }

    static lerpDegrees(a: number, b: number, t: number): number {
        var diff = Math.abs(b - a);
        if (diff > 180) {
            if (b > a) {
                a += 360;
            } else {
                b += 360;
            }
        }

        return Util.wrapDegrees(Util.lerp(a, b, t));
    }

    static lerpRadians(a: number, b: number, t: number): number {
        var diff = Math.abs(b - a);
        if (diff > Math.PI) {
            if (b > a) {
                a += Util.TwoPi;
            } else {
                b += Util.TwoPi;
            }
        }

        return Util.wrapRadians(Util.lerp(a, b, t));
    }

    static wrapDegrees(degrees: number): number {
        return degrees % 360;
    }

    static wrapRadians(radians: number): number {
        return radians % Util.TwoPi;
    }

    static randomRange(min: number, max: number) {
        return Math.floor(Math.random() * ((max + 1) - min) + min);
    }

    static randomRangeF(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    static lerp(a: number, b: number, t: number) {
        return a + (b - a) * t;
    }

    static vec3Lerp(a: TSM.vec3, b: TSM.vec3, t: number) {
        return new TSM.vec3([Util.lerp(a.x, b.x, t),
            Util.lerp(a.y, b.y, t),
            Util.lerp(a.z, b.z, t)]);
    }

    static vec3LerpNoZ(a: TSM.vec3, b: TSM.vec3, t: number) {
        return new TSM.vec3([Util.lerp(a.x, b.x, t),
            Util.lerp(a.y, b.y, t),
            a.z]);
    }
}

class PoolArray<T> {
    array: T[];
    maxIndex;
    freeStack: number[];

    constructor(capacity: number = 64) {
        this.maxIndex = 0;
        this.array = new Array(capacity);
        this.freeStack = [];
        for (var i = capacity - 1; i >= 0; --i) {
            this.freeStack.push(i);
        }
    }

    get length(): number {
        return this.array.length;
    }

    push(obj: T) {
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
    }

    removeAt(index: number) {
        if (this.array[index] != null) {
            this.array[index] = null;
            this.freeStack.push(index);
        }
    }

    at(index: number): T {
        return this.array[index];
    }
}

class Rectangle {
    position: TSM.vec2;
    width: number;
    height: number;

    constructor(position?: TSM.vec2, width: number = 0, height: number = 0) {
        var pos = position || TSM.vec2.zero;
        this.position = new TSM.vec2([pos.x, pos.y]);
        this.width = width;
        this.height = height;
    }

    clone() {
        return new Rectangle(new TSM.vec2([this.position.x, this.position.y]), this.width, this.height);
    }

    left() {
        return this.position.x;
    }

    right() {
        return this.position.x + this.width;
    }

    top() {
        return this.position.y;
    }

    bottom() {
        return this.position.y + this.height;
    }

    xDist(other: Rectangle): number {
        return Math.max(Math.max(other.left() - this.right(), this.left() - other.right()), 0)
    }

    yDist(other: Rectangle): number {
        return Math.max(Math.max(other.top() - this.bottom(), this.top() - other.bottom()), 0)
    }

    minDist(other: Rectangle): number {
        var a: number = this.xDist(other);
        var b: number = this.yDist(other);

        return Math.sqrt(a * a + b * b);
    }

    intersects(other: Rectangle): boolean {
        return (this.xDist(other) <= 0 && this.yDist(other) <= 0);
    }

    intersectsCircle(circ: Circle): boolean {
        return circ.intersectsRectangle(this);
    }

    pointInside(point: number[]): boolean {
        var x = point[0], y = point[1];
        return (x >= this.left() && x <= this.right() &&
            y >= this.top() && y <= this.bottom());
    }

    inflate(amount: number) {
        this.position.x -= amount;
        this.position.y -= amount;
        this.width += amount * 2;
        this.height += amount * 2;
        return this;
    }
}

class Circle {
    position: TSM.vec2;
    radius: number;

    constructor(position?: TSM.vec2, radius: number = 0) {
        this.position = position || new TSM.vec2([0, 0]);
        this.radius = radius;
    }

    clone() {
        return new Circle(new TSM.vec2([this.position.x, this.position.y]), this.radius);
    }

    left(): number {
        return this.position.x - this.radius;
    }

    right(): number {
        return this.position.x + this.radius;
    }

    top(): number {
        return this.position.y - this.radius;
    }

    bottom(): number {
        return this.position.y + this.radius;
    }

    intersects(other: Circle): boolean {
        return (TSM.vec2.distance(this.position, other.position) <= this.radius + other.radius);
    }

    intersectsRectangle(rect: Rectangle): boolean {
        return rect.clone().inflate(this.radius).pointInside(this.position.xy);
    }

    pointInside(point: number[]) {
        var x = point[0], y = point[1];
        var distSqr = Math.pow(x - this.position.x, 2) + Math.pow(y - this.position.y, 2);
        return (distSqr <= this.radius * this.radius);
    }
}

