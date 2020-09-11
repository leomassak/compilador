import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './app/styles/global.scss';
import App from './app';

import createStore from './app/redux';

const store = createStore();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
