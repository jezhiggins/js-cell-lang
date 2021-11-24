
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

function ParsingError(message, recoverable = false) {
  return new SyntaxError(message, recoverable)
}

function ExecutionError(message)
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
