function lenFn(env, string) {
  const [type, value] = string

  if (type !== 'string')
    throw 'len() can only be called for a string.'

  return value.length
}

export { lenFn }
