#!/usr/bin/env node

import { readFileSync } from 'fs'
import { topLevelEnvironment } from '../lib/environment.js';
import { evaluate } from '../lib/evaluator.js'
import { parse } from '../lib/parser.js'
import { lex } from '../lib/lexer.js'
import repl from 'repl'
import { program } from 'commander/esm.mjs'
import chalk from 'chalk'
import { astProcess, processNames } from './astprocessor/index.js'
import { prettyPrint } from './astprinter/pretty.js'
import { minimise } from "./astprinter/minimise.js";

process.on("unhandledRejection", error => {
  console.error(error); // This prints error with stack included (as for normal errors)
  throw error; // Following best practices re-throw error and let the process exit with error code
})

processNames.forEach(name => program.option(`--${name}`))

program
  .command('lex [sources...]')
  .description('Display the tokenized program source')
  .action(sources => run(sources, lexCode))
program
  .command('parse [sources...]')
  .description('Display the program\'s AST')
  .action(sources => run(sources, parseCode))
program
  .command('minimise [sources...]')
  .description('Cell source minimiser')
  .action(sources => run(sources, minimiseCode))
program
  .arguments('[sources...]')
  .action(sources => run(sources, makeEvaluator()))

try {
  program.parse(process.argv)
} catch(e) {
  console.error(e)
}

async function* parseWithAstProcessors(code) {
  const processors = processNames.filter(p => program.opts()[p])

  for await (let ast of parse(lex(code))) {
    yield astProcess(ast, processors);
  }
}

async function lexCode(code) {
  for await (const token of lex(code))
    console.log(` [ ${chalk.yellow(token[0])}, '${chalk.green(token[1])}' ]`)
}

async function parseCode(code) {
  for await (const ast of parseWithAstProcessors(code))
    prettyPrint(ast)
}

async function minimiseCode(code) {
  for await (const ast of parseWithAstProcessors(code))
    minimise(ast)
  console.log()
}

function evaluateCode(code, env) {
  return evaluate(parseWithAstProcessors(code), env)
}

function makeEvaluator() {
  const env = topLevelEnvironment();
  return code => evaluateCode(code, env);
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
  const evalCell = async (cmd, context, filename, callback) => {
    callback(null, await runFn(cmd))
  }

  repl.start({ prompt: '>>> ', eval: evalCell });
}


