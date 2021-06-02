function* lex(input) {
  if (/[(|)|{|}]/.test(input))
    yield [input, '']
  if (/[a-zA-z]/.test(input))
    yield ['symbol', input]
}

export { lex }
