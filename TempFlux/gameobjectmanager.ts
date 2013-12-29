class GameObjectManager {
    gameObjects: {};
    destroyQueue: number[];
    currentId: number;

    constructor() {
        this.gameObjects = {};
        this.destroyQueue = [];
        this.currentId = 0;
    }

    add(gameObject: GameObject) {
        var entityId = this.currentId++;
        if (this.gameObjects[entityId] == null) {
            this.gameObjects[entityId] = gameObject;
            gameObject.entityId = entityId;
        }
        return gameObject;
    }

    remove(entityId: number) {
        if (entityId in this.gameObjects) {
            delete this.gameObjects[entityId];
        }
    }

    update(dt) {
        for (var entityId in this.gameObjects) {
            var go = <GameObject>this.gameObjects[entityId];
            if (go != null) {
                go.update(dt);
                if (go.shouldDestroy) {
                    this.destroyQueue.push(entityId);
                }
            }
        }

        while (this.destroyQueue.length > 0) {
            var removeId = this.destroyQueue[0];
            this.remove(removeId);
            this.destroyQueue.shift();
        }
    }

    render() {
        for (var key in this.gameObjects) {
            var go = this.gameObjects[key];
            if (go != null) {
                go.render();
            }
        }
    }
} 