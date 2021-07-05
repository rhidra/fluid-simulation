#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

// From a force vector and an application point,
// modify the velocity field to include the external force.
// The physical constraints for an incompressible fluid
// are considered later in the algorithm.

// Velocity field, where (R -> v_x, G -> v_y, G, B).
uniform sampler2D velocity;

// Application point and force of the external force applied.
// Practically, point is the click point and force is click-previous_click
uniform vec2 point;
uniform vec2 force;

uniform vec2 resolution;

// Convert a value t, between tmin and tmax, to a ratio
float range(float tmin, float tmax, float t) {
  return (t - tmin) / (tmax - tmin);
}

// Linear interpolation, without a ratio
float lerp(float outmin, float outmax, float inmin, float inmax, float t) {
  float d = range(inmin, inmax, t);
  return mix(outmin, outmax, d);
}

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;

  vec2 vel = texture2D(velocity, st).xy;
  st.x *= resolution.x / resolution.y;

  // We don't modify the field if no force is applied
  if (force.x + force.y != 0.) {

    // pt1 and pt2 are the 2 focal points of an ellipsis
    // Correct the vertical axis which is not the same in GLSL and in DOM
    vec2 pt2 = vec2(point.x, point.y);
    vec2 f = vec2(force.x, force.y);
    vec2 pt1 = pt2 - f * 2.;

    // Distance field for the ellipsis
    float d = length(st - pt1) + length(st - pt2);

    // Radius of the ellipsis, depends on the force applied
    float r = lerp(.01, .25, .001, .2, min(length(f*2.), .2));

    // Modify the velocity field
    float isClose = 1. - step(r, d);
    vel = isClose * f * mix(1., 10., d/r) +  vel;
  }

  gl_FragColor = vec4(vec3(vel, 0.), 1.);
  
}