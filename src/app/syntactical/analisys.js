import * as SyntacticValidation from './validations';

// function getErrorMessage(error) {
//     return {
//         error: {
//             line: error.line,
//             description: error.description,
//         }
//     }
// }

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
    let response = {};
    if (SyntacticValidation.varValidation(tokenList[index])) {
        index += 1;
        if(SyntacticValidation.identifierValidation(tokenList[index])) {
            while(SyntacticValidation.identifierValidation(tokenList[index])) {
                response = varAnalysis(index, tokenList);
                console.log(response);
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
    let response = {};
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
    let response = { erro: false, index };
    
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
            // if (SyntacticValidation.semicolonValidation(tokenList[index])) {
            //     console.log('Leu o ponto e virgula');
            //     response = { error: true, index }
            // } else {
            //     console.log('Não encontrou ponto e virgula');
            //     response = { error: true, description: 'Falta ponto e virgula', line: tokenList[index].line, index }
            //     break;
            // }
        } else {
            console.log(response)
            break;
        }
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
        console.log('block', subroutineStepResponse);
        return subroutineStepResponse;
    }

    return subroutineStepResponse;

    // const commandsStepResponse = commandAnalysis(subroutineStepResponse.position, tokenList);
    // if (commandsStepResponse.error) {
    //     return getErrorMessage(commandsStepResponse.error);
    // }

    // return { position: commandsStepResponse.position };
}