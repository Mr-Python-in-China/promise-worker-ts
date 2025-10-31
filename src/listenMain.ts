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
 * Listens for calls initiated by a Worker on the main thread (worker -> main) and responds.
 * Attach this to a specific Worker instance.
 */
export function listenMain<T extends _UnknownPromiseTaggedWorker>(
  tag: _GetTag<T>,
  worker: Worker,
  fn: ListenFn<T>
): () => void;

export function listenMain<T extends _UnknownPromiseWorker>(
  worker: Worker,
  fn: ListenFn<T>
): () => void;

export function listenMain<T extends _UnknownPromiseWorker>(
  tagOrWorker: string | Worker,
  workerOrFn: Worker | ListenFn<T>,
  maybeFn?: ListenFn<T>
): () => void {
  let tag: string | undefined = undefined;
  let worker: Worker = tagOrWorker as Worker;
  let fn: ListenFn<T> = workerOrFn as ListenFn<T>;
  if (typeof tagOrWorker === "string") {
    tag = tagOrWorker;
    worker = workerOrFn as Worker;
    fn = maybeFn!;
  }

  const listener = async ({
    data,
  }: MessageEvent<_SenderPackage<_GetInput<T>>>) => {
    if (
      !(typeof data === "object") ||
      data === null ||
      !("__id" in data) ||
      !("t" in data)
    )
      return;

    if (tag !== data.__tag) return;
    const { __id, t } = data as _SenderPackage<_GetInput<T>>;
    try {
      const transferables: Transferables = [];
      const r = await fn(t, transferables);
      worker.postMessage(
        { s: true, r, __id, __tag: tag } as _ResponsePackage<
          _GetOutput<T>,
          _GetError<T>
        >,
        transferables || []
      );
    } catch (e) {
      worker.postMessage({ s: false, e, __id, __tag: tag } as _ResponsePackage<
        _GetOutput<T>,
        _GetError<T>
      >);
    }
  };

  worker.addEventListener("message", listener);
  return () => worker.removeEventListener("message", listener);
}

type ListenFn<T extends _PromiseBase<unknown, unknown>> = (
  input: _GetInput<T>,
  transferables: Transferables
  // Return could be sync or async
) => Promise<_GetOutput<T>> | _GetOutput<T>;

type Transferables = Transferable[];
