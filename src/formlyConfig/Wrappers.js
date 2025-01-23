'use strict';

const wrappersMap = {};
const defaultWrapperName = 'default';

module.exports = {
    setWrapper: setWrapper,
    getWrappers: getWrappers,
    getWrapperComponent: getWrapperComponent,
    getWrappersComponentsByType: getWrappersComponentsByType,
    clearWrappers: clearWrappers
};
// wrappers functions
function setWrapper(name, options) {
    if (Array.isArray(name)) {
        name.forEach(function (wrapperType) {
            setWrapper(wrapperType);
        });
    } else if (typeof name === 'object') {
        options = { "types": name.types, component: name.component };
        name = name.name;
        setWrapper(name, options);
    } else {
        options.types = _getOptionsTypes(options);
        name = _getOptionsName(name, options);
        _checkWrapperAPI(name, options);
        wrappersMap[name] = options;
    }
}

function _checkWrapperAPI(name, options) {
    //do all types of checks here
    _checkWrapperTypes(options)
}
function _checkWrapperTypes(options) {
    const shouldThrow = !Array.isArray(options.types) || !options.types.every(type => typeof type === 'string')
    if (shouldThrow) {
        throw new Error(`Formly Config: Attempted to create a template wrapper with types that is not a string or an array of strings`)
    }
}
function getWrappers() {
    return wrappersMap;
}
function getWrapperComponent(name) {
    //undefined name returns the default wrapper
    var wrapperObject = wrappersMap[name || defaultWrapperName];
    if (wrapperObject)
        return wrapperObject.component;
    else if(name) //if the name was set to a wrapper name that doesn't exist'
        throw new Error('Formly: "' + name + '" has not been added to FormlyConfig\'s wrapper types.');

}

function getWrappersComponentsByType(type) {
    const wrappers = []
    for (let name in wrappersMap) {
        if (wrappersMap[name].types && wrappersMap[name].types.indexOf(type) !== -1) {
            wrappers.push(wrappersMap[name].component)
        }
    }
    return wrappers
}

function _getOptionsName(name, options) {
    return name || options.types.join(' ') || defaultWrapperName
}
function _getOptionsTypes(options) {
    if (typeof options.types === 'string') {
        return [options.types]
    }
    else if (!options.types) {
        return []
    } else {
        return options.types
    }
}

function clearWrappers() {
    var oldTypes = wrappersMap;
    wrappersMap = {};
    return oldTypes;
}