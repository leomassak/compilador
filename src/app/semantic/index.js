import * as SyntacticalAnalysis from '../syntactical/analisys';
import * as CodeGeneration from '../codeGeneration';

const posFixPrecedence = [
  { lexeme: '-u', order: 7, read: 1, type: 'inteiro', return: 'inteiro', code: 'INV' },
  { lexeme: '+u', order: 7, read: 1, type: 'inteiro', return: 'inteiro', code: null },
  { lexeme: 'nao', order: 7, read: 1, type: 'booleano', return: 'booleano', code: 'NEG' },
  { lexeme: '*', order: 6, read: 2, type: 'inteiro', return: 'inteiro', code: 'MULT' },
  { lexeme: 'div', order: 6, read: 2, type: 'inteiro', return: 'inteiro', code: 'DIVI' },
  { lexeme: '-', order: 5, read: 2, type: 'inteiro', return: 'inteiro', code: 'SUB' },
  { lexeme: '+', order: 5, read: 2, type: 'inteiro', return: 'inteiro', code: 'ADD' },
  { lexeme: '>', order: 4, read: 2, type: 'inteiro', return: 'booleano', code: 'CMA' },
  { lexeme: '>=', order: 4, read: 2, type: 'inteiro', return: 'booleano', code: 'CMAQ' },
  { lexeme: '<', order: 4, read: 2, type: 'inteiro', return: 'booleano', code: 'CME' },
  { lexeme: '<=', order: 4, read: 2, type: 'inteiro', return: 'booleano', code: 'CMEQ' },
  { lexeme: '=', order: 3, read: 2, type: 'ambos', return: 'booleano', code: 'CEQ' },
  { lexeme: '!=', order: 3, read: 2, type: 'ambos', return: 'booleano', code: 'CDIF' },
  { lexeme: 'e', order: 2, read: 2, type: 'booleano', return: 'booleano', code: 'AND' },
  { lexeme: 'ou', order: 1, read: 2, type: 'booleano', return: 'booleano', code: 'OR' },
];

export const TokenType = {
  PROGRAM: 1,
  VARIABLE: 2,
  BOOLEAN_FUNCTION: 3,
  INTEGER_FUNCTION: 4,
  PROCEDURE: 5,
  FUNCTION: 6,
}

export let symbolTable = [];
export let posFixExpression = [];
export let posFixStack = [];
export let posFixLevel = 0;
// export let expressionIsTrue = false;

let level = 1; // escopo

// ------------------------------------------------------ FUNÇÃO ------------------------------------------------------------

export const BlockEnum = {
  NOT_A_FUNCTION: 1,
  NOT_RETURNED: 2,
  RETURNED: 3,
}

export let returnedFunction = BlockEnum.NOT_A_FUNCTION;

export let returnedFunctionAux = BlockEnum.NOT_RETURNED;

export let functionPile = [];

// export let insideIF = 0;

// export let insideELSE = 0;

export const changeReturnedFunction = (type) => {
  returnedFunction = type;
}

export const changeAuxReturnedFunction = (type) => {
  returnedFunctionAux = type;
}

export const addInFunctionPile = (token) => functionPile.push(token);

export const removeInFunctionPile = () => functionPile.pop();

export const resetInFunctionPile = () => functionPile = [];

export const checkFunctionReturn = (token) => functionPile[functionPile.length - 1].lexeme === token;

// export const changeInsideIf = (number) => {
//   // console.log('numberIf', number);
//   insideIF = number
// };

// export const changeInsideElse = (number) => {
//   // console.log('numberElse', number);
//   insideELSE = number
// };

// ------------------------------------------------------ TABELA DE SÍMBOLOS ------------------------------------------------------------

export const resetSymbolTable = () => {
  level = 1;
  symbolTable = [];
}

