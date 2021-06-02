function* lex(input) {
  for (const c of input) {
    if (/[(|)|{|}]/.test(c))
      yield [c, '']
    if (/[a-zA-z]/.test(c))
      yield ['symbol', c]
  }
}

export { lex }
