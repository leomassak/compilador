import Validators from '../utils/validators';

function trataDigito(c, position, file) {
  let digit = '';
  while (Validators.isDigit(file[position])) {
    digit += file[position];
    position += 1;
  }

  return { simbol: 'snumero', lexem: digit, position };
}

function trataIdentificadorEPalavraReservada(c, position, file) {
  let palavra = '';
  let simbol;

  while (Validators.isChar(file[position])) {
    palavra += file[position];
    position += 1;
  }

  switch (palavra) {
    case 'programa':
      simbol = 'sprograma';
      break;
    case 'se':
      simbol = 'sse';
      break;
    case 'entao':
      simbol = 'sentao';
      break;
    case 'senao':
      simbol = 'sentao';
      break;
    case 'enquanto':
      simbol = 'ssenao';
      break;
    case 'faca':
      simbol = 'sfaca';
      break;
    case 'início':
      simbol = 'sinício';
      break;
    case 'fim':
      simbol = 'sfim';
      break;
    case 'escreva':
      simbol = 'sescreva';
      break;
    case 'leia':
      simbol = 'sleia';
      break;
    default:
      break;
  }

  return { simbol, lexem: palavra, position };
}

function trataAtribuição(c, position, file) {}

function trataOperadorAritmético(c, position, file) {}

function trataOperadorRelacional(c, position, file) {}

function trataPontuação(c, position, file) {}

export default {
  trataDigito,
  trataIdentificadorEPalavraReservada,
  trataAtribuição,
  trataOperadorAritmético,
  trataOperadorRelacional,
  trataPontuação,
};
