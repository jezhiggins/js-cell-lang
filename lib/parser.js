import { peekableStream } from './util/peekable-stream.js'
import { stringify } from './util/stringify-expression.js'

class ASTBuilder {
  constructor(lexer, terminal, separator = terminal) {
    this.lexer_ = lexer
    this.terminal_ = terminal
    this.separator_ = separator
    this.done_ = false
  }

  expression(previous) {
    const [type, value] = this.nextToken()
    if (type === this.separator_) {
      const [peek] = this.peekToken()
      if (!peek && this.separator_ !== this.terminal_)
        throw "Unexpected end of file"
      if (peek === this.terminal_) {
        this.nextToken();
        this.done_ = (this.terminal_ !== this.separator_)
      }
      return previous
    }
    if (type === this.terminal_) {
      this.done_ = (this.terminal_ !== this.separator_)
      return previous
    }

    switch (type) {
      case 'number':
      case 'symbol':
      case 'string':
        return this.expression([type, value])
      case 'operation': {
        const op1 = previous
        const op2 = this.expression()
        return ['operation', value, op1, op2]
      }
      case '=': {
        const op1 = previous
        if (op1[0] !== 'symbol')
          throw 'You can\'t assign to anything except a symbol.'
        const op2 = this.expression()
        return ['assignment', op1, op2]
      }
      case '(': {
        const fnCall = ['call', previous, this.expressionList(')', ',')]
        return this.expression(fnCall)
      }
      case '{': {
        const fnDef = ['function', this.parameterList(), this.expressionList('}', ';')]
        return this.expression(fnDef)
      }
    }
  }

  nextToken() {
    const next = this.lexer_.next()
    if (next.done) {
      if (this.terminal_)
        throw `Hit end of file - expected '${this.terminal_}'.`
      return [null, null]
    }
    return next.value
  }

  peekToken() {
    const peek = this.lexer_.peek()
    if (peek.done)
      return [null, null]
    return peek.value
  }

  *expressions() {
    while(this.hasNext()) {
      const ast = this.next()
      if (ast) yield ast
    }
  }

  expressionList(terminal, separator) {
    const parameterParser = new ASTBuilder(this.lexer_, terminal, separator)
    return [...parameterParser.expressions()]
  }

  parameterList() {
    let tok = this.peekToken()
    if (tok[0] !== ':')
      return []

    this.nextToken()
    tok = this.nextToken()
    if (tok[0] !== '(')
      throw '\':\' must be followed by \'(\' in a function.'

    const parameters = this.expressionList(')', ',')
    parameters.forEach(p => {
      if (p[0] !== 'symbol')
        throw `Only symbols are allowed in function parameter lists. I found: ${stringify(p)}.`
    })
    return parameters
  }

  next() {
    return this.expression()
  }

  hasNext() {
    return !this.done_ && this.lexer_.peek().done === false
  }
}

function parser(lexer) {
  return new ASTBuilder(peekableStream(lexer), ';')
}

function* parse(lexer) {
  const astBuilder = parser(lexer)
  yield *astBuilder.expressions()
}

export { parse }
