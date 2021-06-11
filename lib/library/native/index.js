import { ifFn } from './if-fn';
import { equalsFn } from './equals-fn';
import { setFn } from './set-fn';
import { charAtFn } from './char-at-fn';
import { lenFn } from './len-fn';
import { concatFn} from './concat-fn'
import { printFn } from './print-fn'

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
