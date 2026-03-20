---
title: Timers and Scheduling
phase: 5
topic: Timers and Scheduling
tags: [javascript, setTimeout, setInterval, requestAnimationFrame, AbortController, scheduling, timers]
created: 2025-01-15
---

# Timers and Scheduling

> [!info] **Big Picture**
> JavaScript provides several mechanisms for scheduling code to run later — from simple delays (`setTimeout`) to animation-synced callbacks (`requestAnimationFrame`) to cancellation tokens (`AbortController`). Understanding these tools and their timing guarantees (or lack thereof) is essential for building responsive UIs, managing async operations, and avoiding performance pitfalls.

---

## `setTimeout` / `clearTimeout`

Schedule a callback to run **once** after a minimum delay.

```js
const timerId = setTimeout(() => {
  console.log("Runs after ~2 seconds");
}, 2000);

// Cancel before it fires
clearTimeout(timerId);
```

### Key Behaviors

```js
// The delay is a MINIMUM, not a guarantee
setTimeout(() => console.log("timeout"), 0);
console.log("sync");
// "sync" → "timeout" (macrotask runs after all sync code)

// Nested setTimeout — browsers enforce 4ms minimum after 5 levels
function nested(depth = 0) {
  if (depth >= 10) return;
  setTimeout(() => {
    console.log(`depth ${depth}: ${performance.now()}`);
    nested(depth + 1);
  }, 0);
}
```

### Passing Arguments

```js
// Extra args are passed to the callback
setTimeout((a, b) => {
  console.log(a + b); // 5
}, 1000, 2, 3);

// ❌ Common mistake — calls the function immediately
setTimeout(console.log("oops"), 1000); // runs NOW, not after 1s

// ✅ Wrap in arrow function
setTimeout(() => console.log("correct"), 1000);
```

### `this` in Callbacks

```js
class Timer {
  constructor() {
    this.count = 0;
  }

  start() {
    // ❌ `this` is lost in regular function callback
    setTimeout(function () {
      this.count++; // TypeError: cannot read property of undefined
    }, 1000);

    // ✅ Arrow function captures `this` from enclosing scope
    setTimeout(() => {
      this.count++; // works
    }, 1000);

    // ✅ Or use .bind()
    setTimeout(function () {
      this.count++; // works
    }.bind(this), 1000);
  }
}
```

---

## `setInterval` / `clearInterval`

Execute a callback **repeatedly** at a fixed interval.

```js
let count = 0;
const id = setInterval(() => {
  count++;
  console.log(`Tick ${count}`);
  if (count >= 5) clearInterval(id); // stop after 5 ticks
}, 1000);
```

### The Drift Problem

`setInterval` schedules the **next** call relative to when the previous one was **scheduled**, not when it **finished**. If the callback takes longer than the interval, calls can stack up.

```js
// ❌ If callback takes 150ms and interval is 100ms, calls overlap
setInterval(() => {
  heavyOperation(); // takes 150ms
}, 100);

// ✅ Self-correcting setTimeout chain instead
function tick() {
  const start = performance.now();
  heavyOperation();
  const elapsed = performance.now() - start;
  const delay = Math.max(0, 100 - elapsed); // compensate for execution time
  setTimeout(tick, delay);
}
tick();
```

### Recursive `setTimeout` vs `setInterval`

```js
// ✅ Recursive setTimeout — guarantees delay BETWEEN executions
function poll() {
  fetchData().then(data => {
    process(data);
    setTimeout(poll, 5000); // wait 5s AFTER processing completes
  });
}

// ⚠️ setInterval — fires every 5s regardless of callback duration
setInterval(async () => {
  const data = await fetchData(); // might take 3s
  process(data);
  // Next call fires 5s after START, not after completion
}, 5000);
```

> [!tip] **Use recursive `setTimeout` for most cases**
> It gives you precise control over the delay between executions and prevents overlap. Use `setInterval` only for simple, fast operations.

---

## `requestAnimationFrame` (rAF)

Schedules a callback to run **before the next repaint** (~60fps = every ~16.67ms). The go-to for smooth animations.

