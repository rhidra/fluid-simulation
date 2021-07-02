#ifdef GL_ES
precision mediump float;
#endif

// Generate a constant velocity field

#define PI 3.14159265359

uniform vec2 resolution;

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  st -= .5;
  float d = length(st) * 4.;

  vec2 v = vec2(.2, .2);

  vec2 vel = vec2(st.x*.2, st.y*.2);
  
  vel = mix(v, vec2(0., 0.), d);
  gl_FragColor = vec4(vec3(vel, 0.), 1.);

  // gl_FragColor = vec4(0.1, 0., 0., 1.);
  
}