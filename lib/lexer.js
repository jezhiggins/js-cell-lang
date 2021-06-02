import { peekableStream } from './peekable-stream.js'

function* lex(input) {
  const inputStream = peekableStream(input)

  for (const c of inputStream) {
    if (/[(|)|{|}]/.test(c))
      yield [c, '']
    if (/[a-zA-z]/.test(c))
      yield ['symbol', scan(c, inputStream)]
  }
}

function scan(token, inputStream) {
  let n = inputStream.peek()
  while(!n.done) {
    token += inputStream.next().value
    n = inputStream.peek()
  }
  return token
}

export { lex }
