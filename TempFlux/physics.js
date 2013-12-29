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
        this.offset = offset;
        this.type = 0 /* None */;
    }
    Collider.prototype.updatePosition = function () {
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
        this.circle.position.x = this.parent.position.x + this.offset.x;
        this.circle.position.y = this.parent.position.y + this.offset.y;
    };

    CircleCollider.prototype.intersects = function (other) {
        if (!_super.prototype.intersects.call(this, other)) {
            return false;
        }

        switch (other.type) {
            case 1 /* Circle */:
                return this.intersectsCircle(other);
                break;

            case 2 /* Rectangle */:
                return this.intersectsRectangle(other);
                break;

            default:
                return false;
        }
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
        this.rectangle.position.x = this.parent.position.x + this.offset.x;
        this.rectangle.position.y = this.parent.position.y + this.offset.y;
    };

    RectangleCollider.prototype.intersects = function (other) {
        if (!_super.prototype.intersects.call(this, other)) {
            return false;
        }

        switch (other.type) {
            case 1 /* Circle */:
                return this.intersectsCircle(other);
                break;

            case 2 /* Rectangle */:
                return this.intersectsRectangle(other);
                break;

            default:
                return false;
        }
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
            b.parent.onCollisionEnter(a);
        } else if (collState == 0 /* Enter */ || collState == 1 /* Stay */) {
            this.collisions[a.parent.entityId][b.parent.entityId] = 1 /* Stay */;
            a.parent.onCollisionStay(b);
            b.parent.onCollisionStay(a);
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
            b.parent.onCollisionExit(a);
        }
    };

    CollisionManager.prototype.update = function (dt) {
        for (var key1 in this.colliders) {
            var a = this.colliders[key1];
            a.updatePosition();
            for (var key2 in this.colliders) {
                if (key2 <= key1) {
                    continue;
                }

                var b = this.colliders[key2];
                b.updatePosition();
                if (a.intersects(b)) {
                    this.registerCollision(a, b);
                } else {
                    this.collisionComplete(a, b);
                }
            }
        }
    };
    return CollisionManager;
})();
//# sourceMappingURL=physics.js.map
