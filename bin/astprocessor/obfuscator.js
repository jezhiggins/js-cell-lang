import { loadStandardLibrary } from '../../lib/library/index.js'
import { Environment } from '../../lib/environment.js'
import pkg from 'btoa'
const btoa = pkg

function loadStandardNames() {
  const env = loadStandardLibrary(new Environment())

  const nameMap = new Map();
  Object.keys(env.vars_).forEach(key => nameMap.set(key, key))

  return nameMap
}

function obfuscator(ast) {
  const nameMap = loadStandardNames()
  return obfuscate(ast, nameMap)
}

function obfuscate(ast, nameMap) {
  if (isCallingSet(ast))
    return obfuscateSetCall(ast, nameMap)
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

function obfuscateSetCall(ast, nameMap) {
  const [, fnName, [varName, ...rest]] = ast
  return ['call',
    fnName,
    [
      [ 'string', obfuscator(['symbol', varName[1]], nameMap)[1] ],
      ...rest
    ]
  ]
}

export { obfuscator }
