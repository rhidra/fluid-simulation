#ifdef GL_ES
precision mediump float;
#endif

// Divergence field, with only the red channel holding a value
uniform sampler2D divergence;

// Previous iteration of the Jacobi algorithm, already initialized
uniform sampler2D prev;

uniform vec2 resolution;

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  vec2 epsilon = 1. / resolution.xy;

  // Divergence
  float d = texture2D(divergence, st).r;

  // Pressures
  float p1 = texture2D(prev, vec2(st.x + epsilon.x * 2., st.y)).x;
  float p2 = texture2D(prev, vec2(st.x - epsilon.x * 2., st.y)).x;
  float p3 = texture2D(prev, vec2(st.x, st.y + epsilon.y * 2.)).x;
  float p4 = texture2D(prev, vec2(st.x, st.y - epsilon.y * 2.)).x;

  // New iteration
  float p = (d + p1 + p2 + p3 + p4) / 4.;

  gl_FragColor = vec4(p, 0., 0., 1.);
}