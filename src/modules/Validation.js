'use strict';
import FormlyExpressions from 'react-native-formly/src/modules/FormlyExpressions';
import Utils from 'react-native-formly/src/modules/Utils';
import {ValidationsConfig, AsyncValidationsConfig, MessagesConfig}  from 'react-native-formly/src/formlyConfig';

export default class FieldValidator {
    constructor() {
        this.validateField = this.validateField.bind(this);

        this.subscribeToValidation = this.subscribeToValidation.bind(this);
        this.unsubscribeToValidation = this.unsubscribeToValidation.bind(this);

        this.subscribeToAsyncValidation = this.subscribeToAsyncValidation.bind(this);
        this.unsubscribeToAsyncValidation = this.unsubscribeToAsyncValidation.bind(this);

        this._subscribedValidators = {};
        this._subscribedAsyncValidators = {};
        this._lastFieldValidation;
    }
    //////////////////////////////////////////validators functions////////////////////////////////////
    /*  accepts arguments in the following formats:
        subscribeToValidation(name1,param1)
        subscribeToValidation(['name1','name2'...])
        subscribeToValidation([{name:'name1',param:param1},{name:'name1',param:param1}...])
    */
    subscribeToValidation(name, param) {
        if (Array.isArray(name)) {
            name.forEach(function (validatorName) {
                this.subscribeToValidation(validatorName);
            }, this);
        } else if (typeof name === 'object') {
            name = name.name;
            param = name.param;
        }

        if (name && ValidationsConfig.getTypes().hasOwnProperty(name))
            this._subscribedValidators[name] = param;
        else
            throw new Error("Formly Validation: There was no validator added to formly ValidationsConfig with the following name: " + name);

    }

    unsubscribeToValidation(name) {
        if (Array.isArray(name)) {
            name.forEach(function (validatorName) {
                this.unsubscribeToValidation(validatorName);
            }, this);
        }
        delete this._subscribedValidators[name];
    }
    //////////////////////////////////////////asyncvalidators functions////////////////////////////////////
    /*  accepts arguments in the following formats:
        subscribeToValidation(name1,param1)
        subscribeToValidation(['name1','name2'...])
        subscribeToValidation([{name:'name1',param:param1},{name:'name1',param:param1}...])
    */
    subscribeToAsyncValidation(name, param) {
        if (Array.isArray(name)) {
            name.forEach(function (validatorName) {
                this.subscribeToAsyncValidation(validatorName);
            }, this);
        } else if (typeof name === 'object') {
            name = name.name;
            param = name.param;
        }

        if (name && AsyncValidationsConfig.getTypes().hasOwnProperty(name))
            this._subscribedAsyncValidators[name] = param;
        else
            throw new Error("Formly Validation: There was no validator added to formly AsyncValidationsConfig with the following name: " + name);
    }

    unsubscribeToAsyncValidation(name) {
        if (Array.isArray(name)) {
            name.forEach(function (validatorName) {
                this.unsubscribeToAsyncValidation(validatorName);
            }, this);
        }
        delete this._subscribedAsyncValidators[name];
    }



    validateField(viewValue, modelValue, model, fieldConfig, onValidationUpdate) {
        if (this._lastFieldValidation instanceof FieldValidations) this._lastFieldValidation.closeRunningAsyncValidators();
        this._lastFieldValidation = new FieldValidations(this._subscribedValidators, this._subscribedAsyncValidators, fieldConfig);
        return this._lastFieldValidation.validateField(viewValue, modelValue, model, onValidationUpdate);
    }
};

//this object is designed to be used in one validation cycle
class ValidationObject {
    constructor() {
        this.validation = { isValid: true, errors: {}, messages: {} };
    }
    isValid() {
        return this.validation.isValid;
    }
    getValidation() {
        //return cloned value to the caller so it won't be accessed by refrence
        return Object.assign({}, this.validation);
    }
    addError(key, message) {

        this.validation.errors[key] = true;
        if (message)
            this.validation.messages[key] = message;

        this._updateIsValid();
    }
    addToPending(key) {
        if (!this.validation.pending)
            this.validation.pending = {};

        this.validation.pending[key] = true;
        this._updateIsValid();
    }
    removeFromPending(key) {
        if (this.validation.pending)
            delete this.validation.pending[key];
        //remove pending object if it is empty
        if (Utils.isEmptyObject(this.validation.pending)) {
            delete this.validation.pending;
        }
        this._updateIsValid();
    }
    removeError(key) {
        delete this.validation.errors[key];
        delete this.validation.messages[key];
        this._updateIsValid();
    }
    _updateIsValid() {
        if (Utils.isEmptyObject(this.validation.errors) && !this.validation.pending)
            this.validation.isValid = true;
        else if (!Utils.isEmptyObject(this.validation.errors) && !this.validation.pending)
            this.validation.isValid = false;
        else
            delete this.validation.isValid;


    }

};






