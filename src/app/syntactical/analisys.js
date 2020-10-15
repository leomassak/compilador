import * as SyntacticValidation from './validations';

function getErrorMessage(error) {
    return {
        error: {
            line: error.line,
            description: error.description,
        }
    }
}

function varStepAnalisys(index, tokenList) {
    if (SyntacticValidation.varValidation(tokenList[index])) {
        if(SyntacticValidation.identifierValidation(tokenList[index + 1])) {
            index += 1;
            while(SyntacticValidation.identifierValidation(tokenList[index])) {
                varStepAnalisys(index, tokenList);
            }
            //Continue
        } else {
            return
        }
    }
}

export function blockAnalisys(index, tokenList) {
    const varStepResponse = varStepAnalisys(index, tokenList);
    if (varStepResponse.error) {
        return getErrorMessage(varStepResponse.error);
    }

    const subroutineStepResponse = subroutineAnalisys(varStepResponse.position, tokenList);
    if(subroutineStepResponse.error) {
        return getErrorMessage(subroutineStepResponse.error);
    }

    const commandsStepResponse = commandAnalisys(subroutineStepResponse.poisition, tokenList);
    if (commandsStepResponse.error) {
        return getErrorMessage(commandsStepResponse.error);
    }

    return { position: commandsStepResponse.position };
}