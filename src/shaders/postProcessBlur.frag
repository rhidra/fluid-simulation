#ifdef GL_ES
precision mediump float;
#endif

#define SAMPLES 3

// Apply a last post processing step to the colors
// Motion blur

uniform sampler2D colors;
uniform sampler2D velocity;

uniform float time;

uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec2 vel = texture2D(velocity, uv).xy;
  vec3 color = texture2D(colors, uv).rgb;

  for (int i = 0; i < SAMPLES; ++i) {
    uv = uv - vel;
    color += texture2D(colors, uv).rgb;
  }
  color /= float(SAMPLES);

  gl_FragColor = vec4(color, 1.);
}
