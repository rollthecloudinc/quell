export const isSelectorValid = ({ selector, document }: { selector: string, document: Document }) => {
  const dummyElement = document.createDocumentFragment();
  if (!selector || selector.indexOf('undefined') !== -1) {
    return false;
  }
  try { dummyElement.querySelector(selector) } catch { return false }
  return true
};