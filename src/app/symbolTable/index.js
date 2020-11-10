export let symbolTable = [];
let level = 1; // escopo

export const TokenType = {
  PROGRAM: 1,
  VARIABLE: 2,
  FUNCTION: 3,
  PROCEDURE: 4,
}

export const resetSymbolTable = () => {
  level = 1;
  symbolTable = [];
}

export const insertInSymbolTable = (token, tokenFunc, label) => {
  symbolTable.push({
    token,
    ...(tokenFunc && { tokenFunc }), // constantes
    tokenLevel : level,
    ...(label && { label }), // rotulo para geração do código
  });
};

export const insertTypeInSymbolTable = (type) => {
  let aux = [];
  symbolTable.forEach((item) => {
    if (item.tokenLevel === level && item.tokenFunc === TokenType.VARIABLE && !item.tokenType) {
      aux = [...aux, { ...item, tokenType: type }]
    } else {
      aux = [...aux, item]
    }
  })
  symbolTable = aux;
  console.log('inserindoTipo', symbolTable)
};

export const increaseLevel = () => {
  console.log('aumentou o nível');
  level += 1;
}

export const decreaseLevel = () => {
  console.log('diminuiu o nível');
  if (level !== 1) level -= 1;
  else console.log('ERRO NO NÍVEL!');
}

export const searchDuplicateVariable = (token) => {
  const haveDuplicates = symbolTable.find((item) => item.token === token && item.tokenLevel === level)
  return haveDuplicates ? true : false;
}
