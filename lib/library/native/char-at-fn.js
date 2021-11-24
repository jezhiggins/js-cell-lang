import { ExecutionError } from '../../util/errors.js'

function charAtFn(env, index, string) {
  if (index[0] !== 'number')
    throw ExecutionError('char_at() must take a number as its first argument.')
  if (string[0] !== 'string')
    throw ExecutionError('char_at() must take a string as its second argument.')

  const n = Math.round(index[1])
  if (n < 0 || n >= string[1].length)
    return ['none', null]
  else
    return ['string', string[1][n]]
}

export { charAtFn }
