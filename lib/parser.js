import { peekableStream } from "./peekable-stream"

class ASTBuilder {
  constructor(lexer) {
    this.lexer_ = peekableStream(lexer)
    this.terminal_ = ';'
  }

  expression(previous) {
    const [type, value] = this.nextToken()
    if (type === this.terminal_)
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
        const fn = previous
        return ['call', fn, []]
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

  next() {
    return this.expression()
  }

  hasNext() {
    return this.lexer_.peek().done === false
  }
}

function* parse(lexer) {
  const astBuilder = new ASTBuilder(lexer)
  while(astBuilder.hasNext()) {
    const ast = astBuilder.next()
    if (ast) yield ast
  }
}

export { parse }
