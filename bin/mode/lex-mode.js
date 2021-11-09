import { lex } from '../../lib/lexer.js'
import chalk from 'chalk'

async function lexMode(code) {
  try {
    for await (const token of lex(code))
      console.log(` [ ${chalk.yellow(token[0])}, '${chalk.green(token[1])}' ]`)
  } catch(msg) {
    console.error(chalk.magentaBright(`Lexing error: ${msg}`))
  }
}
lexMode.command = 'lex [sources...]'
lexMode.description = 'Display the tokenized program source'

export { lexMode }
