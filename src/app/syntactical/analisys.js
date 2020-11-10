import * as SyntacticValidation from './validations';
import * as SymbolTable from '../symbolTable';

function lerToken(index, tokenList) {
    index += 1;
    if (tokenList.length <= index) {
        return { error: true, description: 'Arquivo chegou no fim, porém não foi encontrado o ponto', index, line: tokenList[index - 1].line }
    } else if (tokenList[index].symbol === 'Erro') {
        return { error: true, description: tokenList[index].lexeme, index, line: tokenList[index].line }
    }
    return { error: false, index };
}

function typeAnalysis(index, tokenList) {
    let response;
    if (SyntacticValidation.integerValidation(tokenList[index]) || SyntacticValidation.booleanValidation(tokenList[index])) {
        SymbolTable.insertTypeInSymbolTable(tokenList[index].lexeme);
        response = lerToken(index, tokenList);
    } else {
        response = { error: true, description: `Esperado inteiro ou booleano, porem encontrado ${tokenList[index].lexeme}`, index, line: tokenList[index].line }
    }
    return response;
}

function varAnalysis(index, tokenList) {
    let response = { error: false, index };
    do {
        if (SyntacticValidation.identifierValidation(tokenList[index])) {
            const isDuplicate = SymbolTable.searchDuplicateVariable(tokenList[index].lexeme)
            if (isDuplicate) return { error: true, description: `O identificador "${tokenList[index].lexeme}" já foi declarado!`, index, line: tokenList[index].line};

            SymbolTable.insertInSymbolTable(tokenList[index].lexeme, SymbolTable.TokenType.VARIABLE);
            response = lerToken(index, tokenList);
            if (response.error) return response;

            if (SyntacticValidation.commaValidation(tokenList[response.index]) || SyntacticValidation.doublePointValidation(tokenList[response.index])) {
                if (SyntacticValidation.commaValidation(tokenList[response.index])) {
                    response = lerToken(response.index, tokenList);
                    if (response.error) return response;
                    
                    if (SyntacticValidation.doublePointValidation(tokenList[response.index])) {
                        response = { error: true, description: `Esperado identificador, porem encontrado ${tokenList[response.index].lexeme}`, line: tokenList[response.index].line, index: response.index }
                        break;
                    }
                }
            } else {
                response = { error: true, description: `Esperado virgula ou dois pontos, porem encontrado ${tokenList[response.index].lexeme}`, line: tokenList[response.index].line, index: response.index }
                break;
            }
            index = response.index;
        } else {
            response = { error: true, description: `Esperado um identificador, porem encontrado ${tokenList[index].lexeme}`, line: tokenList[index].line, index }
            break;
        }
    } while (!SyntacticValidation.doublePointValidation(tokenList[index]));
    if (!response.error) {
        response = lerToken(index, tokenList);
        if (response.error) return response;
        const typeResponse = typeAnalysis(response.index, tokenList);
        if (typeResponse.error) {
            response = typeResponse;
        } else {
            response = { error: false, index: typeResponse.index };
        }
    }
    return response;
}

function etVarAnalysis(index, tokenList) {
    let response = { error: false, index };
    if (SyntacticValidation.varValidation(tokenList[index])) {
        response = lerToken(response.index, tokenList);
        if (response.error) return response;
        if (SyntacticValidation.identifierValidation(tokenList[response.index])) {
            index = response.index;
            while (SyntacticValidation.identifierValidation(tokenList[index])) {
                response = varAnalysis(response.index, tokenList);

                if (!response.error) {
                    index = response.index;
                    if (SyntacticValidation.semicolonValidation(tokenList[index])) {
                        response = lerToken(response.index, tokenList);
                        if (response.error) break;
                    } else {
                        response = { error: true, description: `Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`, line: tokenList[index].line, index }
                        break;
                    }
                } else break;
                index = response.index;
            }
        } else {
            response = { error: true, description: `Esperado identificador, porem encontrado ${tokenList[index].lexeme}`, line: tokenList[index].line, index }
        }
    }
    return response;
}

