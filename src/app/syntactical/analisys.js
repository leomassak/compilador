import * as SyntacticValidation from './validations';
import * as SemanticAnalisys from '../semantic';

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

  SemanticAnalisys.insertTypeInSymbolTable(tokenList[index].lexeme);
  lerToken();
}

function varAnalysis() {
  do {
    if (!SyntacticValidation.identifierValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado um identificador, porem encontrado ${tokenList[index].lexeme}`);

    const isDuplicate = SemanticAnalisys.searchDuplicateVariable(tokenList[index].lexeme)
    if (isDuplicate) throw new Error(`Erro - Linha ${line}: O identificador "${tokenList[index].lexeme}" já foi declarado!`);

    SemanticAnalisys.insertInSymbolTable(tokenList[index].lexeme, SemanticAnalisys.TokenType.VARIABLE);
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

  SemanticAnalisys.increaseLevel();

  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);

  const found = SemanticAnalisys.searchDuplicateFunctionOrProcedure(tokenList[index].lexeme);
  if (found) throw new Error(`Erro - Linha ${line}: O nome do procedimento "${tokenList[index].lexeme}" já foi declarado!`);

  SemanticAnalisys.insertInSymbolTable(tokenList[index].lexeme, SemanticAnalisys.TokenType.PROCEDURE)

  lerToken();

  if (!SyntacticValidation.semicolonValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`);

  blockAnalisys();

  SemanticAnalisys.decreaseLevel();
}

function functionDeclarationAnalysis() {
  lerToken();

  SemanticAnalisys.increaseLevel();

  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);

  const found = SemanticAnalisys.searchDuplicateFunctionOrProcedure(tokenList[index].lexeme);
  if (found) throw new Error(`Erro - Linha ${line}: O nome da função "${tokenList[index].lexeme}" já foi declarado!`);

  SemanticAnalisys.insertInSymbolTable(tokenList[index].lexeme, SemanticAnalisys.TokenType.FUNCTION)

  lerToken();

  if (!SyntacticValidation.doublePointValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado dois pontos, porem encontrado ${tokenList[index].lexeme}`);
  
  lerToken();

  if (!SyntacticValidation.booleanValidation(tokenList[index]) && !SyntacticValidation.integerValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado booleano ou inteiro, porem encontrado ${tokenList[index].lexeme}`);

  if (SyntacticValidation.booleanValidation(tokenList[index])) {
      SemanticAnalisys.changeFunctionType(SemanticAnalisys.TokenType.BOOLEAN_FUNCTION);
  } else {
      SemanticAnalisys.changeFunctionType(SemanticAnalisys.TokenType.INTEGER_FUNCTION);
  }

  lerToken();

  if (SyntacticValidation.semicolonValidation(tokenList[index])) blockAnalisys();

  SemanticAnalisys.decreaseLevel();
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

    SemanticAnalisys.verifyPrecedence(); 

    lerToken();
     
    simpleExpressionAnalysis();
  }

  if (SemanticAnalisys.posFixLevel === 0) {
    SemanticAnalisys.posFixStack.slice().reverse().forEach((item) => {
      if (item.lexeme !== '(' && item.lexeme !== ')') SemanticAnalisys.posFixExpression.push(item)
    });

    SemanticAnalisys.posFixAnalisys();
  } else SemanticAnalisys.changePosFix(SemanticAnalisys.posFixLevel - 1);
}

function simpleExpressionAnalysis() {
  if (SyntacticValidation.plusValidation(tokenList[index])
    || SyntacticValidation.minusValidation(tokenList[index])) {
    
    if (SyntacticValidation.plusValidation(tokenList[index])) SemanticAnalisys.verifyPrecedence({ symbol: 'smais_unario', lexeme: '+u', line });
    else SemanticAnalisys.verifyPrecedence({ symbol: 'smenos_unario', lexeme: '-u', line });
    lerToken();
  }
  
  termAnalisys();

  while (SyntacticValidation.plusValidation(tokenList[index])
      || SyntacticValidation.minusValidation(tokenList[index])
      || SyntacticValidation.orValidation(tokenList[index])) {

    SemanticAnalisys.verifyPrecedence();
    
    lerToken();

    termAnalisys();
  }
}

