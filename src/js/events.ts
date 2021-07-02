export class MouseListener {
  isMouseDown = false;
  prevDir: [number, number] | null = null;

  mouseDragCb: (dir: [number, number], norm: number) => void;

  constructor() {
    const canvas = document.querySelector<HTMLCanvasElement>("#c");

    document.addEventListener('mousedown', e => {
      this.isMouseDown = true
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX / rect.width;
      const y = e.clientY / rect.height;
      this.prevDir = [x, y];
    });
  
    document.addEventListener('mouseup', () => {
      this.isMouseDown = false;
      this.prevDir = null;
    });
    
    document.addEventListener('mousemove', e => {
      if (!this.isMouseDown) {
        return;
      }
  
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX / rect.width;
      const y = e.clientY / rect.height;
  
      if (!this.prevDir) {
        this.prevDir = [x, y];
        return;
      }
  
      const dir = [x - this.prevDir[0], y - this.prevDir[1]];
      const norm = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]);
      const dirNorm: [number, number] = [dir[0] / norm, dir[1] / norm];
  
      this.mouseDragCb(dirNorm, norm);
    });
  }

  onMouseDrag(fn: (dir: [number, number], norm: number) => void) {
    this.mouseDragCb = fn;
  }
}

export function initMouseListener() {
  return new MouseListener();
}