import chalk from "chalk";

function minimiseNode(node) {
  const [type, operand1, operand2, operand3] = node
  switch (type) {
    case 'symbol':
    case 'number':
      return operand1
    case 'string':
      return `'${operand1}'`
    case 'assignment':
      return minimiseNode(operand1) + '=' + minimiseNode(operand2)
    case 'call':
      return minimiseNode(operand1) + '(' + operand2.map(o => minimiseNode(o)).join(',') + ')'
      break;
    case 'operation':
      return minimiseNode(operand2) + operand1 + minimiseNode(operand3)
    case 'function':
      let fn = '{';
      if (operand1) {
        fn += ':('
        fn += operand1.map(o => minimiseNode(o)).join(',')
        fn += ')'
      }
      fn += operand2.map(o => minimiseNode(o)).join(';')
      fn += '}'
      return fn
  }
}

function minimise(expression) {
  process.stdout.write(minimiseNode(expression))
  process.stdout.write(';')
}

export { minimise }
