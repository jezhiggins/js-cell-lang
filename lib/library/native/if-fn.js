import { evaluate } from '../../evaluator.js'
import { stringify } from '../../util/stringify-expression.js'
import { ExecutionError } from '../../util/errors.js'

function ifFn(env, test, then_fn, else_fn) {
  const [type, value] = test

  if (type !== 'number')
    throw ExecutionError(`Only numbers may be passed to an if, but I was passed ${stringify(test)}`)

  const to_call = value !== 0 ? then_fn : else_fn
  return evaluate([["call", to_call, []]], env)
}

export { ifFn }
