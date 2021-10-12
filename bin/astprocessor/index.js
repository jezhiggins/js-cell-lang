import { constantFold } from './constantFolding.js'

const processors = {
  'fold': constantFold
}

function walkNode(expression, processor) {
  if (!expression)
    return expression

  expression = processor(expression)

  let [type, operand1, operand2, operand3] = expression

  switch (type) {
    case 'assignment':
    case 'operation':
      operand2 = walkNode(operand2, processor);
      operand3 = walkNode(operand3, processor);
      break;
    case 'function':
      operand2 = operand2.map(o => walkNode(o, processor))
      break;
  }

  expression = processor([type, operand1, operand2, operand3])
  return expression
}

function astProcess(ast, processorName) {
  const processor = processors[processorName]
  if (!processor)
    return ast;

  return walkNode(ast, processor);
}

export { astProcess }
