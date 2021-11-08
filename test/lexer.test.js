import { lex } from '../lib/lexer.js'

async function lexed(input) {
  const tokens = []
  for await (const token of lex(input)) {
    tokens.push(token)
  }
  return tokens
}

function expectLexed(input) {
  const result = lexed(input)
    .then(r => r.length === 1 ? r[0] : r)
  return expect(result)
}

describe('lexer', () => {
  it('empty file produces nothing', async () => {
    await expectLexed('').resolves.toEqual([])
  })

  it('open bracket produces open bracket token', async () => {
    await expectLexed('(').resolves.toEqual(["(", ''])
  })

  it('close bracket produces close bracket token', async () => {
    await expectLexed(')').resolves.toEqual([")", ''])
  })

  it('open brace produces open brace token', async () => {
    await expectLexed('{').resolves.toEqual(['{', ''])
  })

  it('close brace produces close brace token', async () => {
    await expectLexed('}').resolves.toEqual(['}', ''])
  })

  it('single letter becomes a symbol token', async () => {
    await expectLexed('a').resolves.toEqual(['symbol', 'a'])
  })

  it('multiple brackets become multiple tokens', async () => {
    await expectLexed('()').resolves.toEqual([['(', ''], [')', '']])
  })

  it('multiple letters become a symbol token', async () => {
    await expectLexed('dog').resolves
      .toEqual(['symbol', 'dog'])
  })

  it('a symbol followed by a bracket becomes two tokens', async () => {
    await expectLexed('dog(').resolves
      .toEqual([['symbol', 'dog'], ['(', '']])
  })

  it('items separated by spaces become separate tokens', async () => {
    await expectLexed('dog cat ( ').resolves
      .toEqual([['symbol', 'dog'], ['symbol', 'cat'], ['(', '']])
  })

  it('items separated by newlines become separate tokens', async () => {
    await expectLexed('dog\ncat\n(\n').resolves
      .toEqual([['symbol', 'dog'], ['symbol', 'cat'], ['(', '']])
  })

  it('symbols may contain numbers and underscores', async () => {
    await expectLexed('dog2_cat(').resolves
      .toEqual([['symbol', 'dog2_cat'], ['(', '']])
  })

  it('symbols may start with underscores', async () => {
    await expectLexed('_dog2_cat(').resolves
      .toEqual([['symbol', '_dog2_cat'], ['(', '']])
  })

  it('integers produce into number tokens', async () => {
    await expectLexed('128').resolves.toEqual(['number', '128'])
  })

  it('floating points produce number tokens', async () => {
    await expectLexed('12.8').resolves.toEqual(['number', '12.8'])
  })

  it('leading decimal point produces number tokens', async () => {
    await expectLexed('.128').resolves.toEqual(['number', '.128'])
  })

  it('double quoted values produce string tokens', async () => {
    await expectLexed('"dog"').resolves.toEqual(['string', 'dog'])
  })

  it('single quoted values produce string tokens', async () => {
    await expectLexed("'dog'").resolves.toEqual(['string', 'dog'])
  })

  it('different quote types allow the other type inside', async () => {
    await expectLexed("'f\"oo'").resolves.toEqual(['string', 'f"oo'])
    await expectLexed('"f\'oo"').resolves.toEqual(['string', "f'oo"])
  })

  it('empty quotes produce an empty string token', async () => {
    await expectLexed('""').resolves.toEqual(['string', ''])
  })

  it('an unfinished string is an error', async () => {
    expect(lexed('"foo')).rejects.
      toEqual("A string ran off the end of the program.")
  })

  it('commas produce comma tokens', async () => {
    await expectLexed(',').resolves.toEqual([',', ''])
  })

  it('equals produce an equals tokens', async () => {
    await expectLexed('=').resolves.toEqual(['=', ''])
  })

  it('semicolons produce semicolon tokens', async () => {
    await expectLexed(';').resolves.toEqual([';', ''])
  })

  it('colons produce colon tokens', async () => {
    await expectLexed(':').resolves.toEqual([':', ''])
  })

  it('arithmetic operators produce operation tokens', async () => {
    await expectLexed("+").resolves.toEqual(["operation", "+"])
    await expectLexed("-").resolves.toEqual(["operation", "-"])
    await expectLexed("*").resolves.toEqual(["operation", "*"])
    await expectLexed("/").resolves.toEqual(["operation", "/"])
  })

  it('tabs are an error', async () => {
    expect(lexed('aaa\tbbb')).rejects.
      toEqual("Tab characters are not allowed in Cell.")
  })

  it('other characters are an error', async () => {
    expect(lexed('!')).rejects.
      toEqual('Unrecognised character - !')
  })

  it('multiple token types can be combined', async () => {
    await expectLexed('frobnicate( "Hello " + name, 4 / 5.0);').resolves
      .toEqual([
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

  it('a complex program lexes', async () => {
    const program = `
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
`;
    await expectLexed(program).resolves.toHaveLength(49)
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
