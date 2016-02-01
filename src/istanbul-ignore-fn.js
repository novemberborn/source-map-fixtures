const q = a => {
  if (a === 42) {
    return bar()
  }
}
export { q as run }

/* istanbul ignore next */
const bar = () => {}
