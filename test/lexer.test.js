import { lex } from '../lib/lexer.js'

function lexed(input) {
  return [...lex(input)]
}

function expectLexed(input) {
  const result = lexed(input)
  return expect(result.length == 1 ? result[0] : result)
}

describe('lexer', () => {
  it('empty file produces nothing', () => {
    expectLexed('').toEqual([])
  })

  it('open bracket produces open bracket token', () => {
    expectLexed('(').toEqual(["(", ''])
  })

  it('close bracket produces close bracket token', () => {
    expectLexed(')').toEqual([")", ''])
  })

  it('open brace produces open brace token', () => {
    expectLexed('{').toEqual(['{', ''])
  })

  it('close brace produces close brace token', () => {
    expectLexed('}').toEqual(['}', ''])
  })

  it('single letter becomes a symbol token', () => {
    expectLexed('a').toEqual(['symbol', 'a'])
  })

  it('multiple brackets become multiple tokens', () => {
    expectLexed('()').
      toEqual([['(', ''], [')', '']])
  })

  it('multiple letters become a symbol token', () => {
    expectLexed('dog').toEqual(['symbol', 'dog'])
  })

  it('a symbol followed by a bracket becomes two tokens', () => {
    expectLexed('dog(').
      toEqual([['symbol', 'dog'], ['(', '']])
  })

  it('items separated by spaces become separate tokens', () => {
    expectLexed('dog cat ( ').
      toEqual([['symbol', 'dog'], ['symbol', 'cat'], ['(', '']])
  })

  it('items separated by newlines become separate tokens', () => {
    expectLexed('dog\ncat\n(\n').
      toEqual([['symbol', 'dog'], ['symbol', 'cat'], ['(', '']])
  })

  it('symbols may contain numbers and underscores', () => {
    expectLexed('dog2_cat(').
      toEqual([['symbol', 'dog2_cat'], ['(', '']])
  })

  it('symbols may start with underscores', () => {
    expectLexed('_dog2_cat(').
      toEqual([['symbol', '_dog2_cat'], ['(', '']])
  })

  it('integers produce into number tokens', () => {
    expectLexed('128').toEqual(['number', '128'])
  })

  it('floating points produce number tokens', () => {
    expectLexed('12.8').toEqual(['number', '12.8'])
  })

  it('leading decimal point produces number tokens', () => {
    expectLexed('.128').toEqual(['number', '.128'])
  })

  it('double quoted values produce string tokens', () => {
    expectLexed('"dog"').toEqual(['string', 'dog'])
  })

  it('single quoted values produce string tokens', () => {
    expectLexed("'dog'").toEqual(['string', 'dog'])
  })

  it('different quote types allow the other type inside', () => {
    expectLexed("'f\"oo'").toEqual(['string', 'f"oo'])
    expectLexed('"f\'oo"').toEqual(['string', "f'oo"])
  })

  it('empty quotes produce an empty string token', () => {
    expectLexed('""').toEqual(['string', ''])
  })

  it('an unfinished string is an error', () => {
    expect(() => lexed('"foo')).
      toThrow("A string ran off the end of the program.")
  })

  it('commas produce comma tokens', () => {
    expectLexed(',').toEqual([',', ''])
  })

  it('equals produce an equals tokens', () => {
    expectLexed('=').toEqual(['=', ''])
  })

  it('semicolons produce semicolon tokens', () => {
    expectLexed(';').toEqual([';', ''])
  })

  it('colons produce colon tokens', () => {
    expectLexed(':').toEqual([':', ''])
  })

  it('arithmetic operators produce operation tokens', () => {
    expectLexed("+").toEqual(["operation", "+"])
    expectLexed("-").toEqual(["operation", "-"])
    expectLexed("*").toEqual(["operation", "*"])
    expectLexed("/").toEqual(["operation", "/"])
  })

  it('tabs are an error', () => {
    expect(() => lexed('aaa\tbbb')).
      toThrow("Tab characters are not allowed in Cell.")
  })

  it('other characters are an error', () => {
    expect(() => lexed('!')).
      toThrow('Unrecognised character - !')
  })

  it('multiple token types can be combined', () => {
    expectLexed('frobnicate( "Hello " + name, 4 / 5.0);').
      toEqual([
        ["symbol", "frobnicate"],
        ["(", ""],
        ["string", "Hello "],
        ["operation", "+"],
        ["symbol", "name"],
        [",", ""],
        ["number", "4"],
        ["operation", "/"],
        ["number", "5.0"],
        [")", ""],
        [";", ""]
      ])
  })

  it('a complex program lexes', () => {
    const example =
`
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
    expectLexed(example).toHaveLength(49)
  })
})

/*
# --- Example programs ---
@system_test
def All_examples_lex():
    from pycell.chars_in_file import chars_in_file
    for example in all_examples():
        with open(example, encoding="ascii") as f:
            lexed(chars_in_file(f))
*/
