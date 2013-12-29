var WorldObjectType;
(function (WorldObjectType) {
    WorldObjectType[WorldObjectType["Mountain"] = 0] = "Mountain";
    WorldObjectType[WorldObjectType["Tree"] = 1] = "Tree";
})(WorldObjectType || (WorldObjectType = {}));

var WorldObjectDescriptor = (function () {
    function WorldObjectDescriptor(pos, type) {
        this.position = pos;
        this.objectType = type;
    }
    return WorldObjectDescriptor;
})();

var WorldObjects = (function () {
    function WorldObjects() {
        this.currentObjectId = 1;

        this.freeIdStack = [];
        this.worldObjects = {};
        this.worldDescriptors = [];

        this.textureMap = {};
        this.textureMap[0 /* Mountain */] = "mountain";
        this.textureMap[1 /* Tree */] = "tree";

        var width = game.config["world_width"];
        var height = game.config["world_height"];
        this.width = width;
        this.height = height;
        var data = game.config["world_data"];
        for (var index in data) {
            var d = data[index];
            var pos = this.indexToCoordinate(index);
            var right = data[this.coordinatesToIndex(pos.x + 1, pos.y)];
            var left = data[this.coordinatesToIndex(pos.x - 1, pos.y)];
            var top = data[this.coordinatesToIndex(pos.x, pos.y - 1)];
            var bottom = data[this.coordinatesToIndex(pos.x, pos.y + 1)];

            if (d == 6 && (right != 6 || left != 6 || top != 6 || bottom != 6)) {
                var position = new TSM.vec3([index % width, Math.floor(index / width), 0]);
                this.worldDescriptors.push(new WorldObjectDescriptor(position, 0 /* Mountain */));
            }
        }

        for (var i = 0, len = this.worldDescriptors.length; i < len; ++i) {
            var sprite = new Sprite(3, 3);
            sprite.setShader(game.spriteShader);
            sprite.alpha = true;
            var r = Math.floor(Math.random() * 2);
            sprite.texture = game.textures.getTexture((r == 0) ? "mountain" : "tree0");
            sprite.rotation.x = 90 - game.camera.cameraAngle;
            sprite.position = this.worldDescriptors[i].position;
            sprite.position.x -= Math.floor(width / 2);
            sprite.position.y -= Math.floor(height / 2);
            var gameObj = game.gameObjects.add(new GameObject(null, null, sprite), 10000 + i);
            gameObj.terrainOffset = -0.6;
            this.worldObjects[this.currentObjectId++] = gameObj;
        }
    }
    WorldObjects.prototype.indexToCoordinate = function (index) {
        return {
            x: index % this.width,
            y: Math.floor(index / this.width)
        };
    };

    WorldObjects.prototype.coordinatesToIndex = function (x, y) {
        return y * this.width + x % this.width;
    };
    return WorldObjects;
})();
//# sourceMappingURL=worldobjects.js.map
