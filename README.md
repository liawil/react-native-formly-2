React-native-formly-2
===================

Build your forms easily by adding custom components, validations, error messages. 
This is a react-native implementation for [Angular Formly](https://github.com/formly-js/angular-formly). 
### Table of contents
* Installation
* Usage
	* Basic usage 
	* Create custom components
* Contribution
* Credits 

## Installation
```
npm install react-native-formly-2 --save
```
## Usage
<img src="https://github.com/liawil/react-native-formly-2/blob/master/examples/FormlyDemo/app/md_template_example/preview.gif" width="400"/>

### Basic Usage
First you need to install our ready made template for material components. Then you can start building your awesome forms easily.

```
npm install react-native-formly-2-templates-md --save
```

```js
import React, { Component }  from 'react';
import {ScrollView } from 'react-native';
import { Formly} from 'react-native-formly-2';
require('react-native-formly-templates-md');

class MaterialForm  extends Component {
    formlyConfig = {
        fields: [            // add your form fields here
            //Basic component            
            {
                key: 'firstInput',
                type: 'input', //material text input
                templateOptions: {
                    label: "Label",
                    placeholder: "Placeholder",
                    required: true,
                    description: "Description",
                }
            },
            //component that hides on some condition
            {
                key: 'secondInput',
                type: 'input',
                templateOptions: {
                    placeholder: "Enter a number between 3 & 10 digits",
                    label: "Number Input",
                    type: "number",
                    minlength: 3,
                    maxlength: 10

                },
                hideExpression: "model.fourthInput==='hide'", //this hides the input when the fourth input value equals 'hide'
            },
            //component that controls its templateOptions using expressionProperties
            {
                key: 'thirdInput',
                type: 'input',
                templateOptions: {
                    label: "Dynamic Label",
                    description: "Enter Value to change the label"

                },
                expressionProperties: {
                    "templateOptions.disabled": "model.fourthInput==='disable'", //this disables the input when the fourth input value equals 'disable'
                    "templateOptions.label": "viewValue || 'Dynamic Label'" //this changes the input when the label depending on the value
                }
            },
            //components with custom validator
            {
                key: 'fourthInput',
                type: 'input',
                templateOptions: {
                    label: "Custom Validation Input",
                    description: "Enter `hide` or `disable`"
                },
                validators: {
                    customValueValidator: {
                        expression: function ({ viewValue, modelValue, param }) {
                            //empty value or hide or disable
                            return !viewValue || viewValue == 'hide' || viewValue == 'disable';
                        },
                        message: "'Should equal to `hide` or `disable`'"
                    }
                }
            },
            {
                key: 'radioInput',
                type: 'radio',
                templateOptions: {
                    label: "Radio Input",
                    required: true,
                    description: "Each radio button have value of different type",
                    options: [
                        "string",
                        2,
                        { name: "array", value: [1, 2, 3] },
                        { name: "date", value: new Date() },
                        { name: "object", value: { prop1: "value1" } }
                    ]

                }
            }
        ]
    }

    state={ model: {} }

    _onFormlyUpdate = (model) =>{
        this.setState({ model: model });
    }

    _onFormlyValidityChange = (isValid) => {
        this.setState({ formIsValid: isValid });
    }
    
    render () {
        return (
            <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
                <Formly config={this.formlyConfig} model={this.state.model} onFormlyUpdate={this._onFormlyUpdate} onFormlyValidityChange={this._onFormlyValidityChange} />
            </ScrollView>
        );
    }
}
```

### Create custom components
First you need to create react component and add `FieldMixin` to its `mixins`. The `FieldMixin` adds `onChange` function which you should call when the components value change.  Formly will automaticaly inject to your component the following props: **config**, **model**, **viewValues** and **fieldValidation**.  

`FormlyTextInput.js` 
```js
import React from 'react';
import createReactClass from 'create-react-class';
import { FieldMixin } from 'react-native-formly-2';
import {
    View,
    Text,
    TextInput
} from 'react-native';

var FormlyTextInput = createReactClass({
    mixins: [FieldMixin],
    render: function () {
        let key = this.props.config.key;
        let to = this.props.config.templateOptions || {};
        let model = this.props.model[key];
        let viewValue = this.props.viewValues[key];
        var fieldValidationResult = this.props.fieldValidation || {};
        let validationMessages = fieldValidationResult.messages || {}
        return (
            <View style={{ flex: 1 }}>
                <Text style={{fontWeight:"bold",color:"black"}}>{to.label}</Text>
                <TextInput editable={!to.disabled} underlineColorAndroid={fieldValidationResult.isValid ? "green" : "red"} value={model || viewValue} placeholder={to.placeholder} onChangeText={this.onChange} />
                <Text style={{ color: "red" }}>{Object.keys(validationMessages).length != 0 ? Object.values(validationMessages)[0] : null}</Text>
            </View>
        );
    }
});

module.exports = FormlyTextInput;
```
Now you only need to register your component with `Formly` before using it.

```js
import {Formly, FormlyConfig} from 'react-native-formly-2';
let {FieldsConfig} = FormlyConfig;

FieldsConfig.addType([
  { name: 'textInput', component: require('./FormlyTextInput') }
]);
```
#### **Working on the rest of the documentation...** 

### Contribution
Please check `CONTRIBUTING.md`.

### Credits
* First Author - [Assem Hafez](https://github.com/Assem-Hafez)
* Contributor - [Contributor](https://github.com/liawil)
* This library was built at [Codelabsys](http://www.codelabsys.com/)
* Special thanks for [Mohamed Abbas](https://github.com/Mohamed-Abbas) for helping out testing the library.