function subroutineDeclarationAnalysis(index, tokenList) {
    let response = {};
    response = lerToken(index, tokenList);
    if (response.error) return response;

    if (SyntacticValidation.identifierValidation(tokenList[response.index])) {
        response = lerToken(response.index, tokenList);
        if (response.error) return response;

        if (SyntacticValidation.semicolonValidation(tokenList[response.index])) {
            response = lerToken(response.index, tokenList);
            if (response.error) return response;

            SymbolTable.increaseLevel();
            response = blockAnalisys(response.index, tokenList);
        } else {
            response = { error: true, description: `Esperado ponto e virgula, porem encontrado ${tokenList[response.index].lexeme}`, line: tokenList[response.index].line, index: response.index };
        }
    } else {
        response = { error: true, description: `Esperado identificador, porem encontrado ${tokenList[response.index].lexeme}`, line: tokenList[response.index].line, index: response.index };
    }
    return response;
}

function functionDeclarationAnalysis(index, tokenList) {
    let response = { error: false, index };
    response = lerToken(index, tokenList);
    if (response.error) return response;

    if (SyntacticValidation.identifierValidation(tokenList[response.index])) {
        response = lerToken(response.index, tokenList);
        if (response.error) return response;

        if (SyntacticValidation.doublePointValidation(tokenList[response.index])) {
            response = lerToken(response.index, tokenList);
            if (response.error) return response;

            if (SyntacticValidation.booleanValidation(tokenList[response.index]) || SyntacticValidation.integerValidation(tokenList[response.index])) {
                if (SyntacticValidation.semicolonValidation(tokenList[response.index])) {
                    SymbolTable.increaseLevel();
                    response = blockAnalisys(response.index, tokenList);
                }
            }
            else {
                response = { error: true, description: `Esperado booleano ou inteiro, porem encontrado ${tokenList[response.index].lexeme}`, line: tokenList[response.index].line, index: response.index };
            }
        } else {
            response = { error: true, description: `Esperado dois pontos, porem encontrado ${tokenList[response.index].lexeme}`, line: tokenList[response.index].line, index: response.index };
        }
    } else {
        response = { error: true, description: `Esperado identificador, porem encontrado ${tokenList[response.index].lexeme}`, line: tokenList[response.index].line, index: response.index };
    }
    return response;
}

function subroutineAnalysis(index, tokenList) {
    let response = { error: false, index };

    while (SyntacticValidation.procedureValidation(tokenList[index]) || SyntacticValidation.functionValidation(tokenList[index])) {
        if (SyntacticValidation.procedureValidation(tokenList[index])) {
            response = subroutineDeclarationAnalysis(index, tokenList);
        } else {
            response = functionDeclarationAnalysis(index, tokenList);
        }
        if (!response.error) {
            index = response.index;
            if (SyntacticValidation.semicolonValidation(tokenList[index])) {
                response = lerToken(index, tokenList);
                if (response.error) return response;

                response = { error: false, index: response.index };
            } else {
                response = { error: true, description: `Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`, line: tokenList[index].line, index }
                break;
            }
        } else {
            break;
        }
        index = response.index;
    }

    return response;
}

function expressionAnalysis(index, tokenList) {
    let response = { error: false, index };
    response = simpleExpressionAnalysis(index, tokenList);
    if (response.error) return response;
    index = response.index;
    if (SyntacticValidation.biggerValidation(tokenList[index])
        || SyntacticValidation.bigEqualValidation(tokenList[index])
        || SyntacticValidation.equalValidation(tokenList[index])
        || SyntacticValidation.lowerValidation(tokenList[index])
        || SyntacticValidation.lowerEqualValidation(tokenList[index])
        || SyntacticValidation.diffValidation(tokenList[index])) {
        response = lerToken(index, tokenList);
        if (response.error) return response;

        response = simpleExpressionAnalysis(response.index, tokenList);
        return response;
    }

    return { error: false, index };
}

function simpleExpressionAnalysis(index, tokenList) {
    let response = {};
    if (SyntacticValidation.plusValidation(tokenList[index]) || SyntacticValidation.minusValidation(tokenList[index])) {
        response = lerToken(index, tokenList);
        if (response.error) return response;
        else index = response.index;
    }
    response = termAnalisys(index, tokenList);
    if (response.error) return response;

    index = response.index;
    while (SyntacticValidation.plusValidation(tokenList[index])
        || SyntacticValidation.minusValidation(tokenList[index])
        || SyntacticValidation.orValidation(tokenList[index])) {
        response = lerToken(index, tokenList);
        if (response.error) return response;

        response = termAnalisys(response.index, tokenList);
        return response;
    }

    return { error: false, index };
}

export function procedureAnalysis(index, tokenList) {
    return { error: false, index };
}

export function functionCallAnalisys(index, tokenList) {
    let response = lerToken(index, tokenList);
    if (response.error) return response;
    return { error: false, index: response.index };
}

