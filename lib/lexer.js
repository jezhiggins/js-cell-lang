import { peekableStream } from './util/peekable-stream.js'
import { LexingError } from './util/errors.js'

const symbolStartMatcher = /[a-zA-Z_]/
const symbolMatcher = /[a-zA-Z_0-9]/
const numberMatcher = /[0-9.]/
const quoteMatcher = /["']/
const singleMatcher = /[(){},=;:]/
const operationMatcher = /[+\-*\/]/
const spaceMatcher = /[ \n]/

function* lex(input) {
  const inputStream = peekableStream(input)

  for (const c of inputStream) {
    if (singleMatcher.test(c))
      yield [c, '']
    else if (symbolStartMatcher.test(c))
      yield ['symbol', scan(c, inputStream, symbolMatcher)]
    else if (numberMatcher.test(c))
      yield ['number', scan(c, inputStream, numberMatcher)]
    else if (quoteMatcher.test(c))
      yield ['string', stringScan(inputStream, c)]
    else if (operationMatcher.test(c))
      yield ['operation', c]
    else if (spaceMatcher.test(c))
      continue
    else if ('\t' === c)
      throw LexingError('Tab characters are not allowed in Cell.')
    else
      throw LexingError(`Unrecognised character - ${c}`)
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

function stringScan(inputStream, quoteChar) {
  let token = ''
  let n = inputStream.next()
  while(n.value !== quoteChar) {
    if (n.done)
      throw LexingError('A string ran off the end of the program.')
    token += n.value
    n = inputStream.next()
  }
  return token
}

export { lex }
