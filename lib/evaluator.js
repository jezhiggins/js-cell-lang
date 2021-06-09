function evaluate(expressions, environment = { }) {
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
  if (environment.hasOwnProperty(symbol))
    throw `Not allowed to re-assign symbol '${symbol}'.`
  const value = eval_expression(expression, environment)
  targetEnvironment[symbol] = value
  return value
}

function eval_symbol_lookup(symbol, environment) {
  if(!environment.hasOwnProperty(symbol))
    throw `Unknown symbol '${symbol}'.`
  return environment[symbol]
}

function eval_function_call(func, parameterValues, environment) {
  const functionEnvironment = Object.assign({ }, environment)
  const [_, parameters, funcBody] = func
  for (let p = 0; p != parameters.length; ++p)
    eval_assignment(parameters[p][1], parameterValues[p], environment, functionEnvironment)

  return evaluate(funcBody, functionEnvironment)
}

export { evaluate };
