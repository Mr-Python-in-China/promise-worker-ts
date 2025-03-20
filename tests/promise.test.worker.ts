import { listen } from "../src/listen";
import { HelloPromise } from "./main.test.types";

listen<HelloPromise>(async (hello) => {
  await new Promise((res) => setTimeout(res, 10));
  return (hello + "promise") as "hellopromise";
});
