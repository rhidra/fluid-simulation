import {initSimulation} from './simulation';
import {initMouseListener} from './events';

export function main() {
  const listener = initMouseListener();
  initSimulation(listener);
}