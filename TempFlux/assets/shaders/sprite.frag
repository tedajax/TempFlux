precision lowp float;

varying vec3 vVertexPosition;
varying vec4 vVertexColor;
varying vec2 vVertexUV;

uniform vec3 uCameraPosition;
uniform sampler2D uTexture;
uniform vec4 uFogColor;
uniform float uFogStart;
uniform float uFogEnd;
uniform bool uFogEnabled;

void main()
{
    vec4 color = vVertexColor * texture2D(uTexture, vVertexUV);
    //if (uFogEnabled) {
       // float camDist = distance(uCameraPosition, vVertexPosition);
       // float fogPerc = (camDist - uFogStart) / (uFogEnd - uFogStart);
      //  float t = clamp(fogPerc, 0.0, 1.0);
     //   color.rgb= mix(color.rgb, uFogColor.rgb, t);
    //}
    gl_FragColor = color;
}