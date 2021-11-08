import { lex } from '../lib/lexer.js'
import { parse } from '../lib/parser.js'
import { astProcess } from '../bin/astprocessor'

async function parsed(input) {
  const asts = []
  for await (const ast of parse(lex(input))) {
    asts.push(ast)
  }
  return asts
}

function expectParsed(input) {
  const result = parsed(input).then(r => r.length === 1 ? r[0] : r)
  return expect(result)
}

async function fold(input) {
  const asts = await parsed(input)
  const folded = await Promise.all(asts.map(ast => astProcess(ast, ['fold'])))
  return folded.length === 1 ? folded[0] : folded
}

describe('constant folding', () => {
  it ('1 + 2', async () => {
    const expression = '1 + 2;'

    await expectParsed(expression).resolves
      .toEqual(['operation', '+', ['number', '1'], ['number', '2']])

    const foldedExpression = await fold(expression)
    expect(foldedExpression).toEqual(['number', '3']);
  })

  it ('1 + 2 * 3;', async () => {
    const expression = '1 + 2 * 3;'

    await expectParsed(expression).resolves
      .toEqual(['operation', '+', ['number', '1'], ['operation', '*', ['number', '2'], ['number', '3']]])

    const foldedExpression = await fold(expression)
    expect(foldedExpression).toEqual(['number', '7']);
  })

  it ('a = 1 + 2;', async () => {
    const expression = 'a = 1 + 2;'

    await expectParsed(expression).resolves
      .toEqual(['assignment', ['symbol', 'a'], ['operation', '+', ['number', '1'], ['number', '2']]])

    const foldedExpression = await fold(expression)
    expect(foldedExpression).toEqual(['assignment', ['symbol', 'a'], ['number', '3']]);
  })
})
