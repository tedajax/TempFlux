class GameObjectManager {
    gameObjects: {};
    destroyQueue: number[];
    addQueue: GameObject[];
    addLock: boolean;

    currentId: number;
    entityCount: number;

    constructor() {
        this.gameObjects = {};
        this.destroyQueue = [];
        this.addQueue = [];
        this.currentId = 0;
    }

    add(gameObject: GameObject) {
        if (!this.addLock) {
            var entityId = gameObject.entityId;
            if (entityId < 0) {
                entityId = this.currentId++;
            }
            if (this.gameObjects[entityId] == null) {
                this.gameObjects[entityId] = gameObject;
                gameObject.entityId = entityId;
            }
            return gameObject;
        } else {
            var entityId = gameObject.entityId;
            if (entityId < 0) {
                entityId = this.currentId++;
                gameObject.entityId = entityId;
            }
            this.addQueue.push(gameObject);
        }
    }

    remove(entityId: number) {
        if (entityId in this.gameObjects) {
            this.gameObjects[entityId].onDestroy();
            delete this.gameObjects[entityId];
        }
    }

    update(dt) {
        this.addLock = true;
        this.entityCount = 0;
        for (var entityId in this.gameObjects) {
            var go = <GameObject>this.gameObjects[entityId];
            if (go != null) {
                go.update(dt);
                if (go.shouldDestroy) {
                    this.destroyQueue.push(entityId);
                }
                this.entityCount++;
            }
        }
        this.addLock = false;

        while (this.addQueue.length > 0) {
            var addedGo = this.addQueue[0];
            this.add(addedGo);
            this.addQueue.shift();
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