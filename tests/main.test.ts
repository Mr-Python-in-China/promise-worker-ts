/// <reference types="vite/client" />

import { send } from "../src/send";
import { beforeEach, describe, expect, test } from "vitest";
// import "@vitest/web-worker";
import MainTestWorker from "./main.test.worker?worker";
import TaggedTestWorker from "./tagged.test.worker?worker";
import PromiseTestWorker from "./promise.test.worker?worker";
import type {
  DelayA,
  DelayB,
  Doubler,
  ErrorPromise,
  HelloPromise,
  HelloWorld,
  TransferSendAsync,
  TransferSendSync,
  TransferSendSyncReturn,
} from "./main.test.types";

describe("Worker", () => {
  describe("Regular Promise Worker", () => {
    test("Basic usage", async () => {
      expect(await send<HelloWorld>(new MainTestWorker(), "hello")).toEqual(
        "helloworld",
      );
    });
    test("Promise usage", async () => {
      expect(
        await send<HelloPromise>(new PromiseTestWorker(), "hello"),
      ).toEqual("hellopromise");
    });
  });

  describe("Tagged workers", () => {
    describe("Parallel delay operations", () => {
      const worker = new TaggedTestWorker();
      const results: string[] = [];
      let promiseA: Promise<2>;
      let promiseB: Promise<"bar">;
      let totalTime: number;

      beforeEach(async () => {
        results.length = 0; // Clear results array
        const startTime = performance.now();

        promiseA = send<DelayA>("a", worker, 1, []);
        promiseB = send<DelayB>("b", worker, "foo", []);

        await Promise.all([
          promiseA.then((result) => {
            results.push("A");
            return result;
          }),
          promiseB.then((result) => {
            results.push("B");
            return result;
          }),
        ]);

        totalTime = performance.now() - startTime;
      });

      test("return values are correct", async () => {
        expect(await promiseA).toBe(2);
        expect(await promiseB).toBe("bar");
      });

      test("resolution order is correct (B before A)", () => {
        expect(results).toEqual(["B", "A"]);
      });

      test("operations execute in parallel", () => {
        expect(totalTime).toBeLessThan(25);
      });
    });
    test("doubles the input number", async () => {
      const taggedWorker = new TaggedTestWorker();
      for (let i = 0; i < 5; i++) {
        const result = await send<Doubler>("doubler", taggedWorker, i);
        expect(result).toBe(i * 2);
      }
    });
    test("throws an error", async () => {
      const taggedWorker = new TaggedTestWorker();
      await expect(
        send<ErrorPromise>("error", taggedWorker, ""),
      ).rejects.toThrow("oh no!");
    });
  });

  describe("Transferables", () => {
    test("sending sync copy", async () => {
      const taggedWorker = new TaggedTestWorker();
      const arr = new Uint8Array([42]).buffer;

      const result = await send<TransferSendSync>("xfer1", taggedWorker, arr);
      expect(new Uint8Array(arr)[0]).toBe(42);
      expect(result).toBe(42);
    });
    test("sending sync transferable", async () => {
      const taggedWorker = new TaggedTestWorker();
      const arr = new Uint8Array([42]).buffer;
      const result = await send<TransferSendSync>("xfer1", taggedWorker, arr, [
        arr,
      ]);

      // Detatched, expect to throw
      expect(() => new Uint8Array(arr)[0]).toThrow(TypeError);
      expect(result).toBe(42);
    });
    test("returning sync transferable", async () => {
      const taggedWorker = new TaggedTestWorker();
      const arr = new Uint8Array([42]);

      const [num, newArr] = await send<TransferSendSyncReturn>(
        "xfer1r",
        taggedWorker,
        arr,
        [arr.buffer],
      );
      expect(arr[0]).toBeUndefined;
      expect(num).toBe(42);
      expect(newArr[0]).toBe(42);
    });
    test("sending async transferable", async () => {
      const taggedWorker = new TaggedTestWorker();
      const arr = new Uint8Array([42]);
      const result = await send<TransferSendAsync>("xfer2", taggedWorker, arr, [
        arr.buffer,
      ]);
      console.log(arr[0]);
      expect(result).toBe(42);
    });
  });
});
