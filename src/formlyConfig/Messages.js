'use strict';

var messageTypeMap = {};

module.exports = {
    addType: addType,
    getTypes: getTypes,
    clearTypes: clearTypes
};
// messages functions
function addType(name, message) {
    if (Array.isArray(name)) {
        name.forEach(function (messageType) {
            addType(messageType);
        });
    } else if (typeof name === 'object') {
        message = name.message;
        name = name.name;
    }
    messageTypeMap[name] = message;
}

function getTypes() {
    return messageTypeMap;
}

function clearTypes() {
    var oldTypes = messageTypeMap;
    messageTypeMap = {};
    return oldTypes;
}