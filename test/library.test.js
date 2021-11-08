import { lex } from '../lib/lexer.js'
import { parse } from '../lib/parser.js'
import { evaluate } from '../lib/evaluator.js'

function cellEval(input) {
  return evaluate(parse(lex(input))).then(result => result[1])
}


function expectEval(input) {
  return expect(cellEval(input))
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
    it('if calls then if first argument is nonzero', async () => {
      await expectEval('if(1, {"t";}, {"f";});').resolves
        .toEqual('t')
    })

    it('if calls else if first argument is zero', async () => {
      await expectEval('if(0, {"t";}, {"f";});').resolves
        .toEqual('f')
    })

    it('call if with a nonnumber is an error', async () => {
      await expectEval('if("x", {}, {});').rejects
        .toEqual('Only numbers may be passed to an if, but I was passed (\'string\', \'x\')')
    })
  })

  describe('equals', () => {
    it('equals returns true for identical numbers', async () => {
      await expectEval('if(equals(1, 1), {"same";}, {"different";});').resolves
        .toEqual('same')
    })

    it('equals returns false for different numbers', async () => {
      await expectEval('if(equals(1, 2), {"same";}, {"different";});').resolves
        .toEqual('different')
    })

    it('equals returns true for identical strings', async () => {
      await expectEval('if(equals("dog", "dog"), {"same";}, {"different";});').resolves
        .toEqual('same')
    })

    it('equals returns false for different strings', async () => {
      await expectEval('if(equals("dog", "cat"), {"same";}, {"different";});').resolves
        .toEqual('different')
    })

    it('functions are not equal even if the same', async () => {
      expectEval('if(equals({3;}, {3;}), {"same";}, {"different";});').resolves
        .toEqual('different')
    })

    it('different functions are not equal', async () => {
      await expectEval('if(equals({:(x)3;}, {3;}), {"same";}, {"different";});').resolves
        .toEqual('different')
      await expectEval('if(equals({3;}, {2; 3;}), {"same";}, {"different";});').resolves
        .toEqual('different')
    })
  })

  describe('set', () => {
    it('set changes value of symbol', async () => {
      await expectEval('x = 3; set("x", 4); x;').resolves
        .toEqual(4);
    })

    it('set changes value of symbol in outer scope', async () => {
      await expectEval(`
        var = "dog";
        fn = {
            set("var", "cat");
        };
        fn();
        var;
      `).resolves
        .toEqual('cat');
    })

    it('calling set with a nonstring is an error', async () => {
      await expectEval('x = 3; set(x, 4);').rejects
        .toEqual('set() takes a string as its first argument, but was: (\'number\', 3)')
    })

    it ('set must change an existing symbol', async () => {
      await expectEval('set("x", 4);').rejects
        .toEqual('Attempted to set name \'x\' but it does not exist.')
    })
  })

  describe('char_at', () => {
    it('char_at gives the nth character of a string', async () => {
      const tests = [
        ['char_at(0, \'abc\');', 'a'],
        ['char_at(1, \'abc\');', 'b'],
        ['char_at(2, \'abc\');', 'c'],
        ['char_at(3, \'abc\');', null],
        ['char_at(0, \'\');', null],
        ['char_at(1, \'\');', null]
      ]

      for (const [test, expected] of tests)
        await expectEval(test).resolves.toEqual(expected)
    })

    it('char_at first parameter must be a number', async () => {
      await expectEval('char_at("fruit", "abc");').rejects
        .toEqual('char_at() must take a number as its first argument.')
    })

    it('char_at second parameter must be a string', async () => {
      await expectEval('char_at(0, 0);').rejects
        .toEqual('char_at() must take a string as its second argument.')
    })
  })

  describe('len', () => {
    it('len gives the length of a string', async () => {
      await expectEval('len("");').resolves.toEqual(0)
      await expectEval('len("abc");').resolves.toEqual(3)
    })
    it('len must be passed a string', async () => {
      await expectEval('len(0);').rejects
        .toEqual('len() can only be called for a string.')
    })
  })

  describe("pairs", () => {
    it('make a pair and access the first element', async () => {
      await expectEval(`
        p = pair("foo", 4);
        first(p);
      `).resolves
        .toEqual('foo')
    })

    it('make a pair and access the second element', async () => {
      await expectEval(`
        p = pair("foo", 4);
        second(p);
      `).resolves
        .toEqual(4)
    })
  })

  describe("not", () => {
    it("not(0) -> 1", async () => {
      await expectEval('not(0);').resolves.toEqual(1)
    })
    it("not(1) -> 0", async () => {
      await expectEval('not(1);').resolves.toEqual(0)
    })
    it("not any other number goes to 0", async () => {
      for (const n of [22, 2, 5352, 2.2])
        await expectEval(`not(${n});`).resolves.toEqual(0)
    })
  })

  describe('concat', () => {
    it('concat two empty strings gives empty string', async () => {
      await expectEval('concat("", "");').resolves
        .toEqual('')
    })
    it('concat a string with an empty string give the string', async () => {
      await expectEval('concat("dog", "");').resolves
        .toEqual('dog')
      await expectEval('concat("", "dog");').resolves
        .toEqual('dog')
    })
    it('concat two strings sticks them together', async () => {
      await expectEval('concat("dog", "cat");').resolves
        .toEqual('dogcat')
    })
    it('concat first argument should be a string', async () => {
      await expectEval('concat(0, "dog");').rejects
        .toEqual('concat() must take a string as its first argument.')
    })
    it('concat second argument should be a string', async () => {
      await expectEval('concat("dog", 0);').rejects
        .toEqual('concat() must take a string as its second argument.')
    })
  })

  describe('print', () => {
    it('print prints to stdout', async () => {
      const capture = captureStdout()
      await cellEval("print('dog');")
      capture.release()

      expect(capture.result()).toEqual('dog\n')
    })

    it('print returns none', async () => {
      const capture = captureStdout()
      const result = await cellEval("print('dog');")
      capture.release()

      expect(result).toBeNull()
    })
  })

  describe('lists', () => {
    it('list0 is None', async () => {
      await expectEval('list0();').resolves.toBeNull()
    })
    it('can append item to an empty list', async () => {
      await expectEval('first(append(list0(), 3));').resolves.toEqual(3)
      await expectEval('second(append(list0(), 3));').resolves.toBeNull()
    })
    it('can append item to a nonempty list', async () => {
      const tests = [
        ['first(append(list2(1, 2), 3));', 1],
        ['first(second(append(list2(1, 2), 3)));', 2],
        ['first(second(second(append(list2(1, 2), 3))));', 3],
        ['second(second(second(append(list2(1, 2), 3))));', null]
      ]
      for (const [test, expected] of tests)
        await expectEval(test).resolves.toEqual(expected)
    })
    it('for loops through everything in a list', async () => {
      const capture = captureStdout()
      await cellEval(`
        for(list3("a", "b", "c"),
          {:(ch)
              print(ch);
          });
      `)
      capture.release()

      expect(capture.result()).toEqual(['a\n', 'b\n', 'c\n'])
    })
    it('for loops through nothing when given an empty list', async () => {
      const capture = captureStdout()
      await cellEval(`
        for(list0(),
          {:(ch)
              print(ch);
          });
      `)
      capture.release()

      expect(capture.result()).toEqual([])
    })
  })

  describe('chars_in', () => {
    it('chars_in allows iterating over the characters of a string', async () => {
      const capture = captureStdout()
      await cellEval('for(chars_in("abc"), {:(ch) print(ch); });')
      capture.release()

      expect(capture.result()).toEqual(['a\n', 'b\n', 'c\n'])
    })
    it('chars_in deals well with empty string', async () => {
      const capture = captureStdout()
      await cellEval('for(chars_in(""), {:(ch) print(ch); });')
      capture.release()

      expect(capture.result()).toEqual([])
    })
  })
})
