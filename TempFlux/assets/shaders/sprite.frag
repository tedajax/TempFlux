precision lowp float;

varying vec3 vVertexPosition;
varying vec4 vVertexColor;
varying vec2 vVertexUV;

uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

uniform vec4 uTintColor;
uniform vec4 uAddColor;

void main()
{
    vec4 color = vVertexColor * texture2D(uTexture, vVertexUV) * uTintColor;
    color = clamp(color + uAddColor, 0.0, 1.0);
    gl_FragColor = color;
}