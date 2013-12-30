precision lowp float;

varying vec3 vVertexPosition;
varying vec4 vVertexColor;
varying vec2 vVertexUV;

uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

uniform vec4 uTintColor;

void main()
{
    vec4 color = vVertexColor * texture2D(uTexture, vVertexUV);
    gl_FragColor = color * uTintColor;
}