import { lex } from '../lib/lexer.js'
import { parse } from '../lib/parser.js'
import { evaluate } from '../lib/evaluator.js'

function expectEval(input) {
  return expect(evaluate(parse(lex(input))))
}

describe('evaluator', () => {
  it('evaluating an empty program gives none', async () => {
    await expectEval("").resolves.toEqual(['none', null])
  })

  it('evaluating a primitive returns itself', async () => {
    await expectEval('3;').resolves.toEqual(['number', 3])
    await expectEval('3.1;').resolves.toEqual(['number', 3.1])
    await expectEval('"fruit";').resolves.toEqual(['string', 'fruit'])
  })

  it('arithmetic expressions come out correct', async () => {
    await expectEval('3 + 4;').resolves.toEqual(['number', 7])
    await expectEval('3 - 4;').resolves.toEqual(['number', -1])
    await expectEval('3 * 4;').resolves.toEqual(['number', 12])
    await expectEval('3 / 4;').resolves.toEqual(['number', 0.75])
  })

  it('referring to an unknown symbol is an error', async () => {
    await expectEval('x;').rejects.toEqual('Unknown symbol \'x\'.')
  })

  it('can define a value and retrieve it', async () => {
    await expectEval('x = 30; x;').resolves.toEqual(['number', 30])
    await expectEval('y = \'foo\'; y;').resolves.toEqual(['string', 'foo'])
  })

  it('modifying a value is an error', async () => {
    await expectEval('x = 30; x = 10;').rejects.toEqual('Not allowed to re-assign symbol \'x\'.')
  })

  it('value of an assignment is the value assigned', async () => {
    await expectEval('x = 31;').resolves.toEqual(["number", 31])
  })

  it('calling a function returns its lat value', async () => {
    await expectEval('{ 10; 11; }();').resolves.toEqual(['number', 11])
  })

  it('body of a function can use arg values', async () => {
    await expectEval('{:(x, y) x + y;}(100, 1);').resolves.toEqual(['number', 101])
  })

  it('can hold a reference to a function and call it', async () => {
    await expectEval(`
      add = {:(x, y) x + y;};
      add(20, 2.2);
    `).resolves.toEqual(['number', 22.2])
  })

  it('a symbol has different life inside and outside a function', async () => {
    /* Define a symbol outside a function, redefine inside,
       then evaluate outside.  What happened inside the
       function should not affect the value outside. */
    await expectEval(`
      dog = 'cat';
      {dog = 3;}();
      dog;
    `).resolves.toEqual(['string', 'cat'])
  })

  it('a symbol within a function has the local value', async () => {
    await expectEval(`
      dog = 3;
      cat = {dog = 77;dog;}();
      cat;
    `).resolves.toEqual(['number', 77])
  })

  it('wrong number of arguments to a function is an error', async () => {
    await expectEval('{}(3);').rejects.toEqual('1 arguments passed to function (\'function\', [], []), but it requires 0 arguments.')
    await expectEval('x = {:(a,b,c)}; x(3, 2);').rejects.toEqual('2 arguments passed to function (\'symbol\', \'x\'), but it requires 3 arguments.')
  })

  it('function arguments are independent', async () => {
    await expectEval(`
      fn = {:(x) {x;};};
      a = fn("a");
      b = fn("b");
      a();
    `).resolves.toEqual(['string', 'a'])
    await expectEval(`
      fn = {:(x) {x;};};
      a = fn("a");
      b = fn("b");
      b();
    `).resolves.toEqual(['string', 'b'])
  })
})

/*
@test
def None_evaluates_to_None():
    assert_that(eval_expr(("none",), Env()), equals(("none", )))

@test
def Native_function_gets_called():
    def native_fn(env, x, y):
        return ("number", x[1] + y[1])
    env = Env()
    env.set("native_fn", ("native_fns", native_fn))
    assert_that(evald("native_fn( 2, 8 );", env), equals(("number", 10)))


@test
def Wrong_number_of_arguments_to_a_native_function_is_an_error():
    def native_fn0(env):
        return ("number", 12)

    def native_fn3(env, x, y, z):
        return ("number", 12)
    env = Env()
    env.set("native_fn0", ("native_fns", native_fn0))
    env.set("native_fn3", ("native_fns", native_fn3))
    assert_prog_fails(
        "native_fn0(3);",
        "1 arguments passed to function ('symbol', 'native_fn0'), but it requires 0 arguments.",
        env
    )
    assert_prog_fails(
        "native_fn3(3, 2);",
        "2 arguments passed to function ('symbol', 'native_fn3'), but it requires 3 arguments.",
        env
    )

@test
def A_native_function_can_edit_the_environment():
    def mx3(env):
        env.set("x", ("number", 3))
    env = Env()
    env.set("make_x_three", ("native_fns", mx3))
    assert_that(
        evald("x=1;make_x_three();x;", env),
        equals(("number", 3))
    )


@test
def A_closure_holds_updateable_values():
    def dumb_set(env, sym, val):
        env.parent.parent.parent.set(sym[1], val)

    def dumb_if_equal(env, val1, val2, then_fn, else_fn):
        if val1 == val2:
            ret = then_fn
        else:
            ret = else_fn
        return eval_expr(("call", ret, []), env)
    env = Env()
    env.set("dumb_set", ("native_fns", dumb_set))
    env.set("dumb_if_equal", ("native_fns", dumb_if_equal))
    assert_that(
        evald(
            """
            counter = {
                x = 0;
                {:(meth)
                    dumb_if_equal(meth, "get",
                        {x;},
                        {dumb_set("x", x + 1);}
                    );
                }
            }();
            counter("inc");
            counter("inc");
            counter("get");
            """,
            env
        ),
        equals(("number", 2))
    )

 */
