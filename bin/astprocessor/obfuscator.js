import { loadStandardLibrary } from '../../lib/library/index.js'
import { Environment } from '../../lib/environment.js'

const nameMap = new Map();

{
  const env = new Environment()
  loadStandardLibrary(env)
  for (const key of Object.keys(env.vars_))
    nameMap.set(key, key);
}

function obfuscator(ast) {
  if (ast && ast[0] !== 'symbol')
    return ast

  let [, operand1] = ast

  if (operand1.startsWith('obs_'))
    return ast

  if (!nameMap.has(operand1)) {
    const obs = `obs_${btoa(operand1)}`
    nameMap.set(operand1, obs)
  }
  operand1 = nameMap.get(operand1)

  return ['symbol', operand1]
}

export { obfuscator }
