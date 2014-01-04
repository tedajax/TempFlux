var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CollisionLayer;
(function (CollisionLayer) {
    CollisionLayer[CollisionLayer["Default"] = 1] = "Default";
    CollisionLayer[CollisionLayer["Player"] = 2] = "Player";
    CollisionLayer[CollisionLayer["PlayerProjectile"] = 4] = "PlayerProjectile";
    CollisionLayer[CollisionLayer["Enemy"] = 8] = "Enemy";
    CollisionLayer[CollisionLayer["EnemyProjectile"] = 16] = "EnemyProjectile";
})(CollisionLayer || (CollisionLayer = {}));

var ColliderType;
(function (ColliderType) {
    ColliderType[ColliderType["None"] = 0] = "None";
    ColliderType[ColliderType["Circle"] = 1] = "Circle";
    ColliderType[ColliderType["Rectangle"] = 2] = "Rectangle";
})(ColliderType || (ColliderType = {}));

var Collider = (function () {
    function Collider(parent, offset, layer) {
        if (typeof offset === "undefined") { offset = TSM.vec2.zero; }
        if (typeof layer === "undefined") { layer = 1 /* Default */; }
        this.parent = parent;
        this.layer = layer;
        this.enabled = true;
        this.offset = offset;
        this.type = 0 /* None */;
        this.continuousCollision = false;
        this.previousPosition = new TSM.vec2([0, 0]);
    }
    Collider.prototype.updatePosition = function () {
    };

    Collider.prototype.getPositionX = function () {
        return 0;
    };

    Collider.prototype.getPositionY = function () {
        return 0;
    };

    Collider.prototype.intersects = function (other) {
        if ((this.layer & other.layer) == 0) {
            return false;
        }
        return true;
    };
    return Collider;
})();

var CircleCollider = (function (_super) {
    __extends(CircleCollider, _super);
    function CircleCollider(parent, radius, offset, layer) {
        if (typeof offset === "undefined") { offset = TSM.vec2.zero; }
        if (typeof layer === "undefined") { layer = 1 /* Default */; }
        _super.call(this, parent, offset, layer);

        var position = new TSM.vec2([this.parent.position.x, this.parent.position.y]);
        position.x += offset.x;
        position.y += offset.y;
        this.circle = new Circle(position, radius);

        this.type = 1 /* Circle */;
    }
    CircleCollider.prototype.updatePosition = function () {
        this.previousPosition.x = this.circle.position.x;
        this.previousPosition.y = this.circle.position.y;
        this.circle.position.x = this.parent.position.x + this.offset.x;
        this.circle.position.y = this.parent.position.y + this.offset.y;
    };

    CircleCollider.prototype.getPositionX = function () {
        return this.circle.position.x;
    };

    CircleCollider.prototype.getPositionY = function () {
        return this.circle.position.y;
    };

    CircleCollider.prototype.intersects = function (other) {
        if (!_super.prototype.intersects.call(this, other)) {
            return false;
        }

        switch (other.type) {
            case 1 /* Circle */:
                if (this.continuousCollision) {
                    return this.continuousIntersectsCircle(other);
                } else {
                    return this.intersectsCircle(other);
                }
                break;

            case 2 /* Rectangle */:
                if (this.continuousCollision) {
                    return this.continuousIntersectsRectangle(other);
                } else {
                    return this.intersectsRectangle(other);
                }
                break;

            default:
                return false;
        }
    };

    CircleCollider.prototype.continuousIntersectsCircle = function (other) {
        var prevCircle = new Circle(this.previousPosition, this.circle.radius);
        var midCircle = Circle.lerp(prevCircle, this.circle, 0.5);
        var circ = other;
        return (this.circle.intersects(circ.circle) || midCircle.intersects(circ.circle) || prevCircle.intersects(circ.circle));
    };

    CircleCollider.prototype.continuousIntersectsRectangle = function (other) {
        var prevCircle = new Circle(this.previousPosition, this.circle.radius);
        var midCircle = Circle.lerp(prevCircle, this.circle, 0.5);
        var rect = other;
        return (this.circle.intersectsRectangle(rect.rectangle) || midCircle.intersectsRectangle(rect.rectangle) || prevCircle.intersectsRectangle(rect.rectangle));
    };

    CircleCollider.prototype.intersectsCircle = function (other) {
        var circ = other;
        return (this.circle.intersects(circ.circle));
    };

    CircleCollider.prototype.intersectsRectangle = function (other) {
        var rect = other;
        return (this.circle.intersectsRectangle(rect.rectangle));
    };
    return CircleCollider;
})(Collider);

