/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';

import './styles.scss';

function CompilerScreen() {
  const [fileRows, setRows] = useState([]);

  async function handleFileSelector(event) {
    if (event.target.files[0].type === 'text/plain') {
      const reader = new FileReader();
      if (reader) {
        reader.readAsText(event.target.files[0]);
        event.target.value = '';
      }
      reader.onload = async (e) => {
        const rows = e.target.result.split('\n');
        console.log(rows);
        setRows(rows);
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
      <div className="main-panel" />
    </div>
  );
}

export default CompilerScreen;
