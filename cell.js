#!/usr/bin/env node

import { readFileSync } from 'fs'
import { topLevelEnvironment } from './lib/environment.js';
import { evaluate } from './lib/evaluator.js'
import { parse } from './lib/parser.js'
import { lex } from './lib/lexer.js'

function runFiles(files) {
  const env = topLevelEnvironment()
  for (const file of files) {
    const code = readFileSync(file).toString()
    evaluate(parse(lex(code)), env)
  }
}

const files = process.argv.slice(2)
if (files.length !== 0)
  runFiles(files)

