function constantFold(ast) {
  if (ast && ast[0] !== 'operation')
    return ast

  const [, [operand1], operand2, operand3] = ast
  const [lType, lValue] = operand2
  const [rType, rValue] = operand3

  if (lType !== 'number' || rType !== 'number')
    return ast

  return [
    'number',
    calculate(
      operand1,
      Number.parseFloat(lValue),
      Number.parseFloat(rValue)
    )
  ]
}

function calculate(operation, lhs, rhs) {
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

export { constantFold }
