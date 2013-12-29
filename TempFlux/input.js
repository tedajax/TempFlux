var Keys = (function () {
    function Keys() {
    }
    Keys.ZERO = 48;
    Keys.ONE = 49;
    Keys.TWO = 50;
    Keys.THREE = 51;
    Keys.FOUR = 52;
    Keys.FIVE = 53;
    Keys.SIX = 54;
    Keys.SEVEN = 55;
    Keys.EIGHT = 56;
    Keys.NINE = 57;

    Keys.A = 65;
    Keys.B = 66;
    Keys.C = 67;
    Keys.D = 68;
    Keys.E = 69;
    Keys.F = 70;
    Keys.G = 71;
    Keys.H = 72;
    Keys.I = 73;
    Keys.J = 74;
    Keys.K = 75;
    Keys.L = 76;
    Keys.M = 77;
    Keys.N = 78;
    Keys.O = 79;
    Keys.P = 80;
    Keys.Q = 81;
    Keys.R = 82;
    Keys.S = 83;
    Keys.T = 84;
    Keys.U = 85;
    Keys.V = 86;
    Keys.W = 87;
    Keys.X = 88;
    Keys.Y = 89;
    Keys.Z = 90;

    Keys.SPACE = 32;

    Keys.LEFT = 37;
    Keys.RIGHT = 39;
    Keys.UP = 38;
    Keys.DOWN = 40;

    Keys.F1 = 112;
    Keys.F2 = 113;
    Keys.F3 = 114;
    Keys.F4 = 115;
    Keys.F5 = 116;
    Keys.F6 = 117;
    Keys.F7 = 118;
    Keys.F8 = 119;
    Keys.F9 = 120;
    Keys.F10 = 121;
    Keys.F11 = 122;
    Keys.F12 = 123;
    return Keys;
})();

var MouseButtons = (function () {
    function MouseButtons() {
    }
    MouseButtons.NONE = -1;
    MouseButtons.LEFT = 0;
    MouseButtons.MIDDLE = 1;
    MouseButtons.RIGHT = 2;
    return MouseButtons;
})();

var MouseState = (function () {
    function MouseState() {
        this.x = 0;
        this.y = 0;
        this.buttons = [false, false, false];
    }
    MouseState.prototype.clone = function (other) {
        this.x = other.x;
        this.y = other.y;
        this.buttons = other.buttons.slice(0);
    };
    return MouseState;
})();

var Input = (function () {
    function Input() {
        this.newKeys = [];
        this.oldKeys = [];

        for (var i = 0; i < 256; ++i) {
            this.newKeys[i] = false;
            this.oldKeys[i] = false;
        }

        this.newMouseState = new MouseState();
        this.oldMouseState = new MouseState();
    }
    Input.prototype.onKeyDown = function (event) {
        this.newKeys[event.keyCode] = true;
    };

    Input.prototype.onKeyUp = function (event) {
        this.newKeys[event.keyCode] = false;
    };

    Input.prototype.onMouseDown = function (event) {
        this.newMouseState.buttons[event.button] = true;

        return false;
    };

    Input.prototype.onMouseUp = function (event) {
        this.newMouseState.buttons[event.button] = false;

        return false;
    };

    Input.prototype.onMouseMove = function (event) {
        var x = event.clientX - game.canvas.offsetLeft;
        var y = event.clientY - game.canvas.offsetTop;

        this.newMouseState.x = x;
        this.newMouseState.y = y;
    };

    Input.prototype.update = function () {
        this.oldKeys = this.newKeys.slice(0);
        this.oldMouseState.clone(this.newMouseState);
    };

    Input.prototype.getKey = function (keycode) {
        return this.newKeys[keycode];
    };

    Input.prototype.getKeyUp = function (keycode) {
        return (!this.newKeys[keycode] && this.oldKeys[keycode]);
    };

    Input.prototype.getKeyDown = function (keycode) {
        return (this.newKeys[keycode] && !this.oldKeys[keycode]);
    };

    Input.prototype.getMouseButton = function (button) {
        return this.newMouseState.buttons[button];
    };

    Input.prototype.getMouseButtonUp = function (button) {
        return (!this.newMouseState.buttons[button] && this.oldMouseState.buttons[button]);
    };

    Input.prototype.getMouseButtonDown = function (button) {
        return (this.newMouseState.buttons[button] && !this.oldMouseState.buttons[button]);
    };

    Input.prototype.getMouseX = function () {
        return this.newMouseState.x;
    };

    Input.prototype.getMouseY = function () {
        return this.newMouseState.y;
    };
    return Input;
})();
//# sourceMappingURL=input.js.map
