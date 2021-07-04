#ifdef GL_ES
precision mediump float;
#endif

// Apply a last post processing step to the colors

uniform sampler2D colors;
uniform sampler2D velocity;

uniform float time;

uniform vec2 resolution;


void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  float k = 80.;

  vec2 iuv = floor(uv * k) / k;
  vec2 fuv = fract(uv * k);

  vec2 vel = texture2D(velocity, iuv).xy;
  vec3 color = texture2D(colors, uv).rgb;
  vec3 icolor = texture2D(colors, iuv).rgb;
  
  vec2 corner1 = step(vec2(.1), fuv);
  vec2 corner2 = step(vec2(.1), 1. - fuv);
  float pixel = corner1.x * corner1.y * corner2.x * corner2.y;

  float a = step(.03, length(vel));

  vec3 final = a * (pixel * icolor + (1. - pixel) * color);
  final += (1. - a) * color;

  gl_FragColor = vec4(final, 1.);
}