function stringify(expression) {
  return `(${expression.map(t => doStringify(t)).join(', ')})`
}
function doStringify(token) {
  if (Array.isArray(token))
    return `[${token.map(t => stringify(t)).join(', ')}]`

  return (typeof token === 'number') ? token : `'${token}'`
}

export { stringify }
