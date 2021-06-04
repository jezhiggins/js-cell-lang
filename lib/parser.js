function* parse(lexer) {
  for (const [type, value] of lexer) {
    switch(type) {
      case 'number':
        want(';', lexer)
        yield ['number', value]
    }
  }
}

function want(expectedType, lexer) {
  const next = lexer.next()
  if (next.done)
    throw `Hit end of file - expected '${expectedType}'.`
  const [type, value] = next.value
  if (type !== expectedType)
    throw `Expected ${expectedType} but found ${type}`
}

export { parse }
