﻿var FontChar = (function () {
    function FontChar(code, width, offset, rect) {
        this.code = code;
        this.width = width;
        this.offset = new TSM.vec2([offset["x"], offset["y"]]);
        this.rect = new Rectangle(new TSM.vec2([rect["x"], rect["y"]]), rect["w"], rect["h"]);
    }
    return FontChar;
})();

var Font = (function () {
    function Font(texture, data) {
        this.texture = texture;

        this.family = data["family"];
        this.style = data["style"];
        this.height = data["height"];
        this.size = data["size"];

        this.chars = {};

        var chars = data["chars"];
        for (var i = 0, len = chars.length; i < len; ++i) {
            var c = chars[i];
            var fc = new FontChar(c["code"], c["width"], c["offset"], c["rect"]);
            this.chars[fc.code] = fc;
        }
    }
    Font.prototype.getCodeUVs = function (code) {
        var c = this.chars[code];
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
    };
    return Font;
})();

var FontManager = (function () {
    function FontManager() {
        this.fonts = {};

        var fonts = game.config["resource_map"]["fonts"];
        for (var key in fonts) {
            var f = fonts[key];
            var texture = game.textures.getTexture(f["texture"]);
            var data = loadJsonFile(f["data"]);

            this.fonts[key] = new Font(texture, data);
        }
    }
    FontManager.prototype.getFont = function (name) {
        return this.fonts[name];
    };
    return FontManager;
})();
//# sourceMappingURL=fonts.js.map
