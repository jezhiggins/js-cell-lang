#!/usr/bin/env node

import { readFileSync } from 'fs'
import repl from 'repl'
import { program } from 'commander/esm.mjs'
import { processNames } from './astprocessor/index.js'
import { cellModes } from './mode/index.js'
import { executeMode } from "./mode/execute-mode.js";

processNames.forEach(name => program.option(`--${name}`))

cellModes.forEach(mode =>
  program
    .command(mode.command)
    .description(mode.description)
    .action(sources => run(mode, sources, program.opts()))
)

program
  .arguments('[sources...]')
  .action(sources => run(executeMode, sources, program.opts()))

try {
  program.parse(process.argv)
} catch(e) {
  console.error(e)
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
  const evalCell = (cmd, context, filename, callback) => {
    callback(null, runFn(cmd, options))
  }

  repl.start({ prompt: '>>> ', eval: evalCell, ignoreUndefined: true});
}


