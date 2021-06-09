function evaluate(expression) {
  const result = eval_expression(expression)

  if (result === null || result === undefined)
    return ['none']
  if (typeof result === 'number')
    return ['number', result]
  return ['string', result]
}

function eval_expression(expression) {
  if (!expression)
    return null

  const [type, op] = expression

  switch (type) {
    case 'number':
      return Number.parseFloat(op)
    case 'string':
      return op
    case 'operation':
      return eval_operation(op, expression[2], expression[3])
  }
}

function eval_operation(operation, operand1, operand2) {
  const lhs = evaluate(operand1)[1]
  const rhs = evaluate(operand2)[1]
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

export { evaluate };
