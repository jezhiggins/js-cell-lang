#!/usr/bin/env node

import { readFileSync } from 'fs'
import { topLevelEnvironment } from '../lib/environment.js';
import { evaluate } from '../lib/evaluator.js'
import { parse } from '../lib/parser.js'
import { lex } from '../lib/lexer.js'
import repl from 'repl'
import { program } from 'commander/esm.mjs'

program
  .command('lex <sources...>')
  .description('Display the tokenized program source')
  .action(sources => {
    lexFiles(sources)
  })
program
  .arguments('[sources...]')
  .action(sources => {
    if (sources.length === 0)
      runRepl()
    else
      runFiles(sources)
  })

program.parse(process.arv)

function lexFiles(files) {
  for (const file of files) {
    const code = readFileSync(file).toString()
    for (const token of lex(code))
      console.log(token)
  }
}

function runFiles(files) {
  const env = topLevelEnvironment()
  for (const file of files) {
    const code = readFileSync(file).toString()
    evaluate(parse(lex(code)), env)
  }
}

function runRepl() {
  const env = topLevelEnvironment()

  const evalCell = (cmd, context, filename, callback) => {
    callback(null, evaluate(parse(lex(cmd)), env))
  }

  repl.start({ prompt: '>>> ', eval: evalCell });
}


