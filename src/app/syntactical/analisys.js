import * as SyntacticValidation from './validations';
import * as SymbolTable from '../symbolTable';

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

  // SymbolTable.insertTypeInSymbolTable(tokenList[index].lexeme);
  lerToken();
}

function varAnalysis() {
  do {
    if (!SyntacticValidation.identifierValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado um identificador, porem encontrado ${tokenList[index].lexeme}`);

    // const isDuplicate = SymbolTable.searchDuplicateVariable(tokenList[index].lexeme)
    // if (isDuplicate) throw new Error(`Erro - Linha ${line}: O identificador "${tokenList[index].lexeme}" já foi declarado!`);

    // SymbolTable.insertInSymbolTable(tokenList[index].lexeme, SymbolTable.TokenType.VARIABLE);
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

  // SymbolTable.increaseLevel();

  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);

  // const found = SymbolTable.searchDeclarationProcedure(tokenList[index].lexeme);
  // if (found) throw new Error(`Erro - Linha ${line}: O identificador "${tokenList[index].lexeme}" já foi declarado!`);

  // SymbolTable.insertTypeInSymbolTable(tokenList[index].lexeme, SymbolTable.TokenType.PROCEDURE)

  lerToken();

  if (!SyntacticValidation.semicolonValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`);

  blockAnalisys();

  // SymbolTable.decreaseLevel();
}

function functionDeclarationAnalysis() {
  lerToken();

  // SymbolTable.increaseLevel();

  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);

  // const found = SymbolTable.searchDeclarationFunction(tokenList[index].lexeme);
  // if (found) throw new Error(`Erro - Linha ${line}: O identificador "${tokenList[index].lexeme}" já foi declarado!`);

  // console.log('inserindo na tabela', tokenList[index].lexeme, SymbolTable.TokenType.FUNCTION)
  // SymbolTable.insertTypeInSymbolTable(tokenList[index].lexeme, SymbolTable.TokenType.FUNCTION)

  lerToken();

  if (!SyntacticValidation.doublePointValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado dois pontos, porem encontrado ${tokenList[index].lexeme}`);
  
  lerToken();

  if (!SyntacticValidation.booleanValidation(tokenList[index]) && !SyntacticValidation.integerValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado booleano ou inteiro, porem encontrado ${tokenList[index].lexeme}`);

  // if (SyntacticValidation.booleanValidation(tokenList[index])) {
  //     SymbolTable.changeFunctionType(SymbolTable.TokenType.BOOLEAN_FUNCTION);
  // } else {
  //     SymbolTable.changeFunctionType(SymbolTable.TokenType.INTEGER_FUNCTION);
  // }

  lerToken();

  if (SyntacticValidation.semicolonValidation(tokenList[index])) blockAnalisys();

  // SymbolTable.decreaseLevel();
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
    
    lerToken();
     
    simpleExpressionAnalysis();
  }
}

function simpleExpressionAnalysis() {
  if (SyntacticValidation.plusValidation(tokenList[index])
    || SyntacticValidation.minusValidation(tokenList[index])) lerToken();
  
  termAnalisys();

  while (SyntacticValidation.plusValidation(tokenList[index])
      || SyntacticValidation.minusValidation(tokenList[index])
      || SyntacticValidation.orValidation(tokenList[index])) {
    
    lerToken();

    termAnalisys();
  }
}

export function procedureAnalysis() { }

export function functionCallAnalisys() {
  lerToken();
}

export function assignmentAnalysis() {
  lerToken();
  
  expressionAnalysis();
}


export function factorAnalisys() {
  if (SyntacticValidation.identifierValidation(tokenList[index])) functionCallAnalisys();
  
  else if (SyntacticValidation.numberValidation(tokenList[index])) lerToken();

  else if (SyntacticValidation.notValidation(tokenList[index])) {
    lerToken();
    
    factorAnalisys();
  } else if (SyntacticValidation.openBracketValidation(tokenList[index])) {
    lerToken();

    expressionAnalysis();

    if (!SyntacticValidation.closeBracketValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado fecha parênteses, porem encontrado ${tokenList[index].lexeme}`);
    
    lerToken();
  } else if (SyntacticValidation.trueValidation(tokenList[index]) || SyntacticValidation.falseValidation(tokenList[index])) {
    lerToken();
  } else throw new Error(`Erro - Linha ${line}: Esperado um fator, porem encontrado ${tokenList[index].lexeme}`);
}

export function termAnalisys() {
  factorAnalisys();

  while (SyntacticValidation.multValidation(tokenList[index])
      || SyntacticValidation.divValidation(tokenList[index])
      || SyntacticValidation.andValidation(tokenList[index])) {
    
    lerToken();

    factorAnalisys();
  }
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

  SymbolTable.insertInSymbolTable(tokenList[index].lexeme, SymbolTable.TokenType.PROGRAM)
  
  lerToken();

  if (!SyntacticValidation.semicolonValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado  ${tokenList[index].lexeme}`);

  blockAnalisys();

  if (SyntacticValidation.pointValidation(tokenList[index])) {
    if (index !== tokenList.length - 1) throw new Error(`Erro - Linha ${line}: Tokens existentes após o ponto`);
  } else throw new Error(`Erro - Linha ${line}: Não encontrado ponto no fim do arquivo`);
}
