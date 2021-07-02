#ifdef GL_ES
precision mediump float;
#endif

// Time duration between two frame
uniform float dt;

// Advected velocity field, where (R -> v_x, G -> v_y, G, B).
uniform sampler2D advVelocity;

// Pressure, with only the red channel
uniform sampler2D pressure;

uniform vec2 resolution;

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  vec2 epsilon = 1. / resolution.xy;
  float e = (epsilon.x + epsilon.y) / 2.;
  float density = 1.;

  vec2 adv_vel = texture2D(advVelocity, st).xy;

  float px1 = texture2D(pressure, vec2(st.x + epsilon.x, st.y)).x;
  float px2 = texture2D(pressure, vec2(st.x - epsilon.x, st.y)).x;
  float py1 = texture2D(pressure, vec2(st.x, st.y + epsilon.y)).x;
  float py2 = texture2D(pressure, vec2(st.x, st.y - epsilon.y)).x;

  vec2 vel = adv_vel - (dt / (2. * density * e)) * vec2(px1 - px2, py1 - py2);

  gl_FragColor = vec4(vec3(vel, 0.), 1.);
}