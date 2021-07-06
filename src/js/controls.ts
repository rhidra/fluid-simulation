export enum RenderType {
  NONE="none", VELOCITY="velocity",
  MOTION_BLUR="blur", PIXELIZE="pixelize", GRID_FLOW="grid", SQUARE_FLOW="square",
}

export class Controller {
  nav;
  renderType = RenderType.NONE;

  constructor() {
    this.nav = document.querySelector<HTMLElement>('nav');

    // Open and close panel buttons
    document.querySelector<HTMLButtonElement>('#close')
      .addEventListener('click', () => this.nav.classList.remove('visible'));
    document.querySelector<HTMLButtonElement>('#open')
      .addEventListener('click', () => this.nav.classList.add('visible'));

    // Post processing effect
    const radios = document.querySelectorAll<HTMLInputElement>('input[type="radio"][name="renderType"]');
    radios.forEach(radio => {
      radio.addEventListener('change', (e: any) => this.handleChangeRenderType(e.target.value))
      if (radio.checked) {
        this.handleChangeRenderType(radio.value as RenderType);
      }
    });
  }

  handleChangeRenderType(type: RenderType) {
    this.renderType = type;
  }
}

export function initControlPanel() {
  return new Controller();
}