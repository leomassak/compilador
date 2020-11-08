import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import SymbolTableSelectors from './reducers/symbolTable'

export default () => {
  const store = createStore(
    combineReducers({
      symbolTable: SymbolTableSelectors,
    }),
    compose(applyMiddleware(thunk))
  );
  return store;
};