export const insertInSymbolTable = (token, tokenFunc, label, variableLabel) => {
  // console.log('insertInSymbolTable', token, tokenFunc, label, variableLabel);
  symbolTable.push({
    token,
    ...(tokenFunc && { tokenFunc }), // constantes
    tokenLevel : level,
    ...(label && { label: `L${label}` }), // rotulo para geração do código
    ...(tokenFunc === TokenType.VARIABLE && { variableLabel: variableLabel + CodeGeneration.allocatedSpace })
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

  let difference = symbolTable.filter(x => !filteredSymbolTable.includes(x) && x.tokenFunc === TokenType.VARIABLE);
  // console.log('O que foi removido', difference);
  if (difference.length > 0) CodeGeneration.dallocVariable(difference.length)

  symbolTable = filteredSymbolTable;
  // console.log('depois da diminuição de nível', symbolTable);

  if (level !== 1) level -= 1;
  else console.log('ERRO NO NÍVEL!');

  // console.log('diminuiu o nível', level);
}

// pesquisa_duplic_var_tabela
export const searchDuplicateVariable = (token) => {
  const alreadyDeclared = symbolTable.slice().reverse().find((item) => item.token === token
    && ((item.tokenFunc === TokenType.VARIABLE && item.tokenLevel === level)
      || item.tokenFunc === TokenType.BOOLEAN_FUNCTION
      || item.tokenFunc === TokenType.INTEGER_FUNCTION
      || item.tokenFunc === TokenType.PROCEDURE
      || item.tokenFunc === TokenType.PROGRAM))
  return alreadyDeclared ? true : false;
}

export const searchDuplicateFunctionOrProcedure = (token) => {
  const alreadyDeclared = symbolTable.slice().reverse().find((item) => item.token === token)
  return alreadyDeclared ? true : false;
}

// pesquisa_declvarfunc_tabela
export const searchDeclarationVariableFunction = (token) => {
  const found = symbolTable.slice().reverse().find((item) => item.token === token
    && (item.tokenFunc === TokenType.BOOLEAN_FUNCTION
    || item.tokenFunc === TokenType.INTEGER_FUNCTION
    || item.tokenFunc === TokenType.VARIABLE))
  return found;
}

// pesquisa_declvarproc_tabela
export const searchDeclarationVariableProcedure = (token) => {
  const found = symbolTable.slice().reverse().find((item) => item.token === token
    && (item.tokenFunc === TokenType.PROCEDURE
      || item.tokenFunc === TokenType.VARIABLE))
  return found ? true : false;
}

// pesquisa_declvar_tabela
export const searchDeclarationVariable = (token) => { 
  const found = symbolTable.slice().reverse().find((item) => item.token === token && item.tokenFunc === TokenType.VARIABLE)
  // const found = symbolTable.find((item) => item.token === token && item.tokenLevel === level)
  return found;
}

// pesquisa_declproc_tabela
export const searchDeclarationProcedure = (token) => {
  const found = symbolTable.slice().reverse().find((item) => item.token === token && item.tokenFunc === TokenType.PROCEDURE)
  return found;
}

// pesquisa_declfunc_tabela
export const searchDeclarationFunction = (token) => {
  const found = symbolTable.slice().reverse().find((item) => item.token === token
    && (item.tokenFunc === TokenType.BOOLEAN_FUNCTION || item.tokenFunc === TokenType.INTEGER_FUNCTION))

  return found;
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
  const found = symbolTable.slice().reverse().find((item) => item.token === token)
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
  // console.log('ANTES: expressão posfix:', JSON.stringify(posFixExpression));
  // console.log('ANTES: pilha posfix:', JSON.stringify(posFixStack));
  // console.log('ANTES: novo token:', SyntacticalAnalysis.tokenList[index]);

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
      if (item.lexeme === '(' && !shouldSkip) shouldSkip = true;
      else if (!shouldSkip) posFixExpression.push(item);
      else newPosFixStack.push(item);
    });
    // console.log('newPosFixStack', newPosFixStack);
    posFixStack = newPosFixStack.reverse();
  } else if (SyntacticalAnalysis.tokenList[index].lexeme === 'nao' && posFixStack[posFixStack.length - 1].lexeme === 'nao') {
    posFixStack.push(SyntacticalAnalysis.tokenList[index]);
  } else {
    const actualTokenOrder = (posFixStack[posFixStack.length - 1].lexeme === '(' || posFixStack[posFixStack.length - 1].lexeme === ')')
      ? 0 : posFixPrecedence.find((item) => item.lexeme === posFixStack[posFixStack.length - 1].lexeme).order;
    const newTokenOrder = posFixPrecedence.find((item) => item.lexeme === ((newToken && newToken.lexeme) || SyntacticalAnalysis.tokenList[index].lexeme)).order
    if (actualTokenOrder < newTokenOrder) posFixStack.push(newToken || SyntacticalAnalysis.tokenList[index])
    else {
      let shouldSkip = false;
      let newPosFixStack = [];
      posFixStack.slice().reverse().forEach((item) => {
        if (item.lexeme === '(') {
          shouldSkip = true;
          newPosFixStack.push(item);
        }
        else if (!shouldSkip) posFixExpression.push(item);
        else newPosFixStack.push(item);
      });
      posFixStack = newPosFixStack.reverse();
      posFixStack.push(newToken || SyntacticalAnalysis.tokenList[index]);
    }
  }
  // console.log('DEPOIS: expressão posfix:', JSON.stringify(posFixExpression));
  // console.log('DEPOIS: pilha posfix:', JSON.stringify(posFixStack));
  // console.log('DEPOIS: novo token:', SyntacticalAnalysis.tokenList[index]);
}

