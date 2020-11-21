import * as SyntacticalAnalysis from '../syntactical/analisys';

export let symbolTable = [];
export let posFixExpression = [];
export let posFixStack = [];
export let posFixLevel = 0;

let level = 1; // escopo

export const TokenType = {
  PROGRAM: 1,
  VARIABLE: 2,
  BOOLEAN_FUNCTION: 3,
  INTEGER_FUNCTION: 4,
  PROCEDURE: 5,
  FUNCTION: 6,
}

const posFixPrecedence = [
  { lexeme: '-u', order: 7, read: 1, type: 'inteiro', return: 'inteiro' },
  { lexeme: '+u', order: 7, read: 1, type: 'inteiro', return: 'inteiro' },
  { lexeme: 'nao', order: 7, read: 1, type: 'booleano', return: 'booleano' },
  { lexeme: '*', order: 6, read: 2, type: 'inteiro', return: 'inteiro' },
  { lexeme: 'div', order: 6, read: 2, type: 'inteiro', return: 'inteiro' },
  { lexeme: '-', order: 5, read: 2, type: 'inteiro', return: 'inteiro' },
  { lexeme: '+', order: 5, read: 2, type: 'inteiro', return: 'inteiro' },
  { lexeme: '>', order: 4, read: 2, type: 'inteiro', return: 'booleano' },
  { lexeme: '>=', order: 4, read: 2, type: 'inteiro', return: 'booleano' },
  { lexeme: '<', order: 4, read: 2, type: 'inteiro', return: 'booleano' },
  { lexeme: '<=', order: 4, read: 2, type: 'inteiro', return: 'booleano' },
  { lexeme: '=', order: 3, read: 2, type: 'ambos', return: 'booleano' },
  { lexeme: '!=', order: 3, read: 2, type: 'ambos', return: 'booleano' },
  { lexeme: 'e', order: 2, read: 2, type: 'booleano', return: 'booleano' },
  { lexeme: 'ou', order: 1, read: 2, type: 'booleano', return: 'booleano' },
];

// ------------------------------------------------------ TABELA DE SÍMBOLOS ------------------------------------------------------------

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
  // console.log('inserindoTipo', symbolTable)
};

export const increaseLevel = () => {
  level += 1;

  // console.log('aumentou o nível', level);
}

export const decreaseLevel = () => {
  // console.log('antes da diminuição de nível', symbolTable);
  const filteredSymbolTable = symbolTable.filter((item) => item.tokenLevel < level || (item.tokenLevel === level
    && (item.tokenFunc === TokenType.BOOLEAN_FUNCTION
      || item.tokenFunc === TokenType.INTEGER_FUNCTION
      || item.tokenFunc === TokenType.PROCEDURE
      || item.tokenFunc === TokenType.PROGRAM)));
  symbolTable = filteredSymbolTable;
  // console.log('depois da diminuição de nível', symbolTable);

  if (level !== 1) level -= 1;
  else console.log('ERRO NO NÍVEL!');

  // console.log('diminuiu o nível', level);
}

// pesquisa_duplic_var_tabela
export const searchDuplicateVariable = (token) => {
  const alreadyDeclared = symbolTable.find((item) => item.token === token
    && ((item.tokenFunc === TokenType.VARIABLE && item.tokenLevel === level)
      || item.tokenFunc === TokenType.BOOLEAN_FUNCTION
      || item.tokenFunc === TokenType.INTEGER_FUNCTION
      || item.tokenFunc === TokenType.PROCEDURE
      || item.tokenFunc === TokenType.PROGRAM))
  return alreadyDeclared ? true : false;
}

export const searchDuplicateFunctionOrProcedure = (token) => {
  const alreadyDeclared = symbolTable.find((item) => item.token === token)
  return alreadyDeclared ? true : false;
}

// pesquisa_declvarfunc_tabela
export const searchDeclarationVariableFunction = (token) => {
  const found = symbolTable.find((item) => item.token === token
    && (item.tokenFunc === TokenType.BOOLEAN_FUNCTION
    || item.tokenFunc === TokenType.INTEGER_FUNCTION
    || item.tokenFunc === TokenType.VARIABLE))
  return found ? true : false;
}

// pesquisa_declvarproc_tabela
export const searchDeclarationVariableProcedure = (token) => {
  const found = symbolTable.find((item) => item.token === token
    && (item.tokenFunc === TokenType.PROCEDURE
      || item.tokenFunc === TokenType.VARIABLE))
  return found ? true : false;
}

