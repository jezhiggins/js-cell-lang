function evaluate(expression) {
  if (!expression)
    return ['none']

  const [type, op] = expression

  switch (type) {
    case 'number':
      return ['number', Number.parseFloat(op)]
    case 'string':
      return ['string', op]
    case 'operation':
      return ['number', eval_operation(op, expression[2], expression[3])]
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
