#ifdef GL_ES
precision mediump float;
#endif

// Generate a constant velocity field

#define PI 3.14159265359

uniform vec2 resolution;

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  st -= .2;
  float d = 1. - length(st);
  // d = step(.9, d) * d;

  vec2 vel = mix(vec2(0., 0.), vec2(.2, .2), d);
  vel = vel * step(.9, d);
  // vel = vec2(d);
  gl_FragColor = vec4(vec3(vel, 0.), 1.);

  // gl_FragColor = vec4(0.1, 0., 0., 1.);
  
}