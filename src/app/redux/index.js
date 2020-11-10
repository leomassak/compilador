import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

export default () => {
  const store = createStore(
    combineReducers({}),
    compose(applyMiddleware(thunk))
  );
  return store;
};
