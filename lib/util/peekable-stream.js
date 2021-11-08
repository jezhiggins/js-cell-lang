function peekableStream(input) {
  const iterator = findIterator(input)()
  let peeked = null
  return {
    peek: async () => {
      if (!peeked)
        peeked = await iterator.next()
      return peeked
    },
    next: async () => {
      if (peeked) {
        const p = peeked
        peeked = null
        return p
      }
      return iterator.next()
    },
    [Symbol.asyncIterator]() {
      return this
    }
  }
}

function findIterator(input)
{
  const iters = [Symbol.asyncIterator, Symbol.iterator].map(sym => input[sym])
  const iter = iters.filter(iter => iter)
  return () => iter[0].apply(input)
}

export { peekableStream }