// pesquisa_declvar_tabela
export const searchDeclarationVariable = (token) => { 
  const found = symbolTable.find((item) => item.token === token && item.tokenFunc === TokenType.VARIABLE)
  // const found = symbolTable.find((item) => item.token === token && item.tokenLevel === level)
  return found;
}

// pesquisa_declproc_tabela
export const searchDeclarationProcedure = (token) => {
  const found = symbolTable.find((item) => item.token === token && item.tokenFunc === TokenType.PROCEDURE)
  return found;
}

// pesquisa_declfunc_tabela
export const searchDeclarationFunction = (token) => {
  const found = symbolTable.find((item) => item.token === token
    && (item.tokenFunc === TokenType.BOOLEAN_FUNCTION || item.tokenFunc === TokenType.INTEGER_FUNCTION))

  return found;
}

export const checkFunctionReturn = (token) => {
  const found = symbolTable.slice().reverse().find((item) => item.tokenFunc === TokenType.BOOLEAN_FUNCTION
    || item.tokenFunc === TokenType.INTEGER_FUNCTION);
  return found && found.token === token;
}

export const changeFunctionType = (type) => {
  let aux = [];

  symbolTable.forEach((item) => {
    if (item.tokenFunc === TokenType.FUNCTION) {
      aux = [...aux, { ...item, tokenFunc: type }]
    } else {
      aux = [...aux, item]
    }
  })
  symbolTable = aux;
}

// pesquisa_tabela
export const searchTable = (token) => {
  const found = symbolTable.find((item) => item.token === token)
  return found;
}

// ------------------------------------------------------ POS FIX ------------------------------------------------------------

export function changePosFix(value) {
  posFixLevel = value;
}

export function resetPosFix() {
  posFixExpression = [];
  posFixStack = [];
  posFixLevel = 0;
}

export function verifyPrecedence(newToken) {
  const index = SyntacticalAnalysis.index;

  if (posFixStack.length === 0 && SyntacticalAnalysis.tokenList[index].lexeme !== '(' && SyntacticalAnalysis.tokenList[index].lexeme !== ')') {
    posFixStack.push(newToken || SyntacticalAnalysis.tokenList[index])
  }
  else if (SyntacticalAnalysis.tokenList[index].lexeme === '(') {
    posFixStack.push(SyntacticalAnalysis.tokenList[index]);
  }
  else if (SyntacticalAnalysis.tokenList[index].lexeme === ')') {
    let shouldSkip = false;
    let newPosFixStack = [];
    posFixStack.slice().reverse().forEach((item) => {
      if (item.lexeme === '(') shouldSkip = true;
      else if (!shouldSkip) posFixExpression.push(item);
      else newPosFixStack.push(item);
    });
    posFixStack = newPosFixStack.reverse();
  } else {
    const actualTokenOrder = (posFixStack[posFixStack.length - 1].lexeme === '(' || posFixStack[posFixStack.length - 1].lexeme === ')')
      ? 0 : posFixPrecedence.find((item) => item.lexeme === posFixStack[posFixStack.length - 1].lexeme).order;
    const newTokenOrder = posFixPrecedence.find((item) => item.lexeme === ((newToken && newToken.lexeme) || SyntacticalAnalysis.tokenList[index].lexeme)).order
    if (actualTokenOrder < newTokenOrder) posFixStack.push(newToken || SyntacticalAnalysis.tokenList[index])
    else {
      posFixStack.slice().reverse().forEach((item) => {
        if (item.lexeme !== '(' && item.lexeme !== ')') posFixExpression.push(item)
      });
      posFixStack = [newToken || SyntacticalAnalysis.tokenList[index]];
    }
  }
}

export function posFixAnalisys() {
  // console.log('analise da posfix')
  // console.log('ANTES: expressão posfix:', JSON.stringify(posFixExpression));
  let hasOperations = true;
  let index = 0;
  do {
    const isOperator = posFixPrecedence.find((item) => item.lexeme === posFixExpression[index].lexeme)
    if (isOperator) {
      const operatorIndex = posFixExpression.findIndex((item) => item.lexeme === isOperator.lexeme);
      const firstToken = posFixExpression[operatorIndex - isOperator.read];
      if (isOperator.read > 1) {
        const secondToken = posFixExpression[operatorIndex - isOperator.read + 1];
        operationAnalysis(isOperator, firstToken, secondToken, operatorIndex);
      } else unaryOperationAnalysis(isOperator, firstToken, operatorIndex);
      index = 0;
    }
    else if (index === posFixExpression.length - 1) hasOperations = false;
    else index += 1;
  } while (hasOperations);

  if (posFixExpression.length > 1)
    throw new Error(`Erro - Linha ${SyntacticalAnalysis.line}: Está faltando um operador na expressão`);

  if (posFixExpression[0].symbol === 'snumero') posFixExpression = 'inteiro';
  else if (posFixExpression[0].symbol === 'sbooleano') posFixExpression = 'booleano';
  else posFixExpression = checkInteger(posFixExpression[0]) ? 'inteiro' : 'booleano';

  // console.log('DEPOIS: expressão posfix:', JSON.stringify(posFixExpression));
  // console.log('saiu da analise da posfix')
}

