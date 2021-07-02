#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform float time;
uniform sampler2D texture;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec3 color = texture2D(texture, uv).rgb;
  gl_FragColor = vec4(color+.5, 1.0);
}