export function assignmentAnalysis(index, tokenList) {
    let response = lerToken(index, tokenList);
    if (response.error) return response;

    response = expressionAnalysis(response.index, tokenList);
    return response;
}


export function factorAnalisys(index, tokenList) {
    let response = { error: false, index };

    if (SyntacticValidation.identifierValidation(tokenList[index])) {
        response = functionCallAnalisys(index, tokenList);
        return response;
    } else if (SyntacticValidation.numberValidation(tokenList[index])) {
        response = lerToken(index, tokenList);
        if (response.error) return response;

        return { error: false, index: response.index };
    } else if (SyntacticValidation.notValidation(tokenList[index])) {
        response = lerToken(index, tokenList);
        if (response.error) return response;

        response = factorAnalisys(response.index, tokenList);
        return response;
    } else if (SyntacticValidation.openBracketValidation(tokenList[index])) {
        response = lerToken(index, tokenList);
        if (response.error) return response;

        response = expressionAnalysis(response.index, tokenList);

        if (!response.error) {
            index = response.index;
            if (SyntacticValidation.closeBracketValidation(tokenList[index])) {
                response = lerToken(index, tokenList);
                if (response.error) return response;

                return { error: false, index: response.index };
            } else {
                return { error: true, description: `Esperado fecha parênteses, porem encontrado ${tokenList[index].lexeme}`, line: tokenList[index].line, index };
            }
        }
        return response;
    } else if (SyntacticValidation.trueValidation(tokenList[index]) || SyntacticValidation.falseValidation(tokenList[index])) {
        response = lerToken(index, tokenList);
        if (response.error) return response;

        return { error: false, index: response.index };
    } else {
        return { error: true, description: `Esperado um fator, porem encontrado ${tokenList[index].lexeme}`, line: tokenList[index].line, index };
    }
}

export function termAnalisys(index, tokenList) {
    let response = factorAnalisys(index, tokenList);
    if (response.error) return response;

    index = response.index;
    while (SyntacticValidation.multValidation(tokenList[index])
        || SyntacticValidation.divValidation(tokenList[index])
        || SyntacticValidation.andValidation(tokenList[index])) {
        response = lerToken(index, tokenList);
        if (response.error) return response;

        response = factorAnalisys(response.index, tokenList);
        return response;
    }

    return { error: false, index };
}

function assignmentOrProcedureAnalysis(index, tokenList) {
    let response = { error: false, index };
    response = lerToken(index, tokenList);
    if (response.error) return response;

    if (SyntacticValidation.assignmentValidation(tokenList[response.index])) {
        response = assignmentAnalysis(response.index, tokenList);
    } else {
        response = procedureAnalysis(response.index, tokenList);
    }

    return response;
}

function ifAnalysis(index, tokenList) {
    let response = { error: false, index };

    response = lerToken(index, tokenList);
    if (response.error) return response;

    response = expressionAnalysis(response.index, tokenList);
    index = response.index;
    if (!response.error && SyntacticValidation.elseValidation(tokenList[index])) {
        response = lerToken(index, tokenList);
        if (response.error) return response;

        response = simpleCommandAnalysis(response.index, tokenList);
        index = response.index;
        if (!response.error && SyntacticValidation.elseIfValidation(tokenList[index])) {
            response = lerToken(index, tokenList);
            if (response.error) return response;
            response = simpleCommandAnalysis(response.index, tokenList);
        }
    }

    return response;
}

function whileAnalysis(index, tokenList) {
    let response = { error: false, index };

    response = lerToken(index, tokenList);
    if (response.error) return response;

    response = expressionAnalysis(response.index, tokenList);
    index = response.index;
    if (response.error) return response;

    if (SyntacticValidation.doValidation(tokenList[index])) {
        response = lerToken(index, tokenList);
        if (response.error) return response;

        response = simpleCommandAnalysis(response.index, tokenList);
        index = response.index;
    } else {
        response = { error: true, description: `Esperado o comando faça, porem encontrado ${tokenList[index].lexeme}`, line: tokenList[index].line, index };
    }

    return response;
}

