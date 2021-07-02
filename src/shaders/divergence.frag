#ifdef GL_ES
precision mediump float;
#endif

// Time duration between two frame
uniform float dt;

// Advected velocity field, where (R -> v_x, G -> v_y, G, B).
uniform sampler2D advVelocity;

uniform vec2 resolution;

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;

  // Step between 2 pixels
  vec2 epsilon = 1. / resolution.xy;

  // Velocities
  float vel_x1 = texture2D(advVelocity, vec2(st.x + epsilon.x, st.y)).x;
  float vel_x2 = texture2D(advVelocity, vec2(st.x - epsilon.x, st.y)).x;
  float vel_y1 = texture2D(advVelocity, vec2(st.x, st.y + epsilon.y)).y;
  float vel_y2 = texture2D(advVelocity, vec2(st.x, st.y - epsilon.y)).y;

  // Density constant (rho)
  float density = 1.;

  // We need to multiply by epsilon in the formula, so we take the average ?
  float e = (epsilon.x + epsilon.y) / 2.;

  // Divergence
  float d = (vel_x1 - vel_x2 + vel_y1 - vel_y2) * (- 2. * e * density / dt);

  gl_FragColor = vec4(d, 0., 0., 1.);
}