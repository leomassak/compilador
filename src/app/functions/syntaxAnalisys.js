import SyntaxFunctions from './syntaxFunctions';
import Validators from '../utils/validators';

export function syntaxAnalisys(token, position, file) {
    if (token.symbol !== 'Erro') {
        if (index === 0) {
          if (!SyntaxFunctions.initialValidation(token)) {
            setSyntacticErrorIndex(index);
            setSyntacticError({ line: lexicalTokenList[index].line, description: 'O código deve iniciar com o identificador "programa"' });
            break;
          }
        }
        if (index === 1) {
          if (!SyntacticValidation.identifierValidation(lexicalTokenList[index])) {
            setSyntacticErrorIndex(index);
            setSyntacticError({ line: lexicalTokenList[index].line, description: 'Identificador não encontrado' });
            break;
          }
        }
        if (index === 3) {
          if (!SyntacticValidation.semicolonValidation(lexicalTokenList[index])) {
            setSyntacticErrorIndex(index);
            setSyntacticError({ line: lexicalTokenList[index].line, description: 'Ponto e vírgula não encontrado' });
            break;
          }
        }
      } else break;
}