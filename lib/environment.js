import { loadStandardLibrary } from './library';

class Environment {
  constructor(parent, vars = { }) {
    this.parent_ = parent
    this.vars_ = vars
  }

  set(symbol, value) {
    if (this.vars_.hasOwnProperty(symbol))
      throw `Not allowed to re-assign symbol '${symbol}'.`
    this.vars_[symbol] = value
    return value
  }

  lookup(symbol) {
    if (this.vars_.hasOwnProperty(symbol))
      return this.vars_[symbol]

    if (this.parent_)
      return this.parent_.lookup(symbol)

    throw `Unknown symbol '${symbol}'.`
  }

  newScope() {
    return new Environment(this)
  }
}

function topLevelEnvironment() {
  const env = new Environment()
  loadStandardLibrary(env)
  env.set('None', null)
  return env
}

export { Environment, topLevelEnvironment }
