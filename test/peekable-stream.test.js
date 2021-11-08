import { peekableStream } from '../lib/util/peekable-stream.js'
import { lex } from '../lib/lexer.js'

function stream(input) {
  return gather(peekableStream(input))
}

async function gather(s) {
  const arr = []
  for await (const c of s) {
    arr.push(c)
  }
  return arr
}

describe('peekable stream', () => {
  it('empty string returns nothing', async () => {
    await expect(stream('')).resolves.toEqual([])
  })

  it('forward traverse splits string into characters', async () => {
    await expect(stream('fruit')).resolves.toEqual(['f', 'r', 'u', 'i', 't'])
  })

  it('peeking returns same character each time, does not affect iteration', async () => {
    const stream = peekableStream('fruit')
    await expect(stream.peek()).resolves.toEqual({ done: false, value: 'f' })
    await expect(stream.peek()).resolves.toEqual({ done: false, value: 'f' })
    await expect(stream.peek()).resolves.toEqual({ done: false, value: 'f' })
    await expect(gather(stream)).resolves.toEqual(['f', 'r', 'u', 'i', 't'])
  })

  it('can peek each character', async () => {
    const stream = peekableStream('fruit')
    await expect(stream.peek()).resolves.toEqual({ done: false, value: 'f' })
    await expect(stream.next()).resolves.toEqual({ done: false, value: 'f' })
    await expect(stream.peek()).resolves.toEqual({ done: false, value: 'r' })
    await expect(stream.next()).resolves.toEqual({ done: false, value: 'r' })
    await expect(stream.peek()).resolves.toEqual({ done: false, value: 'u' })
    await expect(stream.next()).resolves.toEqual({ done: false, value: 'u' })
    await expect(stream.peek()).resolves.toEqual({ done: false, value: 'i' })
    await expect(stream.next()).resolves.toEqual({ done: false, value: 'i' })
    await expect(stream.peek()).resolves.toEqual({ done: false, value: 't' })
    await expect(stream.next()).resolves.toEqual({ done: false, value: 't' })
    await expect(stream.peek()).resolves.toEqual({ done: true })
  })

  it('can peek the lexed token stream', async () => {
    const tokens = peekableStream(lex('12 + 12'))
    await expect(tokens.next()).resolves.toEqual({ done: false, value: ['number', '12']})
    await expect(tokens.next()).resolves.toEqual({ done: false, value: ['operation', '+']})
    await expect(tokens.next()).resolves.toEqual({ done: false, value: ['number', '12']})
    await expect(tokens.next()).resolves.toEqual({ done: true })
  })

  it('can peek an array', async () => {
    const n = peekableStream([1,2,3])
    await expect(n.peek()).resolves.toEqual({ done: false, value: 1 })
    await expect(n.next()).resolves.toEqual({ done: false, value: 1 })
    await expect(n.peek()).resolves.toEqual({ done: false, value: 2 })
    await expect(n.next()).resolves.toEqual({ done: false, value: 2 })
    await expect(n.peek()).resolves.toEqual({ done: false, value: 3 })
    await expect(n.next()).resolves.toEqual({ done: false, value: 3 })
    await expect(n.peek()).resolves.toEqual({ done: true })
    await expect(n.next()).resolves.toEqual({ done: true })
  })
})
