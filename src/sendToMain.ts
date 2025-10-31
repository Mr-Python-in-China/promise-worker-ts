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
 * Sends a message from a Worker to its parent (main thread) and returns a promise for the response.
 *
 * Works exactly like `send`, but from the worker side to call a handler registered on the main thread
 * using `listenMain`.
 */
export function sendToMain<T extends _UnknownPromiseTaggedWorker>(
  tag: _GetTag<T>,
  input: _GetInput<T>,
  transfer?: Transferable[]
): Promise<_GetOutput<T>>;

export function sendToMain<T extends _UnknownPromiseWorker>(
  input: _GetInput<T>,
  transfer?: Transferable[]
): Promise<_GetOutput<T>>;

export function sendToMain<T extends _UnknownPromiseWorker>(
  tagOrInput: string | _GetInput<T>,
  maybeInputOrTransfer?: _GetInput<T> | Transferable[],
  maybeTransfer: Transferable[] = []
): Promise<_GetOutput<T>> {
  const __id = currentId++;
  let tag: string | undefined = undefined;
  let input: _GetInput<T> = tagOrInput as _GetInput<T>;
  let transfer: Transferable[] = (maybeInputOrTransfer || []) as Transferable[];

  if (typeof tagOrInput === "string") {
    tag = tagOrInput;
    input = maybeInputOrTransfer as _GetInput<T>;
    transfer = maybeTransfer || [];
  }

  return new Promise((res, rej) => {
    const listener = ({
      data,
    }: MessageEvent<_ResponsePackage<_GetOutput<T>, _GetError<T>>>) => {
      if (
        typeof data !== "object" ||
        data === null ||
        !("__id" in data) ||
        !("s" in data) ||
        data.__id !== __id
      )
        return;

      // This works either both undefined or both defined and equal
      if (tag !== data.__tag) return;

      const pkg = data as _ResponsePackage<_GetOutput<T>, _GetError<T>>;
      if (pkg.s) res(pkg.r);
      else rej(pkg.e);
      self.removeEventListener("message", listener);
    };
    self.addEventListener("message", listener);
    self.postMessage(
      { t: input, __id, __tag: tag } satisfies _SenderPackage<_GetInput<T>>,
      transfer
    );
  });
}
