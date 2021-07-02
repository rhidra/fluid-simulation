import * as twgl from 'twgl.js';
import { createTexture, createSolidTexture } from './texture';

// Load shaders
const vert = require('../shaders/shader.vert');
const constVelFrag = require('../shaders/constantVel.frag');
const advColors = require('../shaders/advColors.frag');
const identity = require('../shaders/identity.frag');

export function main() {
  // WebGL init
  const gl = document.querySelector<HTMLCanvasElement>("#c").getContext("webgl");
  twgl.resizeCanvasToDisplaySize(gl.canvas as any);

  if (!gl.getExtension('OES_texture_float')) {
      console.error('no floating point texture support');
      return;
  }

  // Programs init
  const progConstantVel = twgl.createProgramInfo(gl, [vert.sourceCode, constVelFrag.sourceCode]);
  const progAdvColor = twgl.createProgramInfo(gl, [vert.sourceCode, advColors.sourceCode])
  const progIdentity = twgl.createProgramInfo(gl, [vert.sourceCode, identity.sourceCode]);
  
  // Vertex shader stuff
  const arrays = {position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]};
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
  
  // Textures
  const initColors = createSolidTexture(gl, 0., 0., 0., 0.);
  const [texture1, framebuffer1] = createTexture(gl);
  const [texture2, framebuffer2] = createTexture(gl);
  const [textColors, framebufferColors] = createTexture(gl);

  let lastTime = Date.now() / 1000;
  let i = 0;

  function render(time: number) {
    const now = time / 1000;
    const dt = now - lastTime;
    lastTime = now;

    // Resize canvas and textures
    if (twgl.resizeCanvasToDisplaySize(gl.canvas as any)) {
      twgl.resizeFramebufferInfo(gl, framebuffer1, undefined, gl.canvas.width, gl.canvas.height);
      twgl.resizeFramebufferInfo(gl, framebuffer2, undefined, gl.canvas.width, gl.canvas.height);
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    const uniformsConstVel = {
      [constVelFrag.uniforms.resolution.variableName]: [gl.canvas.width, gl.canvas.height],
    };
    
    const uniformsAdvColors = {
      [advColors.uniforms.dt.variableName]: dt,
      [advColors.uniforms.velocity.variableName]: texture1,
      [advColors.uniforms.prev.variableName]: i === 0 ? initColors : textColors,
      [advColors.uniforms.resolution.variableName]: [gl.canvas.width, gl.canvas.height],
    };

    const uniformsIdentity = {
      [identity.uniforms.texture.variableName]: texture2,
      [identity.uniforms.resolution.variableName]: [gl.canvas.width, gl.canvas.height],
    };
    
    renderToTexture(gl, progConstantVel, framebuffer1, bufferInfo, uniformsConstVel);
    renderToTexture(gl, progAdvColor, framebuffer2, bufferInfo, uniformsAdvColors);
    
    renderToTexture(gl, progIdentity, framebufferColors, bufferInfo, uniformsIdentity);
    renderToTexture(gl, progIdentity, null, bufferInfo, uniformsIdentity);

    i++;
    requestAnimationFrame(render);
  }
  
  requestAnimationFrame(render);
}

/**
 * Runs a WebGL program with a GLSL shader to generate a texture.
 * 
 * @param gl Current WebGL context
 * @param programInfo The program linked to the shaders to use
 * @param framebuffer The framebuffer linked to the texture on which to render. If null, renders to the canvas.
 * @param bufferInfo The buffer info used with the vertex shader
 * @param uniforms The uniforms used in the fragment shader
 */
function renderToTexture(gl: WebGLRenderingContext, programInfo: twgl.ProgramInfo, framebuffer: twgl.FramebufferInfo|null, bufferInfo: twgl.BufferInfo, uniforms: any) {
  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

  twgl.bindFramebufferInfo(gl, framebuffer);
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);
}