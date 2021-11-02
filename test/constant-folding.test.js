import { lex } from '../lib/lexer.js'
import { parse } from '../lib/parser.js'
import { astProcess } from '../bin/astprocessor'

function parsed(input) {
  return [...parse(lex(input))]
}

function expectParsed(input) {
  const result = parsed(input)
  return expect(result.length === 1 ? result[0] : result)
}

function expectFolded(input) {
  const folded = parsed(input).map(
    ast => astProcess(ast, ['fold'])
  )
  return expect(folded.length === 1 ? folded[0] : folded)
}

describe('constant folding', () => {
  it ('1 + 2', () => {
    const expression = '1 + 2;'

    expectParsed(expression)
      .toEqual(['operation', '+', ['number', '1'], ['number', '2']])
    expectFolded(expression)
      .toEqual(['number', '3']);
  })

  it ('1 + 2 * 3;', () => {
    const expression = '1 + 2 * 3;'

    expectParsed(expression)
      .toEqual(['operation', '+', ['number', '1'], ['operation', '*', ['number', '2'], ['number', '3']]])
    expectFolded(expression)
      .toEqual(['number', '7']);
  })

  it ('a = 1 + 2;', () => {
    const expression = 'a = 1 + 2;'

    expectParsed(expression)
      .toEqual(['assignment', ['symbol', 'a'], ['operation', '+', ['number', '1'], ['number', '2']]])
    expectFolded(expression)
      .toEqual(['assignment', ['symbol', 'a'], ['number', '3']]);
  })
})
