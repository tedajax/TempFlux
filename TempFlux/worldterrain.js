var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TerrainQuad = (function (_super) {
    __extends(TerrainQuad, _super);
    function TerrainQuad() {
        _super.apply(this, arguments);
    }
    return TerrainQuad;
})(Sprite);

var WorldTerrain = (function () {
    function WorldTerrain() {
        this.tileWidth = 64;
        this.tileHeight = 64;
        this.worldWidth = 30;
        this.worldHeight = 20;
        this.worldPixelWidth = this.tileWidth * this.worldWidth;
        this.worldPixelHeight = this.tileHeight * this.worldHeight;
        this.width = game.config["world_width"];
        this.height = game.config["world_height"];

        this.textureMapping = [];
        this.textureMapping[1] = "grid1";
        this.textureMapping[2] = "gridedge_right";
        this.textureMapping[3] = "gridedge_left";
        this.textureMapping[4] = "gridedge_top";
        this.textureMapping[5] = "gridedge_bottom";
        this.textureMapping[6] = "gridcorner_bottomright";
        this.textureMapping[7] = "gridcorner_bottomleft";
        this.textureMapping[8] = "gridcorner_topleft";
        this.textureMapping[9] = "gridcorner_topright";
        this.textureMapping[10] = "grid_blank";

        //this.worldDescriptor = this.genMapRandomly(this.width, this.height);
        this.worldDescriptor = this.genMapFromData(game.config["world_data"]);

        this.tileCountX = this.worldWidth + 1;
        this.tileCountY = this.worldHeight + 1;

        this.worldQuads = [];
        var tileTopLeft = new TSM.vec2([0, 0]);

        for (var i = 0; i < this.tileCountY; ++i) {
            this.worldQuads[i] = [];
            for (var j = 0; j < this.tileCountX; ++j) {
                var trow = j + tileTopLeft.x;
                var tcol = i + tileTopLeft.y;
                var tilePosition = new TSM.vec2([tcol, trow]);
                var quad = new TerrainQuad(this.tileWidth, this.tileHeight);
                quad.setShader(game.spriteShader);
                quad.position = this.tileSpaceToWorldSpace(tilePosition);
                quad.setTexture(this.getTextureAtTile(tilePosition));
                console.log(trow, tcol);
                this.worldQuads[i][j] = quad;
                this.worldQuads[i][j].textureIndex = this.getTextureIndexAtTile(tilePosition);
            }
        }

        this.quadsByTexture = [];
        for (var i = 0; i < this.tileCountY; ++i) {
            for (var j = 0; j < this.tileCountX; ++j) {
                var quad = this.worldQuads[i][j];
                if (this.quadsByTexture[quad.textureIndex] == null) {
                    this.quadsByTexture[quad.textureIndex] = new PoolArray();
                }
                quad.subIndex = this.quadsByTexture[quad.textureIndex].push(quad);
            }
        }
    }
    WorldTerrain.prototype.genMapRandomly = function (width, height) {
        var world = [];
        for (var i = 0; i < width; ++i) {
            world[i] = [];
            for (var j = 0; j < height; ++j) {
                world[i][j] = 1;
            }
        }

        for (var r = 0; r < 1000; ++r) {
            var t = Math.floor(Math.random() * 7) + 2;
            var rad = Math.floor(Math.random() * 5) + 1;
            var x = Math.floor(Math.random() * width);
            var y = Math.floor(Math.random() * height);
            for (var i = x - rad; i < x + rad; ++i) {
                for (var j = y - rad; j < y + rad; ++j) {
                    if (world[i] != null && world[i][j] != null) {
                        world[i][j] = t;
                    }
                }
            }
        }

        return world;
    };

    WorldTerrain.prototype.genMapFromData = function (data) {
        var world = [];
        var index = 0;
        for (var i = 0; i < this.height; ++i) {
            world[i] = [];
            for (var j = 0; j < this.width; ++j) {
                world[i][j] = data[index++];
            }
        }
        return world;
    };

    WorldTerrain.prototype.update = function () {
        for (var i = 0; i < this.tileCountY; ++i) {
            for (var j = 0; j < this.tileCountX; ++j) {
                var quad = this.worldQuads[i][j];
                var textureNeedsUpdating = false;
                var left = game.camera.position.x + this.tileWidth;
                var right = game.camera.position.x + this.worldPixelWidth - this.tileHeight;
                var top = game.camera.position.y + this.tileHeight;
                var bottom = game.camera.position.y + this.worldPixelHeight - this.tileHeight;
                while (quad.position.x < left) {
                    quad.position.x += this.worldWidth * this.tileWidth;
                    textureNeedsUpdating = true;
                }
                while (quad.position.x > right) {
                    quad.position.x -= this.worldWidth * this.tileWidth;
                    textureNeedsUpdating = true;
                }

                while (quad.position.y < top) {
                    quad.position.y += (this.worldHeight + 1) * this.tileHeight;
                    textureNeedsUpdating = true;
                }
                while (quad.position.y > bottom) {
                    quad.position.y -= (this.worldHeight + 1) * this.tileHeight;
                    textureNeedsUpdating = true;
                }

                if (textureNeedsUpdating) {
                    var tile = this.worldSpaceToTileSpace(quad.position);
                    quad.setTexture(this.getTextureAtTile(tile));

                    this.quadsByTexture[quad.textureIndex].removeAt(quad.subIndex);
                    quad.textureIndex = this.getTextureIndexAtTile(tile);
                    if (this.quadsByTexture[quad.textureIndex] == null) {
                        this.quadsByTexture[quad.textureIndex] = new PoolArray();
                    }
                    quad.subIndex = this.quadsByTexture[quad.textureIndex].push(quad);
                }
            }
        }
    };

    WorldTerrain.prototype.render = function () {
        for (var i = 0, len = this.textureMapping.length; i < len; ++i) {
            if (this.quadsByTexture[i] != null) {
                for (var j = 0, len2 = this.quadsByTexture[i].length; j < len2; ++j) {
                    var q = this.quadsByTexture[i].at(j);
                    if (q != null) {
                        q.render();
                    }
                }
            }
        }
    };

    WorldTerrain.prototype.getTextureAtTile = function (tile) {
        var row = this.worldDescriptor[tile.x];
        if (row == null) {
            return game.textures.getTexture("grid_blank");
        }
        var wd = row[tile.y];
        if (wd != null) {
            return game.textures.getTexture(this.textureMapping[wd]);
        } else {
            return game.textures.getTexture("grid_blank");
        }
    };

    WorldTerrain.prototype.getTextureIndexAtTile = function (tile) {
        var row = this.worldDescriptor[tile.x];
        if (row == null) {
            return 0;
        }
        var wd = row[tile.y];
        if (wd != null) {
            return wd;
        } else {
            return 0;
        }
    };

    WorldTerrain.prototype.worldSpaceToTileSpace = function (world) {
        var tileSpaceX = Math.floor(world.x / this.tileWidth) + Math.floor(this.width / 2);
        var tileSpaceY = Math.floor(world.y / this.tileHeight) + Math.floor(this.height / 2);

        return new TSM.vec2([tileSpaceY, tileSpaceX]);
    };

    WorldTerrain.prototype.tileSpaceToWorldSpace = function (tile) {
        var tx = tile.x - Math.floor(this.width / 2);
        var ty = tile.y - Math.floor(this.height / 2);

        return new TSM.vec3([ty * this.tileHeight, tx * this.tileWidth, 0]);
    };

    WorldTerrain.prototype.cameraTileMin = function () {
        var camTL = TSM.vec3.sum(game.camera.position, new TSM.vec3([-this.worldWidth / 2, 0, 0]));
        return this.worldSpaceToTileSpace(camTL);
    };

    WorldTerrain.prototype.cameraTileMax = function () {
        var camBR = TSM.vec3.sum(game.camera.position, new TSM.vec3([this.worldWidth / 2, 0, 0]));
        return this.worldSpaceToTileSpace(camBR);
    };
    return WorldTerrain;
})();
//# sourceMappingURL=worldterrain.js.map
