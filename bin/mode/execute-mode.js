import { astProcess, processNames } from '../astprocessor/index.js';
import { parse } from '../../lib/parser.js';
import { evaluate } from '../../lib/evaluator.js';
import { lex } from '../../lib/lexer.js';
import { topLevelEnvironment } from '../../lib/environment.js';

function* parseWithAstProcessors(tokens, options) {
  const processors = processNames.filter(p => options[p])

  for (let ast of parse(tokens)) {
    yield astProcess(ast, processors);
  }
}

function evaluateCode(code, options, env) {
  return evaluate(parseWithAstProcessors(lex(code), options), env)
}

function makeEvaluator() {
  const env = topLevelEnvironment();
  return (code, options) => evaluateCode(code, options, env);
}

const executeMode = makeEvaluator()

export { executeMode }
