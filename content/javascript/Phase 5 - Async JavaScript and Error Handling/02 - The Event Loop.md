---
title: The Event Loop
phase: 5
topic: The Event Loop
tags: [javascript, event-loop, call-stack, microtask, macrotask, web-apis, concurrency, interview]
created: 2025-01-15
---

# The Event Loop

> [!info] **Big Picture**
> JavaScript is **single-threaded** — it has ONE call stack and can execute only ONE piece of code at a time. Yet it handles thousands of concurrent operations (network requests, timers, user clicks). The **event loop** is the mechanism that makes this possible. It coordinates between the call stack, Web APIs, and task queues to give the illusion of multithreading. Understanding the event loop is the key to predicting execution order and avoiding async bugs.

---

## The Components

### 1. Call Stack

A LIFO (Last In, First Out) stack of **execution contexts**. Every function call pushes a frame; every return pops one.

```js
function multiply(a, b) { return a * b; }
function square(n) { return multiply(n, n); }
function printSquare(n) { console.log(square(n)); }

printSquare(4);
```

```
Call Stack (execution order):
1. push: printSquare(4)
2. push: square(4)
3. push: multiply(4, 4)
4. multiply returns 16 → pop
5. square returns 16 → pop
6. push: console.log(16) → pop
7. printSquare returns → pop
```

### 2. Web APIs / Node.js APIs

When you call `setTimeout`, `fetch`, `addEventListener`, etc., the **browser/Node.js** handles the async operation in a separate thread. JavaScript doesn't wait — it moves on.

```js
console.log("start");
setTimeout(() => console.log("timeout"), 0);
console.log("end");

// "start"
// "end"
// "timeout" ← runs AFTER all synchronous code
```

### 3. Macrotask Queue (Task Queue)

Holds callbacks from: `setTimeout`, `setInterval`, I/O operations, UI rendering events, `setImmediate` (Node.js).

### 4. Microtask Queue

Holds callbacks from: `Promise.then/catch/finally`, `queueMicrotask()`, `MutationObserver`, `process.nextTick()` (Node.js).

---

## The Event Loop Algorithm

```
1. Execute ALL synchronous code on the call stack
2. Stack empty? → Drain the ENTIRE microtask queue
   (including microtasks added during microtask processing)
3. Execute ONE macrotask from the macrotask queue  
4. Go to step 2 (drain microtasks again)
5. Optionally render (if it's time for a frame)
6. Go to step 3 (next macrotask)
```

> [!warning] **Critical Rule**
> **Microtasks ALWAYS run before macrotasks.** The entire microtask queue is drained before the event loop picks up the next macrotask. This means `Promise.then()` callbacks always run before `setTimeout` callbacks, even `setTimeout(fn, 0)`.

---

## The Classic Interview Question

```js
console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

Promise.resolve().then(() => {
  console.log("3");
});

console.log("4");
```

### Step-by-Step Execution

| Step | Action | Call Stack | Microtasks | Macrotasks | Output |
|---|---|---|---|---|---|
| 1 | `console.log("1")` | `console.log` | — | — | `1` |
| 2 | `setTimeout(cb, 0)` | `setTimeout` | — | `cb` | — |
| 3 | `Promise.resolve().then(cb)` | `then` | `cb` | `setTimeout cb` | — |
| 4 | `console.log("4")` | `console.log` | `promise cb` | `setTimeout cb` | `4` |
| 5 | Stack empty → drain microtasks | `promise cb` | — | `setTimeout cb` | `3` |
| 6 | Execute macrotask | `setTimeout cb` | — | — | `2` |

**Output: `1`, `4`, `3`, `2`**

---

## More Complex Example

```js
console.log("script start");

setTimeout(() => console.log("setTimeout"), 0);

Promise.resolve()
  .then(() => console.log("promise 1"))
  .then(() => console.log("promise 2"));

queueMicrotask(() => console.log("queueMicrotask"));

console.log("script end");
```

**Output:**
```
script start
script end
promise 1
queueMicrotask
promise 2
setTimeout
```

