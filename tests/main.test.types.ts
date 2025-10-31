import type { PromiseWorker, PromiseWorkerTagged } from "../src/main";
export type HelloWorld = PromiseWorker<"hello", "helloworld">;
export type HelloPromise = PromiseWorker<"hello", "hellopromise">;
export type DelayA = PromiseWorkerTagged<"a", 1, 2>;
export type DelayB = PromiseWorkerTagged<"b", "foo", "bar">;
export type Doubler = PromiseWorkerTagged<"doubler", number, number>;
export type ErrorPromise = PromiseWorkerTagged<
  "error",
  string,
  string,
  "oh no!"
>;

export type TransferSendSync = PromiseWorkerTagged<
  "xfer1",
  ArrayBuffer,
  number
>;
export type TransferSendSyncReturn = PromiseWorkerTagged<
  "xfer1r",
  Uint8Array,
  [number, Uint8Array]
>;
export type TransferSendAsync = PromiseWorkerTagged<
  "xfer2",
  Uint8Array,
  number
>;

// Reverse direction (worker -> main)
export type RevCallSquare = PromiseWorkerTagged<
  "rev.call.square",
  number,
  number
>;
export type RevTriggerSquare = PromiseWorkerTagged<
  "rev.trigger.square",
  number,
  number
>;
