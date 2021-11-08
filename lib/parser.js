import { peekableStream } from './util/peekable-stream.js'
import { stringify } from './util/stringify-expression.js'

class ASTBuilder {
  constructor(lexer, terminal, separator = terminal) {
    this.lexer_ = lexer
    this.terminal_ = terminal
    this.separator_ = separator
    this.done_ = false
  }

  async expression(previous) {
    const [type, value] = await this.nextToken()

    switch (type) {
      case this.separator_:
        return this.handleSeparator(previous)
      case this.terminal_:
        return this.handleTerminal(previous)
      case 'number':
      case 'symbol':
      case 'string':
        if (previous)
          throw `Unexpected ${type} token, '${value}'.`
        return this.expression([type, value])
      case 'operation': {
        const op1 = previous
        const op2 = await this.expression()
        return ['operation', value, op1, op2]
      }
      case '=': {
        const op1 = previous
        if (op1[0] !== 'symbol')
          throw 'You can\'t assign to anything except a symbol.'
        const op2 = await this.expression()
        return ['assignment', op1, op2]
      }
      case '(': {
        const fnCall = [
          'call',
          previous,
          await this.expressionList(')', ',')
        ]
        return this.expression(fnCall)
      }
      case '{': {
        const fnDef = [
          'function',
          await this.parameterList(),
          await this.expressionList('}', ';')
        ]
        return this.expression(fnDef)
      }
      default:
        throw `Unexpected '${type}' token, '${value}'.`
    }
  }

  async handleSeparator(previous) {
    const [peek] = await this.peekToken()
    if (!peek && this.separator_ !== this.terminal_)
      throw "Unexpected end of file"
    if (peek === this.terminal_) {
      await this.nextToken();
      this.done_ = (this.terminal_ !== this.separator_)
    }
    return previous
  }

  handleTerminal(previous) {
    this.done_ = (this.terminal_ !== this.separator_)
    return previous
  }

  async nextToken() {
    const next = await this.lexer_.next()
    if (next.done) {
      if (this.terminal_)
        throw `Hit end of file - expected '${this.terminal_}'.`
      return [null, null]
    }
    return next.value
  }

  async peekToken() {
    const peek = await this.lexer_.peek()
    if (peek.done)
      return [null, null]
    return peek.value
  }

  async *expressions() {
    while(await this.hasNext()) {
      const ast = await this.next()
      if (ast) yield ast
    }
  }

  async expressionList(terminal, separator) {
    const parameters = []
    const parameterParser = new ASTBuilder(this.lexer_, terminal, separator)
    for await (const parameter of parameterParser.expressions()) {
      parameters.push(parameter)
    }
    return parameters
  }

  async parameterList() {
    let tok = await this.peekToken()
    if (tok[0] !== ':')
      return []

    await this.nextToken()
    tok = await this.nextToken()
    if (tok[0] !== '(')
      throw '\':\' must be followed by \'(\' in a function.'

    const parameters = await this.expressionList(')', ',')
    parameters.forEach(p => {
      if (p[0] !== 'symbol')
        throw `Only symbols are allowed in function parameter lists. I found: ${stringify(p)}.`
    })
    return parameters
  }

  next() {
    return this.expression()
  }

  async hasNext() {
    return !this.done_ && (await this.lexer_.peek()).done === false
  }
}

function parser(lexer) {
  return new ASTBuilder(peekableStream(lexer), ';')
}

async function* parse(lexer) {
  const astBuilder = parser(lexer)
  yield *astBuilder.expressions()
}

export { parse }
