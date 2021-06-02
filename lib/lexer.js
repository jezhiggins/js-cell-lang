import { peekableStream } from './peekable-stream.js'

function* lex(input) {
  const inputStream = peekableStream(input)

  for (const c of inputStream) {
    if (/[(|)|{|}]/.test(c))
      yield [c, '']
    if (/[a-zA-z]/.test(c))
      yield ['symbol', c]
  }
}

export { lex }
