class Environment {
  constructor(parent) {
    this.parent_ = parent
    this.vars_ = { }
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
}

function makeEnvironment(parent = null) {
  return new Environment(parent)
}

function evaluate(expressions, environment = makeEnvironment()) {
  let result
  for (const expression of expressions)
    result = eval_expression(expression, environment)

  if (result === null || result === undefined)
    return ['none']
  if (Array.isArray(result))
    return result
  if (typeof result === 'number')
    return ['number', result]
  return ['string', result]
}

function eval_expression(expression, environment) {
  if (!expression)
    return null

  const [type, op] = expression

  switch (type) {
    case 'number':
      return Number.parseFloat(op)
    case 'string':
      return op
    case 'function':
      return expression
    case 'operation':
      return eval_operation(op, expression[2], expression[3], environment)
    case 'assignment':
      return eval_assignment(op[1], expression[2], environment)
    case 'symbol':
      return eval_symbol_lookup(op, environment)
    case 'call':
      return eval_function_call(op, expression[2], environment)
  }
}

function eval_operation(operation, operand1, operand2, environment) {
  const lhs = eval_expression(operand1, environment)
  const rhs = eval_expression(operand2, environment)
  switch(operation) {
    case '+':
      return lhs + rhs
    case '-':
      return lhs - rhs
    case '/':
      return lhs / rhs
    case '*':
      return lhs * rhs
  }
}

function eval_assignment(symbol, expression, environment, targetEnvironment = environment) {
  const value = eval_expression(expression, environment)
  targetEnvironment.set(symbol, value)
  return value
}

function eval_symbol_lookup(symbol, environment) {
  return environment.lookup(symbol)
}

function eval_function_call(toCall, parameterValues, environment) {
  const func = eval_expression(toCall, environment)
  const [_, parameters, funcBody] = func

  const functionEnvironment = makeEnvironment(environment)
  for (let p = 0; p !== parameters.length; ++p)
    eval_assignment(parameters[p][1], parameterValues[p], environment, functionEnvironment)

  return evaluate(funcBody, functionEnvironment)
}

export { evaluate };
