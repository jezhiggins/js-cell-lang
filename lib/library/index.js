import { native } from './native'

function loadStandardLibrary(env) {
  for (const [name, fn] of Object.entries(native))
    env.set(name, ['native', fn])
}

export { loadStandardLibrary }
