// The functions that we want to expose are declared and exported
//    in this file.  Then, in functions.ts, they are are added to the
//    global "CustomFunctionMappings" variable, which maps them to
//    the JSON metadata and makes them available to the end-users.

export function add(first: number, second: number): number {
  return first + second;
}

export async function addAsync(first: number, second: number): Promise<number> {
  // Waits one second, then adds the two numbers
  await pause(1000);
  return first + second;
}

export function increment(
  incrementBy: number,
  callback: CustomFunctions.StreamingHandler<number>
): void {
  let result = 0;
  const timer = setInterval(() => {
    result += incrementBy;
    callback.setResult(result);
  }, 1000);

  callback.onCanceled = () => {
    clearInterval(timer);
  };
}

// Helper function
function pause(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
