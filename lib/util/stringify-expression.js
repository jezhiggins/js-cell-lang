function stringify(expression) {
  return `(${expression.map(t => doStringify(t)).join(', ')})`
}
function doStringify(token) {
  return Array.isArray(token)
    ? `[${token.map(t => stringify(t)).join(', ')}]`
    : `'${token}'`
}

export { stringify }
