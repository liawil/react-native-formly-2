'use strict';

var asyncValidatorTypeMap = {};

module.exports = {
    addType: addType,
    getTypes: getTypes,
    clearTypes: clearTypes
};
/* accepts object containing one or more asyncValidator 
{'name':{
    expression:function/expression/regex/boolean,
    message: function/expression
    }
} */
function addType(asyncValidator) {
    for (const key of Object.keys(asyncValidator)) {
        if(!key)
         new Error("Formly Config: failed to add asyncValidator ("+key+'), asyncValidator should have a key');

        if (asyncValidator[key].hasOwnProperty('expression') && (typeof asyncValidator[key].expression === 'function' ))
            asyncValidatorTypeMap[key] = asyncValidator[key];
        else
         throw new  Error("Formly Config: failed to add asyncValidator ("+key+'), asyncValidator should have expression of type function');
    };
}

function getTypes() {
    return asyncValidatorTypeMap;
}

function clearTypes() {
    var oldTypes = asyncValidatorTypeMap;
    asyncValidatorTypeMap = {};
    return oldTypes;
}