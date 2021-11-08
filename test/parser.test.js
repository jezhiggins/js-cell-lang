import { lex } from '../lib/lexer.js'
import { parse } from '../lib/parser.js'

async function parsed(input) {
  return gatherAsts(parse(lex(input)))
}

async function gatherAsts(parser) {
  const asts = []
  for await (const ast of parser) {
    asts.push(ast)
  }
  return asts
}

function expectParsed(input) {
  const result = parsed(input)
    .then(r => r.length === 1 ? r[0] : r)
  return expect(result)
}

describe('parser', () => {
  it('empty file produces nothing', async () => {
    await expectParsed('').resolves.toEqual([])
  })

  it('number is parsed as expression', async () => {
    await expectParsed('56;').resolves.toEqual(['number', '56'])
  })

  it('string is parsed as expression', async () => {
    await expectParsed('"bobble";').resolves.toEqual(['string', 'bobble'])
  })

  it('missing semicolon is an error', async () => {
    await expectParsed('56').rejects
      .toEqual('Hit end of file - expected \';\'.')
  })

  it('sum of numbers is parsed as expression', async () => {
    await expectParsed('32 + 44;').resolves
      .toEqual(['operation', '+', ['number', '32'], ['number', '44']])
  })

  it('difference of symbol and number is parsed as expression', async () => {
    await expectParsed('foo - 44;').resolves
      .toEqual(['operation', '-', ['symbol', 'foo'], ['number', '44']])
  })

  it('multiplication of symbol and symbol is parsed as expression', async () => {
    await expectParsed('foo * bar;').resolves
      .toEqual(['operation', '*', ['symbol', 'foo'], ['symbol', 'bar']])
  })

  it('variable assignment gets parsed', async () => {
    await expectParsed('x = 3;').resolves
      .toEqual(['assignment', ['symbol', 'x'], ['number', '3']])
  })

  it('assigning to a number is an error', async () => {
    await expectParsed('3 = x;').rejects
      .toEqual('You can\'t assign to anything except a symbol.')
  })

  it('assigning to an expression is an error', async () => {
    await expectParsed('x(4) = 5;').rejects
      .toEqual('You can\'t assign to anything except a symbol.')
  })

  it('function call with no args gets parsed', async () => {
    await expectParsed('print();').resolves
      .toEqual(['call', ['symbol', 'print'], []])
  })

  it('multiple functions call no args get parsed', async () => {
    await expectParsed('print()();').resolves
      .toEqual(['call', ['call', ['symbol', 'print'], []], [] ])
  })

  it('function call with one args gets parsed', async () => {
    await expectParsed('print( "a" );').resolves
      .toEqual(
        ['call',
          ['symbol', 'print'],
          [
            ['string', 'a']
          ]
        ]
      )
  })

  it('function call with various args gets parsed', async () => {
    await expectParsed('print( "a", 3, 4 / 12 );').resolves
      .toEqual(
        ['call',
          ['symbol', 'print'],
          [
            ['string', 'a'],
            ['number', '3'],
            ['operation', '/', ['number', '4'], ['number', '12']]
          ]
        ]
      )
  })

  it('multiple function calls with various args gets parsed', async () => {
    await expectParsed('print("a", 3, 4 / 12)(512)();').resolves
      .toEqual(
        ['call',
          ['call',
            ['call',
              ['symbol', 'print'],
              [
                ['string', 'a'],
                ['number', '3'],
                ['operation', '/', ['number', '4'], ['number', '12']]
              ]
            ],
            [
              ['number', '512']
            ]
          ],
          []
        ]
      )
  })

  it('empty function definition gets parsed', async () => {
    await expectParsed('{};').resolves
      .toEqual(['function', [], []])
  })

  it('empty function definition with params gets parsed', async () => {
    await expectParsed('{:(aa, bb, cc, dd)};').resolves
      .toEqual(
        ['function',
          [
            ['symbol', 'aa'],
            ['symbol', 'bb'],
            ['symbol', 'cc'],
            ['symbol', 'dd']
          ],
          []
        ]
      )
  })

  it('missing param definition with colon is an error', async () => {
    await expectParsed('{:print(x););').rejects
      .toEqual('\':\' must be followed by \'(\' in a function.')
  })

  it('multiple commands parse into multiple expressions', async () => {
    const program = `
      x = 3;
      func = {:(a) print(a);};
      func(x);
    `
    await expectParsed(program).resolves
      .toEqual([
        ['assignment', ['symbol', 'x'], ['number', '3']],
        ['assignment', ['symbol', 'func'],
          ['function',
            [
              ['symbol', 'a']
            ],
            [
              ['call', ['symbol', 'print'], [['symbol', 'a']]]
            ]
          ]
        ],
        ['call', ['symbol', 'func'], [['symbol', 'x']]]
      ])
  })

  it('function definition containing commands gets parsed', async () => {
    await expectParsed('{print(3-4); a = "x"; print(a);};').resolves
      .toEqual([
          'function',
          [],
          [
            ['call',
              ['symbol', 'print'],
              [
                ['operation', '-',
                  ['number', '3'],
                  ['number', '4']
                ]
              ]
            ],
            ['assignment', ['symbol', 'a'], ['string', 'x']],
            ['call', ['symbol', 'print'], [['symbol', 'a']]]
          ]
        ]
      )
  })

  it('function definition with params and commands gets parsed', async () => {
    await expectParsed('{:(x,yy)print(3-4); a = "x"; print(a);};').resolves
      .toEqual(
        ['function',
          [
            ['symbol', 'x'],
            ['symbol', 'yy']
          ],
          [
            ['call',
              ['symbol', 'print'],
              [
                ['operation', '-', ['number', '3'], ['number', '4']]
              ],
            ],
            ['assignment', ['symbol', 'a'], ['string', 'x']],
            ['call', ['symbol', 'print'], [['symbol', 'a']]]
          ]
        ]
      )
  })

  it('function params that are not symbol is an error', async () => {
    await expectParsed('{:(aa + 3, d)};').rejects
      .toEqual('Only symbols are allowed in function parameter lists. '
        + 'I found: '
        + '(\'operation\', \'+\', [\'symbol\', \'aa\'], [\'number\', \'3\']).'
      )
  })

  it('a complex example program parses', async () => {
    const example = `
      double =
        {:(x)
        2 * x;
        };

      num1 = 3;
      num2 = double( num );

      answer =
      if( greater_than( num2, 5 ),
        {"LARGE!"},
        {"small."}
      );

      print( answer );
    `
    const lexer = lex(example)
    const parser = parse(lexer)

    const ast = gatherAsts(parser)

    expect((await lexer.next()).done === true)
    await expect(ast).resolves.toHaveLength(5)
  })

  it('parse an anonymous function', async () => {
    await expectParsed('{10; 11;};').resolves
      .toEqual([
        'function',
        [],
        [
          ['number', '10'],
          ['number', '11']
        ]
      ])
  })

  it('parse an immediately invoked anonymous function', async () => {
    await expectParsed('{10; 11;}();').resolves
      .toEqual([
        "call",
          [
            'function',
            [],
            [
              ['number', '10'],
              ['number', '11']
            ]
          ],
          []
        ])
  })
})

describe('bad parses', () => {
  it('two numbers in a row', async () => {
    await expectParsed('100 101;').rejects
      .toEqual('Unexpected number token, \'101\'.');
  })

  it('number butted up against a symbol', async () => {
    await expectParsed('100dog = 1;').rejects
      .toEqual('Unexpected symbol token, \'dog\'.');
  })

  it('number then string', async () => {
    await expectParsed('100 "dog";').rejects
      .toEqual('Unexpected string token, \'dog\'.');
  })

  it('string then number', async () => {
    await expectParsed('"dog" 100;').rejects
      .toEqual('Unexpected number token, \'100\'.');
  })

  it('crazy new token', async () => {
    await expect(gatherAsts(parse([['wrong', 'nonsense']]))).rejects
      .toEqual('Unexpected \'wrong\' token, \'nonsense\'.');
  })
})
/*
@system_test
def All_examples_parse():
    from pycell.chars_in_file import chars_in_file
    for example in all_examples():
        with open(example, encoding="ascii") as f:
            parsed(chars_in_file(f))

 */
