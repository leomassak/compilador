/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect, useRef } from 'react';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools"

import './styles.scss';

import { pegaToken } from '../../functions/pegaToken';
import * as SyntacticAnalysis from '../../syntactical/analisys';
import * as SemanticAnalysis from '../../semantic';

function CompilerScreen() {
  const [tokenList, setTokenList] = useState([]);
  const [displayList, setDisplayList] = useState(false);
  const [syntacticErrorIndex, setSyntacticErrorIndex] = useState(-1);
  const [syntacticError, setSyntacticError] = useState('');
  const [success, setSuccess] = useState(false);
  const [lpd, setLpd] = useState('');
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState(0);
  const [annotation, setAnnotation] = useState([]);


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


  function runCode() {
    if(lpd.length > 0) {
      stopRun();
      const list = lexicalAnalysis(lpd);
      syntacticAnalysis(list); 
      setTokenList(list);
      setDisplayList(true);
      setRunning(true);
    }
  }

  function stopRun() {
    setTokenList([]);
    setAnnotation([]);
    setDisplayList(false)
    setSyntacticErrorIndex(-1);
    setSelected(0);
    setSyntacticError('');
    setSuccess(false);
    setRunning(false);
    SemanticAnalysis.resetSymbolTable();
    SemanticAnalysis.resetPosFix();
    SemanticAnalysis.changeInsideFunction(false);
    SemanticAnalysis.changeReturnedFunction(SemanticAnalysis.BlockEnum.NOT_A_FUNCTION);
    SyntacticAnalysis.reset();
    console.clear();
  }

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
      setAnnotation([{ row: SyntacticAnalysis.line - 1, column: 0, type: 'error', text: err.message}])
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
        stopRun();
        const file = e.target.result;
        setLpd(file);
      };
    } else alert('Este tipo de arquivo não é suportado!');
  }

  function getLog() {
    if (selected === 0) {
      return (
        <>
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
        </>
      )
    } else {
      return (
        <>
        {displayList && tokenList.map((item, index) => (
          <>
            {item.symbol !== 'Erro' && index < syntacticErrorIndex && (
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
        ))}
        </>
      )
    }
  }

  return (
    <>
    <nav>
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
                onClick={runCode}
              >
                Compilar
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={stopRun}
              >
                Finalizar compilação
              </button>
            </li>
          </ul>
        </div>
      </nav>
    <div id="container">
    <div id="code">
        <section id="lpdmixed">
          <AceEditor
          mode="text"
          theme="dracula"
          className="editor-style"
          fontSize={14}
          width={'100%'}
          height={'92vh'}
          value={lpd}
          annotations={annotation}  
          onChange={(value) => setLpd(value)}
          name="ace-editor"
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            showPrintMargin: false,
            readOnly: running,
          }}
        />
        </section>
        {running && (
          <section id="console">
          <div className="console-container">
            <div className="tab-container">
              <div className={`console-tab ${selected === 0 && 'tab-selected'}`} onClick={() => setSelected(0)}>
                <span >Console</span>
              </div>
              <div className={`console-tab ${selected === 1 && 'tab-selected'}`} onClick={() => setSelected(1)}>
                <span >Tokens</span>
              </div>
            </div>
            <div className="console-logs">
              {getLog()}
            </div>
          </div>
       </section>
        )}
      </div>
    </div>
    </>
  );
}

export default CompilerScreen;
