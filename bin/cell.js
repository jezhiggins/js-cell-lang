#!/usr/bin/env node

import { readFileSync } from 'fs'
import { topLevelEnvironment } from '../lib/environment.js';
import { evaluate } from '../lib/evaluator.js'
import { parse } from '../lib/parser.js'
import { lex } from '../lib/lexer.js'
import repl from 'repl'
import { program } from 'commander/esm.mjs'
import chalk from 'chalk'

program
  .command('lex [sources...]')
  .description('Display the tokenized program source')
  .action(sources => run(sources, lexCode))
program
  .command('parse [sources...]')
  .description('Display the program\'s AST')
  .action(sources => run(sources, parseCode))
program
  .arguments('[sources...]')
  .action(sources => run(sources, makeEvaluator()))

try {
  program.parse(process.arv)
} catch(e) {
  console.error(e)
}

function lexCode(code) {
  for (const token of lex(code))
    console.log(` [ ${chalk.yellow(token[0])}, '${chalk.green(token[1])}' ]`)
}

function parseCode(code) {
  for (const ast of parse(lex(code)))
    prettyPrintAst(ast)
}

function evaluateCode(code, env) {
  return evaluate(parse(lex(code)), env)
}

function makeEvaluator() {
  const env = topLevelEnvironment();
  return code => evaluateCode(code, env);
}

function prettyPrintAst(node, indent = 0) {
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
      prettyPrintAst(args[0], indent + 2)
      prettyPrintAst(args[1], indent + 2)
      print(']')
      break;
    case 'call':
      print(`[ ${chalk.yellow.italic(type)}`)
      prettyPrintAst(args[0], indent + 2)
      if (args[1].length) {
        print('  [')
        for (const n of args[1])
          prettyPrintAst(n, indent + 4)
        print('  ]')
      } else {
        print('  [ ]')
      }
      print(']')
      break;
    case 'operation':
      print(`[ ${chalk.yellow.italic(type)}, ${chalk.white.bold(args[0])}`)
      prettyPrintAst(args[1], indent + 2)
      prettyPrintAst(args[2], indent + 2)
      print(']')
      break;
    case 'function':
      print(`[ ${chalk.yellow.italic(type)}`)
      if (args[0].length) {
        print('  [')
        for (const n of args[0])
          prettyPrintAst(n, indent + 4)
        print('  ]')
      } else {
        print('  [ ]')
      }
      print('  [')
      for (const n of args[1])
        prettyPrintAst(n, indent + 4)
      print('  ]')
      print(']')
      break;
  }
}

function pad(indent) {
  return "                                             ".substr(0, indent)
}

function run(sources, runFn) {
  if (sources.length === 0)
    runRepl(runFn)
  else
    runFiles(sources, runFn)
}

function runFiles(files, runFn) {
  for (const file of files) {
    if (file === '-')
      runRepl(runFn)
    else {
      const code = readFileSync(file).toString()
      runFn(code)
    }
  }
}

function runRepl(runFn) {
  const evalCell = (cmd, context, filename, callback) => {
    callback(null, runFn(cmd))
  }

  repl.start({ prompt: '>>> ', eval: evalCell });
}


