import * as SyntacticValidation from './validations';


function typeAnalysis(index, tokenList) {
    let response;
    if (SyntacticValidation.integerValidation(tokenList[index]) || SyntacticValidation.booleanValidation(tokenList[index])) {
        response = { error: false, index: index + 1 }
    } else {
        response = { error: true, description: 'Tipo diferente de inteiro ou booleano', index, line: tokenList[index].line }
    }
    return response;
}

function varAnalysis(index, tokenList) {
    let response = {};
    do {
        // console.log('analisa variavel',tokenList[index]);
        if (SyntacticValidation.identifierValidation(tokenList[index])) {
            index += 1;
            // console.log('analisa variavel', tokenList[index])
            if (SyntacticValidation.commaValidation(tokenList[index]) || SyntacticValidation.doublePointValidation(tokenList[index])) {
                if (SyntacticValidation.commaValidation(tokenList[index])) {
                    index += 1;
                    // console.log('analisa variavel', tokenList[index])
                    if (SyntacticValidation.doublePointValidation(tokenList[index])) {
                        response = { error: true, description: 'Dois pontos após a virgula', line: tokenList[index].line, index }
                        break;
                    }
                }
            } else {
                response = { error: true, description: 'Não foi encontrada a virgula ou dois pontos após o identificador', line: tokenList[index].line, index }
                break;
            }
        } else {
            response = { error: true, description: 'Não existe identificador após a declaração de variável', line: tokenList[index].line, index }
            break;
        }
    } while (!SyntacticValidation.doublePointValidation(tokenList[index]));
    if (!response.error) {
        index += 1;
        const typeResponse = typeAnalysis(index, tokenList);
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
        index += 1;
        if(SyntacticValidation.identifierValidation(tokenList[index])) {
            while(SyntacticValidation.identifierValidation(tokenList[index])) {
                response = varAnalysis(index, tokenList);
                console.log('varAnalysis', response, tokenList[response.index]);
                if (!response.error) {
                    index = response.index;
                    if (SyntacticValidation.semicolonValidation(tokenList[index])) {
                        index += 1;
                        response = { ...response, index };
                    } else {
                        response = { error: true, description: 'Ponto e virgula não encontrado', line: tokenList[index].line, index }
                        break;
                    }
                } else break;
            }
        } else {
            response = { error: true, description: 'Declaração de variável sem identificador', line: tokenList[index].line, index }
        }
    }
    return response;
}

function subroutineDeclarationAnalysis(index, tokenList) {
    let response = {};
    index += 1;
    if (SyntacticValidation.identifierValidation(tokenList[index])) {
        console.log('subroutineDeclarationAnalysis, identificador OK');
        index += 1;
        if (SyntacticValidation.semicolonValidation(tokenList[index])) {
            index += 1;
            console.log('TUDO OK', index);
            response = blockAnalisys(index, tokenList);
            console.log('blockAnalisys', response)
        } else {
            response = { error: true, description: 'Falta do ponto e virgula', line: tokenList[index].line, index };
        }
    } else {
        console.log(index, tokenList[index]);
        response = { error: true, description: 'Falta identificador', line: tokenList[index].line, index };
    }
    return response;
}

function functionDeclarationAnalysis(index, tokenList) {
    let response = { error: false, index };
    console.log(index, tokenList[index])
    index += 1;
    if (SyntacticValidation.identifierValidation(tokenList[index])) {
        index += 1;
        if (SyntacticValidation.doublePointValidation(tokenList[index])) {
            index += 1;
            if (SyntacticValidation.booleanValidation(tokenList[index]) || SyntacticValidation.integerValidation(tokenList[index])) {
                if (SyntacticValidation.semicolonValidation(tokenList[index])) {
                    console.log(index);
                    response = blockAnalisys(index, tokenList);
                    console.log('blockAnalisys', response)
                }
            }
            else {
                response = { error: true, description: 'Não foi encontrado o tipo da função', line: tokenList[index].line, index };
            }
        } else {
            response = { error: true, description: 'Não encontrado os dois pontos', line: tokenList[index].line, index };
        }
    } else {
        console.log(index, tokenList[index]);
        response = { error: true, description: 'Falta identificador', line: tokenList[index].line, index };
    }
    return response;
}

