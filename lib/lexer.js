function* lex(input) {
  if (/[(|)|{|}]/.test(input))
    yield [input, '']
}

export { lex }
