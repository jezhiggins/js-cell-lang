import { loadStandardLibrary } from '../../lib/library/index.js'
import { Environment } from '../../lib/environment.js'
import pkg from 'btoa'
const btoa = pkg

const nameMap = new Map();

{
  const env = new Environment()
  loadStandardLibrary(env)
  for (const key of Object.keys(env.vars_))
    nameMap.set(key, key);
}

function obfuscator(ast) {
  if (isCallingSet(ast))
    return obfuscateSetCall(ast)
  if (ast && ast[0] !== 'symbol')
    return ast

  let [, operand1] = ast

  if (operand1.startsWith('obs_'))
    return ast

  if (!nameMap.has(operand1)) {
    const obs = `obs_${btoa(operand1).replace(/=/g,'')}`
    nameMap.set(operand1, obs)
  }
  operand1 = nameMap.get(operand1)

  return ['symbol', operand1]
}

function isCallingSet(ast) {
  return ast && ast[0] === 'call' && ast[1][0] === 'symbol' && ast[1][1] === 'set';
}

function obfuscateSetCall(ast) {
  const [, fnName, [varName, ...rest]] = ast
  return ['call',
    fnName,
    [
      [ 'string', obfuscator(['symbol', varName[1]])[1] ],
      ...rest
    ]
  ]
}

export { obfuscator }
