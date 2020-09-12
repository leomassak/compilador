/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';

import './styles.scss';
import { pegaToken } from '../../functions/pegaToken';

function CompilerScreen() {
  // const [fileRows, setRows] = useState('');
  const [tokenList, setTokenList] = useState([]);

  const COMANDOS_ESPECIAIS = {
    PULA_LINHA: '\n',
    ESPAÇO: ' ',
  };

  const INICIO_COMENTARIO = {
    BARRA: 1,
    CHAVES: 2,
  };

  function test(string) {
    let linha = 1;
    let ativouComentario = false;
    let comentario = '';
    let tipoComentario = null;

    for (let i = 0; i < string.length; i += 1) {
      if (string[i] !== COMANDOS_ESPECIAIS.ESPAÇO || ativouComentario) {

        if (string[i] === '/' || string[i] === '{' || ativouComentario) {

          if (!ativouComentario && string[i] === '/') {
            if (string[i + 1] === '*') {
              console.log('começou comentário');
              ativouComentario = true;
              i += 1;
              tipoComentario = 1;
            } else {
              console.log('ERRO');
              break;
            }
          } else if (
            ativouComentario &&
            tipoComentario === INICIO_COMENTARIO.BARRA &&
            string[i] === '*'
          ) {
            if (string[i + 1] === '/') {
              console.log('comentário:', comentario);
              ativouComentario = false;
              comentario = '';
              tipoComentario = null;
              i += 1;
            } else {
              comentario += string[i];
            }
          } else if (!ativouComentario && string[i] === '{') {
            ativouComentario = true;
            tipoComentario = 2;
          } else if (
            ativouComentario &&
            tipoComentario === INICIO_COMENTARIO.CHAVES &&
            string[i] === '}'
          ) {
            console.log('comentário:', comentario);
            ativouComentario = false;
            comentario = '';
            tipoComentario = null;
          } else {
            comentario += string[i];
          }
        }
        
        else if (string[i] === '/' || string[i] === '}') {
          console.log('ERRO');
          break;
        }
        
        else if (string[i] !== COMANDOS_ESPECIAIS.PULA_LINHA && string[i].charCodeAt() !== 13){
          console.log(string[i]);
          const response = pegaToken(string[i], i, string);
          i = response.position;
          setTokenList([
            ...tokenList,
            { simbol: response.simbol, lexema: response.lexema },
          ]);
          console.log('token', response);
        }

        if (string[i] === COMANDOS_ESPECIAIS.PULA_LINHA) {
          linha += 1;
        }
      }
    }
    console.log(linha);
  }

  async function handleFileSelector(event) {
    if (event.target.files[0].type === 'text/plain') {
      // eslint-disable-next-line no-undef
      const reader = new FileReader();
      if (reader) {
        reader.readAsText(event.target.files[0]);
        event.target.value = '';
      }
      reader.onload = async (e) => {
        const file = e.target.result;
        console.log(file);
        test(file);
      };
      // eslint-disable-next-line no-alert
      // eslint-disable-next-line no-undef
    } else alert('Este tipo de arquivo não é suportado!');
  }

  return (
    <div className="panel">
      <div className="header-panel">
        <ul>
          <li>
            <input
              type="file"
              name="Arquivo"
              id="file-button"
              onChange={handleFileSelector}
            />
            <label htmlFor="file-button">Arquivo</label>
          </li>
          <li>
            <button type="button">Executar</button>
          </li>
          <li>
            <button type="button">Sobre</button>
          </li>
        </ul>
      </div>
      <div className="main-panel" />
    </div>
  );
}

export default CompilerScreen;
