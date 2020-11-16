import * as SyntacticValidation from './validations';
import * as SymbolTable from '../symbolTable';

export let index = 0;
export let line = 0;
export let tokenList = [];
export let posFixExpression = [];
export let posFixPile = [];
export let posFixLevel = 0;

const posFixPrecedence = [
  { lexeme: '-u', order: 7, read: 1, type: 'inteiro' },  
  { lexeme: '+u', order: 7, read: 1, type: 'inteiro' }, 
  { lexeme: 'nao', order: 7, read: 1, type: 'booleano' },
  { lexeme: '*', order: 6, read: 2, type: 'inteiro' },   
  { lexeme: 'div', order: 6, read: 2, type: 'inteiro' },
  { lexeme: '-', order: 5, read: 2, type: 'inteiro' },
  { lexeme: '+', order: 5, read: 2, type: 'inteiro' },
  { lexeme: '>', order: 4, read: 2, type: 'inteiro' },
  { lexeme: '>=', order: 4, read: 2, type: 'inteiro' },
  { lexeme: '<', order: 4, read: 2, type: 'inteiro' },
  { lexeme: '<=', order: 4, read: 2, type: 'inteiro' },
  { lexeme: '=', order: 3, read: 2, type: 'ambos' },
  { lexeme: '!=', order: 3, read: 2, type: 'ambos' },
  { lexeme: 'e', order: 2, read: 2, type: 'booleano' },
  { lexeme: 'ou', order: 1, read: 2, type: 'booleano' },
];

function verifyPrecedence(newToken) {
  if (posFixPile.length === 0 && tokenList[index].lexeme !== '(' && tokenList[index].lexeme !== ')') {
    posFixPile.push(newToken || tokenList[index].lexeme)
  }
  else if (tokenList[index].lexeme === '(') {
    posFixPile.push(tokenList[index].lexeme);
  }
  else if (tokenList[index].lexeme === ')') {
    let shouldSkip = false;
    let newPosFixPile = [];
    posFixPile.slice().reverse().forEach((item) => {
      if (item === '(') shouldSkip = true;
      else if (!shouldSkip) posFixExpression.push(item);
      else newPosFixPile.push(item);
    });
    posFixPile = newPosFixPile.reverse();
  } else {
    const actualTokenOrder = (posFixPile[posFixPile.length - 1] === '(' || posFixPile[posFixPile.length - 1] === ')')
      ? 0 : posFixPrecedence.find((item) => item.lexeme === posFixPile[posFixPile.length - 1]).order;
    const newTokenOrder = posFixPrecedence.find((item) => item.lexeme === (newToken || tokenList[index].lexeme)).order
    if (actualTokenOrder < newTokenOrder) posFixPile.push(newToken || tokenList[index].lexeme)
    else {
      posFixPile.slice().reverse().forEach((item) => posFixExpression.push(item));
      posFixPile = [newToken || tokenList[index].lexeme];
    }
  }
}

function posFixAnalisys() {
  console.log('analise da posfix')
  console.log('expressão posfix:', posFixExpression);
  console.log('pilha posfix:', posFixPile);

  posFixPile = [];
  posFixExpression = [];
  console.log('saiu da analise da posfix')
}

export const reset = () => {
  index = 0;
  line = 0;
}

function lerToken() {
  index += 1;
  if (tokenList.length <= index) throw new Error(`Erro - Linha ${line}: Arquivo chegou no fim, porém não foi encontrado o ponto`);
  else if (tokenList[index].symbol === 'Erro') throw new Error(`Erro - Linha ${line}: ${tokenList[index].lexeme}`);
  line = tokenList[index].line;
}

