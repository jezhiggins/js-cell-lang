import { constantFold } from './constantFolding.js'
import { obfuscator } from './obfuscator.js'

const processors = {
  'fold': constantFold,
  'obfuscate': obfuscator
}

async function walkNode(expression, processor) {
  if (!expression)
    return expression

  let [type, operand1, operand2, operand3] = expression

  switch (type) {
    case 'assignment':
      operand1 = await walkNode(operand1, processor)
      operand2 = await walkNode(operand2, processor)
      operand3 = await walkNode(operand3, processor)
      break;
    case 'operation':
      operand2 = await walkNode(operand2, processor)
      operand3 = await walkNode(operand3, processor)
      break;
    case 'function':
      operand1 = await walkContents(operand1, processor)
      operand2 = await walkContents(operand2, processor)
      break;
    case 'call':
      operand1 = await walkNode(operand1, processor)
      operand2 = await walkContents(operand2, processor)
      break;
  }

  expression = await processor([type, operand1, operand2, operand3])

  return expression.filter(o => o)
}

function walkContents(operand, processor) {
  return Promise.all(operand.map(o => walkNode(o, processor)))
}

async function applyProcess(ast, processorName) {
  const processor = processors[processorName]
  if (!processor)
    return ast;

  return await walkNode(ast, processor);
}

async function astProcess(ast, processNames)
{
  for (const name of processNames)
    ast = await applyProcess(ast, name)
  return ast
}

const processNames = Object.keys(processors)

export {
  astProcess,
  processNames
}
