#ifdef GL_ES
precision mediump float;
#endif

// Time duration between two frame
uniform float dt;

// Velocity field, where (R -> v_x, G -> v_y, G, B).
uniform sampler2D velocity;

uniform vec2 resolution;

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  
  vec2 vel = texture2D(velocity, st).xy;

  vec2 new_st = st - vel * dt;

  vec2 adv_vel = texture2D(velocity, new_st).xy;

  gl_FragColor = vec4(vec3(adv_vel, 0.), 1.);
}