export function posFixAnalisys() {
  // console.log('analise da posfix')
  // console.log('ANTES: expressão posfix:', JSON.stringify(posFixExpression));
  let hasOperations = true;
  let index = 0;
  // if (posFixExpression.length === 1 && posFixExpression[0].lexeme === 'verdadeiro') expressionIsTrue = true;
  // else expressionIsTrue = false;

  posFixExpression.forEach((item) => {
    const isOperator = posFixPrecedence.find((posFixItem) => posFixItem.lexeme === item.lexeme)

    if (isOperator && isOperator.code) CodeGeneration.writeOperation(isOperator.code);
    else transformTokenInCode(item)
  });

  do {
    const isOperator = posFixPrecedence.find((item) => item.lexeme === posFixExpression[index].lexeme)
    if (isOperator) {
      const operatorIndex = posFixExpression.findIndex((item) => item.lexeme === isOperator.lexeme);
      const firstToken = posFixExpression[operatorIndex - isOperator.read];

      if (!firstToken || !operatorIndex) {
        posFixExpression.length > 0 && SyntacticalAnalysis.changeLine(posFixExpression[posFixExpression.length - 1].line);
        throw new Error(`Erro - Linha ${SyntacticalAnalysis.line}: Expressão inválida`);
      }
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

  if (posFixExpression[0].symbol === 'snumero') {
    // transformTokenInCode(posFixExpression[0]);
    posFixExpression = 'inteiro';
  }
  else if (posFixExpression[0].symbol === 'sbooleano') {
    // transformTokenInCode(posFixExpression[0]);
    posFixExpression = 'booleano';
  }
  else {
    // transformTokenInCode(posFixExpression[0]);
    posFixExpression = checkInteger(posFixExpression[0]) ? 'inteiro' : 'booleano';
  }

  // console.log('DEPOIS: expressão posfix:', JSON.stringify(posFixExpression));
  // console.log('saiu da analise da posfix')
}

function unaryOperationAnalysis(unaryOperation, token, index) {
  if (unaryOperation.type === 'inteiro') {
    if (!checkInteger(token)) throw new Error(`Erro - Linha ${token.line}: A operação "${unaryOperation.lexeme}" não pode ser feita com um valor booleano`);
    transformExpressionArray(unaryOperation, unaryOperation.return, index, token)
  } else {
    if (!checkBoolean(token)) throw new Error(`Erro - Linha ${token.line}: A operação "${unaryOperation.lexeme}" não pode ser feita com um valor inteiro`);
    transformExpressionArray(unaryOperation, unaryOperation.return, index, token)
  }
}

function operationAnalysis(operation, firsToken, secondToken, index) {
  if (operation.type === 'inteiro') {
    if (!checkInteger(firsToken)) throwOperationError(operation, firsToken, 'booleano');
    if (!checkInteger(secondToken)) throwOperationError(operation, secondToken, 'booleano');

    transformExpressionArray(operation, operation.return, index, firsToken, secondToken)
  } else if (operation.type === 'booleano') {
    if (!checkBoolean(firsToken)) throwOperationError(operation, firsToken, 'inteiro');
    if (!checkBoolean(secondToken)) throwOperationError(operation, secondToken, 'inteiro');

    transformExpressionArray(operation, operation.return, index, firsToken, secondToken)
  } else {
    if (checkInteger(firsToken) && checkInteger(secondToken)) {
      transformExpressionArray(operation, operation.return, index, firsToken, secondToken)
    }
    else if (checkBoolean(firsToken) && checkBoolean(secondToken)) {
      transformExpressionArray(operation, operation.return, index, firsToken, secondToken)
    }
    else {
      SyntacticalAnalysis.changeLine(secondToken.line);
      throw new Error(`Erro - Linha ${firsToken.line}: Os tokens "${firsToken.lexeme}" e "${secondToken.lexeme}" possuem tipos diferentes`);
    }
  }
}

function throwOperationError(operation, token, type) {
  SyntacticalAnalysis.changeLine(token.line);
  throw new Error(`Erro - Linha ${token.line}: A operação "${operation.lexeme}" não pode ser feita com um valor ${type}`);
}

function transformExpressionArray(operation, type, index, token, secondToken) {
  // console.log('transformExpressionArray', operation, type, token, secondToken);
  const lastToken = secondToken || token;

  // transformTokenInCode(token);
  // if (secondToken) transformTokenInCode(secondToken)

  // if (operation.code) CodeGeneration.writeOperation(operation.code, 'Operação da expressão');
  posFixExpression.splice(index - operation.read, operation.read + 1, { symbol: `s${type}`, lexeme: type, line: lastToken.line });
  // console.log('após transformExpressionArray', posFixExpression);
}

function checkBoolean(token) {
  let response = true;
  if (token.lexeme !== 'verdadeiro' && token.lexeme !== 'falso' && token.lexeme !== 'booleano') {
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

function transformTokenInCode(token) {
  // console.log('transformTokenInCode', token)
  if (token.symbol === 'snumero') CodeGeneration.ldc(token.lexeme);
  else if (token.symbol === 'sverdadeiro') CodeGeneration.ldc(1);
  else if (token.symbol === 'sfalso') CodeGeneration.ldc(0);
  else if (token.symbol === 'sidentificador' && token.variablePosition) CodeGeneration.ldv(token.variablePosition)
  else if (token.symbol === 'sidentificador' && token.label) {
    CodeGeneration.callFunctionOrProcedure(token.label)
    CodeGeneration.ldv(0)
  }
  else console.log('VALOR NÃO TRANSFORMADO');
}
