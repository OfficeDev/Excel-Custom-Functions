
function add(first, second){
  return async first + second;
}

function increment(incrementBy, callback) {
  var result = 0;
  var timer = setInterval(function() {
    result += incrementBy;
    callback.setResult(result);
  }, 1000);

  callback.onCanceled = function() {
    clearInterval(timer);
  };
}

CustomFunctionMappings.ADD = add;
CustomFunctionMappings.INCREMENT = increment;