import { evaluate } from '../../evaluator';
import { stringify } from '../../util/stringify-expression';

function ifFn(env, test, then_fn, else_fn) {
  const [type, value] = test

  if (type !== 'number')
    throw `Only numbers may be passed to an if, but I was passed ${stringify(test)}`

  const to_call = value !== 0 ? then_fn : else_fn
  return evaluate([["call", to_call, []]], env)
}

export { ifFn }
