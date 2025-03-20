import type {
  DelayA,
  DelayB,
  HelloPromise,
  HelloWorld,
} from "./main.test.types";
import { listen } from "../src/main";
self.addEventListener("message", ({ data }) => console.log("received: ", data));

listen<HelloWorld>((hello) => {
  console.log("HelloWorld input:", hello);
  return (hello + "world") as "helloworld";
});
