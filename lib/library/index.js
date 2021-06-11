import { if_fn } from './native/if_fn';

function loadStandardLibrary(env) {
  env.set('if', ['native', if_fn])
}

export { loadStandardLibrary }
