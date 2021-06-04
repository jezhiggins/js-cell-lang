function* parse(lexer) {
  const { done, value : token } = lexer.next()
  if (done)
    return
  const [type, value] = token
  yield ['number', value]
}

export { parse }
