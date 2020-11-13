export let symbolTable = [];
let level = 1; // escopo

export const TokenType = {
  PROGRAM: 1,
  VARIABLE: 2,
  BOOLEAN_FUNCTION: 3,
  INTEGER_FUNCTION: 4,
  PROCEDURE: 5,
  FUNCTION: 6,
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
  level += 1;

  console.log('aumentou o nível', level);
}

export const decreaseLevel = () => {
  console.log('antes da diminuição de nível', symbolTable);
  const filteredSymbolTable = symbolTable.filter((item) => item.tokenLevel !== level
    || (item.tokenLevel === level && (item.tokenFunc === TokenType.BOOLEAN_FUNCTION || item.tokenFunc === TokenType.INTEGER_FUNCTION)));
  symbolTable = filteredSymbolTable;
  console.log('depois da diminuição de nível', symbolTable);

  if (level !== 1) level -= 1;
  else console.log('ERRO NO NÍVEL!');

  console.log('diminuiu o nível', level);
}

// pesquisa_duplic_var_tabela
export const searchDuplicateVariable = (token) => {
  console.log(symbolTable, token);
  const alreadyDeclared = symbolTable.find((item) => item.token === token
    && ((item.tokenFunc === TokenType.VARIABLE && item.tokenLevel === level)
      || item.tokenFunc === TokenType.BOOLEAN_FUNCTION
      || item.tokenFunc === TokenType.INTEGER_FUNCTION
      || item.tokenFunc === TokenType.PROCEDURE
      || item.tokenFunc === TokenType.PROGRAM))
  console.log(alreadyDeclared);
  return alreadyDeclared ? true : false;
}

// pesquisa_declvarfunc_tabela
export const searchDeclarationVariableFunction = (token) => {
  const found = symbolTable.find((item) => item.token === token && item.tokenLevel === level
    && (item.tokenFunc === TokenType.BOOLEAN_FUNCTION || item.tokenFunc === TokenType.INTEGER_FUNCTION
    || item.tokenFunc === TokenType.VARIABLE))
  return found ? true : false;
}

// pesquisa_declvar_tabela
export const searchDeclarationScopeVariable = (token) => { 
  const found = symbolTable.find((item) => item.token === token && item.tokenLevel === level)
  return found ? true : false;
}

// pesquisa_declproc_tabela
export const searchDeclarationProcedure = (token) => {
  const found = symbolTable.find((item) => item.token === token && item.tokenFunc === TokenType.PROCEDURE)
  return found ? true : false;
}

// pesquisa_declfunc_tabela
export const searchDeclarationFunction = (token) => {
  const found = symbolTable.find((item) => item.token === token
    && (item.tokenFunc === TokenType.BOOLEAN_FUNCTION || item.tokenFunc === TokenType.INTEGER_FUNCTION))
  return found ? true : false;
}

export const changeFunctionType = (type) => {
  let aux = [];

  console.log('antes de mudar a função', symbolTable);
  symbolTable.forEach((item) => {
    if (item.tokenFunc === TokenType.FUNCTION) {
      aux = [...aux, { ...item, tokenType: type }]
    } else {
      aux = [...aux, item]
    }
  })
  symbolTable = aux;
  console.log('depois de mudar a função', symbolTable);
}