**Why?**
1. Synchronous: `"script start"`, `"script end"`
2. Microtasks processed (all of them):
   - `"promise 1"` (first `.then`)
   - `"queueMicrotask"` (queued microtask)
   - `"promise 2"` (second `.then` — added when promise 1 resolved)
3. Macrotask: `"setTimeout"`

---

## Nested Microtasks and Macrotasks

```js
setTimeout(() => {
  console.log("timeout 1");
  Promise.resolve().then(() => console.log("promise inside timeout"));
}, 0);

setTimeout(() => {
  console.log("timeout 2");
}, 0);

Promise.resolve().then(() => console.log("promise 1"));
```

**Output:**
```
promise 1               ← microtask (before any macrotask)
timeout 1               ← first macrotask
promise inside timeout  ← microtasks drain AFTER each macrotask
timeout 2               ← second macrotask
```

> [!note] **Key Insight**
> After each macrotask, the microtask queue is fully drained before the next macrotask runs. This is why `"promise inside timeout"` appears between `"timeout 1"` and `"timeout 2"`.

---

## `queueMicrotask()`

Explicitly schedule a microtask. Runs with the same priority as Promise callbacks.

```js
queueMicrotask(() => {
  console.log("microtask");
});

console.log("sync");
// "sync" → "microtask"
```

Use for scheduling work that needs to run after the current task but before rendering.

---

## Node.js Event Loop Differences

Node.js has a more complex event loop with additional phases:

```
   ┌───────────────────────────┐
┌─>│        timers              │  ← setTimeout, setInterval callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │     pending callbacks      │  ← I/O callbacks deferred from previous cycle
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │         poll               │  ← retrieve new I/O events; execute I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │         check              │  ← setImmediate() callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │    close callbacks         │  ← socket.on('close', ...)
│  └─────────────┬─────────────┘
└─────────────────┘
```

### `process.nextTick()` vs `queueMicrotask()`

```js
// process.nextTick — runs BEFORE other microtasks (including Promises)
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));
queueMicrotask(() => console.log("microtask"));

// Output (Node.js):
// "nextTick"    ← highest priority microtask
// "promise"
// "microtask"
```

> [!warning] **`process.nextTick` Starvation**
> `process.nextTick` callbacks run before I/O events. Recursive `nextTick` calls can starve I/O. Prefer `queueMicrotask` for new code.

---

## The Rendering Pipeline

In browsers, rendering (painting pixels on screen) happens between macrotasks:

```
Macrotask → Microtasks → Render → Macrotask → Microtasks → Render → ...
```

- Heavy synchronous code **blocks rendering** — the page freezes
- Long-running microtask chains also block rendering (they all drain before rendering)
- `requestAnimationFrame` callbacks run **just before** rendering

```js
// ❌ Blocks rendering
while (true) {} // infinite loop — page completely frozen

// ❌ Also blocks — microtasks drain before render
function blockWithMicrotasks() {
  queueMicrotask(blockWithMicrotasks); // infinite microtask loop
}
blockWithMicrotasks(); // page frozen — render never gets a chance
```

---

## Practical Implications

### Why `setTimeout(fn, 0)` Isn't Instant

```js
const start = performance.now();
setTimeout(() => {
  console.log(`Delay: ${performance.now() - start}ms`);
}, 0);

// Heavy sync work
for (let i = 0; i < 1e9; i++) {}

// Output: "Delay: ~2000ms" — blocks until sync work finishes!
// The 0ms timeout is a MINIMUM, not a guarantee
```

### Minimum Timeout

Browsers clamp nested `setTimeout` to a minimum of **4ms** after 5 nesting levels. For precise timing, use `requestAnimationFrame` or Web Workers.

### Don't Block the Event Loop

```js
// ❌ Heavy computation blocks everything
function processMillionItems(items) {
  items.forEach(item => heavyComputation(item)); // blocks for seconds
}

// ✅ Break into chunks using setTimeout
function processInChunks(items, chunkSize = 100) {
  let index = 0;

  function processChunk() {
    const end = Math.min(index + chunkSize, items.length);
    for (let i = index; i < end; i++) {
      heavyComputation(items[i]);
    }
    index = end;

    if (index < items.length) {
      setTimeout(processChunk, 0); // yield to the event loop between chunks
    }
  }

  processChunk();
}

// ✅ Even better: use a Web Worker for CPU-intensive work
```

