function* parse(lexer) {
  for (const [type, value] of lexer) {
    switch(type) {
      case 'number':
        yield ['number', value]
    }
  }
}

export { parse }
