class TextCharacterObject {
    char: string;
    sprite: Sprite;

    position: TSM.vec3;

    constructor(char: string) {
        this.char = char;

        this.sprite = new Sprite(32, 32);
        this.sprite.setShader(game.spriteShader);
        this.sprite.mesh = game.meshFactory.createTextQuad(32, 32, "combo", char);
        this.sprite.setTexture(game.fonts.getFont("combo").texture);
        this.sprite.alpha = true;
        this.position = new TSM.vec3([0, 0, 1]);
    }

    setChar(char: string) {
        this.char = char;

        this.sprite.mesh = game.meshFactory.createTextQuad(32, 32, "combo", char);
    }

    update(dt: number) {
        this.sprite.position = this.position;
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

        for (var i = 0, len = text.length; i < len; ++i) {
            var char = new TextCharacterObject(text[i]);
            char.position.x = i * 32;
            char.sprite.position.x = i * 32;
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