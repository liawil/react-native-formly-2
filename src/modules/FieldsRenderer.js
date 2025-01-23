'use strict';
import React, { Component } from 'react';
import { FieldsConfig, WrappersConfig } from 'react-native-formly/src/formlyConfig';

import FieldGroup from 'react-native-formly/src/components/FieldGroup';
import Field from 'react-native-formly/src/components/Field';
import FormlyExpressions from 'react-native-formly/src/modules/FormlyExpressions';
import Utils from 'react-native-formly/src/modules/Utils';
import {
  View,
  Text
} from 'react-native';

class FieldProps {
  constructor(renderingKey, config, viewValues, model, fieldValidation, onValueUpdate) {
    this.key = renderingKey;
    this.renderingKey = renderingKey;
    this.config = config;
    this.viewValues = viewValues;
    this.model = model;
    this.fieldValidation = fieldValidation;
    this.onValueUpdate = onValueUpdate;
  }
  get props() {
    var props = {};
    for (const key of Object.keys(this)) {
      props[key] = this[key];
    }
    return props;
    // return {key:this.key, config:this.config, viewValues:this.viewValues, model:this.model, fieldValidation:this.fieldValidation, onValueUpdate:this.onValueUpdate };

  }
}

class FieldGroupProps {
  constructor(renderingKey, config, viewValues, model, fieldsValidation, onValueUpdate) {
    this.key = renderingKey;
    this.renderingKey = renderingKey;
    this.config = config;
    this.viewValues = viewValues;
    this.model = model;
    this.fieldsValidation = fieldsValidation;
    this.onValueUpdate = onValueUpdate;
  }
  get props() {
    var props = {};
    for (const key of Object.keys(this)) {
      props[key] = this[key];
    }
    return props;
    //return {key:this.key, config:this.config, viewValues:this.viewValues, model:this.model, fieldValidation:this.fieldValidation, onValueUpdate:this.onValueUpdate };
  }
}
class FormlyComponentProps {
  constructor(index, config, viewValues, model, fieldsValidation, onValueUpdate) {
    this.index = index;
    this.config = config;
    this.viewValues = viewValues;
    this.model = model;
    this.fieldsValidation = fieldsValidation;
    this.onValueUpdate = onValueUpdate;
  }

}



class PropsManipulator {

  static propsToField(formlyComponentProps) {
    let { index, config, viewValues, model, fieldsValidation, onValueUpdate } = formlyComponentProps;

    var renderingKey = config.type + "_" + config.key + "_" + index;
    //only send the field validation as a prop instead of the fields validation
    var fieldValidation = fieldsValidation[renderingKey] || {};
    //evaluate the expression properties before sending the props to the field
    if (config.hasOwnProperty('expressionProperties'))
      this.evaluateExpressionProperties(config, viewValues, model);

    return new FieldProps(renderingKey, config, viewValues, model, fieldValidation, onValueUpdate);
  }

  static propsToFieldGroup(formlyComponentProps) {
    let { index, config, viewValues, model, fieldsValidation, onValueUpdate } = formlyComponentProps;

    var renderingKey = "fieldGroup" + "_" + (config.key ? (config.key + "_") : "") + index;
    //send a the field group a isolated model if it needs one ... the same for viewValues
    if (config.key) model = model[config.key] ? model[config.key] : {};
    if (config.key) viewValues = viewValues[config.key] ? viewValues[config.key] : {};

    fieldsValidation = fieldsValidation[renderingKey] ? fieldsValidation[renderingKey] : { isValid: undefined, fields: {} };

    return new FieldGroupProps(renderingKey, config, viewValues, model, fieldsValidation, onValueUpdate);
  }


  static evaluateExpressionProperties(field, viewValues, model) {
    for (const key of Object.keys(field.expressionProperties)) {
      //note that key can be a dot separated path as (parent.child.property) so in order to set the
      //value of the key function setPropertyValue is used, which deals with nesting

      // note that field.key could be undefined
      let expressionContext = { "viewValue": viewValues[field.key], "modelValue": model[field.key], "model": model };
      Utils.setPropertyValue(field, key, FormlyExpressions.evaluate(field.expressionProperties[key], expressionContext));
    };

  }
}




export default class FieldsRenderer {

  //////////////////////////////////////////rendering functions//////////////////////////////////////////////////
  static renderField(FieldProps) {
    const key = FieldProps.props.key
    delete FieldProps.props.key
    return <Field  {...FieldProps.props} key={key} />;
  }

