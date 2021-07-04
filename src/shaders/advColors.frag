#ifdef GL_ES
precision mediump float;
#endif

// Advect color field according to the texture,
// interpreted as a velocity field

// Time duration between two frame
uniform float dt;

// Velocity field, where (R -> v_x, G -> v_y, G, B).
uniform sampler2D velocity;

// Previous color field state (the previous result of this shader)
// At the initial state, set the alpha channel to 0.
uniform sampler2D prev;

// Applied point and force by the user
uniform vec2 point;
uniform vec2 force;

uniform float time;

uniform vec2 resolution;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec3 rgb2hsb( in vec3 c ){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),
                 vec4(c.gb, K.xy),
                 step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),
                 vec4(c.r, p.yzx),
                 step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                d / (q.x + e),
                q.x);
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

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  vec2 vel = texture2D(velocity, st).xy;
  float v = min(length(vel), 1.) / 1.;
  float v_step = smoothstep(0., .02, v);

  vec2 new_st = st - vel * dt;
  vec4 color = texture2D(prev, new_st);
  vec3 hsbColor = rgb2hsb(color.rgb);
  // color.rgb = hsb2rgb(vec3(hsbColor.x, v, hsbColor.z));
  color.rgb = color.rgb * v_step;

  vec2 pt = vec2(point.x, 1. - point.y);
  vec2 force_ = vec2(force.x, - force.y);

  float d = length(st - pt);
  d = exp(-d * 20.) * 1.;

  float f = min(length(force_), .1) / .1;
  
  v = sqrt(1. - min(1., 1.5 * pow(v, 2.)));
  color.rgb += f * d * hsb2rgb(vec3(time/5., v, 1.));

  // If the alpha is null, we are at the initial generation, so we must generate the initial texture
  if (color.a == 0.) {
    st *= 10.;
    // B&W Grid
    // float x = mod(floor(st.x), 2.);
    // float y = mod(floor(st.y + x), 2.);
    // color = vec4(vec3(y), 1.);

    // Random noise
    // st = floor(st);
    // float r = random(st);
    // color = vec4(vec3(r), 1.);

    // Black
    color = vec4(0., 0., 0., 1.);
  }
  
  gl_FragColor = color;
}