import { listen } from "../src/listen";
import {
  DelayA,
  DelayB,
  Doubler,
  ErrorPromise,
  TransferSendAsync,
  TransferSendSync,
  TransferSendSyncReturn,
} from "./main.test.types";

self.addEventListener("message", ({ data }) => console.log("received: ", data));

listen<DelayA>("a", async (one) => {
  await new Promise((res) => setTimeout(res, 20));
  return 2 as const;
});
listen<DelayB>("b", async (foo) => {
  await new Promise((res) => setTimeout(res, 10));
  return "bar" as const;
});
listen<Doubler>("doubler", async (num) => {
  await new Promise((res) => setTimeout(res, 10));
  return num * 2;
});
listen<ErrorPromise>("error", async () => {
  await new Promise((res) => setTimeout(res, 10));
  throw "oh no!";
});

listen<TransferSendSync>("xfer1", (arr) => {
  const buf = new Uint8Array(arr);
  return buf[0];
});

listen<TransferSendSyncReturn>("xfer1r", async (arr, transfer) => {
  transfer.push(arr.buffer);
  return [arr[0], arr];
});

listen<TransferSendAsync>("xfer2", async (arr) => {
  await new Promise((res) => setTimeout(res, 10));
  return arr[0];
});
