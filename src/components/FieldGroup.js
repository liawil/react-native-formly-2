'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FieldsRenderer, {FormlyComponentProps} from './../modules/FieldsRenderer';


import {
  View,
  Text
} from 'react-native';


export default class FieldGroup extends Component {
   render() {

    return (
      <View {...this.props.config} >{this.props.children}</View>
    );
  }
}

FieldGroup.propTypes = {
  model:PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  viewValues: PropTypes.object.isRequired,
  fieldsValidation: PropTypes.object.isRequired,
  onValueUpdate: PropTypes.func.isRequired
}

FieldGroup.defaultProps = {
  model: {}
}
