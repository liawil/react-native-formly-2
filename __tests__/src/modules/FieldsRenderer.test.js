import React from 'react';
import {
  View,
  Text,
  ScrollView
} from 'react-native';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import FieldsRenderer, { FormlyComponentProps } from './../../../src/modules/FieldsRenderer';
import { FormlyConfig } from './../../../src';
let { FieldsConfig, WrappersConfig } = FormlyConfig;
describe('FieldsRenderer', () => {
  describe('Wrappers', () => {
    describe('wrapComponentWith', () => {
      it('should return the component wrapped with wrapper', () => {
        let component = <Text>my component</Text>;
        let wrapper = View;
        const wrappedComponent = shallow(FieldsRenderer.wrapComponentWith(component, wrapper, {}));
        expect(wrappedComponent.find('View').contains(component)).toEqual(true);
      });

      it('should pass componentProps to the wrapper', () => {
        let component = <Text>my component</Text>;
        let wrapper = View;
        let componentProps = { foo: "bar" };
        const wrappedComponent = shallow(FieldsRenderer.wrapComponentWith(component, wrapper, componentProps));
        expect(wrappedComponent.props()).toMatchObject(componentProps);
      });

    });

    describe('getWrappers', () => {
      beforeEach(() => {
        WrappersConfig.clearWrappers();
        FieldsConfig.clearTypes();
      }
      );

      it('should ignore wrappers added to the type using `FieldsConfig` and `WrappersConfig` when `fieldObject` wrapper is null', () => {
        WrappersConfig.setWrapper({ name: 'wrapperOne', component: View });
        WrappersConfig.setWrapper({ name: 'wrapperTwo', types: ['typeOne'], component: ScrollView });
        FieldsConfig.addType({ name: 'typeOne', wrapper: ["wrapperOne"], component: View });
        let fieldObject = {
          type: "typeOne",
          wrapper: null
        };
        expect(FieldsRenderer.getWrappers(fieldObject)).toEqual([]);
      });

      it('should use wrappers added to the type using `WrappersConfig` when `fieldObject` wrapper has no value', () => {
        WrappersConfig.setWrapper({ name: 'wrapperOne', types: ['typeOne'], component: View });
        let fieldObject = {
          type: "typeOne"
        };
        expect(FieldsRenderer.getWrappers(fieldObject)).toEqual(expect.arrayContaining([View]));
      });

      it('should ignore wrappers added to the type using `WrappersConfig` when `fieldObject` wrapper has value', () => {
        WrappersConfig.setWrapper({ name: 'wrapperOne', component: View });
        WrappersConfig.setWrapper({ name: 'wrapperTwo', types: ['typeOne'], component: Text });
        let fieldObject = {
          type: "typeOne",
          wrapper: "wrapperOne"
        };
        expect(FieldsRenderer.getWrappers(fieldObject)).not.toEqual(expect.arrayContaining([Text]));
      });

      it('should append wrappers added to type using `FieldsConfig` to `fieldObject` wrappers', () => {
        WrappersConfig.setWrapper({ name: 'wrapperOne', component: View });
        WrappersConfig.setWrapper({ name: 'wrapperTwo', component: Text });
        FieldsConfig.addType({ name: 'typeOne', wrapper: ["wrapperTwo"], component: View });

        let fieldObject = {
          type: "typeOne",
          wrapper: "wrapperOne"
        };
        expect(FieldsRenderer.getWrappers(fieldObject)).toEqual([View, Text]);
      });

      it('should add the default wrapper to the end if exists', () => {
        WrappersConfig.setWrapper({ name: 'wrapperOne', component: View });
        WrappersConfig.setWrapper({ name: 'wrapperTwo', component: Text });
        WrappersConfig.setWrapper({ name: 'default', component: ScrollView });
        FieldsConfig.addType({ name: 'typeOne', wrapper: ["wrapperTwo"], component: View });

        let fieldObject = {
          type: "typeOne",
          wrapper: "wrapperOne"
        };
        let wrappers = FieldsRenderer.getWrappers(fieldObject);
        expect(wrappers[wrappers.length - 1]).toEqual(ScrollView);
      });

      it('should return wrappers in the following order `fieldObject`->`FieldsConfig`->`default wrapper` if `fieldObject` has wrappers', () => {
        WrappersConfig.setWrapper({ name: 'wrapperOne', component: View });
        WrappersConfig.setWrapper({ name: 'wrapperTwo', component: Text });
        WrappersConfig.setWrapper({ name: 'default', component: ScrollView });
        FieldsConfig.addType({ name: 'typeOne', wrapper: ["wrapperTwo"], component: View });

        let fieldObject = {
          type: "typeOne",
          wrapper: "wrapperOne"
        };
        let wrappers = FieldsRenderer.getWrappers(fieldObject);
        expect(wrappers).toEqual([View, Text, ScrollView]);
      });

      it('should return wrappers in the following order `WrappersConfig`->`FieldsConfig`->`default wrapper` if `fieldObject` wrappers has no value', () => {
        WrappersConfig.setWrapper({ name: 'wrapperOne',types:['typeOne'], component: View });
        WrappersConfig.setWrapper({ name: 'wrapperTwo', component: Text });
        WrappersConfig.setWrapper({ name: 'default', component: ScrollView });
        FieldsConfig.addType({ name: 'typeOne', wrapper: ["wrapperTwo"], component: View });

        let fieldObject = {
          type: "typeOne"
        };
        let wrappers = FieldsRenderer.getWrappers(fieldObject);
        expect(wrappers).toEqual([View, Text, ScrollView]);
      });
    });
  });
});