---

## Summary

| Queue | Examples | Priority | When Drained |
|---|---|---|---|
| **Microtask** | `Promise.then`, `queueMicrotask`, `MutationObserver` | Highest | ENTIRELY after each task |
| **Macrotask** | `setTimeout`, `setInterval`, I/O, UI events | Lower | ONE at a time |
| `process.nextTick` (Node) | `process.nextTick()` | Highest (above microtasks) | Before microtasks |
| `requestAnimationFrame` | `rAF(callback)` | Before render | Once per frame |

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Promises before setTimeout** — Always. Even `setTimeout(fn, 0)` runs after all microtasks.
> 2. **Infinite microtask loops** — Block rendering permanently. At least macrotasks yield between runs.
> 3. **`setTimeout` accuracy** — It's a minimum delay, not a guarantee. Heavy sync code delays it.
> 4. **Blocking code** — Long sync operations freeze the UI. Break into chunks or use Web Workers.
> 5. **`async`/`await` creates microtasks** — `await` schedules the function continuation as a microtask.

---

## 💼 Common Interview Questions

**Q1: What will this output and why?**
```js
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
```
> **Answer:** `1, 4, 3, 2`
> - `1` and `4` are synchronous (call stack)
> - `3` is a microtask (Promise) — runs after sync code but before macrotasks
> - `2` is a macrotask (setTimeout) — runs last

**Q2: Explain the event loop in your own words.**
> JavaScript is single-threaded. The event loop continuously checks: (1) Execute all synchronous code on the call stack, (2) Drain all microtasks (Promises, `queueMicrotask`), (3) Pick ONE macrotask (setTimeout, I/O), push its callback to the stack, (4) Repeat. The browser may render between macrotasks.

**Q3: What's the difference between microtasks and macrotasks?**
> **Microtasks** (Promise callbacks, `queueMicrotask`, `MutationObserver`): ALL are drained after each macrotask, before rendering. **Macrotasks** (setTimeout, setInterval, I/O, UI events): processed ONE at a time, with microtask draining and potential rendering between each.

**Q4: Can the event loop be blocked? What happens?**
> Yes. A long synchronous computation blocks the call stack. The event loop can't process any callbacks, timers, or user interactions. The page freezes. Solutions: break work into chunks with `setTimeout`, use Web Workers, or use `requestIdleCallback`.

**Q5: What will this output?**
```js
async function foo() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}
console.log("C");
foo();
console.log("D");
```
> **Answer:** `C, A, D, B` — `foo()` runs synchronously until `await`. After `await`, the rest (`"B"`) is scheduled as a microtask. `"D"` prints before `"B"` because it’s still synchronous.

---

## 🎯 Practice Exercises

1. **Output Prediction** — Write 5 increasingly complex snippets mixing `setTimeout`, `Promise.then`, `queueMicrotask`, and `async/await`. Predict the exact output order, then verify.
2. **Visual Event Loop** — Build a simple HTML page with a button. On click, log timestamps for: sync code, microtask, macrotask, and `requestAnimationFrame`. Observe the order.
3. **Microtask Starvation** — Create a microtask loop that schedules new microtasks recursively. Observe how it blocks `setTimeout` callbacks. Then add a break condition.
4. **Long Task Chunking** — Write a function that processes an array of 10,000 items. First do it synchronously (blocks UI). Then refactor using `setTimeout(fn, 0)` chunks to keep the page responsive.
5. **Call Stack Tracer** — Write nested functions 3 levels deep, each calling the next. Use `console.trace()` at the deepest level to visualize the call stack.

---

## Related Topics

- [[03 - Promises]] — Microtask-based async primitive
- [[04 - Async Await]] — Syntactic sugar that uses the microtask queue
- [[06 - Timers and Scheduling]] — `setTimeout`, `setInterval`, `requestAnimationFrame`
- [[07 - Higher-Order Functions]] — Callbacks are the foundation of the event loop

---

**Navigation:**
← [[01 - Phase 5 - Overview]] | [[03 - Promises]] →
