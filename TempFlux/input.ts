class Keys {
    static ZERO = 48;
    static ONE = 49;
    static TWO = 50;
    static THREE = 51;
    static FOUR = 52;
    static FIVE = 53;
    static SIX = 54;
    static SEVEN = 55;
    static EIGHT = 56;
    static NINE = 57;

    static A = 65;
    static B = 66;
    static C = 67;
    static D = 68;
    static E = 69;
    static F = 70;
    static G = 71;
    static H = 72;
    static I = 73;
    static J = 74;
    static K = 75;
    static L = 76;
    static M = 77;
    static N = 78;
    static O = 79;
    static P = 80;
    static Q = 81;
    static R = 82;
    static S = 83;
    static T = 84;
    static U = 85;
    static V = 86;
    static W = 87;
    static X = 88;
    static Y = 89;
    static Z = 90;

    static SPACE = 32;

    static LEFT = 37;
    static RIGHT = 39;
    static UP = 38;
    static DOWN = 40;

    static F1  = 112;
    static F2  = 113;
    static F3  = 114;
    static F4  = 115;
    static F5  = 116;
    static F6  = 117;
    static F7  = 118;
    static F8  = 119;
    static F9  = 120;
    static F10 = 121;
    static F11 = 122;
    static F12 = 123;
} 

class MouseButtons {
    static NONE = -1;
    static LEFT = 0;
    static MIDDLE = 1;
    static RIGHT = 2;
}

class MouseState {
    x: number;
    y: number;
    buttons: boolean[];

    constructor() {
        this.x = 0
        this.y = 0
        this.buttons = [false, false, false];
    }

    clone(other: MouseState) {
        this.x = other.x;
        this.y = other.y;
        this.buttons = other.buttons.slice(0);
    }
}

class Input {
    newKeys: boolean[];
    oldKeys: boolean[];

    newMouseState: MouseState;
    oldMouseState: MouseState;

    constructor() {
        this.newKeys = [];
        this.oldKeys = [];

        for (var i = 0; i < 256; ++i) {
            this.newKeys[i] = false;
            this.oldKeys[i] = false;
        }

        this.newMouseState = new MouseState();
        this.oldMouseState = new MouseState();
    }

    onKeyDown(event: KeyboardEvent) {
        this.newKeys[event.keyCode] = true;
    }

    onKeyUp(event: KeyboardEvent) {
        this.newKeys[event.keyCode] = false;
    }

    onMouseDown(event: MouseEvent) {
        this.newMouseState.buttons[event.button] = true;

        return false;
    }

    onMouseUp(event: MouseEvent) {
        this.newMouseState.buttons[event.button] = false;

        return false;
    }

    onMouseMove(event: MouseEvent) {
        var x = event.clientX - game.canvas.offsetLeft;
        var y = event.clientY - game.canvas.offsetTop;

        this.newMouseState.x = x;
        this.newMouseState.y = y;
    }

    update() {
        this.oldKeys = this.newKeys.slice(0);
        this.oldMouseState.clone(this.newMouseState);
    }

    getKey(keycode: number) {
        return this.newKeys[keycode];
    }

    getKeyUp(keycode: number) {
        return (!this.newKeys[keycode] && this.oldKeys[keycode]);
    }

    getKeyDown(keycode: number) {
        return (this.newKeys[keycode] && !this.oldKeys[keycode]);
    }

    getMouseButton(button: number) {
        return this.newMouseState.buttons[button];
    }

    getMouseButtonUp(button: number) {
        return (!this.newMouseState.buttons[button] && this.oldMouseState.buttons[button]);
    }

    getMouseButtonDown(button: number) {
        return (this.newMouseState.buttons[button] && !this.oldMouseState.buttons[button]);
    }

    getMouseX() {
        return this.newMouseState.x;
    }

    getMouseY() {
        return this.newMouseState.y;
    }
}

