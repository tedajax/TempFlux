/// <reference path="tsm-0.7.d.ts" />
/// <reference path="WebGL.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shader = (function () {
    function Shader() {
        this.name = "default";
        this.attribs = [];
        this.uniforms = [];
    }
    Shader.prototype.initialize = function () {
        var fragmentShader = this.getFragShader();
        var vertexShader = this.getVertShader();

        this.program = game.gl.createProgram();
        game.gl.attachShader(this.program, vertexShader);
        game.gl.attachShader(this.program, fragmentShader);
        game.gl.linkProgram(this.program);

        if (!game.gl.getProgramParameter(this.program, game.gl.LINK_STATUS)) {
            alert("Failed to link shader " + name);
        }

        if (this.program != null) {
            game.gl.useProgram(this.program);
        }
    };

    Shader.prototype.addAttribute = function (name, attribute) {
        this.attribs[name] = game.gl.getAttribLocation(this.program, attribute);
        game.gl.enableVertexAttribArray(this.attribs[name]);
    };

    Shader.prototype.addUniform = function (name, uniform) {
        this.uniforms[name] = game.gl.getUniformLocation(this.program, uniform);
    };

    Shader.prototype.frameDrawSetup = function () {
    };

    Shader.prototype.objectDrawSetup = function () {
    };

    Shader.prototype.initLocales = function () {
    };

    Shader.prototype.getShader = function (shaderType) {
        var shaderStr;
        var shaderFilename;

        if (shaderType == game.gl.FRAGMENT_SHADER) {
            shaderFilename = Shader.SHADER_PATH + this.name + ".frag";
        } else if (shaderType == game.gl.VERTEX_SHADER) {
            shaderFilename = Shader.SHADER_PATH + this.name + ".vert";
        } else {
            return null;
        }

        shaderStr = this.getFileString(shaderFilename);

        var shader = game.gl.createShader(shaderType);
        game.gl.shaderSource(shader, shaderStr);
        game.gl.compileShader(shader);

        if (!game.gl.getShaderParameter(shader, game.gl.COMPILE_STATUS)) {
            alert(shaderFilename + "\n" + game.gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    };

    Shader.prototype.getFragShader = function () {
        return this.getShader(game.gl.FRAGMENT_SHADER);
    };

    Shader.prototype.getVertShader = function () {
        return this.getShader(game.gl.VERTEX_SHADER);
    };

    Shader.prototype.getFileString = function (file) {
        var request = new XMLHttpRequest();
        request.open("GET", "./" + file, false);
        request.send();

        return request.responseText;
    };
    Shader.SHADER_PATH = "assets/shaders/";
    return Shader;
})();

var SpriteShader = (function (_super) {
    __extends(SpriteShader, _super);
    function SpriteShader() {
        _super.call(this);
        this.name = "sprite";
    }
    SpriteShader.prototype.initLocales = function () {
        _super.prototype.initLocales.call(this);

        game.gl.useProgram(this.program);

        this.addAttribute("position", "aVertexPosition");
        this.addAttribute("uv", "aVertexUV");
        this.addAttribute("color", "aVertexColor");

        this.addUniform("world", "uWorld");
        this.addUniform("view", "uView");
        this.addUniform("projection", "uProjection");
        this.addUniform("texture", "uTexture");
        this.addUniform("tintColor", "uTintColor");
        this.addUniform("addColor", "uAddColor");
        this.addUniform("invertColor", "uInvert");
    };

    SpriteShader.prototype.frameDrawSetup = function () {
        _super.prototype.frameDrawSetup.call(this);

        //game.gl.useProgram(this.program);
        this.projectionMatrix = game.camera.getProjectionMatrix();
        this.viewMatrix = game.camera.getViewMatrix();

        game.gl.uniformMatrix4fv(this.uniforms["projection"], false, this.projectionMatrix.all());
        game.gl.uniformMatrix4fv(this.uniforms["view"], false, this.viewMatrix.all());
    };

    SpriteShader.prototype.unlockFromCamera = function () {
        game.gl.uniformMatrix4fv(this.uniforms["view"], false, game.camera.getFrozenViewMatrix().all());
    };

    SpriteShader.prototype.bindTexture = function () {
        if (this.texture != null && this.texture.loaded && this.texture != this.lastBoundTexture) {
            game.gl.activeTexture(game.gl.TEXTURE0);
            game.gl.bindTexture(game.gl.TEXTURE_2D, this.texture.texture);
            game.gl.uniform1i(this.uniforms["texture"], 0);
            this.lastBoundTexture = this.texture;
        }
    };

    SpriteShader.prototype.objectDrawSetup = function () {
        _super.prototype.objectDrawSetup.call(this);

        //game.gl.useProgram(this.program);
        game.gl.uniformMatrix4fv(this.uniforms["world"], false, this.worldMatrix.all());
        game.gl.uniform4fv(this.uniforms["tintColor"], this.tintColor);
        game.gl.uniform4fv(this.uniforms["addColor"], this.addColor);
        game.gl.uniform1i(this.uniforms["invertColor"], Number(this.invertColor));
    };
    return SpriteShader;
})(Shader);
//# sourceMappingURL=shaders.js.map
