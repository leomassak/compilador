/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';

import './styles.scss';
import { pegaToken } from '../../functions/pegaToken';

function CompilerScreen() {
  // const [fileRows, setRows] = useState('');
  const [tokenList, setTokenList] = useState([]);
  const [hasError, setHasError] = useState(0);
  const [displayList, setDisplayList] = useState(false);

  const ESPECIAL_COMMANDS = {
    SKIP_LINE: '\n',
    SPACE: ' ',
  };

  const INIT_COMMENT = {
    SLASH: 1,
    KEY: 2,
  };

  function lexicalAnalysis(file) {
    let line = 1;
    let isComment = false;
    let comment = '';
    let commentType = null;

    for (let i = 0; i < file.length; i += 1) {
      
      if (file[i] !== ESPECIAL_COMMANDS.SPACE || isComment) {
        
        if (file[i] === '/' || file[i] === '{' || isComment) {

          if (!isComment && file[i] === '/') {
            if (file[i + 1] === '*') {
              isComment = true;
              i += 1;
              commentType = 1;
            } else {
              setHasError(line);
              break;
            }
          }
          
          else if (isComment && commentType === INIT_COMMENT.SLASH && file[i] === '*') {
            if (file[i + 1] === '/') {
              console.log('comentário:', comment);
              isComment = false;
              comment = '';
              commentType = null;
              i += 1;
            } else {
              comment += file[i];
            }
          }
          
          else if (!isComment && file[i] === '{') {
            isComment = true;
            commentType = 2;
          }
          
          else if (isComment && commentType === INIT_COMMENT.KEY && file[i] === '}') {
            console.log('comentário:', comment);
            isComment = false;
            comment = '';
            commentType = null;
          } else {
            comment += file[i];
          }
        }
        
        else if (file[i] === '/' || file[i] === '}') {
          setHasError(line);
          break;
        }
        
        else if (file[i] !== ESPECIAL_COMMANDS.SKIP_LINE && file[i].charCodeAt() !== 13) {
          const response = pegaToken(file[i], i, file);
          if (response.lexeme === 'Erro') {
            setHasError(line);
            break;
          }
          else {
            i = response.position;
            setTokenList(tokenList => tokenList.concat({ symbol: response.symbol, lexeme: response.lexeme }))
          }
        }

        if (file[i] === ESPECIAL_COMMANDS.SKIP_LINE) {
          line += 1;
        }
      }
    }
  }

  async function handleFileSelector(event) {
    if (event.target.files[0].type === 'text/plain') {
      const reader = new FileReader();
      if (reader) {
        reader.readAsText(event.target.files[0]);
        event.target.value = '';
      }
      reader.onload = async (e) => {
        const file = e.target.result;
        console.log(file);
        await lexicalAnalysis(file);
        setDisplayList(true);
      };
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
      <div className="main-panel">
        {displayList && tokenList.map((item, index) => (
          <p
            key={index}
          >
            {`Símbolo: ${item.symbol}\nLexema: ${item.lexeme}\n`}
          </p>
        ))}
        {hasError !== 0 && (
          <p>
            {`Erro na linha ${hasError}`}
          </p>
        )}
      </div>
    </div>
  );
}

export default CompilerScreen;
