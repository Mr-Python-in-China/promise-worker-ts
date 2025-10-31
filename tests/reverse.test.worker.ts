import { listen } from "../src/listen";
import { sendToMain } from "../src/sendToMain";
import type { RevCallSquare, RevTriggerSquare } from "./main.test.types";

// When triggered by main, call back to main using sendToMain and return the result
listen<RevTriggerSquare>("rev.trigger.square", async (n) => {
  const r = await sendToMain<RevCallSquare>("rev.call.square", n);
  return r;
});
