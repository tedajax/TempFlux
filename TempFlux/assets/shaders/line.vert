attribute vec3 aVertexPosition;

uniform mat4 uWorld;
uniform mat4 uView;
uniform mat4 uProjection;

void main()
{
    mat4 modelView = uView * uWorld;
    gl_Position = uProjection * modelView * vec4(aVertexPosition, 1.0);
}