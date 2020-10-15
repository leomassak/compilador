export function initialValidation(token) {
  return token.symbol === 'sprograma';
}

export function identifierValidation(token) {
  return token.symbol === 'sidentificador';
}

export function semicolonValidation(token) {
  return token.symbol === 'sponto_virgula';
}

export function pointValidation(token) {
  return token.symbol === 'Sponto';
}

export function commaValidation(token) {
  return token.symbol === 'Svirgula';
}

export function varValidation(token) {
  return token.symbol === 'svar';
}

export function doublePointValidation(token) {
  return token.symbol === 'Sdoispontos';
}

export function integerValidation(token) {
  return token.symbol === 'sinteiro';
}

export function booleanValidation(token) {
  return token.symbol === 'sbooleano';
}

export function procedureValidation(token) {
  return token.symbol === 'sprocedimento';
}

export function functionValidation(token) {
  return token.symbol === 'sfuncao';
}