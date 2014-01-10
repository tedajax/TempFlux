class TextCharacterObject {
    char: string;
    sprite: Sprite;

    position: TSM.vec3;
    offset: TSM.vec3;

    constructor(char: string) {
        this.position = new TSM.vec3([0, 0, 1]);
        this.setChar(char);
    }

    setChar(char: string) {
        this.char = char;

        var width = game.fonts.getFont("combo").getCodeWidth(char);
        var height = game.fonts.getFont("combo").getCodeHeight(char);

        var offset = game.fonts.getFont("combo").getCodeOffset(char);
        this.offset = new TSM.vec3([0, 0, 0]);

        this.sprite = new Sprite(width, height);
        this.sprite.setShader(game.spriteShader);
        this.sprite.mesh = game.meshFactory.createTextQuad(width, height, "combo", char);
        this.sprite.setTexture(game.fonts.getFont("combo").texture);
        this.sprite.alpha = true;
        this.sprite.position = TSM.vec3.sum(this.position, this.offset);

        this.sprite.mesh = game.meshFactory.createTextQuad(width, height, "combo", char);
    }

    setPosition(posArray: number[]) {
        if (posArray.length > 0) {
            this.position.x = posArray[0];
        } else if (posArray.length > 1) {
            this.position.y = posArray[1];
        } else if (posArray.length > 2) {
            this.position.z = posArray[2];
        }

        this.sprite.position = TSM.vec3.sum(this.position, this.offset);
    }

    update(dt: number) {
        this.sprite.position = TSM.vec3.sum(this.position, this.offset);
    }

    render() {
        this.sprite.render();
    }
} 

class TextObject {
    text: string;
    characters: TextCharacterObject[];
    textObjectId: number;

    constructor(text: string) {
        this.setText(text);
    }

    setText(text: string) {
        this.characters = [];

        var pos: number = 0;
        for (var i = 0, len = text.length; i < len; ++i) {
            var char = new TextCharacterObject(text[i]);
            char.setPosition([pos]);
            pos += game.fonts.getFont("combo").getCodeSpacing(text[i]);
            console.log(pos);
            this.characters.push(char);
        }

        this.text = text;
    }

    update(dt: number) {
        for (var i = 0, len = this.characters.length; i < len; ++i) {
            this.characters[i].update(dt);
        }
    }

    render() {
        for (var i = 0, len = this.characters.length; i < len; ++i) {
            this.characters[i].render();
        }
    }
}

class TextObjectManager {
    textObjects: {};
    currentId: number;

    constructor() {
        this.textObjects = {};
        this.currentId = 0;
    }

    add(text: TextObject) {
        if (text == null) {
            return;
        }

        text.textObjectId = this.currentId++;
        this.textObjects[text.textObjectId] = text;
        return text;
    }

    update(dt: number) {
        for (var t in this.textObjects) {
            this.textObjects[t].update(dt);
        }
    }

    render() {
        for (var t in this.textObjects) {
            this.textObjects[t].render();
        }
    }
}