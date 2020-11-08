export const ACTION_SYMBOL_TABLE = 'SYMBOL_TABLE';

export const saveSymbolTable = (symbolTable) => ({
  type: ACTION_SYMBOL_TABLE,
  payload: symbolTable,
});

export const insertInSymbolTable = (token, tokenLevel) => async (dispatch, getState) => {
  const table = getState().symbolTable.table;
  dispatch(saveSymbolTable(table.push({ token, tokenLevel })));
};