function typeAnalysis() { 
  if (!SyntacticValidation.integerValidation(tokenList[index]) && !SyntacticValidation.booleanValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado inteiro ou booleano, porem encontrado ${tokenList[index].lexeme}`);

  SymbolTable.insertTypeInSymbolTable(tokenList[index].lexeme);
  lerToken();
}

function varAnalysis() {
  do {
    if (!SyntacticValidation.identifierValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado um identificador, porem encontrado ${tokenList[index].lexeme}`);

    const isDuplicate = SymbolTable.searchDuplicateVariable(tokenList[index].lexeme)
    if (isDuplicate) throw new Error(`Erro - Linha ${line}: O identificador "${tokenList[index].lexeme}" já foi declarado!`);

    SymbolTable.insertInSymbolTable(tokenList[index].lexeme, SymbolTable.TokenType.VARIABLE);
    lerToken();

    if (!SyntacticValidation.commaValidation(tokenList[index]) && !SyntacticValidation.doublePointValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado virgula ou dois pontos, porem encontrado ${tokenList[index].lexeme}`);

    if (SyntacticValidation.commaValidation(tokenList[index])) {
      lerToken();
      
      if (SyntacticValidation.doublePointValidation(tokenList[index])) 
        throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);
    }
  } while (!SyntacticValidation.doublePointValidation(tokenList[index]));

  lerToken();

  typeAnalysis();
}

function etVarAnalysis() {
  if (!SyntacticValidation.varValidation(tokenList[index])) return;

  lerToken();

  if (!SyntacticValidation.identifierValidation(tokenList[index])) 
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);
  
  while (SyntacticValidation.identifierValidation(tokenList[index])) {
    varAnalysis();
    
    if (!SyntacticValidation.semicolonValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`); 
      
    lerToken();
  }
}

function subroutineDeclarationAnalysis() {
  lerToken();

  SymbolTable.increaseLevel();

  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);

  const found = SymbolTable.searchDuplicateFunctionOrProcedure(tokenList[index].lexeme);
  if (found) throw new Error(`Erro - Linha ${line}: O nome do procedimento "${tokenList[index].lexeme}" já foi declarado!`);

  SymbolTable.insertInSymbolTable(tokenList[index].lexeme, SymbolTable.TokenType.PROCEDURE)

  lerToken();

  if (!SyntacticValidation.semicolonValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`);

  blockAnalisys();

  SymbolTable.decreaseLevel();
}

function functionDeclarationAnalysis() {
  lerToken();

  SymbolTable.increaseLevel();

  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);

  const found = SymbolTable.searchDuplicateFunctionOrProcedure(tokenList[index].lexeme);
  if (found) throw new Error(`Erro - Linha ${line}: O nome da função "${tokenList[index].lexeme}" já foi declarado!`);

  SymbolTable.insertInSymbolTable(tokenList[index].lexeme, SymbolTable.TokenType.FUNCTION)

  lerToken();

  if (!SyntacticValidation.doublePointValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado dois pontos, porem encontrado ${tokenList[index].lexeme}`);
  
  lerToken();

  if (!SyntacticValidation.booleanValidation(tokenList[index]) && !SyntacticValidation.integerValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado booleano ou inteiro, porem encontrado ${tokenList[index].lexeme}`);

  if (SyntacticValidation.booleanValidation(tokenList[index])) {
      SymbolTable.changeFunctionType(SymbolTable.TokenType.BOOLEAN_FUNCTION);
  } else {
      SymbolTable.changeFunctionType(SymbolTable.TokenType.INTEGER_FUNCTION);
  }

  lerToken();

  if (SyntacticValidation.semicolonValidation(tokenList[index])) blockAnalisys();

  SymbolTable.decreaseLevel();
}

function subroutineAnalysis() {
  while (SyntacticValidation.procedureValidation(tokenList[index]) || SyntacticValidation.functionValidation(tokenList[index])) {
    if (SyntacticValidation.procedureValidation(tokenList[index])) subroutineDeclarationAnalysis();
    else functionDeclarationAnalysis();

    if (!SyntacticValidation.semicolonValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`);
  
    lerToken();
  }
}

