import { peekableStream } from './peekable-stream.js'

const symbolMatcher = /[a-zA-z]/

function* lex(input) {
  const inputStream = peekableStream(input)

  for (const c of inputStream) {
    if (/[(|)|{|}]/.test(c))
      yield [c, '']
    if (symbolMatcher.test(c))
      yield ['symbol', scan(c, inputStream, symbolMatcher)]
  }
}

function scan(token, inputStream, matcher) {
  let n = inputStream.peek()
  while(!n.done && symbolMatcher.test(n.value)) {
    token += inputStream.next().value
    n = inputStream.peek()
  }
  return token
}

export { lex }
