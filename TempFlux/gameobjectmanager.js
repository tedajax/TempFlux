var GameObjectManager = (function () {
    function GameObjectManager() {
        this.gameObjects = {};
        this.destroyQueue = [];
        this.currentId = 0;
    }
    GameObjectManager.prototype.add = function (gameObject) {
        var entityId = this.currentId++;
        if (this.gameObjects[entityId] == null) {
            this.gameObjects[entityId] = gameObject;
            gameObject.entityId = entityId;
        }
        return gameObject;
    };

    GameObjectManager.prototype.remove = function (entityId) {
        if (entityId in this.gameObjects) {
            delete this.gameObjects[entityId];
        }
    };

    GameObjectManager.prototype.update = function (dt) {
        for (var entityId in this.gameObjects) {
            var go = this.gameObjects[entityId];
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
    };

    GameObjectManager.prototype.render = function () {
        for (var key in this.gameObjects) {
            var go = this.gameObjects[key];
            if (go != null) {
                go.render();
            }
        }
    };
    return GameObjectManager;
})();
//# sourceMappingURL=gameobjectmanager.js.map