function expressionAnalysis() {
  simpleExpressionAnalysis();

  if (SyntacticValidation.biggerValidation(tokenList[index])
      || SyntacticValidation.bigEqualValidation(tokenList[index])
      || SyntacticValidation.equalValidation(tokenList[index])
      || SyntacticValidation.lowerValidation(tokenList[index])
      || SyntacticValidation.lowerEqualValidation(tokenList[index])
      || SyntacticValidation.diffValidation(tokenList[index])) {

    verifyPrecedence(); 

    lerToken();
     
    simpleExpressionAnalysis();
  }

  if (posFixLevel === 0) {
    posFixPile.slice().reverse().forEach((item) => posFixExpression.push(item));

    posFixAnalisys();
  } else posFixLevel -= 1;
}

function simpleExpressionAnalysis() {
  if (SyntacticValidation.plusValidation(tokenList[index])
    || SyntacticValidation.minusValidation(tokenList[index])) {
    
    if (SyntacticValidation.plusValidation(tokenList[index])) verifyPrecedence('+u');
    else verifyPrecedence('-u');
    lerToken();
  }
  
  termAnalisys();

  while (SyntacticValidation.plusValidation(tokenList[index])
      || SyntacticValidation.minusValidation(tokenList[index])
      || SyntacticValidation.orValidation(tokenList[index])) {

    verifyPrecedence();
    
    lerToken();

    termAnalisys();
  }
}

