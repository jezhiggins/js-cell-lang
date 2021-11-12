import { topLevelEnvironment } from "./environment.js";
import { stringify } from './util/stringify-expression.js';

function evaluate(
  expressions,
  environment = topLevelEnvironment()
) {
  let result = ['none', null]

  for (result of progressive_evaluate(expressions, environment))
    ;

  return result
}

function* progressive_evaluate(
  expressions,
  environment = topLevelEnvironment()
) {
  for (const expression of expressions)
    yield eval_expression(expression, environment)
}
function eval_expression(expression, environment) {
  if (!expression)
    return null

  const [type, operand1, operand2, operand3] = expression

  switch (type) {
    case 'number':
      return ['number', Number.parseFloat(operand1)]
    case 'string':
      return ['string', operand1]
    case 'function':
      return [...expression, environment]
    case 'operation':
      return eval_operation(operand1, operand2, operand3, environment)
    case 'assignment':
      return eval_assignment(operand1, operand2, environment)
    case 'symbol':
      return eval_symbol_lookup(operand1, environment)
    case 'call':
      return eval_function_call(operand1, operand2, environment)
  }
}

function eval_operation(operation, operand1, operand2, environment) {
  const lhs = eval_expression(operand1, environment)
  const rhs = eval_expression(operand2, environment)
  return ['number', do_operation(operation, lhs[1], rhs[1])]
}

function do_operation(operation, lhs, rhs) {
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
  const [, name] = symbol;
  const value = eval_expression(expression, environment)
  targetEnvironment.set(name, value)
  return value
}

function eval_symbol_lookup(symbol, environment) {
  return environment.lookup(symbol)
}

function eval_function_call(toCall, parameterValues, environment) {
  const func = eval_expression(toCall, environment)

  switch (func[0]) {
    case 'function':
      return eval_cell_function(func, parameterValues, environment, toCall)
    case 'native':
      return eval_builtin_function(func, parameterValues, environment)
    default:
      throw `Can only call functions, but trying to call '${func[0]}'`
  }
}

function eval_cell_function(func, parameterValues, environment, toCall) {
  const [_, parameters, funcBody, closure] = func
  if (parameterValues.length !== parameters.length)
    throw `${parameterValues.length} arguments passed to function ${stringify(toCall)}, but it requires ${parameters.length} arguments.`

  const functionEnvironment = closure.newScope()
  for (let p = 0; p !== parameters.length; ++p)
    eval_assignment(parameters[p], parameterValues[p], environment, functionEnvironment)

  return evaluate(funcBody, functionEnvironment)
}

function eval_builtin_function(func, parameterValues, environment) {
  const functionEnvironment = environment.newScope()
  const parameters = parameterValues.map(p => evaluate([p], functionEnvironment))

  return func[1](environment, ...parameters)
}

export { evaluate, progressive_evaluate };
