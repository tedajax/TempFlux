var TextCharacterObject = (function () {
    function TextCharacterObject(char, font) {
        this.font = font;
        this.position = new TSM.vec3([0, 0, 1]);
        this.scale = new TSM.vec3([1, 1, 1]);
        this.setChar(char);
    }
    TextCharacterObject.prototype.setChar = function (char) {
        this.char = char;

        var width = game.fonts.getFont(this.font).getCodeWidth(char);
        var height = game.fonts.getFont(this.font).getCodeHeight(char);

        var offset = game.fonts.getFont(this.font).getCodeOffset(char);
        this.offset = new TSM.vec3([0, 0, 0]);

        this.sprite = new Sprite(width, height);
        this.sprite.setShader(game.spriteShader);
        this.sprite.mesh = game.meshFactory.createTextQuad(width, height, this.font, char);
        this.sprite.setTexture(game.fonts.getFont(this.font).texture);
        this.sprite.alpha = true;
        this.sprite.position = TSM.vec3.sum(this.position, this.offset);

        //this.sprite.setBindTexture(false);
        this.sprite.mesh = game.meshFactory.createTextQuad(width, height, this.font, char);
    };

    TextCharacterObject.prototype.setPosition = function (posArray) {
        if (posArray.length > 0) {
            this.position.x = posArray[0];
        }
        if (posArray.length > 1) {
            this.position.y = posArray[1];
        }
        if (posArray.length > 2) {
            this.position.z = posArray[2];
        }

        var scaledOffset = this.offset.copy();
        scaledOffset.x *= this.scale.x;
        scaledOffset.y *= this.scale.y;
        this.sprite.position = TSM.vec3.sum(this.position, scaledOffset);
    };

    TextCharacterObject.prototype.update = function (dt) {
        var scaledOffset = this.offset.copy();
        scaledOffset.x *= this.scale.x;
        scaledOffset.y *= this.scale.y;
        this.sprite.position = TSM.vec3.sum(this.position, scaledOffset);
    };

    TextCharacterObject.prototype.render = function () {
        this.sprite.render();
    };
    return TextCharacterObject;
})();

var TextObject = (function () {
    function TextObject(text, font) {
        this.position_ = new TSM.vec3([400, 400, 0]);
        this.scale_ = new TSM.vec3([1, 1, 1]);
        this.font = font;
        this.hidden = false;
        this.setText(text);
    }
    TextObject.prototype.setText = function (text) {
        this.characters = [];

        var pos = this.position_.x;
        for (var i = 0, len = text.length; i < len; ++i) {
            var char = new TextCharacterObject(text[i], this.font);
            char.setPosition([pos, this.position_.y, 0]);
            pos += game.fonts.getFont(this.font).getCodeSpacing(text[i]);
            this.characters.push(char);
        }

        this.text = text;
    };

    TextObject.prototype.setFont = function (font) {
        this.font = font;

        //TODO: not this
        this.setText(this.text);
    };

    Object.defineProperty(TextObject.prototype, "position", {
        set: function (value) {
            this.position_ = value;

            var pos = this.position_.x;
            for (var i = 0, len = this.characters.length; i < len; ++i) {
                var char = this.characters[i];
                char.setPosition([pos, this.position_.y, 0]);
                pos += game.fonts.getFont(this.font).getCodeSpacing(this.text[i]);
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(TextObject.prototype, "scale", {
        set: function (value) {
            this.scale_ = value;

            var pos = this.position_.x;
            for (var i = 0, len = this.characters.length; i < len; ++i) {
                var char = this.characters[i];
                char.sprite.scale.x = this.scale_.x;
                char.sprite.scale.y = this.scale_.y;
                char.scale = this.scale_;
                char.setPosition([pos, this.position_.y, 0]);
                pos += game.fonts.getFont(this.font).getCodeSpacing(this.text[i]) * this.scale_.x;
            }
        },
        enumerable: true,
        configurable: true
    });

    TextObject.prototype.update = function (dt) {
        for (var i = 0, len = this.characters.length; i < len; ++i) {
            this.characters[i].update(dt);
        }
    };

    TextObject.prototype.render = function () {
        //game.gl.activeTexture(game.gl.TEXTURE0);
        //game.gl.bindTexture(game.gl.TEXTURE_2D, game.fonts.getFont(this.font).texture.texture);
        //game.gl.uniform1i(game.spriteShader.uniforms["texture"], 0);
        if (this.hidden) {
            return;
        }

        for (var i = 0, len = this.characters.length; i < len; ++i) {
            this.characters[i].render();
        }
    };
    return TextObject;
})();

var TextObjectManager = (function () {
    function TextObjectManager() {
        this.textObjects = {};
        this.currentId = 0;
    }
    TextObjectManager.prototype.add = function (text) {
        if (text == null) {
            return;
        }

        text.textObjectId = this.currentId++;
        this.textObjects[text.textObjectId] = text;
        return text;
    };

    TextObjectManager.prototype.update = function (dt) {
        for (var t in this.textObjects) {
            this.textObjects[t].update(dt);
        }
    };

    TextObjectManager.prototype.render = function () {
        for (var t in this.textObjects) {
            this.textObjects[t].render();
        }
    };
    return TextObjectManager;
})();
//# sourceMappingURL=text.js.map
