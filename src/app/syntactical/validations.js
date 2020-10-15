export function initialValidation(token) {
  return token.symbol === 'sprograma';
}

export function identifierValidation(token) {
  return token.symbol === 'sidentificador';
}

export function semicolonValidation(token) {
  return token.symbol === 'sponto_virgula ';
}

export function pointValidation(token) {
  return token.symbol === 'sponto';
}

export function varValidation(token) {
  return token.symbol === 'svar';
}