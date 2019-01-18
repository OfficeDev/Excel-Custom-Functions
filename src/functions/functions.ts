/**
 * Adds two numbers.
 * @customfunction 
 * @param first First number
 * @param second Second number
 * @returns The sum of the two numbers.
 */
function add(first: number, second: number): number {
  return first + second;
}

/**
 * Displays the current time once a second.
 * @customfunction 
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
 * Computes the nth Fibonacci number.
 * @customfunction 
 * @param n number
 */
function fib(n: number): number {
  if (n < 0) {
    throw new Error("n cannot be negative.");
  }

  const values: number[] = [1, 1];

  for (let index = 2; index <= n; ++index) {
    values[index % 2] = values[0] + values[1];
  }

  return values[n % 2];
}

let count: number = 0;

/**
 * Returns the number of times that the function was called
 * @customfunction
 */
function callCount(): number {
  ++count;

  return count;
}
CustomFunctions.associate("callCount", callCount);

/**
 * Returns the current time.
 * @customfunction 
 * @returns String with the current time formatted for the current locale.
 */
function currentTime(): string {
  return new Date().toLocaleTimeString();
}

/**
 * Increments a value once a second.
 * @customfunction 
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
 * @customfunction 
 * @param message String to write.
 * @returns String to write.
 */
function logMessage(message: string): string {
  console.log(message);

  return message;
}

/**
 * Regular expression test
 * @customfunction
 * @param string The string to test
 * @param pattern Regular expression pattern
 * @returns True if it matches the pattern; false otherwise
 */
function regex(string: string, pattern: string): boolean {
  return new RegExp(pattern).test(string);
}

/**
 * Defines the implementation of the custom functions
 * for the function id defined in the metadata file (functions.json).
 */
CustomFunctions.associate("ADD", add);
CustomFunctions.associate("CLOCK", clock);
CustomFunctions.associate("FIB", fib);
CustomFunctions.associate("INCREMENT", increment);
CustomFunctions.associate("LOG", logMessage);
CustomFunctions.associate("REGEX", regex);
