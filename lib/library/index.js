import { if_fn } from './native/if_fn';
import { equals_fn } from './native/equals_fn';
import { set_fn } from './native/set_fn';
import { char_at } from './native/char_at';

function loadStandardLibrary(env) {
  env.set('if', ['native', if_fn])
  env.set('equals', ['native', equals_fn])
  env.set('set', ['native', set_fn])
  env.set('char_at', ['native', char_at])
}

export { loadStandardLibrary }
