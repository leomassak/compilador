import Functions from './index';
import Validators from '../utils/validators';

export function pegaToken(e, position, file) {
  let token;
  if (Validators.isDigit(e)) {
    token = Functions.trataDigito(e, position, file);
  } else if (Validators.isChar(e)) {
    token = Functions.trataIdentificadorEPalavraReservada(e, position, file);
  } else if (e === ':') {
    token = Functions.trataAtribuição(e, position, file);
  } else if (e === '+' || e === '-' || e === '*') {
    token = Functions.trataOperadorAritmético(e, position, file);
  } else if (e === '<' || e === '>' || e === '=') {
    token = Functions.trataOperadorRelacional(e, position, file);
  } else if (e === ';' || e === '.') {
    token = Functions.trataPontuação(e, position, file);
  } else {
    token = { simbol: 'Erro', lexem: 'Erro', position };
  }
  return token;
}
