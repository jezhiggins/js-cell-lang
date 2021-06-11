import { lex } from '../lib/lexer.js'
import { parse } from '../lib/parser.js'
import { evaluate } from '../lib/evaluator.js'

function cellEval(input) {
  return evaluate(parse(lex(input)))[1]
}

function expectEval(input) {
  return expect(cellEval(input))
}

function expectEvalToThrow(input, error) {
  return expect(() => expectEval(input)).toThrow(error)
}

function captureStdout() {
  const boundProcessStdout = process.stdout.write.bind(process.stdout)
  const captured = []
  process.stdout.write = (string, encoding, fd) => {
    captured.push(string)
  }
  return {
    result: () => (captured.length === 1) ? captured[0] : captured,
    release: () => process.stdout.write = boundProcessStdout
  }
}

describe('library tests', () => {
  describe('if', () => {
    it('if calls then if first argument is nonzero', () => {
      expectEval('if(1, {"t";}, {"f";});').toEqual('t')
    })

    it('if calls else if first argument is zero', () => {
      expectEval('if(0, {"t";}, {"f";});').toEqual('f')
    })

    it('call if with a nonnumber is an error', () => {
      expectEvalToThrow('if("x", {}, {});',
        'Only numbers may be passed to an if, but I was passed (\'string\', \'x\')')
    })
  })

  describe('equals', () => {
    it('equals returns true for identical numbers', () => {
      expectEval('if(equals(1, 1), {"same";}, {"different";});')
        .toEqual('same')
    })

    it('equals returns false for different numbers', () => {
      expectEval('if(equals(1, 2), {"same";}, {"different";});')
        .toEqual('different')
    })

    it('equals returns true for identical strings', () => {
      expectEval('if(equals("dog", "dog"), {"same";}, {"different";});')
        .toEqual('same')
    })

    it('equals returns false for different strings', () => {
      expectEval('if(equals("dog", "cat"), {"same";}, {"different";});')
        .toEqual('different')
    })

    it('functions are not equal even if the same', () => {
      expectEval('if(equals({3;}, {3;}), {"same";}, {"different";});')
        .toEqual('different')
    })

    it('different functions are not equal', () => {
      expectEval('if(equals({:(x)3;}, {3;}), {"same";}, {"different";});')
        .toEqual('different')
      expectEval('if(equals({3;}, {2; 3;}), {"same";}, {"different";});')
        .toEqual('different')
    })
  })

  describe('set', () => {
    it('set changes value of symbol', () => {
      expectEval('x = 3; set("x", 4); x;').toEqual(4);
    })

    it('set changes value of symbol in outer scope', () => {
      expectEval(`
        var = "dog";
        fn = {
            set("var", "cat");
        };
        fn();
        var;
      `).toEqual('cat');
    })

    it('calling set with a nonstring is an error', () => {
      expectEvalToThrow('x = 3; set(x, 4);',
        'set() takes a string as its first argument, but was: (\'number\', 3)')
    })

    it ('set must change an existing symbol', () => {
      expectEvalToThrow('set("x", 4);',
        'Attempted to set name \'x\' but it does not exist.')
    })
  })

  describe('char_at', () => {
    it('char_at gives the nth character of a string', () => {
      expectEval('char_at(0, \'abc\');').toEqual('a')
      expectEval('char_at(1, \'abc\');').toEqual('b')
      expectEval('char_at(2, \'abc\');').toEqual('c')
      expectEval('char_at(3, \'abc\');').toEqual(null)
      expectEval('char_at(0, \'\');').toEqual(null)
      expectEval('char_at(1, \'\');').toEqual(null)
    })

    it('char_at first parameter must be a number', () => {
      expectEvalToThrow('char_at("fruit", "abc");', 'char_at() must take a number as its first argument.')
    })

    it('char_at second parameter must be a string', () => {
      expectEvalToThrow('char_at(0, 0);', 'char_at() must take a string as its second argument.')
    })
  })

  describe('len', () => {
    it('len gives the length of a string', () => {
      expectEval('len("");').toEqual(0)
      expectEval('len("abc");').toEqual(3)
    })
    it('len must be passed a string', () => {
      expectEvalToThrow('len(0);', 'len() can only be called for a string.')
    })
  })

  describe("pairs", () => {
    it('make a pair and access the first element', () => {
      expectEval(`
        p = pair("foo", 4);
        first(p);
      `).toEqual('foo')
    })

    it('make a pair and access the second element', () => {
      expectEval(`
        p = pair("foo", 4);
        second(p);
      `).toEqual(4)
    })
  })

  describe("not", () => {
    it("not(0) -> 1", () => {
      expectEval('not(0);').toEqual(1)
    })
    it("not(1) -> 0", () => {
      expectEval('not(1);').toEqual(0)
    })
    it("not any other number goes to 0", () => {
      expectEval('not(22);').toEqual(0)
      expectEval('not(2);').toEqual(0)
      expectEval('not(5352);').toEqual(0)
      expectEval('not(2.2);').toEqual(0)
    })
  })

  describe('concat', () => {
    it('concat two empty strings gives empty string', () => {
      expectEval('concat("", "");').toEqual('')
    })
    it('concat a string with an empty string give the string', () => {
      expectEval('concat("dog", "");').toEqual('dog')
      expectEval('concat("", "dog");').toEqual('dog')
    })
    it('concat two strings sticks them together', () => {
      expectEval('concat("dog", "cat");').toEqual('dogcat')
    })
    it('concat first argument should be a string', () => {
      expectEvalToThrow('concat(0, "dog");', 'concat() must take a string as its first argument')
    })
    it('concat second argument should be a string', () => {
      expectEvalToThrow('concat("dog", 0);', 'concat() must take a string as its second argument')
    })
  })

  describe('print', () => {
    it('print prints to stdout', () => {
      const capture = captureStdout()
      cellEval("print('dog');")
      capture.release()

      expect(capture.result()).toEqual('dog\n')
    })

    it('print returns none', () => {
      const capture = captureStdout()
      const result = cellEval("print('dog');")
      capture.release()

      expect(result).toBeNull()
    })
  })
})

