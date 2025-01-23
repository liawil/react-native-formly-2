'use strict';

var validatorTypeMap = {};

module.exports = {
    addType: addType,
    getTypes: getTypes,
    clearTypes: clearTypes
};
/* accepts object containing one or more validator 
{'name':{
    expression:function/expression/regex/boolean,
    message: function/expression
    }
} */
function addType(validator) {
    for (const key of Object.keys(validator)) {
        if(!key)
         throw new Error("Formly Config: failed to add validator ("+key+'), validator should have a key');

        if (validator[key].hasOwnProperty('expression'))
            validatorTypeMap[key] = validator[key];
        else
         throw new Error("Formly Config: failed to add validator ("+key+'), validator should have expression');
    };
}

function getTypes() {
    return validatorTypeMap;
}

function clearTypes() {
    var oldTypes = validatorTypeMap;
    validatorTypeMap = {};
    return oldTypes;
}