import * as SemanticAnalisys from '../semantic';
export let code = '';
export let allocatedSpace = 0;

export const startProgram = () => {
  code += 'START\n';
};

export const endProgram = () => {
  code += 'HLT';
};

export const allocVariable = (allocNumber, comment) => {
  // code += `ALLOC ${allocatedSpace},${allocNumber}${comment ? ` // ${comment}` : ''}\n`;
  code += `ALLOC ${allocatedSpace},${allocNumber}\n`;
  allocatedSpace += allocNumber;
}

export const dallocVariable = (dallocNumber, comment) => {
  // code += `DALLOC ${allocatedSpace - dallocNumber},${dallocNumber}${comment ? ` // ${comment}` : ''}\n`;
  code += `DALLOC ${allocatedSpace - dallocNumber},${dallocNumber}\n`;
  allocatedSpace -= dallocNumber;
}

export const read = (identifier, comment) => {
  // code += `RD\nSTR ${identifier.variableLabel}${comment ? ` // ${comment}` : ''}\n`;
  code += `RD\nSTR ${identifier.variableLabel}\n`;
}

export const write = (identifier, comment) => {
  if (identifier.tokenFunc !== SemanticAnalisys.TokenType.VARIABLE) callFunctionOrProcedure(identifier.label);
  const position = identifier.tokenFunc === SemanticAnalisys.TokenType.VARIABLE
    ? identifier.variableLabel
    : 0;

  // code += `LDV ${position}\nPRN${comment ? ` // ${comment}` : ''}\n`;
  code += `LDV ${position}\nPRN\n`;
}

export const callFunctionOrProcedure = (label) => {
  // code += `CALL ${label} //Chamou Função ou Procedimento\n`;
  code += `CALL ${label}\n`;
}

export const endFunctionOrProcedure = () => {
  // code += 'RETURN //Finalizou Função ou Procedimento\n';
  code += 'RETURN\n';
}

export const callNull = (label, comment) => {
  // code += `${label ? `L${label} ` : ''}NULL${comment ? ` // ${comment}` : ''}\n`;
  code += `${label ? `L${label} ` : ''}NULL\n`;
}

export const JMPF = (label, comment) => {
  // code += `JMPF ${label ? `L${label}` : ''}${comment ? ` // ${comment}` : ''}\n`;
  code += `JMPF ${label ? `L${label}` : ''}\n`;
}

export const JMP = (label, comment) => {
  // code += `JMP ${label ? `L${label}` : ''}${comment ? ` // ${comment}` : ''}\n`;
  code += `JMP ${label ? `L${label}` : ''}\n`;
}

export const ldc = (constant, comment) => {
  // code += `LDC ${constant}${comment ? ` // ${comment}` : ''}\n`;
  code += `LDC ${constant}\n`;
}

export const ldv = (variablePosition, comment) => {
  // code += `LDV ${variablePosition}${comment ? ` // ${comment}` : ''}\n`;
  code += `LDV ${variablePosition}\n`;
}

export const writeOperation = (operator, comment) => {
  // code += `${operator}${comment ? ` // ${comment}` : ''}\n`;
  code += `${operator}\n`;
}

export const assignment = (variablePosition, comment) => {
  // code += `STR ${variablePosition}${comment ? ` // ${comment}` : ''}\n`;
  code += `STR ${variablePosition}\n`;
}

export const consoleProgram = () => console.log(code);

export const resetProgram = () => {
  code = '';
  allocatedSpace = 0;
}
