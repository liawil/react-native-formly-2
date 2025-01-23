'use strict';

var fieldTypeMap = {};

module.exports = {
    addType: addType,
    getTypes: getTypes,
    getTypeComponent: getTypeComponent,
    clearTypes: clearTypes
};

//field functions
function addType(name, config) {
    if (Array.isArray(name)) {
        name.forEach(function (fieldType) {
            addType(fieldType);
        });
    } else if (typeof name === 'object') {
        config = { "component": name.component, "controller": name.controller, wrapper: name.wrapper };
        name = name.name;
    }
    fieldTypeMap[name] = config;
}

function getTypes() {
    return fieldTypeMap;
}
function getTypeComponent(name) {
    var fieldObject = fieldTypeMap[name];
    if (fieldObject)
        return fieldObject.component;
}

function clearTypes() {
    var oldTypes = fieldTypeMap;
    fieldTypeMap = {};
    return oldTypes;
}
