#!/usr/bin/env node

import { readFileSync } from 'fs'
import { topLevelEnvironment } from '../lib/environment.js';
import { evaluate } from '../lib/evaluator.js'
import { parse } from '../lib/parser.js'
import { lex } from '../lib/lexer.js'
import repl from 'repl'
import { program } from 'commander/esm.mjs'
import chalk from 'chalk'
import { astProcess } from './astprocessor/index.js'
import { prettyPrint } from './astprinter/pretty.js'
import { minimise } from "./astprinter/minimise.js";

program
  .option('--fold', 'Apply constant folding')
  .option('--obfuscate')

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
  program.parse(process.arv)
} catch(e) {
  console.error(e)
}

function* parseWithAstProcessors(tokens) {
  const processors = []
  if(program.opts().fold)
    processors.push('fold')
  if(program.opts().obfuscate)
    processors.push('obfuscate')

  if (!processors)
    yield* parse(tokens)

  for (let ast of parse(tokens)) {
    for (const processor of processors)
      ast = astProcess(ast, processor)
    yield ast;
  }
}

function lexCode(code) {
  for (const token of lex(code))
    console.log(` [ ${chalk.yellow(token[0])}, '${chalk.green(token[1])}' ]`)
}

function parseCode(code) {
  for (const ast of parseWithAstProcessors(lex(code)))
    prettyPrint(ast)
}

function minimiseCode(code) {
  for (const ast of parseWithAstProcessors(lex(code)))
    minimise(ast)
  console.log()
}

function evaluateCode(code, env) {
  return evaluate(parseWithAstProcessors(lex(code)), env)
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
  const evalCell = (cmd, context, filename, callback) => {
    callback(null, runFn(cmd))
  }

  repl.start({ prompt: '>>> ', eval: evalCell });
}


