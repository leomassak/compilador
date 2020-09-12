function isDigit(c) {
  return /[0-9]/.test(c);
}

function isChar(c) {
  return /[a-zA-Z]/.test(c);
}

export default {
  isDigit,
  isChar,
};
