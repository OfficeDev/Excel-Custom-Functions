function add(first, second) {
  return first + second;
}

function clock(callback) {
  const timer = setInterval(() => {
    const time = currentTime();
    callback.setResult(time);
  }, 1000);

  callback.onCanceled = () => {
    clearInterval(timer);
  };
}

function currentTime() {
  return new Date().toLocaleTimeString();
}

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

function logMessage(message) {
  console.log(message);

  return message;
}

if (typeof(CustomFunctionMappings) !== 'undefined') {
  CustomFunctionMappings.ADD = add;
  CustomFunctionMappings.CLOCK = clock;
  CustomFunctionMappings.INCREMENT = increment;
  CustomFunctionMappings.LOG = logMessage;
}
