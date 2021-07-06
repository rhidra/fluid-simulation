export enum RenderType {
  NONE="none", VELOCITY="velocity",
  MOTION_BLUR="blur", PIXELIZE="pixelize", GRID_FLOW="grid", SQUARE_FLOW="square",
}

export enum Quality {
  LOW="low", MEDIUM="medium", HIGH="high",
}

export class Controller {
  nav;
  renderType = RenderType.NONE;
  quality = Quality.MEDIUM;
  qualityCb: (q: Quality) => void

  constructor() {
    this.nav = document.querySelector<HTMLElement>('nav');

    // Open and close panel buttons
    document.querySelector<HTMLButtonElement>('#close')
      .addEventListener('click', () => this.nav.classList.remove('visible'));
    document.querySelector<HTMLButtonElement>('#open')
      .addEventListener('click', () => this.nav.classList.add('visible'));

    // Post processing effect
    const radiosRenderType = document.querySelectorAll<HTMLInputElement>('input[type="radio"][name="renderType"]');
    radiosRenderType.forEach(radio => {
      radio.addEventListener('change', (e: any) => this.handleChangeRenderType(e.target.value));
      if (radio.checked) {
        this.handleChangeRenderType(radio.value as RenderType);
      }
    });

    // Quality
    const radiosQuality = document.querySelectorAll<HTMLInputElement>('input[type="radio"][name="quality"]');
    radiosQuality.forEach(radio => {
      radio.addEventListener('change', (e: any) => this.handleChangeQuality(e.target.value));
      if (radio.checked) {
        this.handleChangeQuality(radio.value as Quality)
      }
    });
  }

  handleChangeRenderType(type: RenderType) {
    this.renderType = type;
  }

  handleChangeQuality(type: Quality) {
    this.quality = type;
    if (this.qualityCb) {
      this.qualityCb(this.quality);
    }
  }

  onChangeQuality(f: any) {
    this.qualityCb = f;
  }
}

export function initControlPanel() {
  return new Controller();
}