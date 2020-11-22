import * as SyntacticValidation from './validations';
import * as SemanticAnalysis from '../semantic';

export let index = 0;
export let line = 0;
export let tokenList = [];

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

  SemanticAnalysis.insertTypeInSymbolTable(tokenList[index].lexeme);
  lerToken();
}

function varAnalysis() {
  do {
    if (!SyntacticValidation.identifierValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado um identificador, porem encontrado ${tokenList[index].lexeme}`);

    const isDuplicate = SemanticAnalysis.searchDuplicateVariable(tokenList[index].lexeme)
    if (isDuplicate) throw new Error(`Erro - Linha ${line}: O identificador "${tokenList[index].lexeme}" já foi declarado!`);

    SemanticAnalysis.insertInSymbolTable(tokenList[index].lexeme, SemanticAnalysis.TokenType.VARIABLE);
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

  SemanticAnalysis.increaseLevel();

  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);

  const found = SemanticAnalysis.searchDuplicateFunctionOrProcedure(tokenList[index].lexeme);
  if (found) throw new Error(`Erro - Linha ${line}: O nome do procedimento "${tokenList[index].lexeme}" já foi declarado!`);

  SemanticAnalysis.insertInSymbolTable(tokenList[index].lexeme, SemanticAnalysis.TokenType.PROCEDURE)

  lerToken();

  if (!SyntacticValidation.semicolonValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`);

  blockAnalisys();

  SemanticAnalysis.decreaseLevel();
}

function functionDeclarationAnalysis() {
  lerToken();

  SemanticAnalysis.increaseLevel();

  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);

  const found = SemanticAnalysis.searchDuplicateFunctionOrProcedure(tokenList[index].lexeme);
  if (found) throw new Error(`Erro - Linha ${line}: O nome da função "${tokenList[index].lexeme}" já foi declarado!`);

  SemanticAnalysis.insertInSymbolTable(tokenList[index].lexeme, SemanticAnalysis.TokenType.FUNCTION)
  SemanticAnalysis.changeReturnedFunction(SemanticAnalysis.BlockEnum.NOT_RETURNED);
  SemanticAnalysis.addInFunctionPile({ lexeme: tokenList[index].lexeme, tokenFunc: SemanticAnalysis.TokenType.FUNCTION });
  console.log('functionPile', SemanticAnalysis.functionPile);

  lerToken();

  if (!SyntacticValidation.doublePointValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado dois pontos, porem encontrado ${tokenList[index].lexeme}`);
  
  lerToken();

  if (!SyntacticValidation.booleanValidation(tokenList[index]) && !SyntacticValidation.integerValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado booleano ou inteiro, porem encontrado ${tokenList[index].lexeme}`);

  if (SyntacticValidation.booleanValidation(tokenList[index])) {
      SemanticAnalysis.changeFunctionType(SemanticAnalysis.TokenType.BOOLEAN_FUNCTION);
  } else {
      SemanticAnalysis.changeFunctionType(SemanticAnalysis.TokenType.INTEGER_FUNCTION);
  }

  lerToken();

  if (SyntacticValidation.semicolonValidation(tokenList[index])) blockAnalisys();

  if (SemanticAnalysis.returnedFunction === SemanticAnalysis.BlockEnum.NOT_RETURNED)
    throw new Error(`Erro - Linha ${line}: Não foi encontrado o retorno para a função.`);

  SemanticAnalysis.changeReturnedFunction(SemanticAnalysis.BlockEnum.NOT_A_FUNCTION);
  SemanticAnalysis.removeInFunctionPile();
  SemanticAnalysis.decreaseLevel();
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

  while (SyntacticValidation.biggerValidation(tokenList[index])
      || SyntacticValidation.bigEqualValidation(tokenList[index])
      || SyntacticValidation.equalValidation(tokenList[index])
      || SyntacticValidation.lowerValidation(tokenList[index])
      || SyntacticValidation.lowerEqualValidation(tokenList[index])
      || SyntacticValidation.diffValidation(tokenList[index])) {

    SemanticAnalysis.verifyPrecedence(); 

    lerToken();
     
    simpleExpressionAnalysis();
  }

  if (SemanticAnalysis.posFixLevel === 0) {
    SemanticAnalysis.posFixStack.slice().reverse().forEach((item) => {
      if (item.lexeme !== '(' && item.lexeme !== ')') SemanticAnalysis.posFixExpression.push(item)
    });

    SemanticAnalysis.posFixAnalisys();
  } else SemanticAnalysis.changePosFix(SemanticAnalysis.posFixLevel - 1);
}

