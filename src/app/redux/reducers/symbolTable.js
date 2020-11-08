import { ACTION_SYMBOL_TABLE } from '../actions/symbolTable';

const initialState = {
  table: [],
};

export default function symbolTable(state = initialState, action) {
  switch (action.type) {
    case ACTION_SYMBOL_TABLE:
      state = {
        ...state,
        table: action.payload,
      };
      return state;
    default:
      return state;
  }
}

export function getSymbolTable(state) {
  return state && state.symbolTable && state.symbolTable.table;
}
