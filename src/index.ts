declare var CustomFunctionMappings;

function add(first: number, second: number): number {
  return first + second;
}

function addAsync(first: number, second: number): Promise<number> {
  return Promise.resolve(add(first, second));
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

CustomFunctionMappings.add = add;
CustomFunctionMappings.addAsync = addAsync;
CustomFunctionMappings.INCREMENT = increment;