function subroutineAnalysis(index, tokenList) {
    let response = { error: false, index };
    
    while (SyntacticValidation.procedureValidation(tokenList[index]) || SyntacticValidation.functionValidation(tokenList[index])) {
        if (SyntacticValidation.procedureValidation(tokenList[index])) {
            response = subroutineDeclarationAnalysis(index, tokenList);
            console.log('subroutineDeclarationAnalysis', response);
        } else {
            response = functionDeclarationAnalysis(index, tokenList);
            console.log('functionDeclarationAnalysis', response);
        }
        if (!response.error) {
            index = response.index;
            if (SyntacticValidation.semicolonValidation(tokenList[index])) {
                console.log('Leu o ponto e virgula');
                response = { error: false, index }
            } else {
                console.log('Não encontrou ponto e virgula');
                response = { error: true, description: 'Falta ponto e virgula', line: tokenList[index].line, index }
                break;
            }
        } else {
            console.log(response)
            break;
        }
    }

    return response;
}

function expressionAnalysis(index, tokenList) {
    let response = { error: false, index };
    console.log(index, tokenList);
    response = simpleExpressionAnalysis(index, tokenList);
    if (response.error) {
        return response;
    }

    index = response.index;
    if (SyntacticValidation.biggerValidation(tokenList[index])
        || SyntacticValidation.bigEqualValidation(tokenList[index])
        || SyntacticValidation.equalValidation(tokenList[index])
        || SyntacticValidation.lowerValidation(tokenList[index])
        || SyntacticValidation.lowerEqualValidation(tokenList[index])
        || SyntacticValidation.diffValidation(tokenList[index])) {
        index += 1;
        response = simpleExpressionAnalysis(index, tokenList);
        return response;
    }

    return { error: false, index };
}

function simpleExpressionAnalysis(index, tokenList) {
    let response = {};
    console.log(index, tokenList[index]);
    if (SyntacticValidation.plusValidation(tokenList[index]) || SyntacticValidation.minusValidation(tokenList[index])) {
        index += 1;
        response = termAnalisys(index, tokenList);

        if (response.error) {
            return response;
        }

        index = response.index;
        while (SyntacticValidation.plusValidation(tokenList[index])
            || SyntacticValidation.minusValidation(tokenList[index])
            || SyntacticValidation.orValidation(tokenList[index])) {
            index += 1;
            response = termAnalisys(index, tokenList);
            return response;
        }
    }

    return { error: false, index };
}

export function procedureAnalysis(index, tokenList) {
    return { error: false, index };
}

export function functionCallAnalisys(index, tokenList) {
    return { error: false, index: index + 1 };
}

export function assignmentAnalysis(index, tokenList) {
    index += 1;
    console.log(index, tokenList);
    const response = expressionAnalysis(index, tokenList);
    return response;
}


export function factorAnalisys(index, tokenList) {
    let response = { error: false, index };

    if (SyntacticValidation.identifierValidation(tokenList[index])) {
        response = functionCallAnalisys();
        return response;
    } else if (SyntacticValidation.numberValidation(tokenList[index])) {
        index += 1;
    } else if (SyntacticValidation.notValidation(tokenList[index])) {
        index += 1;
        response = factorAnalisys(index, tokenList);
        return response;
    } else if (SyntacticValidation.openBracketValidation(tokenList[index])) {
        index += 1;
        console.log('factor', index, tokenList[index]);
        response = expressionAnalysis(index, tokenList);
        if (!response.error) {
            index = response.index;
            if (SyntacticValidation.closeBracketValidation(tokenList[index])) {
                index += 1;
                return { error: false, index };
            } else {
                return { error: true, description: 'Não encontrou fecha parênteses', line: tokenList[index].line, index };
            }
        }
        return response;
    } else if (SyntacticValidation.trueValidation(tokenList[index]) || SyntacticValidation.falseValidation(tokenList[index])) {
        index += 1;
        return { error: false, index };
    } else {
        return { error: true, description: 'Não entendi esse erro', line: tokenList[index].line, index };
    }
}

export function termAnalisys(index, tokenList) {
    let response = factorAnalisys(index, tokenList);

    if (response.error) {
        return response
    }

    index = response.index;
    while (SyntacticValidation.multValidation(tokenList[index])
        || SyntacticValidation.divValidation(tokenList[index])
        || SyntacticValidation.andValidation(tokenList[index])) {
        index += 1;
        response = factorAnalisys(index, tokenList);
        return response;
    }
}

