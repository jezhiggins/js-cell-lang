function char_at_fn(env, index, string) {
  if (index[0] !== 'number')
    throw 'char_at() must take a number as its first argument.'
  if (string[0] !== 'string')
    throw 'char_at() must take a string as its second argument.'

  const n = Math.round(index[1])
  if (n < 0 || n >= string[1].length)
    return null
  else
    return string[1][n]
}

export { char_at_fn }