class FieldValidations {
    constructor(subscribedValidations, subscribedAsyncValidations, fieldConfig) {
        this.fieldConfig = fieldConfig;
        this.validateField = this.validateField.bind(this);

        this._subscribedValidators = this._subscribedValidators.bind(this);
        this._subscribedAsyncValidators = this._subscribedAsyncValidators.bind(this);
        this._validationMessagesFromConfig = this._validationMessagesFromConfig.bind(this);
        this._validatorsFromConfig = this._validatorsFromConfig.bind(this);
        this._asyncValidatorsFromConfig = this._asyncValidatorsFromConfig.bind(this);

        //validators priority:  _subscribedValidators <  _validationMessagesFromConfig < _validatorsFromConfig
        //preserve the order of merging to keep this behaviour consistent with angular formly
        this.validators = Object.assign({}, this._subscribedValidators(subscribedValidations), this._validationMessagesFromConfig(fieldConfig), this._validatorsFromConfig(fieldConfig));
        this.asyncValidators = Object.assign({}, this._subscribedAsyncValidators(subscribedAsyncValidations), this._validationMessagesFromConfig(fieldConfig), this._asyncValidatorsFromConfig(fieldConfig));

        this.removeValidatorsWithNoExpressions(this.validators);
        this.removeValidatorsWithNoExpressions(this.asyncValidators);

        this._runningAsyncValidators = {};
    }
    removeValidatorsWithNoExpressions(obj) {
        for (const key of Object.keys(obj)) {
            if (!obj[key].hasOwnProperty('expression'))
                delete obj[key];
        };
    }
    ///////////////////////////////////subscribed///////////////////////////////////
    _subscribedValidators(subscribedValidations) {
        var validators = {};
        for (const key of Object.keys(subscribedValidations)) {

            var validation = ValidationsConfig.getTypes()[key] ? ValidationsConfig.getTypes()[key] : {};
            if (!validation.hasOwnProperty('message') && MessagesConfig.getTypes()[key])
                validation.message = MessagesConfig.getTypes()[key];

            validation.param = subscribedValidations[key];
            validators[key] = validation;
        };
        return validators;
    }
    _subscribedAsyncValidators(subscribedAsyncValidations) {

        var asyncValidators = {};
        for (const key of Object.keys(subscribedAsyncValidations)) {

            var validation = AsyncValidationsConfig.getTypes()[key] ? AsyncValidationsConfig.getTypes()[key] : {};
            if (!validation.hasOwnProperty('message') && MessagesConfig.getTypes()[key])
                validation.message = MessagesConfig.getTypes()[key];

            validation.param = subscribedAsyncValidations[key];
            asyncValidators[key] = validation;
        };
        return asyncValidators;
    }
    ////////////////////////////////////from config//////////////////////////
    _validationMessagesFromConfig(fieldConfig) {

        var validations = {};
        if (fieldConfig.validation && fieldConfig.validation.hasOwnProperty('messages')) {
            for (const key of Object.keys(fieldConfig.validation.messages)) {
                var validation = {};
                validation.message = fieldConfig.validation.messages[key];
                validations[key] = validation;
            };
        }
        return validations;

    }
    _validatorsFromConfig(fieldConfig) {
        var validators = {};
        if (fieldConfig.validators) {
            for (const key of Object.keys(fieldConfig.validators)) {
                var validation = {};
                if (fieldConfig.validators[key].expression)
                    validation.expression = fieldConfig.validators[key].expression;
                if (fieldConfig.validators[key].message)
                    validation.message = fieldConfig.validators[key].message;
                // WIL ADD
                if (fieldConfig.validators[key].param)
                    validation.param = fieldConfig.validators[key].param;
                
                validators[key] = validation;
            };
        }
        return validators;
    }
    _asyncValidatorsFromConfig(fieldConfig) {
        var asyncValidators = {};
        if (fieldConfig.asyncValidators) {
            for (const key of Object.keys(fieldConfig.asyncValidators)) {
                var validation = {};
                if (fieldConfig.asyncValidators[key].expression)
                    validation.expression = fieldConfig.asyncValidators[key].expression;
                if (fieldConfig.asyncValidators[key].message)
                    validation.message = fieldConfig.asyncValidators[key].message;

                asyncValidators[key] = validation;

            };
        }
        return asyncValidators;

    }