```js
let position = 0;

function animate(timestamp) {
  position += 2;
  element.style.transform = `translateX(${position}px)`;

  if (position < 500) {
    requestAnimationFrame(animate); // schedule next frame
  }
}

requestAnimationFrame(animate); // start animation

// Cancel:
const id = requestAnimationFrame(callback);
cancelAnimationFrame(id);
```

### Why Not `setTimeout` for Animations?

| Feature | `setTimeout` | `requestAnimationFrame` |
|---|---|---|
| Timing | Fixed MS (may miss frames) | Synced to display refresh |
| Tab behavior | Runs in background tabs | **Paused** in background (saves battery) |
| Frame rate | Manual (~16ms, not precise) | Automatic (matches monitor) |
| Jank | Can cause janky animations | Smooth, browser-optimized |

### Smooth Animation with Delta Time

```js
let lastTime = 0;
const speed = 200; // pixels per second

function animate(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000; // seconds since last frame
  lastTime = timestamp;

  position += speed * deltaTime; // consistent speed regardless of frame rate
  element.style.transform = `translateX(${position}px)`;

  if (position < 500) {
    requestAnimationFrame(animate);
  }
}

requestAnimationFrame((timestamp) => {
  lastTime = timestamp;
  animate(timestamp);
});
```

---

## `requestIdleCallback`

Schedule work during browser **idle periods** — when the main thread has nothing else to do. Perfect for non-urgent background tasks.

```js
requestIdleCallback((deadline) => {
  // deadline.timeRemaining() — ms left in this idle period
  // deadline.didTimeout — true if the timeout was reached

  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    processTask(tasks.shift());
  }

  if (tasks.length > 0) {
    requestIdleCallback(processRemainingTasks); // continue later
  }
}, { timeout: 2000 }); // force run within 2s even if browser is busy
```

**Use cases:** analytics, preloading, data syncing, non-critical computations.

> [!note] **Browser Support**
> `requestIdleCallback` is supported in Chrome, Firefox, and Edge. Safari does NOT support it. Polyfill with `setTimeout(cb, 0)` as a fallback.

---

## `queueMicrotask`

Schedule a **microtask** — runs after current synchronous code but before any macrotasks or rendering.

```js
console.log("1");
queueMicrotask(() => console.log("2 — microtask"));
setTimeout(() => console.log("3 — macrotask"), 0);
console.log("4");

// Output: 1, 4, 2, 3
```

**Use cases:** batching updates, ensuring consistent ordering, cleanup between operations.

```js
// Batch multiple synchronous state changes
let pendingUpdates = [];
let scheduled = false;

function scheduleUpdate(update) {
  pendingUpdates.push(update);
  if (!scheduled) {
    scheduled = true;
    queueMicrotask(() => {
      const updates = pendingUpdates;
      pendingUpdates = [];
      scheduled = false;
      flushUpdates(updates); // process all at once
    });
  }
}
```

---

## `AbortController`

A mechanism for **cancelling** async operations — primarily `fetch`, but usable with any abortable API.

### Basic Usage

```js
const controller = new AbortController();
const { signal } = controller;

// Pass signal to fetch
fetch("/api/data", { signal })
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === "AbortError") {
      console.log("Request cancelled");
    } else {
      throw err; // real error
    }
  });

// Cancel the request
controller.abort();
```

### Timeout Pattern

```js
// AbortSignal.timeout — ES2022
const response = await fetch("/api/data", {
  signal: AbortSignal.timeout(5000) // auto-abort after 5s
});

// Manual timeout with AbortController
function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}
```

### Combining Signals — `AbortSignal.any()` — ES2024

```js
const userCancel = new AbortController();
const timeoutSignal = AbortSignal.timeout(10000);

// Cancel if EITHER the user cancels OR 10s elapse
const combinedSignal = AbortSignal.any([
  userCancel.signal,
  timeoutSignal
]);

fetch("/api/data", { signal: combinedSignal });

// User clicks cancel button
cancelButton.onclick = () => userCancel.abort();
```

### Aborting Multiple Operations

```js
const controller = new AbortController();

// One signal cancels everything
await Promise.all([
  fetch("/api/users", { signal: controller.signal }),
  fetch("/api/posts", { signal: controller.signal }),
  fetch("/api/comments", { signal: controller.signal })
]);

// Cancel all three at once
controller.abort();
```

### Listening to Abort

