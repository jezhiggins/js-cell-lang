import { if_fn } from './if_fn';
import { equals_fn } from './equals_fn';
import { set_fn } from './set_fn';
import { char_at_fn } from './char_at_fn';
import { len_fn } from "./len_fn";

const native_fns = {
  'if': if_fn,
  'equals': equals_fn,
  'set': set_fn,
  'char_at': char_at_fn,
  'len': len_fn
}

export { native_fns }
