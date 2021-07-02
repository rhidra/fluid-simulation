#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 position;
    
void main() {
  gl_Position = position;
}