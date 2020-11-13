import * as SyntacticValidation from './validations';
import * as SymbolTable from '../symbolTable';

export let index = 0;
export let line = 0;

export const reset = () => {
  index = 0;
  line = 0;
}

function lerToken(tokenList) {
  index += 1;
  if (tokenList.length <= index) throw new Error(`Erro - Linha ${line}: Arquivo chegou no fim, porém não foi encontrado o ponto`);
  else if (tokenList[index].symbol === 'Erro') throw new Error(`Erro - Linha ${line}: ${tokenList[index].lexeme}`);
  line = tokenList[index].line;
}

function typeAnalysis(tokenList) {
  if (!SyntacticValidation.integerValidation(tokenList[index]) && !SyntacticValidation.booleanValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado inteiro ou booleano, porem encontrado ${tokenList[index].lexeme}`);

  SymbolTable.insertTypeInSymbolTable(tokenList[index].lexeme);
  lerToken(tokenList);
}

function varAnalysis(tokenList) {
  do {
    if (!SyntacticValidation.identifierValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado um identificador, porem encontrado ${tokenList[index].lexeme}`);

    const isDuplicate = SymbolTable.searchDuplicateVariable(tokenList[index].lexeme)
    if (isDuplicate) throw new Error(`Erro - Linha ${line}: O identificador "${tokenList[index].lexeme}" já foi declarado!`);

    SymbolTable.insertInSymbolTable(tokenList[index].lexeme, SymbolTable.TokenType.VARIABLE);
    lerToken(tokenList);

    if (!SyntacticValidation.commaValidation(tokenList[index]) && !SyntacticValidation.doublePointValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado virgula ou dois pontos, porem encontrado ${tokenList[index].lexeme}`);

    if (SyntacticValidation.commaValidation(tokenList[index])) {
      lerToken(tokenList);
      
      if (SyntacticValidation.doublePointValidation(tokenList[index])) 
        throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);
    }
  } while (!SyntacticValidation.doublePointValidation(tokenList[index]));

  lerToken(tokenList);

  typeAnalysis(tokenList);
}

function etVarAnalysis(tokenList) {
  if (!SyntacticValidation.varValidation(tokenList[index])) return;

  lerToken(tokenList);

  if (!SyntacticValidation.identifierValidation(tokenList[index])) 
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);
  
  while (SyntacticValidation.identifierValidation(tokenList[index])) {
    varAnalysis(tokenList);
    
    if (!SyntacticValidation.semicolonValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`); 
      
    lerToken(tokenList);
  }
}

function subroutineDeclarationAnalysis(tokenList) {
  lerToken(tokenList);

  SymbolTable.increaseLevel();

  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);

  const found = SymbolTable.searchDeclarationProcedure(tokenList[index].lexeme);
  if (found) throw new Error(`Erro - Linha ${line}: O identificador "${tokenList[index].lexeme}" já foi declarado!`);

  SymbolTable.insertTypeInSymbolTable(tokenList[index].lexeme, SymbolTable.TokenType.PROCEDURE)

  lerToken(tokenList);

  if (!SyntacticValidation.semicolonValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`);

  blockAnalisys(tokenList);

  SymbolTable.decreaseLevel();
}

function functionDeclarationAnalysis(tokenList) {
  lerToken(tokenList);

  SymbolTable.increaseLevel();

  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);

  const found = SymbolTable.searchDeclarationFunction(tokenList[index].lexeme);
  if (found) throw new Error(`Erro - Linha ${line}: O identificador "${tokenList[index].lexeme}" já foi declarado!`);

  console.log('inserindo na tabela', tokenList[index].lexeme, SymbolTable.TokenType.FUNCTION)
  SymbolTable.insertTypeInSymbolTable(tokenList[index].lexeme, SymbolTable.TokenType.FUNCTION)

  lerToken(tokenList);

  if (!SyntacticValidation.doublePointValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado dois pontos, porem encontrado ${tokenList[index].lexeme}`);
  
  lerToken(tokenList);

  if (!SyntacticValidation.booleanValidation(tokenList[index]) && !SyntacticValidation.integerValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado booleano ou inteiro, porem encontrado ${tokenList[index].lexeme}`);

  if (SyntacticValidation.booleanValidation(tokenList[index])) {
      SymbolTable.changeFunctionType(SymbolTable.TokenType.BOOLEAN_FUNCTION);
  } else {
      SymbolTable.changeFunctionType(SymbolTable.TokenType.INTEGER_FUNCTION);
  }

  lerToken(tokenList);

  if (SyntacticValidation.semicolonValidation(tokenList[index])) blockAnalisys(tokenList);

  SymbolTable.decreaseLevel();
}

function subroutineAnalysis(tokenList) {
  while (SyntacticValidation.procedureValidation(tokenList[index]) || SyntacticValidation.functionValidation(tokenList[index])) {
    if (SyntacticValidation.procedureValidation(tokenList[index])) subroutineDeclarationAnalysis(tokenList);
    else functionDeclarationAnalysis(tokenList);

    if (!SyntacticValidation.semicolonValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`);
  
    lerToken(tokenList);
  }
}

