#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 resolution;
uniform float time;

mat2 rotate(float a) {
  return mat2(cos(a), -sin(a), sin(a), cos(a));
}

float box(vec2 st, vec2 size) {
  st += .5;
  vec2 uv = step(.5-size/2., st) * step(.5-size/2., 1.-st);
  return uv.x * uv.y;
}

vec2 tile(vec2 st, vec2 coef) {
  return fract(st * coef);
}

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  vec3 color = vec3(0.0);
  st = tile(st, vec2(5.));
  st -= .5;
  st *= rotate(PI / 4.);
  color += vec3(box(st, vec2(.707)));
  gl_FragColor = vec4(color, 1.);
}