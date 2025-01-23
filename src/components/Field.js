'use strict';

import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';
import PropTypes from 'prop-types';
import { FieldsConfig } from 'react-native-formly/src/formlyConfig';
import FieldValidator from 'react-native-formly/src/modules/Validation';
import FieldControllers from 'react-native-formly/src/modules/FormlyControllers';
import Utils from 'react-native-formly/src/modules/Utils';



export default class Field extends Component {
  constructor(props) {
    super(props);
    //initialize the field validator & field controller
    this.state = {
      fieldControllers: new FieldControllers(this, this.props.config),
      fieldValidator: new FieldValidator()
    }
  }

  UNSAFE_componentWillMount() {
    this.state.fieldControllers.runUNSAFE_componentWillMount();
  }
  componentDidMount() {
    this.state.fieldControllers.runComponentDidMount();

    //run change logic on the supplied values by the model
    this.onChange(this.props.model[this.props.config.key]);
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.state.fieldControllers.runUNSAFE_componentWillReceiveProps(nextProps);

    if (nextProps.config && nextProps.config.hasOwnProperty('expressionProperties') && !Utils.deepEqual(nextProps.config, this.props.config)) {
      this.validateField(nextProps.viewValues[nextProps.config.key], nextProps);
    }
  }
  UNSAFE_componentWillUpdate(nextProps, nextState) {
    this.state.fieldControllers.runUNSAFE_componentWillUpdate(nextProps, nextState);

  }
  componentDidUpdate(prevProps, prevState) {
    this.state.fieldControllers.runComponentDidUpdate(prevProps, prevState);

  }
  componentWillUnmount() {
    this.state.fieldControllers.runComponentWillUnmount();
    //remove validations when component is removed
    this.props.onValueUpdate(this.props.renderingKey, this.props.config.key, this.props.viewValues[this.props.config.key], this.props.model[this.props.config.key], undefined);
  }
  onChange = (value) => {
    this.updateValue(value);
  }

  onFocus = (value) => {
    //this.updateValue(value);
  }
  shouldValueUpdate = (event) => {

  }
  updateValue = (viewValue) => {
    if (this.transformUpdate) {
      viewValue = this.transformUpdate(viewValue);
    }
    this.validateField(viewValue, this.props);

  }
  validateField = (viewValue, props) => {
    this.state.fieldValidator.validateField(viewValue, props.model[this.props.config.key], props.model, props.config, this.onValidationsUpdate(viewValue, props));
  }
  //pass on validations update with props to work with
  onValidationsUpdate = (viewValue, props) => {
    return function (fieldValidationResult) {
      var modelValue = fieldValidationResult.isValid ? viewValue : undefined;
      props.onValueUpdate(props.renderingKey, props.config.key, viewValue, modelValue, fieldValidationResult);
    }
  }

  render() {
    //config aliased to field makes config more readable
    let { config: field, viewValues, model } = this.props;

    var fieldComponent = field.component ? field.component : FieldsConfig.getTypeComponent(field.type);
    if (!fieldComponent) {
      throw new Error('Formly: "' + field.type + '" has not been added to FormlyConfig\'s field types.');
    }
    var propsFromConfig;
    if (field.props) {
      propsFromConfig = typeof field.props === 'function' ? field.props(model, field) : field.props;
    }

    //assign to variable to allow JSX compiler to pick up as a prop instead of string
    var FieldComponent = fieldComponent;
    return (
      <FieldComponent  {...propsFromConfig} {...this.props} onChange={this.onChange} />
    );
  }
}

Field.propTypes = {
  model: PropTypes.object,
  config: PropTypes.object.isRequired,
  viewValues: PropTypes.object,
  fieldsValidation: PropTypes.object,
  onValueUpdate: PropTypes.func.isRequired
}