function simpleExpressionAnalysis() {
  if (SyntacticValidation.plusValidation(tokenList[index])
    || SyntacticValidation.minusValidation(tokenList[index])) {
    
    if (SyntacticValidation.plusValidation(tokenList[index])) SemanticAnalysis.verifyPrecedence({ symbol: 'smais_unario', lexeme: '+u', line });
    else SemanticAnalysis.verifyPrecedence({ symbol: 'smenos_unario', lexeme: '-u', line });
    lerToken();
  }
  
  termAnalisys();

  while (SyntacticValidation.plusValidation(tokenList[index])
      || SyntacticValidation.minusValidation(tokenList[index])
      || SyntacticValidation.orValidation(tokenList[index])) {

    SemanticAnalysis.verifyPrecedence();
    
    lerToken();

    termAnalisys();
  }
}

export function factorAnalisys() {
  // console.log('factor', tokenList[index])
  if (SyntacticValidation.identifierValidation(tokenList[index])) {
    const identifierFound = SemanticAnalysis.searchTable(tokenList[index].lexeme);

    if (!identifierFound || (identifierFound.tokenFunc !== SemanticAnalysis.TokenType.VARIABLE
      && identifierFound.tokenFunc !== SemanticAnalysis.TokenType.BOOLEAN_FUNCTION
      && identifierFound.tokenFunc !== SemanticAnalysis.TokenType.INTEGER_FUNCTION))
      throw new Error(`Erro - Linha ${line}: O fator "${tokenList[index].lexeme}" não foi declarado`);

    if (identifierFound.tokenFunc === SemanticAnalysis.TokenType.VARIABLE) {
      SemanticAnalysis.posFixExpression.push(tokenList[index]);

      lerToken();
    }
    else {
      SemanticAnalysis.posFixExpression.push(tokenList[index]);

      functionCallAnalisys();
    }
  }

  else if (SyntacticValidation.numberValidation(tokenList[index])) {
    SemanticAnalysis.posFixExpression.push(tokenList[index]);

    lerToken();
  }

  else if (SyntacticValidation.notValidation(tokenList[index])) {
    SemanticAnalysis.verifyPrecedence();

    lerToken();

    factorAnalisys();
  } else if (SyntacticValidation.openBracketValidation(tokenList[index])) {
    SemanticAnalysis.verifyPrecedence();

    lerToken();

    SemanticAnalysis.changePosFix(SemanticAnalysis.posFixLevel + 1);
    expressionAnalysis();

    if (!SyntacticValidation.closeBracketValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado fecha parênteses, porem encontrado ${tokenList[index].lexeme}`);

    SemanticAnalysis.verifyPrecedence();

    lerToken();
  } else if (SyntacticValidation.trueValidation(tokenList[index]) || SyntacticValidation.falseValidation(tokenList[index])) {
    SemanticAnalysis.posFixExpression.push(tokenList[index]);

    lerToken();
  } else throw new Error(`Erro - Linha ${line}: Esperado um fator, porem encontrado ${tokenList[index].lexeme}`);
}

export function termAnalisys() {
  factorAnalisys();

  while (SyntacticValidation.multValidation(tokenList[index])
    || SyntacticValidation.divValidation(tokenList[index])
    || SyntacticValidation.andValidation(tokenList[index])) {
    SemanticAnalysis.verifyPrecedence();

    lerToken();

    factorAnalisys();
  }
}

export function procedureAnalysis() {}

export function functionCallAnalisys() {
  lerToken();
}

export function assignmentAnalysis() {
  const identifier = tokenList[index - 1];

  const changeReturnedFunction = (SemanticAnalysis.insideIF && SemanticAnalysis.expressionIsTrue) || !SemanticAnalysis.insideIF;
  
  const isFunction = { response: SemanticAnalysis.searchDeclarationFunction(identifier.lexeme), index, line };

  const isVariable = { response: SemanticAnalysis.searchDeclarationVariable(identifier.lexeme), line };

  lerToken();
   
  expressionAnalysis();

  // console.log(SemanticAnalysis.posFixExpression, ' --> SemanticAnalysis.posFixExpression');
  // console.log('isFunction', isFunction)
  // console.log('isVariable', isVariable)

  if (isFunction.response) {
    if (!SemanticAnalysis.checkFunctionReturn(isFunction.response.token)) {
      index = isFunction.index;
      throw new Error(`Erro - Linha ${isFunction.line}: O retorno da função ${isFunction.response.token} está declarado em lugar errado`);
    }

    if (isFunction.response.tokenFunc === SemanticAnalysis.TokenType.BOOLEAN_FUNCTION) {
      if (SemanticAnalysis.posFixExpression === 'inteiro')
        throw new Error(`Erro - Linha ${isFunction.line}: O retorno da função ${isFunction.response.token} não pode ser um valor inteiro`);
    } else {
      if (SemanticAnalysis.posFixExpression === 'booleano')
        throw new Error(`Erro - Linha ${isFunction.line}: O retorno da função ${isFunction.response.token} não pode ser um valor booleano`);
    }

    // console.log('line', line);
    // console.log('SemanticAnalysis.insideIF', SemanticAnalysis.insideIF);
    // console.log('SemanticAnalysis.returnedFunction', SemanticAnalysis.returnedFunction);
    // if (SemanticAnalysis.returnedFunction === SemanticAnalysis.BlockEnum.RETURNED)
    //   throw new Error(`Erro - Linha ${line}: Função já possui um retorno`);
    console.log('Retorno da função');
    if (changeReturnedFunction) SemanticAnalysis.changeReturnedFunction(SemanticAnalysis.BlockEnum.RETURNED);
  } else if (isVariable.response) {

    if (isVariable.response.tokenType === 'booleano') {
      if (SemanticAnalysis.posFixExpression === 'inteiro')
        throw new Error(`Erro - Linha ${isVariable.line}: A variável ${isVariable.response.token} não pode receber um valor inteiro`);
    } else {
      if (SemanticAnalysis.posFixExpression === 'booleano')
        throw new Error(`Erro - Linha ${isVariable.line}: A variável ${isVariable.response.token} não pode receber um valor booleano`);
    }
  } else throw new Error(`Erro - Linha ${line}: O identificador que está recebendo a atribuição não é nem uma função nem uma variável`);
  
  SemanticAnalysis.resetPosFix();
}

function assignmentOrProcedureAnalysis() {
  lerToken();

  if (SyntacticValidation.assignmentValidation(tokenList[index])) {
    if (!SemanticAnalysis.searchDeclarationVariableFunction(tokenList[index - 1].lexeme)) {
      index -= 1;
      throw new Error(`Erro - Linha ${line}: O identificador "${tokenList[index].lexeme}" não é uma função ou uma variável`);
    }
    assignmentAnalysis();
  }
  else {
    if (!SemanticAnalysis.searchDeclarationProcedure(tokenList[index - 1].lexeme)) {
      index -= 1;
      throw new Error(`Erro - Linha ${line}: O identificador "${tokenList[index].lexeme}" não é um procedimento`);
    }
    procedureAnalysis();
  }
}

function ifAnalysis() {
  lerToken();
  console.log('ENTROU NO IF')
  SemanticAnalysis.changeInsideIf(true);

  expressionAnalysis();
  console.log('CONDIÇÃO DO IF É:', SemanticAnalysis.posFixExpression);
  if (SemanticAnalysis.posFixExpression !== 'booleano')
    throw new Error(`Erro - Linha ${line}: Condição do comando "se" não pode ser do tipo inteiro`);

  SemanticAnalysis.resetPosFix();

  if (SyntacticValidation.elseValidation(tokenList[index])) {
    lerToken();

    simpleCommandAnalysis();

    SemanticAnalysis.changeInsideIf(false);

    if (SyntacticValidation.elseIfValidation(tokenList[index])) {
      lerToken();
      
      simpleCommandAnalysis();
    }
  }
}

function whileAnalysis() {
  lerToken();

  expressionAnalysis();

  if (SemanticAnalysis.posFixExpression !== 'booleano')
    throw new Error(`Erro - Linha ${line}: Condição do comando "enquanto" não pode ser do tipo inteiro`);

  SemanticAnalysis.resetPosFix();

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

  if (!SemanticAnalysis.searchDeclarationVariable(tokenList[index].lexeme))
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
  
  if (!SemanticAnalysis.searchDeclarationVariableFunction(tokenList[index].lexeme))
    throw new Error(`Erro - Linha ${line}: Não foi encontrado nenhuma variável ou função com nome "${tokenList[index].lexeme}"`);

  lerToken();

  if (!SyntacticValidation.closeBracketValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado fecha parênteses, porem encontrado ${tokenList[index].lexeme}`);

  lerToken();
}

function simpleCommandAnalysis() {
  if (SyntacticValidation.identifierValidation(tokenList[index])) assignmentOrProcedureAnalysis();

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

  if (SemanticAnalysis.returnedFunction === SemanticAnalysis.BlockEnum.RETURNED) 
    throw new Error(`Erro - Linha ${line}: Encontrado comando após o retorno da função!`);
  
  simpleCommandAnalysis();

  while (!SyntacticValidation.endValidation(tokenList[index])) {
    if (!SyntacticValidation.semicolonValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`);
    
    lerToken();

    if (!SyntacticValidation.endValidation(tokenList[index])) {
      if (SemanticAnalysis.returnedFunction === SemanticAnalysis.BlockEnum.RETURNED)
        throw new Error(`Erro - Linha ${line}: Encontrado comando após o retorno da função!`);

      simpleCommandAnalysis();
    }
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

  SemanticAnalysis.insertInSymbolTable(tokenList[index].lexeme, SemanticAnalysis.TokenType.PROGRAM)
    
  lerToken();

  if (!SyntacticValidation.semicolonValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado  ${tokenList[index].lexeme}`);

  blockAnalisys();

  if (SyntacticValidation.pointValidation(tokenList[index])) {
    if (index !== tokenList.length - 1) throw new Error(`Erro - Linha ${line}: Tokens existentes após o ponto`);
  } else throw new Error(`Erro - Linha ${line}: Não encontrado ponto no fim do arquivo`);
}
