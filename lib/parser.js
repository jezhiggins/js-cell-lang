function* parse(lexer) {
  for (const token of lexer)
    yield expression(token, lexer)
}

function nextToken(lexer, expectedType) {
  const next = lexer.next()
  if (next.done) {
    if (expectedType)
      throw `Hit end of file - expected '${expectedType}'.`
    return [null, null]
  }
  return next.value
}

function expression([type, value], lexer, previous) {
  if (type == ';')
    return previous
  switch (type) {
    case 'number':
    case 'symbol':
      return expression(nextToken(lexer, ';'), lexer, [type, value])
    case 'operation':
      const op1 = previous
      const op2 = expression(nextToken(lexer), lexer)
      return ['operation', value, op1, op2]
  }
}

export { parse }