/*

@test
def List0_is_None():
    assert_that(evald("list0();"), equals(evald("None;")))


@test
def Can_append_item_to_an_empty_list():
    assert_that(evald("first( append(list0(), 3));"), equals(evald("3;")))
    assert_that(evald("second(append(list0(), 3));"), equals(evald("None;")))


@test
def Can_append_item_to_a_nonempty_list():
    assert_that(
        evald("first(append(list2(1, 2), 3));"),
        equals(evald("1;"))
    )
    assert_that(
        evald("first(second(append(list2(1, 2), 3)));"),
        equals(evald("2;"))
    )
    assert_that(
        evald("first(second(second(append(list2(1, 2), 3))));"),
        equals(evald("3;"))
    )
    assert_that(
        evald("second(second(second(append(list2(1, 2), 3))));"),
        equals(evald("None;"))
    )

@test
def For_loops_through_everything_in_a_list():
    stdout = StringIO()
    evald(
        """
        for(list3("a", "b", "c"),
        {:(ch)
            print(ch);
        });
        """,
        stdout=stdout
    )
    assert_that(stdout.getvalue(), equals("a\nb\nc\n"))


@test
def For_loops_through_nothing_when_given_empty_list():
    stdout = StringIO()
    evald(
        """
        for(list0(),
        {:(ch)
            print(ch);
        });
        """,
        stdout=stdout
    )
    assert_that(stdout.getvalue(), equals(""))


@test
def Chars_in_allows_iterating_over_the_characters_of_a_string():
    stdout = StringIO()
    evald(
        """
        for(chars_in("abc"),
        {:(ch)
            print(ch);
        });
        """,
        stdout=stdout
    )
    assert_that(stdout.getvalue(), equals("a\nb\nc\n"))


@test
def Chars_in_deals_well_with_empty_string():
    stdout = StringIO()
    evald(
        """
        for(chars_in(""),
        {:(ch)
            print(ch);
        });
        """,
        stdout=stdout
    )
    assert_that(stdout.getvalue(), equals(""))


 */
