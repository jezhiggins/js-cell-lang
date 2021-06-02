function peekableStream(input) {
  const iterator = input[Symbol.iterator]()
  let peeked = null
  return {
    peek: () => {
      if (!peeked)
        peeked = iterator.next()
      return peeked
    },
    next: () => {
      if (peeked) {
        const p = peeked
        peeked = null
        return p
      }
      return iterator.next()
    },
    [Symbol.iterator]() {
      return this
    }
  }
}

export { peekableStream }