function unaryOperationAnalysis(unaryOperation, token, index) {
  if (unaryOperation.type === 'inteiro') {
    if (!checkInteger(token)) throw new Error(`Erro - Linha ${token.line}: A operação "${unaryOperation.lexeme}" não pode ser feita com um valor booleano`);
    transformExpressionArray(unaryOperation, unaryOperation.return, index)
  } else {
    if (!checkBoolean(token)) throw new Error(`Erro - Linha ${token.line}: A operação "${unaryOperation.lexeme}" não pode ser feita com um valor inteiro`);
    transformExpressionArray(unaryOperation, unaryOperation.return, index)
  }
}

function operationAnalysis(operation, firsToken, secondToken, index) {
  if (operation.type === 'inteiro') {
    if (!checkInteger(firsToken)) throw new Error(`Erro - Linha ${firsToken.line}: A operação "${operation.lexeme}" não pode ser feita com um valor booleano`);
    if (!checkInteger(secondToken)) throw new Error(`Erro - Linha ${secondToken.line}: A operação "${operation.lexeme}" não pode ser feita com um valor booleano`);

    transformExpressionArray(operation, operation.return, index)
  } else if (operation.type === 'booleano') {
    if (!checkBoolean(firsToken)) throw new Error(`Erro - Linha ${firsToken.line}: A operação "${operation.lexeme}" não pode ser feita com um valor inteiro`);
    if (!checkBoolean(secondToken)) throw new Error(`Erro - Linha ${secondToken.line}: A operação "${operation.lexeme}" não pode ser feita com um valor inteiro`);

    transformExpressionArray(operation, operation.return, index)
  } else {
    if (checkInteger(firsToken) && checkInteger(secondToken)) {
      transformExpressionArray(operation, operation.return, index)
    }
    else if (checkBoolean(firsToken) && checkBoolean(secondToken)) {
      transformExpressionArray(operation, operation.return, index)
    }
    else throw new Error(`Erro - Linha ${firsToken.line}: Os tokens "${firsToken.lexeme}" e "${secondToken.lexeme}" possuem tipos diferentes`);
  }
}

function transformExpressionArray(operation, type, index) {
  // console.log('transformExpressionArray', operation, type, index);
  posFixExpression.splice(index - operation.read, operation.read + 1, { symbol: `s${type}`, lexeme: type, line: SyntacticalAnalysis.line });
  // console.log('após transformExpressionArray', posFixExpression);
}

function checkBoolean(token) {
  let response = true;
  if (token.lexeme !== 'verdadeiro' && token.lexeme !== 'false' && token.lexeme !== 'booleano') {
    const checkIsFunction = searchDeclarationFunction(token.lexeme)
    // console.log('checkBoolean: checkIsFunction', checkIsFunction);

    const checkIsVariable = searchDeclarationVariable(token.lexeme)
    // console.log('checkBoolean: checkIsVariable', checkIsVariable);

    if (checkIsFunction && checkIsFunction.tokenFunc === TokenType.BOOLEAN_FUNCTION) response = true;
    else if (checkIsVariable && checkIsVariable.tokenType === 'booleano') response = true;
    else response = false;
  }
  return response;
}

function checkInteger(token) {
  let response = true;
  if (token.symbol !== 'snumero' && token.lexeme !== 'inteiro') {
    const checkIsFunction = searchDeclarationFunction(token.lexeme)
    // console.log('checkInteger: checkIsFunction', checkIsFunction);

    const checkIsVariable = searchDeclarationVariable(token.lexeme)
    // console.log('checkInteger: checkIsVariable', checkIsVariable);

    if (checkIsFunction && checkIsFunction.tokenFunc === TokenType.INTEGER_FUNCTION) response = true;
    else if (checkIsVariable && checkIsVariable.tokenType === 'inteiro') response = true;
    else response = false;
  }
  return response;
}