function expressionAnalysis(tokenList) {
  simpleExpressionAnalysis(tokenList);

  if (SyntacticValidation.biggerValidation(tokenList[index])
      || SyntacticValidation.bigEqualValidation(tokenList[index])
      || SyntacticValidation.equalValidation(tokenList[index])
      || SyntacticValidation.lowerValidation(tokenList[index])
      || SyntacticValidation.lowerEqualValidation(tokenList[index])
      || SyntacticValidation.diffValidation(tokenList[index])) {
    
    lerToken(tokenList);
     
    simpleExpressionAnalysis(tokenList);
  }
}

function simpleExpressionAnalysis(tokenList) {
  if (SyntacticValidation.plusValidation(tokenList[index])
    || SyntacticValidation.minusValidation(tokenList[index])) lerToken(tokenList);
  
  termAnalisys(tokenList);

  while (SyntacticValidation.plusValidation(tokenList[index])
      || SyntacticValidation.minusValidation(tokenList[index])
      || SyntacticValidation.orValidation(tokenList[index])) {
    
    lerToken(tokenList);

    termAnalisys(tokenList);
  }
}

export function procedureAnalysis(tokenList) { }

export function functionCallAnalisys(tokenList) {
  lerToken(tokenList);
}

export function assignmentAnalysis(tokenList) {
  lerToken(tokenList);
  
  expressionAnalysis(tokenList);
}


