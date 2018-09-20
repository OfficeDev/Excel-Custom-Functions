debugger;

function add(first: number, second: number): number {
  return first + second;
}

async function addAsync(first: number, second: number): Promise<number> {
  // waits one second, then adds the two numbers
  await pause(1000);
  return first + second;

  // helper
  function pause(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

function increment(incrementBy: number, callback: CustomFunctions.StreamingHandler<number>): void {
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