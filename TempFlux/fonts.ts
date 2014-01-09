class FontChar {
    code: string;
    width: number;
    rect: Rectangle;
    offset: TSM.vec2;

    constructor(code: string, width: number, offset: {}, rect: {}) {
        this.code = code;
        this.width = width;
        this.offset = new TSM.vec2([offset["x"], offset["y"]]);
        this.rect = new Rectangle(new TSM.vec2([rect["x"], rect["y"]]), rect["w"], rect["h"]);
    }
}

class Font {
    texture: ImageTexture;
    data: {};

    family: string;
    style: string;
    height: number;
    size: number;
    chars: {};

    constructor(texture: ImageTexture, data: {}) {
        this.texture = texture;

        this.family = data["family"];
        this.style = data["style"];
        this.height = <number>data["height"];
        this.size = <number>data["size"];

        this.chars = {};

        var chars = <Array<any>>data["chars"];
        for (var i = 0, len = chars.length; i < len; ++i) {
            var c = chars[i];
            var fc = new FontChar(c["code"], c["width"], c["offset"], c["rect"]);
            this.chars[fc.code] = fc;
        }
    }

    getCodeUVs(code: string) {
        var c = <FontChar>this.chars[code];
        if (c == null) {
            return null;
        }

        var w = 512;
        var h = 512;
        return {
            u1: c.rect.left / w,
            u2: c.rect.right / w,
            v1: c.rect.top / h,
            v2: c.rect.bottom / h
        };
    }

    getCodeWidth(code: string) {
        var c = <FontChar>this.chars[code];
        if (c == null) {
            return null;
        }

        return c.width;
    }

    getCodeOffset(code: string) {
        var c = <FontChar>this.chars[code];
        if (c == null) {
            return null;
        }

        return {
            x: c.offset.x,
            y: c.offset.y
        }
    }
}

class FontManager {
    fonts: {}

    constructor() {
        this.fonts = {};

        var fonts = game.config["resource_map"]["fonts"];
        for (var key in fonts) {
            var f = fonts[key];
            var texture = game.textures.getTexture(f["texture"]);
            var data = loadJsonFile(f["data"]);

            this.fonts[key] = new Font(texture, data);
        }
    }

    getFont(name: string) {
        return <Font>this.fonts[name];
    }
} 