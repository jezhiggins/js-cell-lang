import { ifFn } from './if-fn.js'
import { equalsFn } from './equals-fn.js'
import { setFn } from './set-fn.js'
import { charAtFn } from './char-at-fn.js'
import { lenFn } from './len-fn.js'
import { concatFn} from './concat-fn.js'
import { printFn } from './print-fn.js'

const native_fns = {
  'if': ifFn,
  'equals': equalsFn,
  'set': setFn,
  'char_at': charAtFn,
  'len': lenFn,
  'concat': concatFn,
  'print': printFn
}

export { native_fns }
