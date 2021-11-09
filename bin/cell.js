#!/usr/bin/env node

import { readFileSync } from 'fs'
import { topLevelEnvironment } from '../lib/environment.js';
import { evaluate } from '../lib/evaluator.js'
import { parse } from '../lib/parser.js'
import { lex } from '../lib/lexer.js'
import repl from 'repl'
import { program } from 'commander/esm.mjs'
import { astProcess, processNames } from './astprocessor/index.js'
import { cellModes } from './mode/index.js'

process.on("unhandledRejection", error => {
  console.error(error); // This prints error with stack included (as for normal errors)
  throw error; // Following best practices re-throw error and let the process exit with error code
})

processNames.forEach(name => program.option(`--${name}`))

cellModes.forEach(mode =>
  program
    .command(mode.command)
    .description(mode.description)
    .action(sources => run(mode, sources, program.opts()))
)

program
  .arguments('[sources...]')
  .action(sources => run(makeEvaluator(), sources))

try {
  program.parse(process.argv)
} catch(e) {
  console.error(e)
}

async function* parseWithAstProcessors(code) {
  const processors = processNames.filter(p => program.opts()[p])

  for await (let ast of parse(lex(code))) 
    yield astProcess(ast, processors)
}

function evaluateCode(code, env) {
  return evaluate(parseWithAstProcessors(code), env)
}

function makeEvaluator() {
  const env = topLevelEnvironment();
  return code => evaluateCode(code, env);
}

function run(runFn, sources, options) {
  if (sources.length === 0)
    runRepl(runFn, options)
  else
    runFiles(runFn, sources, options)
}

function runFiles(runFn, files, options) {
  for (const file of files) {
    if (file === '-')
      runRepl(runFn, options)
    else {
      const code = readFileSync(file).toString()
      runFn(code, options)
    }
  }
}

function runRepl(runFn, options) {
  const evalCell = async (cmd, context, filename, callback) => {
    callback(null, await runFn(cmd, options))
  }

  repl.start({ prompt: '>>> ', eval: evalCell, ignoreUndefined: true});
}


