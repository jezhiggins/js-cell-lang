import { if_fn } from './native/if_fn';
import { equals_fn } from './native/equals_fn';
import { set_fn } from './native/set_fn';

function loadStandardLibrary(env) {
  env.set('if', ['native', if_fn])
  env.set('equals', ['native', equals_fn])
  env.set('set', ['native', set_fn])
}

export { loadStandardLibrary }
