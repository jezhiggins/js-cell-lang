import { lex } from '../lib/lexer.js'
import { parse } from '../lib/parser.js'

function parsed(input) {
  return [...parse(lex(input))]
}

function expectParsed(input) {
  const result = parsed(input)
  return expect(result.length === 1 ? result[0] : result)
}

function badParse(input) {
  return expect(() => parsed(input))
}

describe('parser', () => {
  it('empty file produces nothing', () => {
    expectParsed('').toEqual([])
  })

  it('number is parsed as expression', () => {
    expectParsed('56;').toEqual(['number', '56'])
  })

  it('string is parsed as expression', () => {
    expectParsed('"bobble";').toEqual(['string', 'bobble'])
  })

  it('missing semicolon is an error', () => {
    expect(() => parsed('56')).
      toThrow('Hit end of file - expected \';\'.')
  })

  it('sum of numbers is parsed as expression', () => {
    expectParsed('32 + 44;')
      .toEqual(['operation', '+', ['number', '32'], ['number', '44']])
  })

  it('difference of symbol and number is parsed as expression', () => {
    expectParsed('foo - 44;')
      .toEqual(['operation', '-', ['symbol', 'foo'], ['number', '44']])
  })

  it('multiplication of symbol and symbol is parsed as expression', () => {
    expectParsed('foo * bar;')
      .toEqual(['operation', '*', ['symbol', 'foo'], ['symbol', 'bar']])
  })

  it('variable assignment gets parsed', () => {
    expectParsed('x = 3;')
      .toEqual(['assignment', ['symbol', 'x'], ['number', '3']])
  })

  it('assigning to a number is an error', () => {
    expect(() => parsed('3 = x;'))
      .toThrow('You can\'t assign to anything except a symbol.')
  })

  it('assigning to an expression is an error', () => {
    expect(() => parsed('x(4) = 5;'))
      .toThrow('You can\'t assign to anything except a symbol.')
  })

  it('function call with no args gets parsed', () => {
    expectParsed('print();')
      .toEqual(['call', ['symbol', 'print'], []])
  })

  it('multiple functions call no args get parsed', () => {
    expectParsed('print()();')
      .toEqual(['call', ['call', ['symbol', 'print'], []], [] ])
  })

  it('function call with one args gets parsed', () => {
    expectParsed('print( "a" );')
      .toEqual(
        ['call',
          ['symbol', 'print'],
          [
            ['string', 'a']
          ]
        ]
      )
  })

  it('function call with various args gets parsed', () => {
    expectParsed('print( "a", 3, 4 / 12 );')
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

  it('multiple function calls with various args gets parsed', () => {
    expectParsed('print("a", 3, 4 / 12)(512)();')
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

  it('empty function definition gets parsed', () => {
    expectParsed('{};')
      .toEqual(['function', [], []])
  })

  it('empty function definition with params gets parsed', () => {
    expectParsed('{:(aa, bb, cc, dd)};')
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

  it('missing param definition with colon is an error', () => {
    expect(() => parsed('{:print(x););'))
      .toThrow('\':\' must be followed by \'(\' in a function.')
  })

  it('multiple commands parse into multiple expressions', () => {
    const program = `
      x = 3;
      func = {:(a) print(a);};
      func(x);
    `
    expectParsed(program)
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

  it('function definition containing commands gets parsed', () => {
    expectParsed('{print(3-4); a = "x"; print(a);};')
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

  it('function definition with params and commands gets parsed', () => {
    expectParsed('{:(x,yy)print(3-4); a = "x"; print(a);};')
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

  it('function params that are not symbol is an error', () => {
    expect(() => parsed('{:(aa + 3, d)};'))
      .toThrow('Only symbols are allowed in function parameter lists. '
        + 'I found: '
        + '(\'operation\', \'+\', [\'symbol\', \'aa\'], [\'number\', \'3\']).'
      )
  })

  it('a complex example program parses', () => {
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

    const ast = [...parser]

    expect(lexer.next().done === true)
    expect(ast).toHaveLength(5)
  })

  it('parse an anonymous function', () => {
    expectParsed('{10; 11;};')
      .toEqual([
        'function',
        [],
        [
          ['number', '10'],
          ['number', '11']
        ]
      ])
  })

  it('parse an immediately invoked anonymous function', () => {
    expectParsed('{10; 11;}();')
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
  it('two numbers in a row', () => {
    badParse('100 101;').toThrow('Unexpected number token, \'101\'.');
  })

  it('number butted up against a symbol', () => {
    badParse('100dog = 1;').toThrow('Unexpected symbol token, \'dog\'.');
  })

  it('number then string', () => {
    badParse('100 "dog";').toThrow('Unexpected string token, \'dog\'.');
  })

  it('string then number', () => {
    badParse('"dog" 100;').toThrow('Unexpected number token, \'100\'.');
  })

  it('crazy new token', () => {
    expect(() => [...parse([['wrong', 'nonsense']])])
      .toThrow('Unexpected \'wrong\' token, \'nonsense\'.');
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
