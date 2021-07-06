#ifdef GL_ES
precision mediump float;
#endif

// Render a velocity texture

uniform sampler2D velocity;
uniform vec2 resolution;

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  vec2 v = texture2D(velocity, st).xy;
  v = v + .5;
  v = v / .9;
  gl_FragColor = vec4(v.x, v.y, 1., 1.);
}