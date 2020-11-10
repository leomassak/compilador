const symbolTable = [];
let level = 1; // escopo

export const TokenType = {
  PROGRAM: 1,
  VARIABLE: 2,
  FUNCTION: 3,
  PROCEDURE: 4,
}

export const insertInSymbolTable = (token, tokenType, label) => {
  symbolTable.push({
    token,
    ...(tokenType && { tokenType }), // constantes
    tokenLevel : level,
    ...(label && { label }), // rotulo para geração do código
  });
};

export const getSymbolTable = () => symbolTable

export const increaseLevel = () => level += 1;

export const decreaseLevel = () => {
  if (level !== 1) level -= 1;
  else console.log('ERRO NO NIVEL!');
}

export const searchDuplicateVariable = (token) => {
  const haveDuplicates = symbolTable.find((item) => item.token === token && item.tokenLevel === level)
  return haveDuplicates ? true : false;
}
