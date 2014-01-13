attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec2 aVertexUV;

varying vec4 vVertexColor;
varying vec2 vVertexUV;

uniform mat4 uWorld;
uniform mat4 uView;
uniform mat4 uProjection;

void main()
{
    mat4 modelView = uView * uWorld;

    vVertexUV = aVertexUV;
    vVertexColor = aVertexColor;

    gl_Position = uProjection * modelView * vec4(aVertexPosition, 1.0);
}