export function factorAnalisys(tokenList) {
  if (SyntacticValidation.identifierValidation(tokenList[index])) functionCallAnalisys(tokenList);
  
  else if (SyntacticValidation.numberValidation(tokenList[index])) lerToken(tokenList);

  else if (SyntacticValidation.notValidation(tokenList[index])) {
    lerToken(tokenList);
    
    factorAnalisys(tokenList);
  } else if (SyntacticValidation.openBracketValidation(tokenList[index])) {
    lerToken(tokenList);

    expressionAnalysis(tokenList);

    if (!SyntacticValidation.closeBracketValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado fecha parênteses, porem encontrado ${tokenList[index].lexeme}`);
    
    lerToken(tokenList);
  } else if (SyntacticValidation.trueValidation(tokenList[index]) || SyntacticValidation.falseValidation(tokenList[index])) {
    lerToken(tokenList);
  } else throw new Error(`Erro - Linha ${line}: Esperado um fator, porem encontrado ${tokenList[index].lexeme}`);
}

export function termAnalisys(tokenList) {
  factorAnalisys(tokenList);

  while (SyntacticValidation.multValidation(tokenList[index])
      || SyntacticValidation.divValidation(tokenList[index])
      || SyntacticValidation.andValidation(tokenList[index])) {
    
    lerToken(tokenList);

    factorAnalisys(tokenList);
  }
}

function assignmentOrProcedureAnalysis(tokenList) {
  lerToken(tokenList);

  if (SyntacticValidation.assignmentValidation(tokenList[index])) assignmentAnalysis(tokenList);
  else procedureAnalysis(tokenList);
}

function ifAnalysis(tokenList) {
  lerToken(tokenList);
  
  expressionAnalysis(tokenList);
  if (SyntacticValidation.elseValidation(tokenList[index])) {
    
    lerToken(tokenList);

    simpleCommandAnalysis(tokenList);
    if (SyntacticValidation.elseIfValidation(tokenList[index])) {
      lerToken(tokenList);
      
      simpleCommandAnalysis(tokenList);
    }
  }
}

function whileAnalysis(tokenList) {
  lerToken(tokenList);

  expressionAnalysis(tokenList);

  if (!SyntacticValidation.doValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado um fator, porem encontrado ${tokenList[index].lexeme}`);

  lerToken(tokenList);
  
  simpleCommandAnalysis(tokenList);
}

function readAnalysis(tokenList) {
  lerToken(tokenList);

  if (!SyntacticValidation.openBracketValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado abre parênteses, porem encontrado ${tokenList[index].lexeme}`);
  
  lerToken(tokenList);
  
  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);
  
  lerToken(tokenList);

  if (!SyntacticValidation.closeBracketValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado fecha parênteses, porem encontrado ${tokenList[index].lexeme}`);
  
  lerToken(tokenList);
}

function writeAnalysis(tokenList) {
  lerToken(tokenList);

  if (!SyntacticValidation.openBracketValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado abre parênteses, porem encontrado ${tokenList[index].lexeme}`);

  lerToken(tokenList);

  if (!SyntacticValidation.identifierValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);

  lerToken(tokenList);

  if (!SyntacticValidation.closeBracketValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado fecha parênteses, porem encontrado ${tokenList[index].lexeme}`);

  lerToken(tokenList);
}

function simpleCommandAnalysis(tokenList) {
  if (SyntacticValidation.identifierValidation(tokenList[index])) assignmentOrProcedureAnalysis(tokenList);

  else if (SyntacticValidation.ifValidation(tokenList[index])) ifAnalysis(tokenList);

  else if (SyntacticValidation.whileValidation(tokenList[index])) whileAnalysis(tokenList);

  else if (SyntacticValidation.readValidation(tokenList[index])) readAnalysis(tokenList);

  else if (SyntacticValidation.writeValidation(tokenList[index])) writeAnalysis(tokenList);

  else commandAnalysis(tokenList);
}

function commandAnalysis(tokenList) {
  if (!SyntacticValidation.initValidation(tokenList[index]))
    throw new Error(`Erro - Linha ${line}: Esperado inicio, porem encontrado ${tokenList[index].lexeme}`);

  lerToken(tokenList);

  simpleCommandAnalysis(tokenList);

  while (!SyntacticValidation.endValidation(tokenList[index])) {
    if (!SyntacticValidation.semicolonValidation(tokenList[index]))
      throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`);
    
    lerToken(tokenList);
    if (!SyntacticValidation.endValidation(tokenList[index])) simpleCommandAnalysis(tokenList);
  }

  lerToken(tokenList);
}

function blockAnalisys(tokenList) {
  lerToken(tokenList);

  etVarAnalysis(tokenList);

  subroutineAnalysis(tokenList);

  commandAnalysis(tokenList);
}

export function initSyntacticalAnalisys(tokenList) {
  line = tokenList[index].line;
  if (!SyntacticValidation.initialValidation(tokenList[index])) throw new Error(`Erro - Linha ${line}: Esperado comando ínicio, porem encontrado comando ${tokenList[index].lexeme}`);

  lerToken(tokenList);

  if (!SyntacticValidation.identifierValidation(tokenList[index])) throw new Error(`Erro - Linha ${line}: Esperado identificador, porem encontrado ${tokenList[index].lexeme}`);
  SymbolTable.insertInSymbolTable(tokenList[index].lexeme, SymbolTable.TokenType.PROGRAM)
  
  lerToken(tokenList);

  if (!SyntacticValidation.semicolonValidation(tokenList[index])) throw new Error(`Erro - Linha ${line}: Esperado ponto e virgula, porem encontrado  ${tokenList[index].lexeme}`);

  blockAnalisys(tokenList);

  if (SyntacticValidation.pointValidation(tokenList[index])) {
    if (index !== tokenList.length - 1) throw new Error(`Erro - Linha ${line}: Tokens existentes após o ponto`);
  } else throw new Error(`Erro - Linha ${line}: Não encontrado ponto no fim do arquivo`);
}
