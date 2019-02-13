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
CustomFunctions.associate("ADD", add);

/**
 * Displays the current time once a second.
 * @customfunction 
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
CustomFunctions.associate("CLOCK", clock);

/**
 * Computes the nth Fibonacci number.
 * @customfunction FIBONACCI 斐波那契
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
CustomFunctions.associate("FIBONACCI", fib);


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
CustomFunctions.associate("INCREMENT", increment);

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
CustomFunctions.associate("LOG", logMessage);

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
CustomFunctions.associate("REGEX", regex);

