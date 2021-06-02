import { peekableStream } from '../lib/peekable-stream.js'

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
})
