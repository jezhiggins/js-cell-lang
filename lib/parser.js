import { peekableStream } from "./peekable-stream"

class ASTBuilder {
  constructor(lexer, terminal, separator = terminal) {
    this.lexer_ = lexer
    this.terminal_ = terminal
    this.separator_ = separator
    this.done_ = false
  }

  expression(previous) {
    const [type, value] = this.nextToken()
    if (type === this.terminal_) {
      this.done_ = true
      return previous
    }
    if (type === this.separator_)
      return previous

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
        const fn = ['call', previous, this.parameterList()]
        return this.expression(fn)
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

  *expressions() {
    while(this.hasNext()) {
      const ast = this.next()
      if (ast) yield ast
    }
  }

  parameterList() {
    const parameterParser = new ASTBuilder(this.lexer_, ')', ',')
    return [...parameterParser.expressions()]
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
