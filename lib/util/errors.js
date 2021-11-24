
class SyntaxError extends Error {
  constructor (message, recoverable) {
    super(message)
    this.recoverable = recoverable
  }
}

class RuntimeError extends Error {
  constructor (message) {
    super(message)
  }
}

function LexingError(message) {
  return new SyntaxError(message, false)
}

function ParsingError(message) {
  return new SyntaxError(message)
}

function ExecutionError(message, recoverable = false)
{
  return new RuntimeError(message)
}

export {
  LexingError,
  ParsingError,
  ExecutionError,
  SyntaxError,
  RuntimeError
}
