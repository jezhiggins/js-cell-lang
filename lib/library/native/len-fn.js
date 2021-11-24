import { ExecutionError } from '../../util/errors.js'

function lenFn(env, string) {
  const [type, value] = string

  if (type !== 'string')
    throw ExecutionError('len() can only be called for a string.')

  return ['number', value.length]
}

export { lenFn }
