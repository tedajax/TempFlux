enum CollisionLayer {
    Default = 1,
    Player = 2,
    PlayerProjectile = 4,
    Enemy = 8,
    EnemyProjectile = 16
}

enum ColliderType {
    None,
    Circle,
    Rectangle
}

class Collider {
    layer: number;
    type: ColliderType; 
    parent: GameObject
    offset: TSM.vec2;

    constructor(parent: GameObject, offset: TSM.vec2 = TSM.vec2.zero, layer: number = CollisionLayer.Default) {
        this.parent = parent;
        this.layer = layer;
        this.offset = offset;
        this.type = ColliderType.None;
    }

    updatePosition() {

    }

    intersects(other: Collider): boolean {
        if ((this.layer & other.layer) == 0) {
            return false;
        }
        return true;
    }
} 

class CircleCollider extends Collider {
    circle: Circle;

    constructor(parent: GameObject, radius: number, offset: TSM.vec2 = TSM.vec2.zero, layer: number = CollisionLayer.Default) {
        super(parent, offset, layer);

        var position = new TSM.vec2([this.parent.position.x, this.parent.position.y]);
        position.x += offset.x;
        position.y += offset.y;
        this.circle = new Circle(position, radius);

        this.type = ColliderType.Circle;
    }

    updatePosition() {
        this.circle.position.x = this.parent.position.x + this.offset.x;
        this.circle.position.y = this.parent.position.y + this.offset.y;
    }

    intersects(other: Collider): boolean {
        if (!super.intersects(other)) {
            return false;
        }

        switch (other.type) {
            case ColliderType.Circle:
                return this.intersectsCircle(other);
                break;

            case ColliderType.Rectangle:
                return this.intersectsRectangle(other);
                break;

            default:
                return false;
        }
    }

    intersectsCircle(other: Collider): boolean {
        var circ = <CircleCollider>other;
        return (this.circle.intersects(circ.circle));
    }

    intersectsRectangle(other: Collider): boolean {
        var rect = <RectangleCollider>other;
        return (this.circle.intersectsRectangle(rect.rectangle));
    }
}

class RectangleCollider extends Collider {
    rectangle: Rectangle;

    constructor(parent: GameObject, width: number, height: number, offset: TSM.vec2 = TSM.vec2.zero, layer: number = CollisionLayer.Default) {
        super(parent, offset, layer);

        var position = new TSM.vec2([this.parent.position.x, this.parent.position.y]);
        position.x += offset.x;
        position.y += offset.y;
        this.rectangle = new Rectangle(position, width, height);

        this.type = ColliderType.Rectangle;
    }

    updatePosition() {
        this.rectangle.position.x = this.parent.position.x + this.offset.x;
        this.rectangle.position.y = this.parent.position.y + this.offset.y;
    }

    intersects(other: Collider): boolean {
        if (!super.intersects(other)) {
            return false;
        }

        switch (other.type) {
            case ColliderType.Circle:
                return this.intersectsCircle(other);
                break;

            case ColliderType.Rectangle:
                return this.intersectsRectangle(other);
                break;

            default:
                return false;
        }
    }

    intersectsCircle(other: Collider): boolean {
        var circ = <CircleCollider>other;
        return (circ.circle.intersectsRectangle(this.rectangle));
    }

    intersectsRectangle(other: Collider): boolean {
        var rect = <RectangleCollider>other;
        return (this.rectangle.intersects(rect.rectangle));
    }
}

enum CollisionState {
    Enter,
    Stay,
    Exit
}

class CollisionManager {
    colliders: {};
    collisions: {};

    constructor() {
        this.colliders = {};
        this.collisions = {};
    }

    register(collider: Collider) {
        if (this.colliders[collider.parent.entityId] == null) {
            this.colliders[collider.parent.entityId] = collider;
        }
    }

    release(entityId: number) {
        if (this.colliders[entityId] != null) {
            delete this.colliders[entityId];
        }
    }

    registerCollision(a: Collider, b: Collider) {
        if (this.collisions[a.parent.entityId] == null) {
            this.collisions[a.parent.entityId] = {};
        }

        var collState = this.collisions[a.parent.entityId][b.parent.entityId];
        if (collState == null || collState == CollisionState.Exit) {
            this.collisions[a.parent.entityId][b.parent.entityId] = CollisionState.Enter;
            a.parent.onCollisionEnter(b);
            b.parent.onCollisionEnter(a);
        } else if (collState == CollisionState.Enter || collState == CollisionState.Stay) {
            this.collisions[a.parent.entityId][b.parent.entityId] = CollisionState.Stay;
            a.parent.onCollisionStay(b);
            b.parent.onCollisionStay(a);
        }
    }

    collisionComplete(a: Collider, b: Collider) {
        if (this.collisions[a.parent.entityId] == null) {
            return;
        }

        var collState = this.collisions[a.parent.entityId][b.parent.entityId];
        if (collState == null) {
            return;
        }

        if (collState == CollisionState.Exit) {
            // how'd we get here?
        } else {
            this.collisions[a.parent.entityId][b.parent.entityId] = CollisionState.Exit;
            a.parent.onCollisionExit(b);
            b.parent.onCollisionExit(a);
        }
    }

    update(dt) {
        //for now no broadphase just compare everything to everything
        for (var key1 in this.colliders) {
            var a: Collider = this.colliders[key1];
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
    }
}