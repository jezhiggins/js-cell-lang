import { peekableStream } from './peekable-stream.js'

const symbolStartMatcher = /[a-zA-z_]/
const symbolMatcher = /[a-zA-z_0-9]/
const numberMatcher = /[0-9\.]/

function* lex(input) {
  const inputStream = peekableStream(input)

  for (const c of inputStream) {
    if (/[(|)|{|}]/.test(c))
      yield [c, '']
    if (symbolStartMatcher.test(c))
      yield ['symbol', scan(c, inputStream, symbolMatcher)]
    if (numberMatcher.test(c))
      yield ['number', scan(c, inputStream, numberMatcher)]
    if (c == '"')
      yield ['string', stringScan(inputStream)]
  }
}

function scan(token, inputStream, matcher) {
  let n = inputStream.peek()
  while(!n.done && matcher.test(n.value)) {
    token += inputStream.next().value
    n = inputStream.peek()
  }
  return token
}

function stringScan(inputStream) {
  let token = ''
  let n = inputStream.next()
  while(!n.done && n.value != '"') {
    token += n.value
    n = inputStream.next()
  }
  return token
}

export { lex }
