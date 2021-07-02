#ifdef GL_ES
precision mediump float;
#endif

// Render a texture as simply as possible

uniform sampler2D texture;
uniform vec2 resolution;

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  vec4 color = texture2D(texture, st);
  gl_FragColor = color;
}