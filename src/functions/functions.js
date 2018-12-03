/**
 * Add two numbers
 * @param {number} first 
 * @param {number} second 
 * @returns {number} The sum of first and second.
 */
function add(first, second) {
  return first + second;
}

/**
 * Returns the current time once a second
 * @param {*} callback 
 */
function clock(callback) {
  const timer = setInterval(() => {
    const time = currentTime();
    callback.setResult(time);
  }, 1000);

  callback.onCanceled = () => {
    clearInterval(timer);
  };
}

/**
 * Returns the current time
 * @returns {string} String containing the current time formatted for the current locale.
 */
function currentTime() {
  return new Date().toLocaleTimeString();
}

/**
 * Increments a number once a second.
 * @param {number} incrementBy Amount to increment
 * @param {*} callback 
 */
function increment(incrementBy, callback) {
  let result = 0;
  const timer = setInterval(() => {
    result += incrementBy;
    callback.setResult(result);
  }, 1000);

  callback.onCanceled = () => {
    clearInterval(timer);
  };
}

/**
 * Writes a message to console.log().
 * @param {string} message String to log
 */
function logMessage(message) {
  console.log(message);

  return message;
}

/**
 * Defines the implementation of the custom functions
 * for the function id defined in the metadata file (functions.json).
 */
if (typeof(CustomFunctionMappings) !== "undefined") {
  CustomFunctionMappings.ADD = add;
  CustomFunctionMappings.CLOCK = clock;
  CustomFunctionMappings.INCREMENT = increment;
  CustomFunctionMappings.LOG = logMessage;
}