  static renderFieldGroup(FieldGroupProps) {
    //config aliased to field makes config more readable
    let { renderingKey: fieldGroupRenderKey, config: field, viewValues, model, fieldsValidation: fieldGroupValidation } = FieldGroupProps;
    /*
        this function is passed to the fieldGroup fields which is called when the field value changes.
        when this function is invoked it updates the model of the field group and notifies its parent by calling its parent onValueUpdate
        the invocation continues till reaching formly onValueUpdate
      */


    function onValueUpdate(renderingKey, fieldKey, viewValue, modelValue, validationResult) {
      //the field calls this function with its key and the updated value
      //if the fieldGroup have separated model it updates it and send it to the parent model to be updated
      //while if the field group had no separate model it updates send the field key and the new value to its parent to handle updating the model
      if (validationResult === undefined)
        delete fieldGroupValidation.fields[renderingKey];
      else
        fieldGroupValidation.fields[renderingKey] = validationResult;
      fieldGroupValidation.isValid = Utils.getFormValidity(fieldGroupValidation.fields);

      if (field.key) {
        //clone ViewValues
        viewValues = { ...viewValues };
        viewValues[fieldKey] = viewValue;

        //clone model
        model = { ...model }
        if (modelValue === undefined)
          delete model[fieldKey];
        else
          model[fieldKey] = modelValue;

        FieldGroupProps.onValueUpdate(fieldGroupRenderKey, field.key, viewValues, model, fieldGroupValidation);
      }
      else
        FieldGroupProps.onValueUpdate(fieldGroupRenderKey, fieldKey, viewValue, modelValue, fieldGroupValidation);



    }
    const key = FieldGroupProps.props.key
    delete FieldGroupProps.props.key
    return (
      <FieldGroup  {...FieldGroupProps.props} key={key}>
        {field.fieldGroup.map(function (field, index) {
          var props = new FormlyComponentProps(index, field, viewValues, model, fieldGroupValidation.fields, onValueUpdate);
          return FieldsRenderer.generateFieldTag(props);
        })}
      </FieldGroup>
    );
  }



  static generateFieldTag(FormlyComponentProps) {
    //config aliased to field makes config more readable
    let { config: field, viewValues, model } = FormlyComponentProps;
    var fieldComponent;

    if (this.shouldHide(field, viewValues, model)) {
      return null;
    }
    let convertedProps; // holds formlyComponentProps converted to FieldPorps or FiledGroupProps
    if (field.fieldGroup) {
      let FieldGroupProps = convertedProps = PropsManipulator.propsToFieldGroup(FormlyComponentProps);
      fieldComponent = this.renderFieldGroup(FieldGroupProps)
    }
    else {
      let FieldProps = convertedProps = PropsManipulator.propsToField(FormlyComponentProps);
      fieldComponent = this.renderField(FieldProps);
    }

    //return wrapped component
    return this.wrapComponent(field, fieldComponent, convertedProps);
  }



  //////////////////////////////////////////hide functions//////////////////////////////////////////////////
  static shouldHide(field, viewValues, model) {
    var hide = this.isOrInvoke(field, 'hideExpression', viewValues, model);
    return hide && hide !== null;
  }

  static isOrInvoke(field, property, viewValues, model) {
    if (!field.hasOwnProperty(property)) {
      return null;
    }
    else {
      // note that field.key could be undefined
      let expressionContext = { "viewValue": viewValues[field.key], "modelValue": model[field.key], "model": model };
      return FormlyExpressions.evaluate(field[property], expressionContext)
    }
  }

  //////////////////////////////////////////Wrapping functions//////////////////////////////////////////////////
  static wrapComponent(fieldObject, fieldComponent, componentProps) {
    var wrappers = this.getWrappers(fieldObject);

    wrappers.forEach(function (wrapper) {
      fieldComponent = this.wrapComponentWith(fieldComponent, wrapper, componentProps);
    }, this);
    return fieldComponent;

  }
  static getWrappers(fieldObject) {
    var wrappers = fieldObject.wrapper;
    // explicit null means no wrapper
    if (wrappers === null) {
      return [];
    }

    // nothing specified means use the default wrapper for the type
    if (!wrappers) {
      // get all wrappers that specify they apply to this type
      wrappers = Utils.arrayify(WrappersConfig.getWrappersComponentsByType(fieldObject.type));
    }
    else {
      wrappers = Utils.arrayify(wrappers).map(wrapperName => WrappersConfig.getWrapperComponent(wrapperName))
    }
    // get all wrappers for that the type specified that it uses.
    const type = FieldsConfig.getTypes()[fieldObject.type];
    if (type && type.wrapper) {
      const typeWrappers = Utils.arrayify(type.wrapper).map(wrapperName => WrappersConfig.getWrapperComponent(wrapperName))
      wrappers = wrappers.concat(typeWrappers);
    }


    // add the default wrapper last
    const defaultWrapper = WrappersConfig.getWrapperComponent();
    if (defaultWrapper) {
      wrappers.push(defaultWrapper)
    }
    return wrappers;
  }
  static wrapComponentWith(component, wrapperComponent, componentProps) {
    var WrapperComponent = wrapperComponent;
    if (!componentProps.key)
      delete componentProps.key;

    return <WrapperComponent {...componentProps}>{component}</WrapperComponent>
  }

}




module.exports.FormlyComponentProps = FormlyComponentProps;