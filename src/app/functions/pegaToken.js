import Functions from './index';
import Validators from '../utils/validators';

export function pegaToken(e, position, file) {
  let token;
  if (Validators.isDigit(e)) {
    token = Functions.trataDigito(position, file);
  } else if (Validators.isChar(e)) {
    token = Functions.trataIdentificadorEPalavraReservada(position, file);
  } else if (e === ':') {
    token = Functions.trataAtribuição(e, position, file);
  } else if (e === '+' || e === '-' || e === '*') {
    token = Functions.trataOperadorAritmético(e, position, file);
  } else if (e === '<' || e === '>' || e === '=' || e === '!') {
    token = Functions.trataOperadorRelacional(e, position, file);
  } else if (e === ';' || e === '.' || e === ',' || e === '(' || e === ')') {
    token = Functions.trataPontuação(e, position);
  } else {
    token = { symbol: 'Erro', lexeme: `O caractere ${e} é inválido`, position };
  }
  return token;
}