var RectangleCollider = (function (_super) {
    __extends(RectangleCollider, _super);
    function RectangleCollider(parent, width, height, offset, layer) {
        if (typeof offset === "undefined") { offset = TSM.vec2.zero; }
        if (typeof layer === "undefined") { layer = 1 /* Default */; }
        _super.call(this, parent, offset, layer);

        var position = new TSM.vec2([this.parent.position.x, this.parent.position.y]);
        position.x += offset.x;
        position.y += offset.y;
        this.rectangle = new Rectangle(position, width, height);

        this.type = 2 /* Rectangle */;
    }
    RectangleCollider.prototype.updatePosition = function () {
        this.previousPosition.x = this.rectangle.position.x;
        this.previousPosition.y = this.rectangle.position.y;
        this.rectangle.position.x = this.parent.position.x + this.offset.x;
        this.rectangle.position.y = this.parent.position.y + this.offset.y;
    };

    RectangleCollider.prototype.getPositionX = function () {
        return this.rectangle.position.x;
    };

    RectangleCollider.prototype.getPositionY = function () {
        return this.rectangle.position.y;
    };

    RectangleCollider.prototype.intersects = function (other) {
        if (!_super.prototype.intersects.call(this, other)) {
            return false;
        }

        switch (other.type) {
            case 1 /* Circle */:
                if (this.continuousCollision) {
                    return this.continuousIntersectsCircle(other);
                } else {
                    return this.intersectsCircle(other);
                }
                break;

            case 2 /* Rectangle */:
                if (this.continuousCollision) {
                    return this.continuousIntersectsRectangle(other);
                } else {
                    return this.intersectsRectangle(other);
                }
                break;

            default:
                return false;
        }
    };

    RectangleCollider.prototype.continuousIntersectsCircle = function (other) {
        var prevRectangle = new Rectangle(this.previousPosition, this.rectangle.width, this.rectangle.height);
        var midRectangle = Rectangle.lerp(prevRectangle, this.rectangle, 0.5);
        var circ = other;
        return (circ.circle.intersectsRectangle(this.rectangle) || circ.circle.intersectsRectangle(midRectangle) || circ.circle.intersectsRectangle(prevRectangle));
    };

    RectangleCollider.prototype.continuousIntersectsRectangle = function (other) {
        var prevRectangle = new Rectangle(this.previousPosition, this.rectangle.width, this.rectangle.height);
        var midRectangle = Rectangle.lerp(prevRectangle, this.rectangle, 0.5);
        var rect = other;
        return (this.rectangle.intersects(rect.rectangle) || midRectangle.intersects(rect.rectangle) || prevRectangle.intersects(rect.rectangle));
    };

    RectangleCollider.prototype.intersectsCircle = function (other) {
        var circ = other;
        return (circ.circle.intersectsRectangle(this.rectangle));
    };

    RectangleCollider.prototype.intersectsRectangle = function (other) {
        var rect = other;
        return (this.rectangle.intersects(rect.rectangle));
    };
    return RectangleCollider;
})(Collider);

