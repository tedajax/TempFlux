precision highp float;

varying vec3 vVertexPosition;
varying vec4 vVertexColor;
varying vec2 vVertexUV;

uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

uniform vec4 uTintColor;
uniform vec4 uAddColor;
uniform bool uInvert;

void main()
{
    vec4 color = vVertexColor * texture2D(uTexture, vVertexUV) * uTintColor;
    color.rgb = clamp(color.rgb + (uAddColor.rgb * uAddColor.a), 0.0, 1.0);
    if (uInvert) {
      color = vec4(1.0 - color.r, 1.0 - color.g, 1.0 - color.b, color.a);
    }
    gl_FragColor = color;
}