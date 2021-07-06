#ifdef GL_ES
precision mediump float;
#endif

// Apply a last post processing step to the colors

uniform sampler2D colors;
uniform sampler2D velocity;

uniform float time;

uniform vec2 resolution;

vec3 rgb2hsb(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

//  https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

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
  icolor = texture2D(colors, iuv).rgb;
  
  fuv.x *= resolution.x / resolution.y;
  float ow = .1;
  float iw = .1;
  vec2 corner1 = step(vec2(ow), fuv);
  vec2 corner2 = step(vec2(ow), 1. - fuv);
  vec2 corner3 = step(vec2(ow+iw), fuv);
  vec2 corner4 = step(vec2(ow+iw), 1. - fuv);
  float outer = corner1.x * corner1.y * corner2.x * corner2.y;
  float inner = corner3.x * corner3.y * corner4.x * corner4.y;
  float contour = outer - inner;

  vec3 bg = icolor * smoothstep(.3, .8, length(icolor)/1.73);

  // vec3 hsb = rgb2hsb(icolor);
  // icolor = hsb2rgb(vec3(0.833, hsb.y, hsb.z));

  vec3 final = contour * icolor + inner * bg;

  gl_FragColor = vec4(final, 1.);
}