export function factorAnalisys() {
  if (SyntacticValidation.identifierValidation(tokenList[index])) {
    const identifierFound = SymbolTable.searchTable(tokenList[index].lexeme);

    if (!identifierFound || (identifierFound.tokenFunc !== SymbolTable.TokenType.VARIABLE
      && identifierFound.tokenFunc !== SymbolTable.TokenType.BOOLEAN_FUNCTION
      && identifierFound.tokenFunc !== SymbolTable.TokenType.INTEGER_FUNCTION))
      throw new Error(`Erro - Linha ${line}: O fator "${tokenList[index].lexeme}" não foi declarado`);

    if (identifierFound.tokenFunc === SymbolTable.TokenType.VARIABLE) {
      posFixExpression.push(tokenList[index].lexeme);

      lerToken();
    }
    else {
      posFixExpression.push(tokenList[index].lexeme);

      functionCallAnalisys();
    }
  }

  else if (SyntacticValidation.numberValidation(tokenList[index])) {
    posFixExpression.push(tokenList[index].lexeme);

    lerToken();
  }

  else if (SyntacticValidation.notValidation(tokenList[index])) {
    verifyPrecedence();

    lerToken();

    factorAnalisys();
  } else if (SyntacticValidation.openBracketValidation(tokenList[index])) {
    verifyPrecedence();

    lerToken();

    posFixLevel += 1;
    expressionAnalysis();

    if (!SyntacticValidation.closeBracketValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado fecha parênteses, porem encontrado ${tokenList[index].lexeme}`);

    verifyPrecedence();

    lerToken();
  } else if (SyntacticValidation.trueValidation(tokenList[index]) || SyntacticValidation.falseValidation(tokenList[index])) {
    posFixExpression.push(tokenList[index].lexeme);

    lerToken();
  } else throw new Error(`Erro - Linha ${line}: Esperado um fator, porem encontrado ${tokenList[index].lexeme}`);
}

export function termAnalisys() {
  factorAnalisys();

  while (SyntacticValidation.multValidation(tokenList[index])
    || SyntacticValidation.divValidation(tokenList[index])
    || SyntacticValidation.andValidation(tokenList[index])) {
    verifyPrecedence();

    lerToken();

    factorAnalisys();
  }
}

export function procedureAnalysis() {}

export function functionCallAnalisys() {
  lerToken();
}

export function assignmentAnalysis() {
  lerToken();
  
  expressionAnalysis();
}

function assignmentOrProcedureAnalysis() {
  lerToken();

  if (SyntacticValidation.assignmentValidation(tokenList[index])) assignmentAnalysis();
  else procedureAnalysis();
}

function ifAnalysis() {
  lerToken();
  
  expressionAnalysis();
  if (SyntacticValidation.elseValidation(tokenList[index])) {
    
    lerToken();

    simpleCommandAnalysis();
    if (SyntacticValidation.elseIfValidation(tokenList[index])) {
      lerToken();
      
      simpleCommandAnalysis();
    }
  }
}

function whileAnalysis() {
  lerToken();

  expressionAnalysis();

  if (!SyntacticValidation.doValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado um fator, porem encontrado ${tokenList[index].lexeme}`);

  lerToken();
  
  simpleCommandAnalysis();
}

function readAnalysis() {
  lerToken();

  if (!SyntacticValidation.openBracketValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado abre parênteses, porem encontrado ${tokenList[index].lexeme}`);
  
  lerToken();
  
  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);

  if (!SymbolTable.searchDeclarationVariable(tokenList[index].lexeme))
    throw new Error(`Erro - Linha ${line}: Não foi encontrado nenhuma variável "${tokenList[index].lexeme}"`);

  lerToken();

  if (!SyntacticValidation.closeBracketValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado fecha parênteses, porem encontrado ${tokenList[index].lexeme}`);
  
  lerToken();
}

function writeAnalysis() {
  lerToken();

  if (!SyntacticValidation.openBracketValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado abre parênteses, porem encontrado ${tokenList[index].lexeme}`);

  lerToken();

  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);
  
  if (!SymbolTable.searchDeclarationVariableFunction(tokenList[index].lexeme))
    throw new Error(`Erro - Linha ${line}: Não foi encontrado nenhuma variável ou função com nome "${tokenList[index].lexeme}"`);

  lerToken();

  if (!SyntacticValidation.closeBracketValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado fecha parênteses, porem encontrado ${tokenList[index].lexeme}`);

  lerToken();
}

function simpleCommandAnalysis() {
  if (SyntacticValidation.identifierValidation(tokenList[index])) {
    if (!SymbolTable.searchDeclarationVariableProcedure(tokenList[index].lexeme))
      throw new Error(`Erro - Linha ${line}: O identificador "${tokenList[index].lexeme}" não foi declarado`);

    assignmentOrProcedureAnalysis();
  }

  else if (SyntacticValidation.ifValidation(tokenList[index])) ifAnalysis();

  else if (SyntacticValidation.whileValidation(tokenList[index])) whileAnalysis();

  else if (SyntacticValidation.readValidation(tokenList[index])) readAnalysis();

  else if (SyntacticValidation.writeValidation(tokenList[index])) writeAnalysis();

  else commandAnalysis();
}

function commandAnalysis() {
  if (!SyntacticValidation.initValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado inicio, porem encontrado ${tokenList[index].lexeme}`);

  lerToken();

  simpleCommandAnalysis();

  while (!SyntacticValidation.endValidation(tokenList[index])) {
    if (!SyntacticValidation.semicolonValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`);
    
    lerToken();
    if (!SyntacticValidation.endValidation(tokenList[index])) simpleCommandAnalysis();
  }

  lerToken();
}

function blockAnalisys() {
  lerToken();

  etVarAnalysis();

  subroutineAnalysis();

  commandAnalysis();
}

export function initSyntacticalAnalisys(lexicalTokenList) {
  tokenList = lexicalTokenList;
  line = tokenList[index].line;
  if (!SyntacticValidation.initialValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado comando ínicio, porem encontrado comando ${tokenList[index].lexeme}`);

  lerToken();

  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);

  SymbolTable.insertInSymbolTable(tokenList[index].lexeme, SymbolTable.TokenType.PROGRAM)
  
  lerToken();

  if (!SyntacticValidation.semicolonValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado  ${tokenList[index].lexeme}`);

  blockAnalisys();

  if (SyntacticValidation.pointValidation(tokenList[index])) {
    if (index !== tokenList.length - 1) throw new Error(`Erro - Linha ${line}: Tokens existentes após o ponto`);
  } else throw new Error(`Erro - Linha ${line}: Não encontrado ponto no fim do arquivo`);
}
