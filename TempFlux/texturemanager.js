var ImageTexture = (function () {
    function ImageTexture() {
    }
    ImageTexture.prototype.bindTextureParameters = function (wrapMode) {
        game.gl.bindTexture(game.gl.TEXTURE_2D, this.texture);
        game.gl.pixelStorei(game.gl.UNPACK_FLIP_Y_WEBGL, Number(false));
        game.gl.texImage2D(game.gl.TEXTURE_2D, 0, game.gl.RGBA, game.gl.RGBA, game.gl.UNSIGNED_BYTE, this.image);
        game.gl.texParameteri(game.gl.TEXTURE_2D, game.gl.TEXTURE_MAG_FILTER, game.gl.LINEAR);
        game.gl.texParameteri(game.gl.TEXTURE_2D, game.gl.TEXTURE_MIN_FILTER, game.gl.LINEAR);

        switch (wrapMode) {
            case 0 /* Clamp */:
                game.gl.texParameteri(game.gl.TEXTURE_2D, game.gl.TEXTURE_WRAP_S, game.gl.CLAMP_TO_EDGE);
                game.gl.texParameteri(game.gl.TEXTURE_2D, game.gl.TEXTURE_WRAP_T, game.gl.CLAMP_TO_EDGE);
                break;

            default:
            case 1 /* Wrap */:
                game.gl.texParameteri(game.gl.TEXTURE_2D, game.gl.TEXTURE_WRAP_S, game.gl.REPEAT);
                game.gl.texParameteri(game.gl.TEXTURE_2D, game.gl.TEXTURE_WRAP_T, game.gl.REPEAT);
                break;
        }

        game.gl.bindTexture(game.gl.TEXTURE_2D, null);
        this.loaded = true;
    };
    return ImageTexture;
})();

var TextureWrapMode;
(function (TextureWrapMode) {
    TextureWrapMode[TextureWrapMode["Clamp"] = 0] = "Clamp";
    TextureWrapMode[TextureWrapMode["Wrap"] = 1] = "Wrap";
})(TextureWrapMode || (TextureWrapMode = {}));

var TextureManager = (function () {
    function TextureManager() {
        this.textures = [];

        var resourceMap = game.config["resource_map"]["textures"];
        for (var key in resourceMap) {
            var value = resourceMap[key];
            var url = value["url"];
            var mode = value["mode"];
            var texMode = (mode == "wrap") ? 1 /* Wrap */ : 0 /* Clamp */;
            this.loadTexture(key, url, texMode);
        }
    }
    TextureManager.prototype.loadTexture = function (name, url, wrapMode) {
        if (typeof wrapMode === "undefined") { wrapMode = 1 /* Wrap */; }
        if (this.textures[name] != null) {
            return this.textures[name];
        }

        var imgTexture = new ImageTexture();
        imgTexture.texture = game.gl.createTexture();
        imgTexture.loaded = false;
        imgTexture.name = name;
        imgTexture.image = new Image();
        imgTexture.image.onload = function () {
            imgTexture.bindTextureParameters(wrapMode);
        };
        imgTexture.image.src = url;

        this.textures[name] = imgTexture;
        return this.textures[name];
    };

    TextureManager.prototype.getTexture = function (name) {
        return this.textures[name];
    };
    return TextureManager;
})();
//# sourceMappingURL=texturemanager.js.map
