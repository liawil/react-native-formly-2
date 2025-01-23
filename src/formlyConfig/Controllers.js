'use strict';

var controllerTypeMap = {};

module.exports = {
    addType: addType,
    getTypes: getTypes,
    clearTypes: clearTypes
};
// controllers functions
function addType(name, controller) {
    if (Array.isArray(name)) {
        name.forEach(function (controllerType) {
            addType(controllerType);
        });
    } else if (typeof name === 'object') {
        controller = name.controller;
        name = name.name;
    }
    controllerTypeMap[name] = controller;
}

function getTypes() {
    return controllerTypeMap;
}

function clearTypes() {
    var oldTypes = controllerTypeMap;
    controllerTypeMap = {};
    return oldTypes;
}