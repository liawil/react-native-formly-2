
module.exports = {
  getFormValidity: getFormValidity,
  deepEqual: deepEqual,
  isEmptyObject: isEmptyObject,
  setPropertyValue: setPropertyValue,
  cloneObject: cloneObject,
  arrayify: arrayify,
  debounce: debounce,
  isObject: isObject,
  isNumber: isNumber,
};
function getFormValidity(formFields = {}) {
  var newFormValidity = true;
  var iterateThrough = function (obj) {
    if (newFormValidity && Object(obj) === obj) // loop only if the current form validity is true && obj is type of object
      for (const key of Object.keys(obj)) {
        if (obj[key].hasOwnProperty('isValid')) {
          if (!obj[key].isValid) {
            newFormValidity = false;
          }
        }
        else
          iterateThrough(obj[key]);
      };
  };

  iterateThrough(formFields);

  return newFormValidity;
}

function deepEqual(x, y) {
  return (x && y && typeof x === 'object' && typeof y === 'object') ?
    (Object.keys(x).length === Object.keys(y).length) &&
    Object.keys(x).every(function (key) {
      return deepEqual(x[key], y[key]);
    }, true) : (x === y);
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && (obj).constructor === Object;
}

//Lodash function
function isObject(value) {
  const type = typeof value
  return value != null && (type == 'object' || type == 'function')
}

//Lodash function
function isNumber(value) {
  return typeof value == 'number' ||
    (isObjectLike(value) && baseGetTag(value) == '[object Number]')
}


function setPropertyValue(obj, propPath, value) {
  var schema = obj;  // a moving reference to internal objects within obj
  var pList = propPath.split('.');
  var len = pList.length;
  for (var i = 0; i < len - 1; i++) {
    var elem = pList[i];
    if (!schema[elem]) schema[elem] = {}
    schema = schema[elem];
  }

  schema[pList[len - 1]] = value;
}

function cloneObject(obj) {
  return Object.assign({}, obj);
};

function arrayify(obj) {
  if (obj && !Array.isArray(obj)) {
    obj = [obj]
  } else if (!obj) {
    obj = []
  }
  return obj
}



//Lodash function
function debounce(func, wait, options) {
  const nativeMax = Math.max
  const nativeMin = Math.min

  let lastArgs,
    lastThis,
    maxWait,
    result,
    timerId,
    lastCallTime

  let lastInvokeTime = 0
  let leading = false
  let maxing = false
  let trailing = true

  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }
  wait = toNumber(wait) || 0
  if (isObject(options)) {
    leading = !!options.leading
    maxing = 'maxWait' in options
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }

  function invokeFunc(time) {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait)
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const result = wait - timeSinceLastCall

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
  }

  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time))
  }

  function trailingEdge(time) {
    timerId = undefined

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = undefined
    return result
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId)
    }
    lastInvokeTime = 0
    lastArgs = lastCallTime = lastThis = timerId = undefined
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now())
  }

  function debounced(...args) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime)
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait)
        return invokeFunc(lastCallTime)
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait)
    }
    return result
  }
  debounced.cancel = cancel
  debounced.flush = flush
  return debounced
}