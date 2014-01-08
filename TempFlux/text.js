var TextCharacterObject = (function () {
    function TextCharacterObject(char) {
        this.char = char;

        this.sprite = new Sprite(32, 32);
        this.sprite.setShader(game.spriteShader);
        this.sprite.mesh = game.meshFactory.createTextQuad(32, 32, "combo", char);
        this.sprite.setTexture(game.fonts.getFont("combo").texture);
        this.sprite.alpha = true;
        this.position = new TSM.vec3([0, 0, 1]);
    }
    TextCharacterObject.prototype.setChar = function (char) {
        this.char = char;

        this.sprite.mesh = game.meshFactory.createTextQuad(32, 32, "combo", char);
    };

    TextCharacterObject.prototype.update = function (dt) {
        this.sprite.position = this.position;
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
            char.position.x = i * 32;
            char.sprite.position.x = i * 32;
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
