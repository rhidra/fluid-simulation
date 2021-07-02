import * as twgl from 'twgl.js';

export function createTexture(gl: WebGLRenderingContext): [WebGLTexture, twgl.FramebufferInfo] {
  const texture = twgl.createTexture(gl, {width: gl.canvas.width, height: gl.canvas.height, min: gl.LINEAR, mag: gl.LINEAR, type: gl.FLOAT});
  const framebuffer = twgl.createFramebufferInfo(gl, undefined, gl.canvas.width, gl.canvas.height);
  twgl.bindFramebufferInfo(gl, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  return [texture, framebuffer];
}

// ref: https://stackoverflow.com/questions/9046643/webgl-create-texture
export function createSolidTexture(gl: WebGLRenderingContext, r: number, g: number, b: number, a: number) {
  const data = new Uint8Array([r, g, b, a]);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  return texture;
}