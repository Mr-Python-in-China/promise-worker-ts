/// <reference types="vite/client" />
import { beforeEach, describe, expect, test } from "vitest";
import { listenMain, send } from "../src/main";
import ReverseWorker from "./reverse.test.worker?worker";
import type { RevCallSquare, RevTriggerSquare } from "./main.test.types";

describe("Reverse calls (worker -> main)", () => {
  test("worker can call main and get result", async () => {
    const worker = new ReverseWorker();
    const stop = listenMain<RevCallSquare>(
      "rev.call.square",
      worker,
      (n) => n * 2
    );

    const result = await send<RevTriggerSquare>(
      "rev.trigger.square",
      worker,
      5
    );

    expect(result).toBe(10);
    stop();
  });
});
