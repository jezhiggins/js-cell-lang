import { constantFold } from './constantFolding.js'
import { obfuscator } from './obfuscator.js'

const processors = {
  'fold': constantFold,
  'obfuscate': obfuscator
}

function walkNode(expression, processor) {
  if (!expression)
    return expression

  let [type, operand1, operand2, operand3] = expression

  switch (type) {
    case 'assignment':
      operand1 = walkNode(operand1, processor)
      operand2 = walkNode(operand2, processor)
      operand3 = walkNode(operand3, processor)
      break;
    case 'operation':
      operand2 = walkNode(operand2, processor)
      operand3 = walkNode(operand3, processor)
      break;
    case 'function':
      operand1 = walkContents(operand1, processor)
      operand2 = walkContents(operand2, processor)
      break;
    case 'call':
      operand1 = walkNode(operand1, processor)
      operand2 = walkContents(operand2, processor)
      break;
  }

  expression = processor([type, operand1, operand2, operand3])

  return expression.filter(o => o)
}

function walkContents(operand, processor) {
  return operand.map(o => walkNode(o, processor))
}

function astProcess(ast, processorName) {
  const processor = processors[processorName]
  if (!processor)
    return ast;

  return walkNode(ast, processor);
}

export { astProcess }
