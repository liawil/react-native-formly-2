var FormlyExpression = (function () {
    var jsep = require("jsep");

    // Remove a binary operator
    jsep.removeBinaryOp(">>>");

    // Remove a unary operator
    jsep.removeUnaryOp("~");
    jsep.removeUnaryOp("|");
    jsep.removeUnaryOp("&");


    function parseAndEval(expr, context) {
        let values = Object.values(context);
        let keys = Object.keys(context);
        try {
            jsep(expr);
            //the eval function requires a variable 'model' as expressions depends on it
            // this function should be treated carefully as it exposes the system to security issues
            var func = new Function(keys, 'return ' + expr);
            return func(...values);
        } catch (error) {
            console.warn('Formly validation: Faild to evaluate expression ('+expr+') '+error);
            return false;
        }
    }

    //This function takes boolean/function/expression and return the result of their evaluation
    //the function and the expression will be evaluated in the context sent to the function
    function evaluate(expr, context) {
        var value;

        //the $viewValue,$modelValue" are added to handle expression sent from angular formly 
        if (context.hasOwnProperty("viewValue")) context["$viewValue"] ? context["$viewValue"] : context["viewValue"];
        if (context.hasOwnProperty("modelValue")) context["$modelValue"] ? context["$modelValue"] : context["modelValue"];

        if (typeof expr === 'function') {
            value = expr.apply(null, [context]);
        }
        else if (typeof expr === 'string') {
            value = parseAndEval(expr, context);
        }
        else {
            value = !!expr;
        }
        return value;
    }

    return {
        parseAndEval: parseAndEval,
        evaluate: evaluate
    };

})();

export default FormlyExpression