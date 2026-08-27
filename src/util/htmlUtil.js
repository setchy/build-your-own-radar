function getElementWidth(element) {
  const node = element && element.node && element.node()
  if (!node) return 0
  return node.getBoundingClientRect().width
}

function decodeHTML(encodedText) {
  const parser = new DOMParser()
  return parser.parseFromString(encodedText, 'text/html').body.textContent
}

function getElementHeight(element) {
  const node = element && element.node && element.node()
  if (!node) return 0
  return node.getBoundingClientRect().height
}

module.exports = {
  getElementWidth,
  getElementHeight,
  decodeHTML,
}
