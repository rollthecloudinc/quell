export const isSelectorValid = ((dummyElement) =>
  (selector) => {
    if (!selector || selector.indexOf('undefined') !== -1) {
      return false;
    }
    try { dummyElement.querySelector(selector) } catch { return false }
    return true
})(document.createDocumentFragment())