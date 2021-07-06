import {initSimulation} from './simulation';
import {initMouseListener} from './events';
import { initControlPanel } from './controls';

export function main() {
  const listener = initMouseListener();
  const controller = initControlPanel();
  initSimulation(listener, controller);
}