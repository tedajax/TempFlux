class ImageTexture {
    texture: WebGLTexture;
    image: HTMLImageElement;
    name: string;
    loaded: boolean;

    bindTextureParameters(wrapMode: TextureWrapMode) {
        game.gl.bindTexture(game.gl.TEXTURE_2D, this.texture);
        game.gl.pixelStorei(game.gl.UNPACK_FLIP_Y_WEBGL, Number(false));
        game.gl.texImage2D(game.gl.TEXTURE_2D, 0, game.gl.RGBA, game.gl.RGBA, game.gl.UNSIGNED_BYTE, this.image);
        game.gl.texParameteri(game.gl.TEXTURE_2D, game.gl.TEXTURE_MAG_FILTER, game.gl.LINEAR);
        game.gl.texParameteri(game.gl.TEXTURE_2D, game.gl.TEXTURE_MIN_FILTER, game.gl.LINEAR);

        switch (wrapMode) {
            case TextureWrapMode.Clamp:
                game.gl.texParameteri(game.gl.TEXTURE_2D, game.gl.TEXTURE_WRAP_S, game.gl.CLAMP_TO_EDGE);
                game.gl.texParameteri(game.gl.TEXTURE_2D, game.gl.TEXTURE_WRAP_T, game.gl.CLAMP_TO_EDGE);
                break;

            default:
            case TextureWrapMode.Wrap:
                game.gl.texParameteri(game.gl.TEXTURE_2D, game.gl.TEXTURE_WRAP_S, game.gl.REPEAT);
                game.gl.texParameteri(game.gl.TEXTURE_2D, game.gl.TEXTURE_WRAP_T, game.gl.REPEAT);
                break;
        }

        game.gl.bindTexture(game.gl.TEXTURE_2D, null);
        this.loaded = true;
    }
}

enum TextureWrapMode {
    Clamp,
    Wrap
}

class TextureManager {
    textures: ImageTexture[];

    constructor() {
        this.textures = [];

        var resourceMap = game.config["resource_map"]["textures"];
        for (var key in resourceMap) {
            var value = resourceMap[key];
            var url: string = value["url"]
            var mode: string = value["mode"]
            var texMode: TextureWrapMode = (mode == "wrap") ? TextureWrapMode.Wrap : TextureWrapMode.Clamp;
            this.loadTexture(key, url, texMode);
        }
    }

    loadTexture(name, url, wrapMode: TextureWrapMode = TextureWrapMode.Wrap) {
        if (this.textures[name] != null) {
            return this.textures[name];
        }

        var imgTexture = new ImageTexture();
        imgTexture.texture = game.gl.createTexture();
        imgTexture.loaded = false;
        imgTexture.name = name;
        imgTexture.image = new Image();
        imgTexture.image.onload = () => {
            imgTexture.bindTextureParameters(wrapMode);
        }
        imgTexture.image.src = url;

        this.textures[name] = imgTexture;
        return this.textures[name];
    }

    getTexture(name) {
        return this.textures[name];
    }
} 