/**
 * Adds two numbers.
 * @param first First number
 * @param second Second number
 * @returns The sum of the two numbers.
 */
function add(first: number, second: number): number {
  return first + second;
}

/**
 * Displays the current time once a second.
 * @param handler Custom function handler  
 */
function clock(handler: CustomFunctions.StreamingHandler<string>): void {
  const timer = setInterval(() => {
    const time = currentTime();
    handler.setResult(time);
  }, 1000);

  handler.onCanceled = () => {
    clearInterval(timer);
  };
}

/**
 * Returns the current time.
 * @returns String with the current time formatted for the current locale.
 */
function currentTime(): string {
  return new Date().toLocaleTimeString();
}

/**
 * Increments a value once a second.
 * @param incrementBy Amount to increment
 * @param handler Custom function handler 
 */
function increment(incrementBy: number, handler: CustomFunctions.StreamingHandler<number>): void {
  let result = 0;
  const timer = setInterval(() => {
    result += incrementBy;
    handler.setResult(result);
  }, 1000);

  handler.onCanceled = () => {
    clearInterval(timer);
  };
}

/**
 * Writes a message to console.log().
 * @param message String to write.
 * @returns String to write.
 */
function logMessage(message: string): string {
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