    validateField(viewValue, modelValue, model, onValidationUpdate) {
        model = model || {};
        // WIL ADD
        // let expressionContext = { "viewValue": viewValue, "modelValue": modelValue, "model": model, "param": undefined };
        let expressionContext = { "viewValue": viewValue, "modelValue": modelValue, "model": model, "param": undefined, fieldConfig: this.fieldConfig };

        var validationResultObject = new ValidationObject();

        //sends validationResultObject to runValidators to modify it
        //validationResultObject would be changed by reference but returning makes it clearer
        validationResultObject = this.runValidators(expressionContext, validationResultObject);
        //run async validators only if the normal local validators passed
        if (validationResultObject.isValid() && !Utils.isEmptyObject(this.asyncValidators))
            this.runAsyncValidators(expressionContext, validationResultObject, onValidationUpdate);
        //if there are no async validation or normal validationResultObject is not valid update the validation with the normal validation results
        else {
            onValidationUpdate(validationResultObject.getValidation());
        }

    }

    runValidators(expressionContext, validationResultObject) {

        for (const key of Object.keys(this.validators)) {
            var isValid;
            var validation = this.validators[key];

            expressionContext.param = this.validators[key].param;

            if (validation) {

                if (!validation.hasOwnProperty('expression')) {
                    isValid = true;
                    console.warn('Formly validation: Validation type ' + key + ' has no validation expression');
                }
                else if (validation.expression instanceof RegExp) {
                    isValid = validation.expression.test(expressionContext.viewValue);
                }
                else {
                    isValid = FormlyExpressions.evaluate(validation.expression, expressionContext);
                }

                if (!isValid) {
                    var message;
                    if (validation.message) {
                        message = FormlyExpressions.evaluate(validation.message, expressionContext);
                    }
                    validationResultObject.addError(key, message);
                }
            }
            else {
                console.warn('Formly validation: Validation type ' + key + ' has not been added to field\'s validators.');
            }

        }
        return validationResultObject;
    }
    runAsyncValidators(expressionContext, validationResultObject, onValidationUpdate) {

        for (const key of Object.keys(this.asyncValidators)) {
            var isValid;
            var validation = this.asyncValidators[key];

            expressionContext.param = this.asyncValidators[key].param;

            if (validation) {

                if (!validation.hasOwnProperty('expression')) {
                    //if the validator has no expression update the model and view value without changing the validationResultObject
                    onValidationUpdate(validationResultObject.getValidation());
                    console.warn('Formly validation: Validation type ' + key + ' has no validation expression');

                }
                else {
                    //get the returned promise from the async validator
                    var promise = FormlyExpressions.evaluate(validation.expression, expressionContext);
                    // passing the returned value to resolve which returns a Promise even if the expression didn't return a Promise
                    //works instead of null checks
                    promise = Promise.resolve(promise)

                    var currentCancellablePromise;      //this is the promise we will work with

                    //Used as a cancellable layer between the  validation and updating the validation on the view
                    var cancellablePromise = new Promise(function (resolve, reject) {
                        //save a reference to resolve and reject so it can be used from outside
                        currentCancellablePromise = { "resolve": resolve, "reject": reject };

                    });
                    currentCancellablePromise.promise = cancellablePromise; //save the promise with its reject and resolve functions
                    this._runningAsyncValidators[key] = currentCancellablePromise;   //add this validator to the running validators

                    var fieldConfig = this.fieldConfig;
                    //add this validation to validationObject as a pending validation before running it
                    validationResultObject.addToPending(key);
                    onValidationUpdate(validationResultObject.getValidation());

                    promise.then(function (value) {
                        currentCancellablePromise.resolve("succeeded");
                        return currentCancellablePromise.promise;

                    }, function (reason) {

                        //this reject function will only run if the validation failed (rejected)
                        //if the validation was cancelled (resolved) the next line won't  run
                        //while if the promise wasn't cancelled the promise will be rejected and returned  so it is handled by the next catch method

                        currentCancellablePromise.reject("rejected");
                        return currentCancellablePromise.promise;
                    }).then(function (value) {
                        //update validation only if the promise is succeeded not cancelled
                        //this line depends on the idea that the promise is not cancelled unless there is a new validation is started
                        // so the validation will be updated with the next promise
                        if (value == "succeeded") {
                            validationResultObject.removeFromPending(key);
                            onValidationUpdate(validationResultObject.getValidation());
                        }

                    },
                        function (reason) {

                            var message;
                            if (validation.message) {
                                message = FormlyExpressions.evaluate(validation.message, expressionContext);
                            }
                            validationResultObject.removeFromPending(key);
                            validationResultObject.addError(key, message);

                            onValidationUpdate(validationResultObject.getValidation());

                        });

                }
            }
            else {
                console.warn('Formly validation: Validation type ' + key + ' has not been added to field\'s validators.');
            }
        }


    }

    closeRunningAsyncValidators() {
        for (const key of Object.keys(this._runningAsyncValidators)) {
            var cancellablePromise = this._runningAsyncValidators[key];
            //cancel promise
            cancellablePromise.resolve("cancelled");
        }
        //clear the object
        this._runningAsyncValidators = {};

    }


};