```js
function longRunningTask(signal) {
  return new Promise((resolve, reject) => {
    // Check if already aborted
    if (signal?.aborted) {
      return reject(new DOMException("Aborted", "AbortError"));
    }

    const id = setInterval(() => {
      // do work...
    }, 100);

    // Clean up when aborted
    signal?.addEventListener("abort", () => {
      clearInterval(id);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}
```

### React Cleanup Pattern

```js
useEffect(() => {
  const controller = new AbortController();

  async function loadData() {
    try {
      const res = await fetch("/api/data", { signal: controller.signal });
      const data = await res.json();
      setData(data);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err);
      }
      // AbortError is expected on cleanup — ignore it
    }
  }

  loadData();

  return () => controller.abort(); // cleanup on unmount/re-render
}, [dependency]);
```

---

## Debounce and Throttle

### Debounce — Wait Until Idle

Only run after the user **stops** triggering for a specified period.

```js
function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Only search after user stops typing for 300ms
const searchInput = document.getElementById("search");
searchInput.addEventListener("input", debounce((e) => {
  fetchResults(e.target.value);
}, 300));
```

### Throttle — Limit Frequency

Run at most once every N milliseconds, no matter how often triggered.

```js
function throttle(fn, limit) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= limit) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// Update position at most every 100ms during scroll
window.addEventListener("scroll", throttle(() => {
  updateScrollIndicator();
}, 100));
```

| Pattern | Use Case | Behavior |
|---|---|---|
| **Debounce** | Search input, form validation, resize | Wait until activity stops |
| **Throttle** | Scroll, mousemove, resize | Run at fixed intervals |

---

## Scheduling Reference Table

| API | Type | Timing | Cancellation |
|---|---|---|---|
| `setTimeout(fn, ms)` | Macrotask | After ≥ ms delay | `clearTimeout(id)` |
| `setInterval(fn, ms)` | Macrotask | Every ≥ ms | `clearInterval(id)` |
| `requestAnimationFrame(fn)` | Before repaint | ~16.67ms (60fps) | `cancelAnimationFrame(id)` |
| `requestIdleCallback(fn)` | Idle period | When browser is idle | `cancelIdleCallback(id)` |
| `queueMicrotask(fn)` | Microtask | After sync, before macrotasks | Not cancellable |
| `Promise.then(fn)` | Microtask | After sync, before macrotasks | Not cancellable |
| `AbortSignal.timeout(ms)` | N/A | Auto-aborts after ms | N/A |

---

## Execution Order Cheat Sheet

```js
console.log("1 — sync");

setTimeout(() => console.log("2 — macrotask"), 0);

Promise.resolve().then(() => console.log("3 — microtask"));

queueMicrotask(() => console.log("4 — microtask"));

requestAnimationFrame(() => console.log("5 — before repaint"));

console.log("6 — sync");

// Output:
// 1 — sync
// 6 — sync
// 3 — microtask
// 4 — microtask
// 5 — before repaint (next frame)
// 2 — macrotask
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`setTimeout(fn, 0)` ≠ instant** — It's at least one macrotask away, after all microtasks and possibly rendering.
> 2. **`setInterval` drift** — Callbacks can stack if they take longer than the interval. Use recursive `setTimeout` instead.
> 3. **Timer IDs are numbers** — `clearTimeout` and `clearInterval` are interchangeable (they share the same ID pool), but don't rely on this.
> 4. **Background tabs** — Browsers throttle `setTimeout`/`setInterval` in background tabs to ≥ 1000ms. `requestAnimationFrame` is paused entirely.
> 5. **Memory leaks** — Forgetting to `clearInterval` or `clearTimeout` keeps callbacks (and their closures) in memory.
> 6. **`AbortError` is normal** — When using `AbortController`, always check `err.name === "AbortError"` and handle it as a non-error.

---

## Related Topics

- [[02 - The Event Loop]] — How timers are processed in the event loop
- [[03 - Promises]] — Microtask-based scheduling
- [[06 - Closures]] — Timer callbacks form closures over variables
- [[05 - Error Handling]] — Handling `AbortError` and async errors

---

**Navigation:**
← [[05 - Error Handling]] | Phase 5 Complete → [[01 - Phase 6 - Overview]]
