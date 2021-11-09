import { astProcess, processNames } from '../astprocessor/index.js'
import { parse } from '../../lib/parser.js'
import { lex } from '../../lib/lexer.js'
import { prettyPrint } from '../astprinter/pretty.js'
import { minimise } from '../astprinter/minimise.js'

async function* parseWithAstProcessors(code, options) {
  const processors = processNames.filter(p => options[p])

  for await (let ast of parse(lex(code))) {
    yield await astProcess(ast, processors);
  }
}

async function parseMode(code, options) {
  for await (const ast of parseWithAstProcessors(code, options))
    prettyPrint(ast)
}

async function minimiseMode(code, options) {
  for await (const ast of parseWithAstProcessors(code, options))
    minimise(ast)
  console.log()
}

export { parseMode, minimiseMode }
