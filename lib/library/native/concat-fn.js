function concatFn(env, string1, string2) {
  const [firstType, firstValue] = string1
  if (firstType !== 'string')
    throw 'concat() must take a string as its first argument.'
  const [secondType, secondValue] = string2
  if (secondType !== 'string')
    throw 'concat() must take a string as its second argument.'

  return `${firstValue}${secondValue}`
}

export { concatFn }