/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';

import './styles.scss';
import { pegaToken } from '../../functions/pegaToken';
import * as SyntacticAnalysis from '../../syntactical/analisys';
import * as SymbolTable from '../../symbolTable';

function CompilerScreen() {
  const [tokenList, setTokenList] = useState([]);
  const [displayList, setDisplayList] = useState(false);
  const [syntacticErrorIndex, setSyntacticErrorIndex] = useState(-1);
  const [syntacticError, setSyntacticError] = useState('');
  const [success, setSuccess] = useState(false);

  const ESPECIAL_COMMANDS = {
    SKIP_LINE: '\n',
    SPACE: ' ',
  };

  const ESPECIAL_COMMANDS_NUMBER = {
    TAB: 9,
    SKIP_LINE: 13,
  }

  const INIT_COMMENT = {
    SLASH: 1,
    KEY: 2,
  };

  function lexicalAnalysis(file) {
    let line = 1;
    let isComment = false;
    let comment = '';
    let commentType = null;
    let commentLines = 0;
    let list = [];

    for (let i = 0; i < file.length; i += 1) {
      if (file[i].charCodeAt() !== ESPECIAL_COMMANDS_NUMBER.TAB && (file[i] !== ESPECIAL_COMMANDS.SPACE || isComment)) {
        
        if (file[i] === '/' || file[i] === '{' || isComment) {

          if (!isComment && file[i] === '/') {
            if (file[i + 1] === '*') {
              isComment = true;
              i += 1;
              commentType = 1;
            } else {
              list = list.concat({ symbol: 'Erro', lexeme: `O comentário não foi formado corretamente`, line });
              break;
            }
          }
          
          else if (isComment && commentType === INIT_COMMENT.SLASH && file[i] === '*') {
            if (file[i + 1] === '/') {
              console.log('comentário:', comment);
              isComment = false;
              comment = '';
              commentType = null;
              commentLines = 0;
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
            commentLines = 0;
          } else {
            comment += file[i];
          }
        }
        
        else if (file[i] !== ESPECIAL_COMMANDS.SKIP_LINE && file[i].charCodeAt() !== ESPECIAL_COMMANDS_NUMBER.SKIP_LINE) {
          const response = pegaToken(file[i], i, file);
          list = list.concat({ symbol: response.symbol, lexeme: response.lexeme, line });
          if (response.symbol !== 'Erro') i = response.position;
          else break;
        }

        if (file[i] === ESPECIAL_COMMANDS.SKIP_LINE) {
          line += 1;
          if (isComment) commentLines += 1;
        }
      }
    }

    if (isComment) list = list.concat({ symbol: 'Erro', lexeme: `O comentário não foi fechado`, line: line - commentLines });
    return list;
  }

  function syntacticAnalysis(lexicalTokenList) {
    try {
      SyntacticAnalysis.initSyntacticalAnalisys(lexicalTokenList);
      setSuccess(true);
    } catch (err) {
      setSyntacticError(err.message);
      setSyntacticErrorIndex(SyntacticAnalysis.index);
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
        handleFileRemove();
        const file = e.target.result;
        const list = await lexicalAnalysis(file);
        await syntacticAnalysis(list);
        setTokenList(list);
        setDisplayList(true);
      };
    } else alert('Este tipo de arquivo não é suportado!');
  }

  async function handleFileRemove() {
    setTokenList([]);
    setDisplayList(false)
    setSyntacticErrorIndex(-1);
    setSyntacticError('');
    setSuccess(false);
    SymbolTable.resetSymbolTable();
    SyntacticAnalysis.reset();
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
            <label htmlFor="file-button">Inserir Arquivo</label>
          </li>
          <li>
            <button
              type="button"
              onClick={handleFileRemove}
            >
              Limpar
            </button>
          </li>
        </ul>
      </div>
      <div className="main-panel">
        {displayList && tokenList.map((item, index) => (
          <>
            {(syntacticErrorIndex === -1 || index < syntacticErrorIndex) && (
              <>
                {item.symbol === 'Erro' && (
                  <>
                    <p className="panel-error-text-lines">
                      {`Linha -> ${item.line}`}
                    </p>
                    <p className="panel-error-text-lines">
                      {`Erro -> ${item.lexeme}`}
                      <br />
                    </p>
                  </>
                )}
                {item.symbol !== 'Erro' && (
                  <>
                    <p className="panel-text-lines">
                      {`Linha -> ${item.line}`}
                    </p>
                    <p className="panel-text-lines">
                      {`Símbolo -> ${item.symbol}`}
                    </p>
                    <p className="panel-text-lines">
                      {`Lexema -> ${item.lexeme}`}
                    </p>
                    <br />
                  </>
                )}
              </>
            )}
          </>
        ))}
        {syntacticErrorIndex >= 0 && (
          <p className="panel-error-text-lines">
            {syntacticError}
          </p>
        )}
        {success && (
          <p className="panel-success-text-lines">
            Compilado com sucesso!
          </p>
        )}
      </div>
    </div>
  );
}

export default CompilerScreen;
