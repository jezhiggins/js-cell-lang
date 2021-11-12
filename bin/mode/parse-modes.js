import { astProcess, processNames } from '../astprocessor/index.js'
import { parse } from '../../lib/parser.js'
import { lex } from '../../lib/lexer.js'
import { prettyPrint } from '../astprinter/pretty.js'
import { minimise } from '../astprinter/minimise.js'
import chalk from "chalk";

function fullyLex(code) {
  try {
    return [...lex(code)]
  } catch(msg) {
    console.error(chalk.magentaBright(`Lexing error: ${msg}`))
    return []
  }
}

function* parseWithAstProcessors(code, options) {
  try {
    const processors = processNames.filter(p => options[p])

    for (const ast of parse(fullyLex(code))) {
      yield astProcess(ast, processors);
    }
  } catch(msg) {
    console.error(chalk.magentaBright(`Parsing error: ${msg}`))
    return []
  }
}

function parseMode(code, options) {
  for (const ast of parseWithAstProcessors(code, options))
    prettyPrint(ast)
}
parseMode.command = 'parse [sources...]'
parseMode.description = 'Display the program\'s AST'

function minimiseMode(code, options) {
  for (const ast of parseWithAstProcessors(code, options))
    minimise(ast)
  console.log()
}
minimiseMode.command = 'minimise [sources...]'
minimiseMode.description = 'Cell source minimiser'

export { parseMode, minimiseMode }
