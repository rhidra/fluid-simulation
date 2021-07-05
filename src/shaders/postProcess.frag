#ifdef GL_ES
precision mediump float;
#endif

// Apply a last post processing step to the colors

uniform sampler2D colors;
uniform sampler2D velocity;

uniform float time;

uniform vec2 resolution;

vec3 maxVec(vec3 a, vec3 b) {
  return dot(a, a) > dot(b, b) ? a : b;
}

vec3 maxSampling(sampler2D texture, vec2 uv, float incr) {
  vec3 c1 = texture2D(texture, uv).rgb;
  vec3 c2 = texture2D(texture, vec2(uv.x + incr, uv.y)).rgb;
  vec3 c3 = texture2D(texture, vec2(uv.x, uv.y + incr)).rgb;
  vec3 c4 = texture2D(texture, vec2(uv.x + incr, uv.y + incr)).rgb;
  vec3 c5 = texture2D(texture, vec2(uv.x + incr/2., uv.y + incr/2.)).rgb;
  return maxVec(c1, maxVec(c2, maxVec(c3, maxVec(c4, c5))));
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  float k = 50.;

  vec2 iuv = floor(uv * k) / k;
  vec2 fuv = fract(uv * k);

  vec2 vel = texture2D(velocity, iuv).xy;
  vec3 color = texture2D(colors, uv).rgb;

  vec3 icolor = maxSampling(colors, iuv, 1./k);
  // icolor = texture2D(colors, iuv).rgb;
  
  uv.x *= resolution.x / resolution.y;
  fuv = fract(uv * k);
  iuv = floor(uv * k) / k;
  float ow = .15;
  float iw = .2;
  vec2 corner1 = step(vec2(ow), fuv);
  vec2 corner2 = step(vec2(ow), 1. - fuv);
  vec2 corner3 = step(vec2(iw), fuv);
  vec2 corner4 = step(vec2(iw), 1. - fuv);
  float outer = corner1.x * corner1.y * corner2.x * corner2.y;
  float inner = corner3.x * corner3.y * corner4.x * corner4.y;
  float contour = outer - inner;

  vec3 bg = icolor * smoothstep(.3, .8, length(icolor)/1.73);

  vec3 final = contour * icolor * min(length(color)*2., 1.) + inner * bg;

  gl_FragColor = vec4(final, 1.);
}