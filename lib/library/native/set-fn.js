import { stringify } from '../../util/stringify-expression.js'

function setFn(env, symbol, value) {
  const [stype, sname] = symbol
  if (stype !== 'string')
    throw `set() takes a string as its first argument, but was: ${stringify(symbol)}`

  for(let e = env; e; e = e.parent_)
    if (e.vars_.hasOwnProperty(sname))
      return e.vars_[sname] = value

  throw `Attempted to set name '${sname}' but it does not exist.`
}

export { setFn }
