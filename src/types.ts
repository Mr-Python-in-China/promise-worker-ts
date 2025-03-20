/**
 * Represents the type structure for worker communication.
 *
 * @template I - The type of data being sent to the worker
 * @template O - The type of data being returned from the worker
 * @template E - The type of error that may be thrown (defaults to unknown)
 *
 * Example:
 * ```ts
 * // Worker that takes a number and returns a string
 * type MyWorker = PromiseWorker<number, string, Error>
 * ```
 */
export interface PromiseWorker<I, O, E = unknown> {
  input: I;
  output: O;
  error: E;
  tag: never;
}

/**
 * Represents the type structure for worker communication with tags to
 * identify the correct promise. Required when using the same worker with
 * multiple promises.
 *
 * @template T - Tag to identify the correct promise
 * @template I - The type of data being sent to the worker
 * @template O - The type of data being returned from the worker
 * @template E - The type of error that may be thrown (defaults to unknown)
 *
 * Example:
 * ```ts
 * // Worker that takes a number and returns a string
 * type MyWorker = PromiseWorkerTagged<"myTag", number, string, Error>
 * ```
 */
export interface PromiseWorkerTagged<T extends string, I, O, E = unknown> {
  tag: T;
  input: I;
  output: O;
  error: E;
}

export interface _PromiseBase<I, O, E = unknown> {
  input: I;
  output: O;
  error: E;
}
export type _UnknownPromiseWorker = PromiseWorker<unknown, unknown, unknown>;
export type _UnknownPromiseTaggedWorker = PromiseWorkerTagged<
  string,
  unknown,
  unknown,
  unknown
>;

export type _GetInput<T extends _PromiseBase<unknown, unknown, unknown>> =
  T extends _PromiseBase<infer I, any, any> ? I : never;
export type _GetOutput<T extends _PromiseBase<unknown, unknown, unknown>> =
  T extends _PromiseBase<any, infer O, any> ? O : never;
export type _GetError<T extends _PromiseBase<unknown, unknown, unknown>> =
  T extends _PromiseBase<any, any, infer E> ? E : never;
export type _GetTag<T extends _UnknownPromiseTaggedWorker> =
  T extends PromiseWorkerTagged<infer U, unknown, unknown, unknown> ? U : never;

export type _SenderPackage<T> = {
  __id: number;
  __tag: undefined | string;
  t: T;
};

export type _ResponsePackage<R, E> = {
  __id: number;
  __tag: undefined | string;
} & ({ s: true; r: R } | { s: false; e: E });
