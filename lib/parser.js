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
      return expression(nextToken(lexer, ';'), lexer, ['number', value])
  }
}

export { parse }
