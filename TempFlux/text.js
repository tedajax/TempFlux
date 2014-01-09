var TextCharacterObject = (function () {
    function TextCharacterObject(char) {
        this.position = new TSM.vec3([0, 0, 1]);
        this.setChar(char);
    }
    TextCharacterObject.prototype.setChar = function (char) {
        this.char = char;

        var width = game.fonts.getFont("combo").getCodeWidth(char);
        var height = game.fonts.getFont("combo").height;

        var offset = game.fonts.getFont("combo").getCodeOffset(char);
        this.offset = new TSM.vec3([offset.x, offset.y, 0]);

        this.sprite = new Sprite(width, height);
        this.sprite.setShader(game.spriteShader);
        this.sprite.mesh = game.meshFactory.createTextQuad(width, height, "combo", char);
        this.sprite.setTexture(game.fonts.getFont("combo").texture);
        this.sprite.alpha = true;
        this.sprite.position = TSM.vec3.sum(this.position, this.offset);

        this.sprite.mesh = game.meshFactory.createTextQuad(width, height, "combo", char);
    };

    TextCharacterObject.prototype.setPosition = function (posArray) {
        if (posArray.length > 0) {
            this.position.x = posArray[0];
        } else if (posArray.length > 1) {
            this.position.y = posArray[1];
        } else if (posArray.length > 2) {
            this.position.z = posArray[2];
        }

        this.sprite.position = TSM.vec3.sum(this.position, this.offset);
    };

    TextCharacterObject.prototype.update = function (dt) {
        this.sprite.position = TSM.vec3.sum(this.position, this.offset);
    };

    TextCharacterObject.prototype.render = function () {
        this.sprite.render();
    };
    return TextCharacterObject;
})();

var TextObject = (function () {
    function TextObject(text) {
        this.setText(text);
    }
    TextObject.prototype.setText = function (text) {
        this.characters = [];

        for (var i = 0, len = text.length; i < len; ++i) {
            var char = new TextCharacterObject(text[i]);
            char.setPosition([i * 32]);
            this.characters.push(char);
        }

        this.text = text;
    };

    TextObject.prototype.update = function (dt) {
        for (var i = 0, len = this.characters.length; i < len; ++i) {
            this.characters[i].update(dt);
        }
    };

    TextObject.prototype.render = function () {
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
