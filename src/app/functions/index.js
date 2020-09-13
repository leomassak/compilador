import Validators from '../utils/validators';

function trataDigito(position, file) {
  let digit = '';
  while (Validators.isDigit(file[position])) {
    digit += file[position];
    position += 1;
  }

  return { symbol: 'snumero', lexeme: digit, position };
}

function trataIdentificadorEPalavraReservada(position, file) {
  let palavra = '';
  let symbol;

  while (Validators.isChar(file[position]) || Validators.isDigit(file[position]) || file[position] === '_') {
    palavra += file[position];
    position += 1;
  }

  switch (palavra) {
    case 'programa':
      symbol = 'sprograma';
      break;
    case 'se':
      symbol = 'sse';
      break;
    case 'entao':
      symbol = 'sentao';
      break;
    case 'senao':
      symbol = 'sentao';
      break;
    case 'enquanto':
      symbol = 'ssenao';
      break;
    case 'faca':
      symbol = 'sfaca';
      break;
    case 'início':
      symbol = 'sinício';
      break;
    case 'fim':
      symbol = 'sfim';
      break;
    case 'escreva':
      symbol = 'sescreva';
      break;
    case 'leia':
      symbol = 'sleia';
      break;
    case 'var':
      symbol = 'svar';
      break;
    case 'inteiro':
      symbol = 'sinteiro';
      break;
    case 'booleano':
      symbol = 'sbooleano';
      break;
    case 'verdadeiro':
      symbol = 'sverdadeiro';
      break;
    case 'falso':
      symbol = 'sfalso';
      break;
    case 'procedimento':
      symbol = 'sprocedimento';
      break;
    case 'funcao':
      symbol = 'sfuncao';
      break;
    case 'div':
      symbol = 'sdiv';
      break;
    case 'e':
      symbol = 'se';
      break;
    case 'ou':
      symbol = 'sou';
      break;
    case 'nao':
      symbol = 'snao';
      break;
    default:
      symbol = 'sidentificador';
      break;
  }

  return { symbol, lexeme: palavra, position: position - 1 };
}

function trataAtribuição(c, position, file) {
  let token = { symbol: 'Sdoispontos', lexeme: c, position };
  if (file[position + 1] === '=') {
    token = { symbol: 'satribuição', lexeme: ':=', position: position + 1 };
  }

  return token;
}

function trataOperadorAritmético(c, position, file) {
  let token = { symbol: 'Erro', lexeme: 'Erro', position };;

  if (c === '+') token = { symbol: 'Smais', lexeme: c, position };

  else if (c === '-') token = { symbol: 'Smenos', lexeme: c, position };

  else if (c === '*') token = { symbol: 'Smult', lexeme: c, position, };

  return token;
}

function trataOperadorRelacional(c, position, file) {
  let token = { symbol: 'Erro', lexeme: 'Erro', position };;

  if (c === '<' || c === '>') {
    if (file[position + 1] === '=') {
      token = {
        symbol: c === '>' ? 'Smaiorig' : 'Smenorig',
        lexeme: c + '=',
        position: position + 1,
      }
    } else {
      token = {
        symbol: c === '>' ? 'Smaior' : 'Smenor',
        lexeme: c,
        position,
      }
    }
  }

  else if (c === '=') token = { symbol: 'Sig', lexeme: c, position };

  else if (c === '!') {
    if (file[position + 1] === '=') token = { symbol: 'Sdif', lexeme: c + '=', position: position + 1 };
  }

  return token;
}

function trataPontuação(ponto, position) {
  let symbol;
  switch (ponto) {
    case ';':
      symbol = 'sponto_virgula';
      break;
    case '.':
      symbol = 'Sponto';
      break;
    case ',':
      symbol = 'Svirgula';
      break;
    case '(':
      symbol = 'sabre_parenteses';
      break;
    case ')':
      symbol = 'sfecha_parenteses';
      break;
    default:
      break;
  }
  return { symbol, lexeme: ponto, position };
}

export default {
  trataDigito,
  trataIdentificadorEPalavraReservada,
  trataAtribuição,
  trataOperadorAritmético,
  trataOperadorRelacional,
  trataPontuação,
};
