import chalk from "chalk";

function prettyPrint(node, indent = 0) {
  const print = line => console.log(pad(indent), line)
  const [type, ...args] = node
  switch (type) {
    case 'symbol':
      print(`[ ${chalk.yellow.italic(type)}, ${chalk.yellow(args[0])} ]`)
      break;
    case 'number':
      print(`[ ${chalk.yellow.italic(type)}, ${chalk.cyan(args[0])} ]`)
      break;
    case 'string':
      print(`[ ${chalk.yellow.italic(type)}, '${chalk.green(args[0])}' ]`)
      break;
    case 'assignment':
      print(`[ ${chalk.yellow.italic(type)}`)
      prettyPrint(args[0], indent + 2)
      prettyPrint(args[1], indent + 2)
      print(']')
      break;
    case 'call':
      print(`[ ${chalk.yellow.italic(type)}`)
      prettyPrint(args[0], indent + 2)
      if (args[1].length) {
        print('  [')
        for (const n of args[1])
          prettyPrint(n, indent + 4)
        print('  ]')
      } else {
        print('  [ ]')
      }
      print(']')
      break;
    case 'operation':
      print(`[ ${chalk.yellow.italic(type)}, ${chalk.white.bold(args[0])}`)
      prettyPrint(args[1], indent + 2)
      prettyPrint(args[2], indent + 2)
      print(']')
      break;
    case 'function':
      print(`[ ${chalk.yellow.italic(type)}`)
      if (args[0].length) {
        print('  [')
        for (const n of args[0])
          prettyPrint(n, indent + 4)
        print('  ]')
      } else {
        print('  [ ]')
      }
      print('  [')
      for (const n of args[1])
        prettyPrint(n, indent + 4)
      print('  ]')
      print(']')
      break;
  }
}

function pad(indent) {
  return "                                             ".substr(0, indent)
}

export { prettyPrint }