var CollisionState;
(function (CollisionState) {
    CollisionState[CollisionState["Enter"] = 0] = "Enter";
    CollisionState[CollisionState["Stay"] = 1] = "Stay";
    CollisionState[CollisionState["Exit"] = 2] = "Exit";
})(CollisionState || (CollisionState = {}));

var CollisionManager = (function () {
    function CollisionManager() {
        this.colliders = {};
        this.collisions = {};
    }
    CollisionManager.prototype.register = function (collider) {
        if (this.colliders[collider.parent.entityId] == null) {
            this.colliders[collider.parent.entityId] = collider;
        }
    };

    CollisionManager.prototype.release = function (entityId) {
        if (this.colliders[entityId] != null) {
            this.clearColliderCollisions(this.colliders[entityId]);
            delete this.colliders[entityId];
        }
    };

    CollisionManager.prototype.registerCollision = function (a, b) {
        if (this.collisions[a.parent.entityId] == null) {
            this.collisions[a.parent.entityId] = {};
        }

        var collState = this.collisions[a.parent.entityId][b.parent.entityId];
        if (collState == null || collState == 2 /* Exit */) {
            this.collisions[a.parent.entityId][b.parent.entityId] = 0 /* Enter */;
            a.parent.onCollisionEnter(b);
        } else if (collState == 0 /* Enter */ || collState == 1 /* Stay */) {
            this.collisions[a.parent.entityId][b.parent.entityId] = 1 /* Stay */;
            a.parent.onCollisionStay(b);
        }
    };

    CollisionManager.prototype.collisionComplete = function (a, b) {
        if (this.collisions[a.parent.entityId] == null) {
            return;
        }

        var collState = this.collisions[a.parent.entityId][b.parent.entityId];
        if (collState == null) {
            return;
        }

        if (collState == 2 /* Exit */) {
            // how'd we get here?
        } else {
            this.collisions[a.parent.entityId][b.parent.entityId] = 2 /* Exit */;
            a.parent.onCollisionExit(b);
        }
    };

    CollisionManager.prototype.clearColliderCollisions = function (a) {
        if (this.collisions[a.parent.entityId] == null) {
            return;
        }

        for (var i in this.collisions[a.parent.entityId]) {
            var c = this.collisions[a.parent.entityId][i];
            if (c == 0 /* Enter */ || c == 1 /* Stay */) {
                this.collisions[a.parent.entityId][i] = 2 /* Exit */;
                var go = game.gameObjects.gameObjects[i];
                if (go != null) {
                    go.onCollisionExit(a);
                }
            }
        }
    };

    CollisionManager.prototype.overlapCircle = function (position, radius) {
        var collider = new CircleCollider(game.gameObjects.root, radius, position);
        var result = [];

        for (var key in this.colliders) {
            var c = this.colliders[key];

            if (!c.enabled) {
                continue;
            }
            c.updatePosition();

            if (collider.intersects(c)) {
                result.push(c.parent);
            }
        }

        return result;
    };

    CollisionManager.prototype.update = function (dt) {
        for (var key1 in this.colliders) {
            var a = this.colliders[key1];
            if (!a.enabled) {
                continue;
            }
            a.updatePosition();
            for (var key2 in this.colliders) {
                if (key2 <= key1) {
                    continue;
                }

                var b = this.colliders[key2];
                if (!b.enabled) {
                    continue;
                }

                if (a.parent.tag == b.parent.tag) {
                    continue;
                }

                b.updatePosition();

                if (Math.abs(a.getPositionX() - b.getPositionX()) > 100) {
                    continue;
                }
                if (Math.abs(a.getPositionY() - b.getPositionY()) > 100) {
                    continue;
                }

                if (a.intersects(b) || b.intersects(a)) {
                    this.registerCollision(a, b);
                    this.registerCollision(b, a);
                } else {
                    this.collisionComplete(a, b);
                    this.collisionComplete(b, a);
                }
            }
        }
    };
    return CollisionManager;
})();
//# sourceMappingURL=physics.js.map
