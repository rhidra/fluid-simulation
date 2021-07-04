import * as twgl from 'twgl.js';
import { MouseListener } from './events';
import { createTexture, createSolidTexture } from './texture';

// Load shaders
const vert = require('../shaders/shader.vert');
const externalForce = require('../shaders/externalForce.frag');
const advVel = require('../shaders/advVelocity.frag');
const divergence = require('../shaders/divergence.frag');
const jacobi = require('../shaders/jacobi.frag');
const velocity = require('../shaders/velocity.frag');
const advColors = require('../shaders/advColors.frag');
const identity = require('../shaders/identity.frag');

export function initSimulation(listener: MouseListener) {
  // WebGL init
  const gl = document.querySelector<HTMLCanvasElement>("#c").getContext("webgl");
  twgl.resizeCanvasToDisplaySize(gl.canvas as any);

  if (!gl.getExtension('OES_texture_float')) {
      console.error('no floating point texture support');
      return;
  }
  gl.getExtension('OES_texture_float_linear');

  // Programs init
  const progExtForce = twgl.createProgramInfo(gl, [vert.sourceCode, externalForce.sourceCode])
  const progAdvVel = twgl.createProgramInfo(gl, [vert.sourceCode, advVel.sourceCode])
  const progDiv = twgl.createProgramInfo(gl, [vert.sourceCode, divergence.sourceCode])
  const progJacobi = twgl.createProgramInfo(gl, [vert.sourceCode, jacobi.sourceCode])
  const progVel = twgl.createProgramInfo(gl, [vert.sourceCode, velocity.sourceCode])
  const progAdvColor = twgl.createProgramInfo(gl, [vert.sourceCode, advColors.sourceCode])
  const progIdentity = twgl.createProgramInfo(gl, [vert.sourceCode, identity.sourceCode]);
  
  // Vertex shader stuff
  const arrays = {position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]};
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
  
  // Textures
  const initColors = createSolidTexture(gl, 0., 0., 0., 0.);
  const initVel = createSolidTexture(gl, 0., 0., 0., 1.);
  const initJacobi = createSolidTexture(gl, 1., 0., 0., 0.);
  const [texture1, framebuffer1] = createTexture(gl);
  const [texture2, framebuffer2] = createTexture(gl);
  const [texture3, framebuffer3] = createTexture(gl);
  const [texture4, framebuffer4] = createTexture(gl);
  const [textVel, framebufferVel] = createTexture(gl);
  const [textColors, framebufferColors] = createTexture(gl);

  console.log(`resolution: ${gl.canvas.width} ${gl.canvas.height}`);

  const uniformsExtForce = {
    [externalForce.uniforms.velocity.variableName]: textVel,
    [externalForce.uniforms.point.variableName]: [-1., -1.],
    [externalForce.uniforms.force.variableName]: [0., 0.],
    [externalForce.uniforms.resolution.variableName]: [gl.canvas.width, gl.canvas.height],
  };

  listener.onMouseDrag((point, force) => {
    uniformsExtForce[externalForce.uniforms.point.variableName] = point;
    uniformsExtForce[externalForce.uniforms.force.variableName] = force;
  });
  listener.onMouseDragStop(() => {
    uniformsExtForce[externalForce.uniforms.point.variableName] = [-1., -1.];
    uniformsExtForce[externalForce.uniforms.force.variableName] = [0., 0.];
  });

  let lastTime = Date.now() / 1000;
  let i = 0;

  function render(time: number) {
    const now = time / 1000;
    const dt = (now - lastTime) * 1;
    lastTime = now;

    // Resize canvas and textures
    if (twgl.resizeCanvasToDisplaySize(gl.canvas as any)) {
      twgl.resizeFramebufferInfo(gl, framebuffer1, undefined, gl.canvas.width, gl.canvas.height);
      twgl.resizeFramebufferInfo(gl, framebuffer2, undefined, gl.canvas.width, gl.canvas.height);
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    const uniformsAdvVel = {
      [advVel.uniforms.dt.variableName]: dt,
      [advVel.uniforms.velocity.variableName]: texture1,
      [advVel.uniforms.resolution.variableName]: [gl.canvas.width, gl.canvas.height],
    };
    
    const uniformsDiv = {
      [divergence.uniforms.dt.variableName]: dt,
      [divergence.uniforms.advVelocity.variableName]: texture2,
      [divergence.uniforms.resolution.variableName]: [gl.canvas.width, gl.canvas.height],
    };
    
    const uniformsJacobi = {
      [jacobi.uniforms.divergence.variableName]: texture1,
      [jacobi.uniforms.prev.variableName]: initJacobi,
      [jacobi.uniforms.resolution.variableName]: [gl.canvas.width, gl.canvas.height],
    };
    
    const uniformsVel = {
      [velocity.uniforms.dt.variableName]: dt,
      [velocity.uniforms.advVelocity.variableName]: texture2,
      [velocity.uniforms.pressure.variableName]: texture4,
      [velocity.uniforms.resolution.variableName]: [gl.canvas.width, gl.canvas.height],
    };
    
    const uniformsAdvColors = {
      [advColors.uniforms.dt.variableName]: dt,
      [advColors.uniforms.time.variableName]: now,
      [advColors.uniforms.velocity.variableName]: textVel,
      [advColors.uniforms.prev.variableName]: textColors,
      [advColors.uniforms.point.variableName]: uniformsExtForce[externalForce.uniforms.point.variableName],
      [advColors.uniforms.force.variableName]: uniformsExtForce[externalForce.uniforms.force.variableName],
      [advColors.uniforms.resolution.variableName]: [gl.canvas.width, gl.canvas.height],
    };

    const uniformsIdentity = {
      [identity.uniforms.texture.variableName]: texture1,
      [identity.uniforms.resolution.variableName]: [gl.canvas.width, gl.canvas.height],
    };

    if (i === 0) {
      // Render initial velocity to textVel
      uniformsIdentity[identity.uniforms.texture.variableName] = initVel;
      renderToTexture(gl, progIdentity, framebufferVel, bufferInfo, uniformsIdentity);

      // Render initial texture to textColors
      uniformsAdvColors[advColors.uniforms.prev.variableName] = initColors;
      renderToTexture(gl, progAdvColor, framebufferColors, bufferInfo, uniformsAdvColors);
    } else {
      // Add external forces to the velocity and render to texture1
      renderToTexture(gl, progExtForce, framebuffer1, bufferInfo, uniformsExtForce);

      // uniformsIdentity[identity.uniforms.texture.variableName] = texture1;
      // renderToTexture(gl, progIdentity, null, bufferInfo, uniformsIdentity);

      // Render advected velocity to texture2
      renderToTexture(gl, progAdvVel, framebuffer2, bufferInfo, uniformsAdvVel);

      // Render divergence to texture1
      renderToTexture(gl, progDiv, framebuffer1, bufferInfo, uniformsDiv);

      // Jacobi algorithm to approximate pressure
      for (let j = 0; j < 5; j++) {
        if (j % 2 === 0) {
          // Render one iteration of the Jacobi algorithm to texture3
          renderToTexture(gl, progJacobi, framebuffer3, bufferInfo, uniformsJacobi);
          uniformsJacobi[jacobi.uniforms.prev.variableName] = texture3;
        } else {
          // Render one iteration of the Jacobi algorithm to texture4
          renderToTexture(gl, progJacobi, framebuffer4, bufferInfo, uniformsJacobi);
          uniformsJacobi[jacobi.uniforms.prev.variableName] = texture4;
        }
      }

      // Render the velocity to textVel
      uniformsVel[velocity.uniforms.pressure.variableName] = uniformsJacobi[jacobi.uniforms.prev.variableName];
      renderToTexture(gl, progVel, framebufferVel, bufferInfo, uniformsVel);

      // Render the advected colors to texture1 and textColors
      renderToTexture(gl, progAdvColor, framebuffer1, bufferInfo, uniformsAdvColors);
      uniformsIdentity[identity.uniforms.texture.variableName] = texture1;
      renderToTexture(gl, progIdentity, framebufferColors, bufferInfo, uniformsIdentity);
    }

    // Render the color texture to the screen
    uniformsIdentity[identity.uniforms.texture.variableName] = textColors;
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