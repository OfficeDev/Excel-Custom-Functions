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
 * Returns the address where the function was called 
 * @param invocation 
 */
function address(invocation: CustomFunctions.Invocation): string {
  return invocation.address || "";
}

/**
 * Displays the current time once a second.
 * @param invocation Custom function handler  
 */
function clock(invocation: CustomFunctions.StreamingInvocation<string>): void {
  const timer = setInterval(() => {
    const time = currentTime();
    invocation.setResult(time);
  }, 1000);

  invocation.onCanceled = () => {
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
 * @param invocation Custom function handler 
 */
function increment(incrementBy: number, invocation: CustomFunctions.StreamingInvocation<number>): void {
  let result = 0;
  const timer = setInterval(() => {
    result += incrementBy;
    invocation.setResult(result);
  }, 1000);

  invocation.onCanceled = () => {
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
CustomFunctions.associate("ADD", add);
CustomFunctions.associate("ADDRESS", address);
CustomFunctions.associate("CLOCK", clock);
CustomFunctions.associate("INCREMENT", increment);
CustomFunctions.associate("LOG", logMessage);
