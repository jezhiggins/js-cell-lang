import { native_fns } from './native/index.js'
import { cellFns } from './cell/index.js'
import { evaluate } from '../evaluator.js'
import { parse } from '../parser.js'
import { lex } from '../lexer.js'

function loadStandardLibrary(env) {
  for (const [name, fn] of Object.entries(native_fns))
    env.set(name, ['native', fn])

  for (const fnDef of cellFns)
    evaluate(parse(lex(fnDef)), env)
}

export { loadStandardLibrary }