export function factorAnalisys() {
  if (SyntacticValidation.identifierValidation(tokenList[index])) {
    const identifierFound = SemanticAnalisys.searchTable(tokenList[index].lexeme);

    if (!identifierFound || (identifierFound.tokenFunc !== SemanticAnalisys.TokenType.VARIABLE
      && identifierFound.tokenFunc !== SemanticAnalisys.TokenType.BOOLEAN_FUNCTION
      && identifierFound.tokenFunc !== SemanticAnalisys.TokenType.INTEGER_FUNCTION))
      throw new Error(`Erro - Linha ${line}: O fator "${tokenList[index].lexeme}" não foi declarado`);

    if (identifierFound.tokenFunc === SemanticAnalisys.TokenType.VARIABLE) {
      SemanticAnalisys.posFixExpression.push(tokenList[index]);

      lerToken();
    }
    else {
      SemanticAnalisys.posFixExpression.push(tokenList[index]);

      functionCallAnalisys();
    }
  }

  else if (SyntacticValidation.numberValidation(tokenList[index])) {
    SemanticAnalisys.posFixExpression.push(tokenList[index]);

    lerToken();
  }

  else if (SyntacticValidation.notValidation(tokenList[index])) {
    SemanticAnalisys.verifyPrecedence();

    lerToken();

    factorAnalisys();
  } else if (SyntacticValidation.openBracketValidation(tokenList[index])) {
    SemanticAnalisys.verifyPrecedence();

    lerToken();

    SemanticAnalisys.changePosFix(SemanticAnalisys.posFixLevel + 1);
    expressionAnalysis();

    if (!SyntacticValidation.closeBracketValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado fecha parênteses, porem encontrado ${tokenList[index].lexeme}`);

    SemanticAnalisys.verifyPrecedence();

    lerToken();
  } else if (SyntacticValidation.trueValidation(tokenList[index]) || SyntacticValidation.falseValidation(tokenList[index])) {
    SemanticAnalisys.posFixExpression.push(tokenList[index]);

    lerToken();
  } else throw new Error(`Erro - Linha ${line}: Esperado um fator, porem encontrado ${tokenList[index].lexeme}`);
}

export function termAnalisys() {
  factorAnalisys();

  while (SyntacticValidation.multValidation(tokenList[index])
    || SyntacticValidation.divValidation(tokenList[index])
    || SyntacticValidation.andValidation(tokenList[index])) {
    SemanticAnalisys.verifyPrecedence();

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

  const isFunction = { response: SemanticAnalisys.searchDeclarationFunction(identifier.lexeme), index, line };

  const isVariable = { response: SemanticAnalisys.searchDeclarationVariable(identifier.lexeme), line };

  lerToken();
   
  expressionAnalysis();
  // console.log(SemanticAnalisys.posFixExpression, ' --> SemanticAnalisys.posFixExpression');
  // console.log('isFunction', isFunction)
  // console.log('isVariable', isVariable)

  if (isFunction.response) {
    if (!SemanticAnalisys.checkFunctionReturn(isFunction.response.token)) {
      index = isFunction.index;
      throw new Error(`Erro - Linha ${isFunction.line}: O retorno da função ${isFunction.response.token} está declarado em lugar errado`);
    }

    if (isFunction.response.tokenFunc === SemanticAnalisys.TokenType.BOOLEAN_FUNCTION) {
      if (SemanticAnalisys.posFixExpression === 'inteiro')
        throw new Error(`Erro - Linha ${isFunction.line}: O retorno da função ${isFunction.response.token} não pode ser um valor inteiro`);
    } else {
      if (SemanticAnalisys.posFixExpression === 'booleano')
        throw new Error(`Erro - Linha ${isFunction.line}: O retorno da função ${isFunction.response.token} não pode ser um valor booleano`);
    }
  } else if (isVariable.response) {

    if (isVariable.response.tokenType === 'booleano') {
      if (SemanticAnalisys.posFixExpression === 'inteiro')
        throw new Error(`Erro - Linha ${isVariable.line}: A variável ${isVariable.response.token} não pode receber um valor inteiro`);
    } else {
      if (SemanticAnalisys.posFixExpression === 'booleano')
        throw new Error(`Erro - Linha ${isVariable.line}: A variável ${isVariable.response.token} não pode receber um valor booleano`);
    }
  } else throw new Error(`Erro - Linha ${line}: O identificador que está recebendo a atribuição não é nem uma função nem uma variável`);
  
  SemanticAnalisys.resetPosFix();
}

function assignmentOrProcedureAnalysis() {
  lerToken();

  if (SyntacticValidation.assignmentValidation(tokenList[index])) {
    if (!SemanticAnalisys.searchDeclarationVariableFunction(tokenList[index - 1].lexeme)) {
      index -= 1;
      throw new Error(`Erro - Linha ${line}: O identificador "${tokenList[index].lexeme}" não é uma função ou uma variável`);
    }
    assignmentAnalysis();
  }
  else {
    if (!SemanticAnalisys.searchDeclarationProcedure(tokenList[index - 1].lexeme)) {
      index -= 1;
      throw new Error(`Erro - Linha ${line}: O identificador "${tokenList[index].lexeme}" não é um procedimento`);
    }
    procedureAnalysis();
  }
}

function ifAnalysis() {
  lerToken();
  
  expressionAnalysis();
  console.log('CONDIÇÃO DO IF É:', SemanticAnalisys.posFixExpression);
  if (SemanticAnalisys.posFixExpression !== 'booleano')
    throw new Error(`Erro - Linha ${line}: Condição do comando "se" não pode ser do tipo inteiro`);

  SemanticAnalisys.resetPosFix();

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

  if (SemanticAnalisys.posFixExpression !== 'booleano')
    throw new Error(`Erro - Linha ${line}: Condição do comando "enquanto" não pode ser do tipo inteiro`);

  SemanticAnalisys.resetPosFix();

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

  if (!SemanticAnalisys.searchDeclarationVariable(tokenList[index].lexeme))
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
  
  if (!SemanticAnalisys.searchDeclarationVariableFunction(tokenList[index].lexeme))
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

  SemanticAnalisys.insertInSymbolTable(tokenList[index].lexeme, SemanticAnalisys.TokenType.PROGRAM)
  
  lerToken();

  if (!SyntacticValidation.semicolonValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado  ${tokenList[index].lexeme}`);

  blockAnalisys();

  if (SyntacticValidation.pointValidation(tokenList[index])) {
    if (index !== tokenList.length - 1) throw new Error(`Erro - Linha ${line}: Tokens existentes após o ponto`);
  } else throw new Error(`Erro - Linha ${line}: Não encontrado ponto no fim do arquivo`);
}
