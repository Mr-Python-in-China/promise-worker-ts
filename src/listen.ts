import type {
  _GetInput,
  _GetOutput,
  _GetError,
  _ResponsePackage,
  _SenderPackage,
  _UnknownPromiseWorker,
  _UnknownPromiseTaggedWorker,
  _GetTag,
  _PromiseBase,
} from "./types";
/**
 * Sets up a message listener in a Web Worker to handle incoming messages.
 *
 * @template T - The PromiseWorker type definition
 * @param tag - The tag for the message listener
 * @param fn - The function that processes the input data. Can return a value synchronously or as a Promise
 * @returns A cleanup function that removes the message listener
 *
 * Example:
 * ```ts
 * // In worker.ts
 * type Doubler = PromiseWorkerTagged<"myTag",number, string>
 * listen<Doubler>("myTag",(input) => {
 *   return `Processed: ${input * 2}`;
 * });
 *
 * // Or, for transferables
 * type Transfer = PromiseWorker<"myTag", number, Uint8Array>
 * listen<Transfer>("myTag", (input, transferables) => {
 *   const arr = new Uint8Array(input);
 *   transferables.push(arr.buffer); // Push the buffer to the transferables array
 *   return arr;
 * });
 * ```
 */
export function listen<T extends _UnknownPromiseTaggedWorker>(
  tag: _GetTag<T>,
  fn: ListenFn<T>,
  transferables?: Transferables,
): () => void;
/**
 * Sets up a message listener in a Web Worker to handle incoming messages.
 *
 * @template T - The PromiseWorker type definition
 * @param fn - The function that processes the input data. Can return a value synchronously or as a Promise
 * @param transferables - Optional function that returns an array of Transferable objects to be transferred to the main thread
 * @returns A cleanup function that removes the message listener
 *
 * Example:
 * ```ts
 * // In worker.ts
 * type Doubler = PromiseWorker<number, string>
 * listen<Doubler>((input) => {
 *   return `Processed: ${input * 2}`;
 * });
 *
 * // Or, for transferables
 * type Transfer = PromiseWorker<number, Uint8Array>
 * listen<Transfer>((input, transferables) => {
 *   const arr = new Uint8Array(input);
 *   transferables.push(arr.buffer); // Push the buffer to the transferables array
 *   return arr;
 * });
 * ```
 */
export function listen<T extends _UnknownPromiseWorker>(
  fn: ListenFn<T>,
): () => void;
export function listen<T extends _UnknownPromiseWorker>(
  tagOrFn: string | ListenFn<T>,
  extraFn?: ListenFn<T>,
): () => void {
  let tag: string | undefined = undefined;
  let fn: ListenFn<T> = tagOrFn as ListenFn<T>;
  if (typeof tagOrFn === "string") {
    // We are in tag mode!
    tag = tagOrFn;
    fn = extraFn!;
  }
  const listener = async ({
    data,
  }: MessageEvent<_SenderPackage<_GetInput<T>>>) => {
    if (!(typeof data === "object") || !("__id" in data) || !("t" in data))
      return;

    // This works either both undefined or both defined and equal
    if (tag !== data.__tag) return;
    const { __id, t } = data;
    try {
      const transferables: Transferables = [];
      const r = await fn(t, transferables);
      self.postMessage(
        { s: true, r, __id, __tag: tag } as _ResponsePackage<
          _GetOutput<T>,
          _GetError<T>
        >,
        transferables || [],
      );
    } catch (e) {
      self.postMessage({ s: false, e, __id, __tag: tag } as _ResponsePackage<
        _GetOutput<T>,
        _GetError<T>
      >);
    }
  };
  self.addEventListener("message", listener);
  return () => self.removeEventListener("message", listener);
}

type ListenFn<T extends _PromiseBase<unknown, unknown>> = (
  input: _GetInput<T>,
  transferables: Transferables,
) => Promise<_GetOutput<T>> | _GetOutput<T>;

type Transferables = Transferable[];
