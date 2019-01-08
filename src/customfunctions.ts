
function add(first: number, second: number): number {
  return first + second;
}

function increment(incrementBy: number, callback) {
  let result = 0;
  const timer = setInterval(() => {
    result += incrementBy;
    callback.setResult(result);
  }, 1000);

  callback.onCanceled = () => {
    clearInterval(timer);
  };
}

CustomFunctions.associate("ADD", add);
CustomFunctions.associate("INCREMENT", increment);
