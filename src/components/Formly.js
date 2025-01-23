'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FieldsRenderer, { FormlyComponentProps } from 'react-native-formly-2/src/modules/FieldsRenderer';
import Utils from 'react-native-formly-2/src/modules/Utils';

import {
  View,
  Text
} from 'react-native';

function typeOrComponent(props, propName, componentName) {
  var errorPrefix = componentName + ' config.fields field with key ' + props.key;
  if (props.type && props.component) {
    return new Error(errorPrefix + ' should only have either a type or a component, not both.');
  } else if (!props.type && !props.component) {
    return new Error(errorPrefix + ' should have either a type (string) or a component (React component)');
  }
}
var hideExpression = PropTypes.oneOfType([
  PropTypes.bool,
  PropTypes.string,
  PropTypes.func
]);
var wrapper = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.arrayOf(PropTypes.string)
]);
var controller = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    UNSAFE_componentWillMount: PropTypes.func,
    componentDidMount: PropTypes.func,
    UNSAFE_componentWillReceiveProps: PropTypes.func,
    UNSAFE_componentWillUpdate: PropTypes.func,
    componentDidUpdate: PropTypes.func,
    componentWillUnmount: PropTypes.func
  })
]);

var field = PropTypes.oneOfType([
  PropTypes.shape(FieldGroupConfig),
  PropTypes.shape(fieldConfig)
]);

var FieldGroupConfig = {
  key: PropTypes.string,
  fieldGroup: PropTypes.arrayOf(field).isRequired,
  hideExpression: hideExpression,
  wrapper: wrapper,
  data: PropTypes.object
}
var fieldConfig = {
  key: PropTypes.string.isRequired,
  type: typeOrComponent.isRequired,
  component: typeOrComponent,
  templateOptions: PropTypes.object,
  expressionProperties: PropTypes.object,
  hideExpression: hideExpression,
  validators: PropTypes.object,
  validation: PropTypes.object,
  controller: PropTypes.oneOfType([
    controller,
    PropTypes.string,
    PropTypes.arrayOf(controller)
  ]),
  wrapper: wrapper,
  modelOptions: PropTypes.shape({
    updateOn: PropTypes.string,
    debounce: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object
    ])
  }),
  props: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func
  ]),
  data: PropTypes.object
};

class Formly extends Component {
  constructor(props) {
    super(props);
    this.state = { formValidation: { isValid: undefined, fields: {} }, viewValues: {} };
  }

  onValueUpdate = (renderingKey, fieldKey, viewValue, modelValue, validationResult) => {
    if (!Utils.deepEqual(this.state.viewValues[fieldKey], viewValue)) {
      //clone viewValues
      let currentViewValuesState = { ...this.state.viewValues };
      currentViewValuesState[fieldKey] = viewValue;
      this.setState({ viewValues: currentViewValuesState });
    }

    var currentValidationState = this.state.formValidation;
    if (validationResult === undefined)
      delete currentValidationState.fields[renderingKey];
    else
      currentValidationState.fields[renderingKey] = validationResult;
    this.setState({ formValidation: currentValidationState });
    var prevFormValidity = this.state.formValidation.isValid;
    let newFormValidity = Utils.getFormValidity(this.state.formValidation.fields);
    this.state.formValidation.isValid = newFormValidity;
    if (this.props.onFormlyValidityChange && prevFormValidity !== this.state.formValidation.isValid) {
      this.props.onFormlyValidityChange(this.state.formValidation.isValid);
    }
    //clone model
    let currentModel = { ...this.props.model }
    if (modelValue === undefined)
      delete currentModel[fieldKey];
    else
      currentModel[fieldKey] = modelValue;

    this.props.onFormlyUpdate(currentModel);


  }


  render() {
    var model = this.props.model;
    var viewValues = this.state.viewValues;
    var fieldsValidation = this.state.formValidation.fields;
    var onValueUpdate = this.onValueUpdate;
    var fields = Array.isArray(this.props.config.fields) ? this.props.config.fields.map(function (field, index) {
      var props = new FormlyComponentProps(index, field, viewValues, model, fieldsValidation, onValueUpdate);
      return FieldsRenderer.generateFieldTag(props);
    }) : [];
    return (
      <View style={{ flex: 1 }}>
        {fields}
      </View>
    );
  }
}
Formly.defaultProps = { model: {} }

Formly.propTypes = {
  onFormlyUpdate: PropTypes.func.isRequired,
  onFormlyValidityChange: PropTypes.func,
  config: PropTypes.shape({
    fields: PropTypes.arrayOf(field).isRequired
  }),
  model: PropTypes.object
}


module.exports = Formly;