function readAnalysis(index, tokenList) {
    let response = { error: false, index };

    response = lerToken(index, tokenList);
    if (response.error) return response;

    if (SyntacticValidation.openBracketValidation(tokenList[response.index])) {
        response = lerToken(response.index, tokenList);
        if (response.error) return response;

        if (SyntacticValidation.identifierValidation(tokenList[response.index])) {
            response = lerToken(response.index, tokenList);
            if (response.error) return response;

            if (SyntacticValidation.closeBracketValidation(tokenList[response.index])) {
                response = lerToken(response.index, tokenList);
                if (response.error) return response;

            } else {
                response = { error: true, description: `Esperado fecha parênteses, porem encontrado ${tokenList[response.index].lexeme}`, line: tokenList[response.index].line, index: response.index };
            }
        } else {
            response = { error: true, description: `Esperado identificador, porem encontrado ${tokenList[response.index].lexeme}`, line: tokenList[response.index].line, index: response.index };
        }
    } else {
        response = { error: true, description: `Esperado abre parênteses, porem encontrado ${tokenList[response.index].lexeme}`, line: tokenList[response.index].line, index: response.index };
    }

    return response;
}

function writeAnalysis(index, tokenList) {
    let response = { error: false, index };

    response = lerToken(index, tokenList);
    if (response.error) return response;

    if (SyntacticValidation.openBracketValidation(tokenList[response.index])) {
        response = lerToken(response.index, tokenList);
        if (response.error) return response;

        if (SyntacticValidation.identifierValidation(tokenList[response.index])) {
            response = lerToken(response.index, tokenList);
            if (response.error) return response;

            if (SyntacticValidation.closeBracketValidation(tokenList[response.index])) {
                response = lerToken(response.index, tokenList);
                if (response.error) return response;

            } else {
                response = { error: true, description: `Esperado fecha parênteses, porem encontrado ${tokenList[response.index].lexeme}`, line: tokenList[response.index].line, index: response.index };
            }
        } else {
            response = { error: true, description: `Esperado identificador, porem encontrado ${tokenList[response.index].lexeme}`, line: tokenList[response.index].line, index: response.index };
        }
    } else {
        response = { error: true, description: `Esperado abre parênteses, porem encontrado ${tokenList[response.index].lexeme}`, line: tokenList[response.index].line, index: response.index };
    }

    return response;
}

function simpleCommandAnalysis(index, tokenList) {
    let response = { error: false, index };

    if (SyntacticValidation.identifierValidation(tokenList[index])) {
        response = assignmentOrProcedureAnalysis(index, tokenList);

    } else if (SyntacticValidation.ifValidation(tokenList[index])) {
        response = ifAnalysis(index, tokenList);

    } else if (SyntacticValidation.whileValidation(tokenList[index])) {
        response = whileAnalysis(index, tokenList);

    } else if (SyntacticValidation.readValidation(tokenList[index])) {
        response = readAnalysis(index, tokenList);

    } else if (SyntacticValidation.writeValidation(tokenList[index])) {
        response = writeAnalysis(index, tokenList);

    } else {
        response = commandAnalysis(index, tokenList);

    }

    return response;
}

function commandAnalysis(index, tokenList) {
    let response = { error: false, index };

    if (SyntacticValidation.initValidation(tokenList[index])) {
        response = lerToken(index, tokenList);
        if (response.error) return response;

        response = simpleCommandAnalysis(response.index, tokenList);
        if (response.error) return response;
        index = response.index;

        while (!SyntacticValidation.endValidation(tokenList[index])) {
            if (SyntacticValidation.semicolonValidation(tokenList[index])) {
                response = lerToken(index, tokenList);
                if (response.error) return response;

                if (!SyntacticValidation.endValidation(tokenList[response.index])) {
                    response = simpleCommandAnalysis(response.index, tokenList);
                    if (response.error) return response;
                }

                index = response.index;
            } else {
                return { error: true, description: `Esperado ponto e virgula, porem encontrado ${tokenList[index].lexeme}`, line: tokenList[index].line, index };
            }
        }

        response = lerToken(index, tokenList);
        if (response.error) return response;
        response = { error: false, index: response.index };
    } else {
        response = { error: true, description: `Esperado inicio, porem encontrado ${tokenList[index].lexeme}`, line: tokenList[index].line, index };
    }

    return response;
}

export function blockAnalisys(index, tokenList) {
    const varStepResponse = etVarAnalysis(index, tokenList);
    if (varStepResponse.error) {
        return varStepResponse;
    }

    const subroutineStepResponse = subroutineAnalysis(varStepResponse.index, tokenList);
    if (subroutineStepResponse.error) {
        return subroutineStepResponse;
    }

    const commandsStepResponse = commandAnalysis(subroutineStepResponse.index, tokenList);
    if (commandsStepResponse.error) {
        return commandsStepResponse;
    }

    SymbolTable.decreaseLevel();
    return commandsStepResponse;
}