# promise-worker-ts 🚀

Type-safe Promise-based communication with Web Workers in TypeScript.

[![npm version](https://badge.fury.io/js/promise-worker-ts.svg)](https://www.npmjs.com/package/promise-worker-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features ✨

- 🔒 **Fully Type-Safe**: Complete end-to-end type safety for Web Worker communication
- 🏷️ **Tagged Messages**: Support for multiple message types in a single worker
- 🔄 **Promise-Based**: Clean, modern async/await syntax
- 📦 **Zero Dependencies**: Lightweight and framework-agnostic
- 🛡️ **TypeScript First**: Built with TypeScript for the best developer experience
- 📤 **Transferable Objects**: Full support for transferring ownership of objects between threads

## Installation 📦

```bash
npm install promise-worker-ts
# or
yarn add promise-worker-ts
# or
pnpm add promise-worker-ts
```

## Quick Start 🚀

### Basic Usage

1. Define your shared types (e.g., `types.shared.ts`):

```typescript
import type { PromiseWorker } from "promise-worker-ts";

export type DoubleNumber = PromiseWorker<number, number>;
```

2. Set up your worker (`worker.ts`):

```typescript
import { listen } from "promise-worker-ts";
import type { DoubleNumber } from "./types.shared";

listen<DoubleNumber>((num) => num * 2);
```

3. Use in your main thread:

```typescript
import { send } from "promise-worker-ts";
import type { DoubleNumber } from "./types.shared";

const worker = new Worker(/* ... */);
const result = await send<DoubleNumber>(worker, 21); // result = 42
```

### Tagged Messages

When you need multiple message types in a single worker:

1. Define tagged types:

```typescript
import type { PromiseWorkerTagged } from "promise-worker-ts";

export type AddNumbers = PromiseWorkerTagged<"add", [number, number], number>;
export type MultiplyNumbers = PromiseWorkerTagged<
  "multiply",
  [number, number],
  number
>;
```

2. Set up worker handlers:

```typescript
import { listen } from "promise-worker-ts";
import type { AddNumbers, MultiplyNumbers } from "./types.shared";

listen<AddNumbers>("add", ([a, b]) => a + b);
listen<MultiplyNumbers>("multiply", ([a, b]) => a * b);
```

3. Use in main thread:

```typescript
import { send } from "promise-worker-ts";
import type { AddNumbers, MultiplyNumbers } from "./types.shared";

const worker = new Worker("worker.ts");

const sum = await send<AddNumbers>("add", worker, [5, 3]); // 8
const product = await send<MultiplyNumbers>("multiply", worker, [5, 3]); // 15
```

## API Reference 📖

### Types

These types are technically objects, but they're convenience types for being able to define once and use in both workers and main thread.

#### `PromiseWorker<Input, Output, Error = unknown>`

Basic type for single-purpose workers

- `Input`: Type of data sent to worker
- `Output`: Type of data received from worker
- `Error`: Optional error type

#### `PromiseWorkerTagged<Tag, Input, Output, Error = unknown>`

Type for tagged messages in multi-purpose workers

- `Tag`: Literal string type for message identification
- `Input`: Type of data sent to worker
- `Output`: Type of data received from worker
- `Error`: Optional error type

### Functions

#### `send<T>(worker: Worker, input: Input): Promise<Output>`

Send message to untagged worker

#### `send<T>(tag: string, worker: Worker, input: Input): Promise<Output>`

Send message to tagged worker

#### `listen<T>(handler: (input: Input) => Output | Promise<Output>): void`

Listen for untagged messages

#### `listen<T>(tag: string, handler: (input: Input) => Output | Promise<Output>): void`

Listen for tagged messages

#### Reverse direction (worker → main)

- `sendToMain<T>(input: Input, transfer?: Transferable[]): Promise<Output>`
- `sendToMain<T>(tag: string, input: Input, transfer?: Transferable[]): Promise<Output>`
- `listenMain<T>(worker: Worker, handler: (input: Input, transfer: Transferable[]) => Output | Promise<Output>): () => void`
- `listenMain<T>(tag: string, worker: Worker, handler: (input: Input, transfer: Transferable[]) => Output | Promise<Output>): () => void`

These mirror `send`/`listen` but in the opposite direction: call from the worker, handle on the main thread, with full support for tagging and transferables.

## Advanced Usage 🔧

### Error Handling

```typescript
type DivideNumbers = PromiseWorkerTagged<
  "divide", // Tag
  [number, number], // Input
  number, // Output
  "Division by zero" // Error
>;

// In worker
listen<DivideNumbers>("divide", ([a, b]) => {
  if (b === 0) throw "Division by zero";
  return a / b;
});

// In main thread
try {
  const result = await send<DivideNumbers>("divide", worker, [10, 0]);
} catch (error) {
  console.error(error); // 'Division by zero'
}
```

### Transferable Objects

```typescript
// Send with transferable objects
const arrayBuffer = new ArrayBuffer(1024);
await send<MyType>(worker, arrayBuffer, [arrayBuffer]);

// Send back transferable objects
listen<MyType>((arrayBuffer, transferables) => {
  const newArrayBuffer = new ArrayBuffer(1024);

  // Add to transfer queue and return
  transferables.push(newArrayBuffer);
  return newArrayBuffer;
});
```

For listening, you can pass a callback function.

## Todo

- [x] Write tests for transferable objects
- [ ] Write more robust test for passing _back_ transfer objects
- [x] Make it so workers can initiate promises to their parent threads

### Worker → Main Example

1. Define the types (shared):

```ts
import type { PromiseWorkerTagged } from "promise-worker-ts";

export type RevCallSquare = PromiseWorkerTagged<"rev.call.square", number, number>;
export type RevTriggerSquare = PromiseWorkerTagged<
  "rev.trigger.square",
  number,
  number
>;
```

2. In worker:

```ts
import { listen, sendToMain } from "promise-worker-ts";
import type { RevCallSquare, RevTriggerSquare } from "./types.shared";

listen<RevTriggerSquare>("rev.trigger.square", async (n) => {
  return await sendToMain<RevCallSquare>("rev.call.square", n);
});
```

3. In main:

```ts
import { listenMain, send } from "promise-worker-ts";
import type { RevCallSquare, RevTriggerSquare } from "./types.shared";

const worker = new Worker("reverse.worker.ts");
const stop = listenMain<RevCallSquare>("rev.call.square", worker, (n, transfer) => n * 2);

const result = await send<RevTriggerSquare>("rev.trigger.square", worker, 5);
// result === 10
stop();
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💖

If you find this project helpful, please consider:

- Starring the repository ⭐
- Reporting issues 🐛
- Contributing improvements 🛠️
- Sharing with others 🌟

## Credits 👏

Created and maintained by [Peter Batory-Bernardin](https://petermakeswebsites.co.uk)
