type Vector2 = [number, number];

export class MouseListener {
  isMouseDown = false;
  prevDir: Vector2 | null = null;
  canvas;

  mouseDragCb: (point: Vector2, force: Vector2) => void;
  dragStopCb: () => void;

  constructor() {
    this.canvas = document.querySelector<HTMLCanvasElement>("#c");

    // Configure event listeners

    // Mouse down
    document.addEventListener('touchstart', e => {
      // e.preventDefault();
      this.handleMouseDown(e.touches[0].clientX, e.touches[0].clientY);
    });
    document.addEventListener('mousedown', e => this.handleMouseDown(e.clientX, e.clientY));
  
    // Mouse up
    document.addEventListener('touchend', e => {
      // e.preventDefault();
      this.handleMouseUp();
    });
    document.addEventListener('mouseup', () => this.handleMouseUp());
    
    // Mouse move
    document.addEventListener('touchmove', e => {
      // e.preventDefault();
      this.handleMouseMove(e.touches[0].clientX, e.touches[0].clientY);
    });
    document.addEventListener('mousemove', e => this.handleMouseMove(e.clientX, e.clientY));

    if (false) {
      const startTime = Date.now() / 1000;
      let lastTime = 0;
      setInterval(() => {
        const now = Date.now() / 1000 - startTime;
        const dt = now - lastTime;
        this.step(now, dt);
        lastTime = now;
      }, 1000/30);
    }
  }

  handleMouseDown(clientX: number, clientY: number) {
    this.isMouseDown = true
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX / rect.width;
    const y = clientY / rect.height;
    this.prevDir = [x, y];
  }

  handleMouseUp() {
    this.isMouseDown = false;
    this.prevDir = null;
    if (this.dragStopCb) {
      this.dragStopCb();
    }
  }

  handleMouseMove(clientX: number, clientY: number) {
    if (!this.isMouseDown) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = clientX / rect.width * (rect.width/rect.height);
    const y = 1. - clientY / rect.height;

    if (!this.prevDir) {
      this.prevDir = [x, y];
      return;
    }

    const dir: Vector2 = [x - this.prevDir[0], y - this.prevDir[1]];

    this.prevDir = [x, y];
    
    if (this.mouseDragCb) {
      this.mouseDragCb([x, y], dir);
    }
  }

  onMouseDrag(fn: (point: Vector2, force: Vector2) => void) {
    this.mouseDragCb = fn;
  }

  onMouseDragStop(fn: () => void) {
    this.dragStopCb = fn;
  }

  step(time: number, dt: number) {
    if (time < 3) {
      this.dragStopCb();
    }
    const {width, height} = this.canvas.getBoundingClientRect();
    
    const t = time - 3;
    const radius = .25;
    const f = 1/5;
    const cx = .5;
    const cy = .5;
    const force = .05;

    const theta = t * 2 * Math.PI * f;

    const pt: Vector2 = [cx + radius * Math.cos(theta), cy + radius * Math.sin(theta)];
    const dpt: Vector2 = [- force * Math.sin(theta), force * Math.cos(theta)];

    pt[0] *= width / height;
    this.mouseDragCb(pt, dpt);
  }
}

export function initMouseListener() {
  return new MouseListener();
}