#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

// Velocity field, where (R -> v_x, G -> v_y, G, B).
uniform sampler2D velocity;

uniform vec2 point;
uniform vec2 force;

uniform vec2 resolution;

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;

  vec2 vel = texture2D(velocity, st).xy;

  if (force.x + force.y != 0.) {
    vec2 pt = vec2(point.x, 1. - point.y);
    float isClose = 1. - step(.01, length(pt - st));
    vel = isClose * force * 50. + (1. - isClose) * vel;
  }

  gl_FragColor = vec4(vec3(vel, 0.), 1.);
  
}