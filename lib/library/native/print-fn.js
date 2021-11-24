import { ExecutionError } from '../../util/errors.js'

function printValue(value) {
  const [type, val] = value

  switch(type) {
    case 'number':
      return val.toString()
    case 'string':
      return val
    case 'function':
      return '<function>'
    case 'native':
      return '<native>'
    case 'none':
      return 'None'
    default:
      throw ExecutionError('Unknown value type \'${type}\'')
  }
}

function printFn(env, value) {
  process.stdout.write(`${printValue(value)}\n`)
  return ['none', null]
}

export { printFn }
