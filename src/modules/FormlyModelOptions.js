import Utils from './Utils'
const ONBLUR_EVENT_NAME = 'blur';
const ONCHANGE_EVENT_NAME = 'change';

export default class ModelOptions {
    constructor() {
        this.defaultEventName = ONCHANGE_EVENT_NAME;
        this.prevDebounce = null;
        this.onEvent = this.onEvent.bind(this);

    }
    onEvent(callerEvent, updateValue, modelOptions = {}) {
        var updateOn = modelOptions.updateOn;
        var debounceObject = modelOptions.debounce;

        var updateOnArray = updateOn.split(' ');
        updateOnArray = updateOnArray.length ? updateOnArray : [this.defaultEventName];
        if (updateOnArray.includes(callerEvent)) {
            /*get event debouncingValue
                if the value the debounceObject is number then it is the debouncing value for all events
                else if the debouncing is object then get the specific debouncing value for the event and if not found the defualt is 0
                in all other cases the debouncing value is 0
            */
            const debouncingValue = 0;
            if (Utils.isNumber(debounceObject) && debounceObject >= 0)
                debouncingValue = debounceObject;
            else if (Utils.isObject(debounceObject) && debounceObject[callerEvent] && debounceObject[callerEvent] >= 0)
                debouncingValue = debounceObject[callerEvent];
            //stop the previous debonced function if exist
            if (prevDebounce)
                prevDebounce.cancel

            var debounced = Utils.debounce(updateValue, debouncingValue);
            this.prevDebounce = debounced;
            debounced("aaa"); //run the debounced function

        }
    }


}
