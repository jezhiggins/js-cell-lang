import { native_fns } from './native'
import { cell_fns } from "./cell";
import { evaluate } from "../evaluator";
import { parse } from "../parser";
import { lex } from "../lexer";

function loadStandardLibrary(env) {
  for (const [name, fn] of Object.entries(native_fns))
    env.set(name, ['native', fn])

  for (const fnDef of cell_fns)
    evaluate(parse(lex(fnDef)), env)
}

export { loadStandardLibrary }
