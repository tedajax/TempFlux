/// <reference path="tsm-0.7.d.ts" /> 
/// <reference path="WebGL.d.ts" />

class Shader {
    name: string;
    program: WebGLProgram;
    attribs: number[];
    uniforms: WebGLUniformLocation[];

    static SHADER_PATH: string = "assets/shaders/";

    constructor() {
        this.name = "default";
        this.attribs = [];
        this.uniforms = [];
    }

    initialize() {
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
    }

    addAttribute(name: string, attribute: string) {
        this.attribs[name] = game.gl.getAttribLocation(this.program, attribute);
        game.gl.enableVertexAttribArray(this.attribs[name]);
    }

    addUniform(name: string, uniform: string) {
        this.uniforms[name] = game.gl.getUniformLocation(this.program, uniform);
    }

    frameDrawSetup() {
    }

    objectDrawSetup() {
    }

    initLocales() {
    }

    getShader(shaderType: number) {
        var shaderStr: string;
        var shaderFilename: string;

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
    }

    getFragShader() {
        return this.getShader(game.gl.FRAGMENT_SHADER);
    }

    getVertShader() {
        return this.getShader(game.gl.VERTEX_SHADER);
    }

    getFileString(file) {
        var request = new XMLHttpRequest();
        request.open("GET", "./" + file, false);
        request.send();
        
        return request.responseText;
    }
}

class SpriteShader extends Shader {
    worldMatrix: TSM.mat4;
    viewMatrix: TSM.mat4;
    projectionMatrix: TSM.mat4;
    texture: ImageTexture;
    lastBoundTexture: ImageTexture;

    fogEnabled: boolean;
    fogStart: number;
    fogEnd: number;
    fogColor: Float32Array;

    constructor() {
        super();
        this.name = "sprite";

        this.fogEnabled = true;
        this.fogStart = 13;
        this.fogEnd = 20;
        this.fogColor = new Float32Array([1, 1, 1, 1]);
    }

    initLocales() {
        super.initLocales();

        game.gl.useProgram(this.program);

        this.addAttribute("position", "aVertexPosition");
        this.addAttribute("uv", "aVertexUV");
        this.addAttribute("color", "aVertexColor");

        this.addUniform("world", "uWorld");
        this.addUniform("view", "uView");
        this.addUniform("projection", "uProjection");
        this.addUniform("texture", "uTexture");
        this.addUniform("cameraPosition", "uCameraPosition");
        this.addUniform("fogColor", "uFogColor");
        this.addUniform("fogStart", "uFogStart");
        this.addUniform("fogEnd", "uFogEnd");
        this.addUniform("fogEnabled", "uFogEnabled");
    }

    frameDrawSetup() {
        super.frameDrawSetup();

        //game.gl.useProgram(this.program);

        this.projectionMatrix = game.camera.getProjectionMatrix();
        this.viewMatrix = game.camera.getViewMatrix();

        game.gl.uniformMatrix4fv(this.uniforms["projection"], false, this.projectionMatrix.all());
        game.gl.uniformMatrix4fv(this.uniforms["view"], false, this.viewMatrix.all());

        game.gl.uniform3fv(this.uniforms["cameraPosition"], game.camera.position.xyz);
        game.gl.uniform4fv(this.uniforms["fogColor"], this.fogColor);
        game.gl.uniform1f(this.uniforms["fogStart"], this.fogStart);
        game.gl.uniform1f(this.uniforms["fogEnd"], this.fogEnd);
        game.gl.uniform1i(this.uniforms["fogEnabled"], (this.fogEnabled) ? 1 : 0);
    }

    bindTexture() {
        if (this.texture != null && this.texture.loaded && this.texture != this.lastBoundTexture) {
            game.gl.activeTexture(game.gl.TEXTURE0);
            game.gl.bindTexture(game.gl.TEXTURE_2D, this.texture.texture);
            game.gl.uniform1i(this.uniforms["texture"], 0);
            this.lastBoundTexture = this.texture;
        }
    }

    objectDrawSetup() {
        super.objectDrawSetup();

        //game.gl.useProgram(this.program);

        game.gl.uniformMatrix4fv(this.uniforms["world"], false, this.worldMatrix.all());
    }
}