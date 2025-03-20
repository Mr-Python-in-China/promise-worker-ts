import type {
  _UnknownPromiseWorker,
  _GetInput,
  _GetOutput,
  _ResponsePackage,
  _GetError,
  _SenderPackage,
  _UnknownPromiseTaggedWorker,
  _GetTag,
} from "./types";

let currentId = 0;

/**
 * Sends a message to a Web Worker and returns a promise for the response.
 *
 * @template T - The PromiseWorker type definition
 * @param tag - The tag to identify the message
 * @param worker - The Web Worker instance to send the message to
 * @param input - The data to send to the worker
 * @param transfer - Optional array of Transferable objects to transfer ownership to the worker
 * @returns Promise that resolves with the worker's response or rejects with an error
 *
 * Example:
 * ```ts
 * // In main thread
 * const worker = new Worker('worker.ts');
 * type Answer = PromiseWorkerTagged<"myTag", number, string>
 * const result = await send<Answer>("myTag", worker, 42);
 *
 * // Or, if using transferables
 * const myBuffer = new Uint8Array([42]);
 * type AnswerBuffer = PromiseWorkerTagged<"myTag", ArrayBuffer, string>>
 * const result = await send<AnswerBuffer>("myTag", worker, myBuffer, [myBuffer.buffer]);
 * ```
 */
export function send<T extends _UnknownPromiseTaggedWorker>(
  tag: _GetTag<T>,
  worker: Worker,
  input: _GetInput<T>,
  transfer?: Transferable[],
): Promise<_GetOutput<T>>;

/**
 * Sends a message to a Web Worker and returns a promise for the response.
 *
 * @template T - The PromiseWorker type definition
 * @param worker - The Web Worker instance to send the message to
 * @param input - The data to send to the worker
 * @param transfer - Optional array of Transferable objects to transfer ownership to the worker
 * @returns Promise that resolves with the worker's response or rejects with an error
 *
 * Example:
 * ```ts
 * // In main thread
 * const worker = new Worker('worker.ts');
 * type Answer = PromiseWorker<number, string>;
 * const result = await send<Answer>(worker, 42);
 *
 * // Or, if using transferables
 * const myBuffer = new Uint8Array([42]);
 * type AnswerBuffer = PromiseWorker<ArrayBuffer, string>>
 * const result = await send<AnswerBuffer>(worker, myBuffer, [myBuffer.buffer]);
 * ```
 */
export function send<T extends _UnknownPromiseWorker>(
  worker: Worker,
  input: _GetInput<T>,
  transfer?: Transferable[],
): Promise<_GetOutput<T>>;
export function send<T extends _UnknownPromiseWorker>(
  tagOrWorker: Worker | string,
  workerOrInput: Worker | _GetInput<T>,
  inputOrTransfer?: _GetInput<T> | Transferable[],
  maybeTransfer: Transferable[] = [],
): Promise<_GetOutput<T>> {
  const __id = currentId++;
  let tag: string | undefined = undefined;
  let worker: Worker = tagOrWorker as Worker;
  let input: _GetInput<T> = workerOrInput as _GetInput<T>;
  let transfer: Transferable[] = (inputOrTransfer || []) as Transferable[];
  if (typeof tagOrWorker === "string") {
    tag = tagOrWorker;
    worker = workerOrInput as Worker;
    input = inputOrTransfer as _GetInput<T>;
    transfer = maybeTransfer || [];
  }
  return new Promise((res, rej) => {
    const listener = ({
      data,
    }: MessageEvent<_ResponsePackage<_GetOutput<T>, _GetError<T>>>) => {
      if (
        typeof data !== "object" ||
        !("__id" in data) ||
        !("s" in data) ||
        data.__id !== __id
      )
        return;

      // This works either both undefined or both defined and equal
      if (tag !== data.__tag) return;

      if (data.s) res(data.r);
      else rej(data.e);
      worker.removeEventListener("message", listener);
    };
    worker.addEventListener("message", listener);
    worker.postMessage(
      { t: input, __id, __tag: tag } as _SenderPackage<_GetInput<T>>,
      transfer,
    );
  });
}
