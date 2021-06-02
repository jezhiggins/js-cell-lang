import { lex } from '../lib/lexer.js'

function lexed(input) {
  return [...lex(input)]
}

describe('lexer', () => {
  it('empty file produces nothing', () => {
    expect(lexed('')).toEqual([])
  })

  it('open bracket produces open bracket token', () => {
    expect(lexed('(')).toEqual([["(", '']])
  })

  it('close bracket produces close bracket token', () => {
    expect(lexed(')')).toEqual([[")", '']])
  })

  it('open brace produces open brace token', () => {
    expect(lexed('{')).toEqual([['{', '']])
  })

  it('close brace produces close brace token', () => {
    expect(lexed('}')).toEqual([['}', '']])
  })

  it('single letter becomes a symbol token', () => {
    expect(lexed('a')).toEqual([['symbol', 'a']])
  })

  it('multiple brackets become multiple tokens', () => {
    expect(lexed('()')).
      toEqual([['(', ''], [')', '']])
  })

  it('multiple letters become a symbol token', () => {
    expect(lexed('dog')).toEqual([['symbol', 'dog']])
  })

  it('a symbol followed by a bracket becomes two tokens', () => {
    expect(lexed('dog(')).
      toEqual([['symbol', 'dog'], ['(', '']])
  })

  it('items separated by spaces become separate tokens', () => {
    expect(lexed('dog cat ( ')).
      toEqual([['symbol', 'dog'], ['symbol', 'cat'], ['(', '']])
  })

  it('items separated by newlines become separate tokens', () => {
    expect(lexed('dog\ncat\n(\n')).
    toEqual([['symbol', 'dog'], ['symbol', 'cat'], ['(', '']])
  })

  it('symbols may contain numbers and underscores', () => {
    expect(lexed('dog2_cat(')).
    toEqual([['symbol', 'dog2_cat'], ['(', '']])
  })

  it('symbols may start with underscores', () => {
    expect(lexed('_dog2_cat(')).
    toEqual([['symbol', '_dog2_cat'], ['(', '']])
  })
})

/*
@test
def Integers_are_parsed_into_number_tokens():
    assert_that(lexed("128"), equals([("number", "128")]))


@test
def Floating_points_are_parsed_into_number_tokens():
    assert_that(lexed("12.8"), equals([("number", "12.8")]))


@test
def Leading_decimal_point_produces_number_token():
    assert_that(lexed(".812"), equals([("number", ".812")]))


@test
def Double_quoted_values_produce_string_tokens():
    assert_that(lexed('"foo"'), equals([("string", 'foo')]))


@test
def Single_quoted_values_produce_string_tokens():
    assert_that(lexed("'foo'"), equals([("string", 'foo')]))


@test
def Different_quote_types_allow_the_other_type_inside():
    assert_that(lexed("'f\"oo'"), equals([("string", 'f"oo')]))
    assert_that(lexed('"f\'oo"'), equals([("string", "f'oo")]))


@test
def Empty_quotes_produce_an_empty_string_token():
    assert_that(lexed('""'), equals([("string", '')]))


@test
def An_unfinished_string_is_an_error():
    try:
        lexed('"foo')
        fail("Should throw")
    except Exception as e:
        assert_that(str(e), equals("A string ran off the end of the program."))


@test
def Commas_produce_comma_tokens():
    assert_that(lexed(","), equals([(",", "")]))


@test
def Equals_produces_an_equals_token():
    assert_that(lexed("="), equals([("=", "")]))


@test
def Semicolons_produce_semicolon_tokens():
    assert_that(lexed(";"), equals([(";", "")]))


@test
def Colons_produce_colon_tokens():
    assert_that(lexed(":"), equals([(":", "")]))


@test
def Arithmetic_operators_produce_operation_tokens():
    assert_that(lexed("+"), equals([("operation", "+")]))
    assert_that(lexed("-"), equals([("operation", "-")]))
    assert_that(lexed("*"), equals([("operation", "*")]))
    assert_that(lexed("/"), equals([("operation", "/")]))


@test
def Multiple_token_types_can_be_combined():
    assert_that(
        lexed('frobnicate( "Hello" + name, 4 / 5.0);'),
        equals(
            [
                ("symbol", "frobnicate"),
                ("(", ""),
                ("string", "Hello"),
                ("operation", "+"),
                ("symbol", "name"),
                (",", ""),
                ("number", "4"),
                ("operation", "/"),
                ("number", "5.0"),
                (")", ""),
                (";", "")
            ]
        )
    )


@test
def A_complex_example_program_lexes():
    example = """
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
    """
    lexed(example)


@test
def Tabs_are_an_error():
    try:
        lexed("aaa\tbbb")
        fail("Should throw")
    except Exception as e:
        assert_that(str(e), equals("Tab characters are not allowed in Cell."))


# --- Example programs ---


@system_test
def All_examples_lex():
    from pycell.chars_in_file import chars_in_file
    for example in all_examples():
        with open(example, encoding="ascii") as f:
            lexed(chars_in_file(f))
*/
