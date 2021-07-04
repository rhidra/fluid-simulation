#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

// Velocity field, where (R -> v_x, G -> v_y, G, B).
uniform sampler2D velocity;

uniform vec2 point;
uniform vec2 force;

uniform vec2 resolution;

float range(float tmin, float tmax, float t) {
  return (t - tmin) / (tmax - tmin);
}

float lerp(float outmin, float outmax, float inmin, float inmax, float t) {
  float d = range(inmin, inmax, t);
  return mix(outmin, outmax, d);
}

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;

  vec2 vel = texture2D(velocity, st).xy;

  if (force.x + force.y != 0.) {
    vec2 pt2 = vec2(point.x, 1. - point.y);
    vec2 f = vec2(force.x, - force.y);
    vec2 pt1 = pt2 - f * 1.5;

    float d = length(st - pt1) + length(st - pt2);
    float r = lerp(.01, .25, .001, .1, min(length(f), .1));

    float isClose = 1. - step(r, d);
    vel = isClose * f * mix(1., 10., d/r) +  vel;

    // float isClose = 1. - step(.01, length(pt - st));
    // vel = isClose * f * 50. + (1. - isClose) * vel;
  }

  gl_FragColor = vec4(vec3(vel, 0.), 1.);
  
}