import { add, addAsync, increment } from "./sample";

// To expose the functions to Excel, we need to set the
//    CustomFunctionsMapping variable, matching up the
//    end-user-facing function names from "functions.json"
//    to the code implementations.

CustomFunctionMappings = {
  ADD: add,
  ADDASYNC: addAsync,
  INCREMENT: increment
};
