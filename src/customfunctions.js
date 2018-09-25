
function add(first, second){
  return first + second + 10;
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

CustomFunctionMappings.ADD = add;
CustomFunctionMappings.INCREMENT = increment;