function assignmentOrProcedureAnalysis(index, tokenList) {
    let response = { error: false, index };

    index += 1;
    if (SyntacticValidation.assignmentValidation(tokenList[index])) {
        response = assignmentAnalysis(index, tokenList);
    } else {
        response = procedureAnalysis(index, tokenList);
    }

    return response;
}

function ifAnalysis(index, tokenList) {
    let response = { error: false, index };

    index += 1;
    console.log('if', index, tokenList[index]);
    response =  expressionAnalysis(index, tokenList);
    if (!response.error && SyntacticValidation.elseValidation(tokenList[index])) {
        index += 1;
        response = simpleCommandAnalysis(index, tokenList);
        if (!response.error && SyntacticValidation.elseIfValidation(tokenList[index])) {
            index += 1;
            simpleCommandAnalysis(index, tokenList);
        }
    }

    return response;
}

function whileAnalysis(index, tokenList) {
    let response = { error: false, index };

    index += 1;
    console.log('while', index, tokenList[index]);
    response = expressionAnalysis(index, tokenList);
    if (!response.error && SyntacticValidation.doValidation(tokenList[index])) {
        index += 1;
        response = simpleCommandAnalysis(index, tokenList);
    } else {
        response = { error: true, description: 'Não encontrou o comando faça', line: tokenList[index].line, index };
    }

    return response;
}

function readAnalysis(index, tokenList) {
    let response = { error: false, index };

    index += 1;
    if (SyntacticValidation.openBracketValidation(tokenList[index])) {
        index += 1;
        if (SyntacticValidation.identifierValidation(tokenList[index])) {
            index += 1;
            if (SyntacticValidation.closeBracketValidation(tokenList[index])) {
                index += 1;
                response = { error: false, index };

            } else {
                response = { error: true, description: 'Não encontrou o fecha parênteses', line: tokenList[index].line, index };
            }
        } else {
            response = { error: true, description: 'Não encontrou o identificador', line: tokenList[index].line, index };
        }
    } else {
        response = { error: true, description: 'Não encontrou o abre parênteses', line: tokenList[index].line, index };
    }

    return response;
}

function writeAnalysis(index, tokenList) {
    let response = { error: false, index };

    index += 1;
    if (SyntacticValidation.openBracketValidation(tokenList[index])) {
        index += 1;
        if (SyntacticValidation.identifierValidation(tokenList[index])) {
            index += 1;
            if (SyntacticValidation.closeBracketValidation(tokenList[index])) {
                index += 1;
                response = { error: false, index };

            } else {
                response = { error: true, description: 'Não encontrou o fecha parênteses', line: tokenList[index].line, index };
            }
        } else {
            response = { error: true, description: 'Não encontrou o identificador', line: tokenList[index].line, index };
        }
    } else {
        response = { error: true, description: 'Não encontrou o abre parênteses', line: tokenList[index].line, index };
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
        index += 1;
        console.log('commandAnalysis', index, tokenList[index]);
        simpleCommandAnalysis(index, tokenList);
        while (!SyntacticValidation.endValidation(tokenList[index])) {
            index += 1;
            if (SyntacticValidation.doublePointValidation(tokenList[index])) {
                simpleCommandAnalysis(index, tokenList);
            } else {
                response = { error: true, description: 'Não foi encontrado o ponto e virgula', line: tokenList[index].line, index };
                break;
            }
        }
    } else {
        response = { ...response, error: true, description: 'Não foi encontrado o comando início', line: tokenList[index].line };
    }

    return response;
}

export function blockAnalisys(index, tokenList) {
    const varStepResponse = etVarAnalysis(index, tokenList);
    if (varStepResponse.error) {
        console.log('block', varStepResponse);
        return varStepResponse;
    }

    const subroutineStepResponse = subroutineAnalysis(varStepResponse.index, tokenList);
    if(subroutineStepResponse.error) {
        console.log('block2', subroutineStepResponse);
        return subroutineStepResponse;
    }

    const commandsStepResponse = commandAnalysis(subroutineStepResponse.index, tokenList);
    if (commandsStepResponse.error) {
        console.log('block3', commandsStepResponse);
        return commandsStepResponse;
    }

    return commandsStepResponse;
}