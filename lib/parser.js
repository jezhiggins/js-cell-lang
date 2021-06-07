function* parse(lexer) {
  for (const token of lexer) {
    const expr = expression(token, lexer)
    if (expr) yield expr;
  }
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
    case 'operation': {
      const op1 = previous
      const op2 = expression(nextToken(lexer), lexer)
      return ['operation', value, op1, op2]
    }
    case '=': {
      const op1 = previous
      if (op1[0] != 'symbol')
        throw 'You can\'t assign to anything except a symbol.'
      const op2 = expression(nextToken(lexer), lexer)
      return ['assignment', op1, op2]
    }
    case '(': {
      const fn = previous
      return ['call', fn, []]
    }
  }
}

export { parse }
