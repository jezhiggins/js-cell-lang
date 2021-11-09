import { lexMode } from './lex-mode.js'
import { parseMode, minimiseMode } from './parse-modes.js'

const cellModes = [
  lexMode,
  parseMode,
  minimiseMode
]

export { cellModes }
