type Vector2 = [number, number];

export class MouseListener {
  isMouseDown = false;
  prevDir: Vector2 | null = null;

  mouseDragCb: (point: Vector2, force: Vector2) => void;
  dragStopCb: () => void;

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
      if (this.dragStopCb) {
        this.dragStopCb();
      }
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
  
      const dir: Vector2 = [x - this.prevDir[0], y - this.prevDir[1]];
      
      if (this.mouseDragCb) {
        this.mouseDragCb([x, y], dir);
      }
    });
  }

  onMouseDrag(fn: (point: Vector2, force: Vector2) => void) {
    this.mouseDragCb = fn;
  }

  onMouseDragStop(fn: () => void) {
    this.dragStopCb = fn;
  }
}

export function initMouseListener() {
  return new MouseListener();
}