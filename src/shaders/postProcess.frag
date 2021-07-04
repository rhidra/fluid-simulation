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
  
  float wx = .1;
  // float wy = wx * resolution.x / resolution.y;
  float wy = .1;
  vec2 corner1 = step(vec2(wx, wy), fuv);
  vec2 corner2 = step(vec2(wx, wy), 1. - fuv);
  vec2 corner3 = step(vec2(wx, wy)*2., fuv);
  vec2 corner4 = step(vec2(wx, wy)*2., 1. - fuv);
  float outer = corner1.x * corner1.y * corner2.x * corner2.y;
  float inner = corner3.x * corner3.y * corner4.x * corner4.y;
  float contour = outer - inner;

  vec3 bg = color * smoothstep(.5, .8, length(icolor)/1.73);

  vec3 final = contour * icolor * min(length(color)*2., 1.) + inner * bg;
  // final.gb = iuv;

  gl_FragColor = vec4(final, 1.);
}