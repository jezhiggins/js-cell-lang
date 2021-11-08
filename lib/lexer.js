import { peekableStream } from './util/peekable-stream.js'

const symbolStartMatcher = /[a-zA-Z_]/
const symbolMatcher = /[a-zA-Z_0-9]/
const numberMatcher = /[0-9.]/
const quoteMatcher = /["']/
const singleMatcher = /[(){},=;:]/
const operationMatcher = /[+\-*\/]/
const spaceMatcher = /[ \n]/

async function* lex(input) {
  const inputStream = peekableStream(input)

  for await (const c of inputStream) {
    if (singleMatcher.test(c))
      yield [c, '']
    else if (symbolStartMatcher.test(c))
      yield ['symbol', await scan(c, inputStream, symbolMatcher)]
    else if (numberMatcher.test(c))
      yield ['number', await scan(c, inputStream, numberMatcher)]
    else if (quoteMatcher.test(c))
      yield ['string', await stringScan(inputStream, c)]
    else if (operationMatcher.test(c))
      yield ['operation', c]
    else if (spaceMatcher.test(c))
      continue
    else if ('\t' === c)
      throw 'Tab characters are not allowed in Cell.'
    else
      throw `Unrecognised character - ${c}`
  }
}

async function scan(token, inputStream, matcher) {
  let n = await inputStream.peek()
  while(!n.done && matcher.test(n.value)) {
    token += (await inputStream.next()).value
    n = await inputStream.peek()
  }
  return token
}

async function stringScan(inputStream, quoteChar) {
  let token = ''
  let n = await inputStream.next()
  while(n.value !== quoteChar) {
    if (n.done)
      throw 'A string ran off the end of the program.'
    token += n.value
    n = await inputStream.next()
  }
  return token
}

export { lex }
