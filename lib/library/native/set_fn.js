import {stringify} from "../../util/stringify-expression";

function set_fn(env, symbol, value) {
  const [stype, sname] = symbol
  if (stype !== 'string')
    throw `set() takes a string as its first argument, but was: ${stringify(symbol)}`

  const vars = env.vars_
  if (vars.hasOwnProperty(sname))
    return vars[sname] = value

  if (env.parent_)
    return set_fn(env.parent_, symbol, value)

  throw `Attempted to set name '${sname}' but it does not exist.`
}

export { set_fn }
