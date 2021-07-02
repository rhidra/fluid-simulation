#ifdef GL_ES
precision mediump float;
#endif

// Generate a constant velocity field

#define PI 3.14159265359

uniform vec2 resolution;

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  st -= .5;
  vec2 vel = vec2(st.x*.2, st.y*.2);
  
  // Normalize [-1; 1] -> [0; 1]
  vel = vel / 2. + .5;
  gl_FragColor = vec4(vec3(vel, 0.), 1.);

  // gl_FragColor = vec4(.1, 0., 0., 1.);
  
}