'use strict';
import Utils from 'react-native-formly-2/src/modules/Utils';
import {FieldsConfig, ControllersConfig} from 'react-native-formly-2/src/formlyConfig';

//import {ControllersConfig}  from '../FormlyConfig';

export default class FieldControllers {
    constructor(context, config) {
        this.executeFunctionInContext = this.executeFunctionInContext.bind(this);
        this.executeControllersFunction = this.executeControllersFunction.bind(this);
        this.addController = this.addController.bind(this);

        this.runUNSAFE_componentWillMount = this.runUNSAFE_componentWillMount.bind(this);
        this.runComponentDidMount = this.runComponentDidMount.bind(this);
        this.runUNSAFE_componentWillReceiveProps = this.runUNSAFE_componentWillReceiveProps.bind(this);
        this.runUNSAFE_componentWillUpdate = this.runUNSAFE_componentWillUpdate.bind(this);
        this.runComponentDidUpdate = this.runComponentDidUpdate.bind(this);
        this.runComponentWillUnmount = this.runComponentWillUnmount.bind(this);
        this.controllers = [];
        // Preserve order of adding controllers to maintain their periority  //Important!!
        //add type controller
        var type = FieldsConfig.getTypes()[config.type];
        if (type.controller)
            this.addController(type.controller);
        //add field Controller
        if (config.controller)
            this.addController(config.controller);
        this.context = context;

        //function names
        this.functionNames = {
            UNSAFE_componentWillMount: 'UNSAFE_componentWillMount',
            componentDidMount: 'componentDidMount',
            UNSAFE_componentWillReceiveProps: 'UNSAFE_componentWillReceiveProps',
            UNSAFE_componentWillUpdate: 'UNSAFE_componentWillUpdate',
            componentDidUpdate: 'componentDidUpdate',
            componentWillUnmount: 'componentWillUnmount'
        };


    }
    addController(controller) {
        if (Array.isArray(controller)) {
            controller.forEach(function (ctrl) {
                this.addController(ctrl);
            },this);
        }
        else if (typeof controller === 'string')
            this.controllers.push(ControllersConfig.getTypes()[controller]);
        else if (typeof controller === 'object') {
            this.controllers.push(controller);
        }
    }

    executeFunctionInContext(func, args) {
        if (typeof func !== 'function')
            console.warn("FormlyControllers: Invalid controller function " + func);
        else if (!this.context)
            console.warn("FormlyControllers: Invalid context" + this.context);
        else if (!Array.isArray(args))
            console.warn("FormlyControllers: args should be an array" + args);
        else
            func.apply(this.context, args);

    }

    executeControllersFunction(functionName, args) {
        this.controllers.forEach(function (controller) {
            var func = controller[functionName];
            if (func)
                this.executeFunctionInContext(func, args);
        }, this);
    }

    runUNSAFE_componentWillMount() {
        this.executeControllersFunction(this.functionNames.UNSAFE_componentWillMount, []);

    }
    runComponentDidMount() {
        this.executeControllersFunction(this.functionNames.componentDidMount, []);

    }
    runUNSAFE_componentWillReceiveProps(nextProps) {
        this.executeControllersFunction(this.functionNames.UNSAFE_componentWillReceiveProps, [nextProps]);

    }
    runUNSAFE_componentWillUpdate(nextProps, nextState) {
        this.executeControllersFunction(this.functionNames.UNSAFE_componentWillUpdate, [nextProps, nextState]);

    }
    runComponentDidUpdate(prevProps, prevState) {
        this.executeControllersFunction(this.functionNames.componentDidUpdate, [prevProps, prevState]);

    }
    runComponentWillUnmount() {
        this.executeControllersFunction(this.functionNames.componentWillUnmount, []);

    }
};