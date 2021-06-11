import { if_fn } from './native/if_fn';
import { equals_fn } from './native/equals_fn';

function loadStandardLibrary(env) {
  env.set('if', ['native', if_fn])
  env.set('equals', ['native', equals_fn])
}

export { loadStandardLibrary }
