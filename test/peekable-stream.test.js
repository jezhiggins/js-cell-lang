import { peekableStream } from '../lib/util/peekable-stream.js'
import { lex } from '../lib/lexer.js'

describe('peekable stream', () => {
  it('empty string returns nothing', () => {
    expect([...peekableStream('')]).toEqual([])
  })

  it('forward traverse splits string into characters', () => {
    expect([...peekableStream('fruit')]).toEqual(['f', 'r', 'u', 'i', 't'])
  })

  it('peeking returns same character each time, does not affect iteration', () => {
    const stream = peekableStream('fruit')
    expect(stream.peek()).toEqual({ done: false, value: 'f' })
    expect(stream.peek()).toEqual({ done: false, value: 'f' })
    expect(stream.peek()).toEqual({ done: false, value: 'f' })
    expect([...stream]).toEqual(['f', 'r', 'u', 'i', 't'])
  })

  it('can peek each character', () => {
    const stream = peekableStream('fruit')
    expect(stream.peek()).toEqual({ done: false, value: 'f' })
    expect(stream.next()).toEqual({ done: false, value: 'f' })
    expect(stream.peek()).toEqual({ done: false, value: 'r' })
    expect(stream.next()).toEqual({ done: false, value: 'r' })
    expect(stream.peek()).toEqual({ done: false, value: 'u' })
    expect(stream.next()).toEqual({ done: false, value: 'u' })
    expect(stream.peek()).toEqual({ done: false, value: 'i' })
    expect(stream.next()).toEqual({ done: false, value: 'i' })
    expect(stream.peek()).toEqual({ done: false, value: 't' })
    expect(stream.next()).toEqual({ done: false, value: 't' })
    expect(stream.peek()).toEqual({ done: true })
  })

  it('can peek the lexed token stream', () => {
    const tokens = peekableStream(lex('12 + 12'))
    expect(tokens.next()).toEqual({ done: false, value: ['number', '12']})
    expect(tokens.next()).toEqual({ done: false, value: ['operation', '+']})
    expect(tokens.next()).toEqual({ done: false, value: ['number', '12']})
    expect(tokens.next()).toEqual({ done: true })
  })

  it('can peek the lexed token stream', () => {
    const tokens = peekableStream(lex('12 + 12'))
    expect(tokens.next()).toEqual({ done: false, value: ['number', '12']})
    expect(tokens.next()).toEqual({ done: false, value: ['operation', '+']})
    expect(tokens.next()).toEqual({ done: false, value: ['number', '12']})
    expect(tokens.next()).toEqual({ done: true })
  })

  it('can peek an array', () => {
    const n = peekableStream([1,2,3])
    expect(n.peek()).toEqual({ done: false, value: 1 })
    expect(n.next()).toEqual({ done: false, value: 1 })
    expect(n.peek()).toEqual({ done: false, value: 2 })
    expect(n.next()).toEqual({ done: false, value: 2 })
    expect(n.peek()).toEqual({ done: false, value: 3 })
    expect(n.next()).toEqual({ done: false, value: 3 })
    expect(n.peek()).toEqual({ done: true })
    expect(n.next()).toEqual({ done: true })
  })
})
