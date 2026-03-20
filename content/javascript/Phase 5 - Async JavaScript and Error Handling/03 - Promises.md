---
title: Promises
phase: 5
topic: Promises
tags: [javascript, promises, async, then, catch, finally, promise-combinators, interview]
created: 2025-01-15
---

# Promises

> [!info] **Big Picture**
> A **Promise** is an object that represents the eventual completion (or failure) of an asynchronous operation and its resulting value. Before Promises, callbacks were the only way to handle async results — leading to deeply nested "callback hell." Promises flatten the chain, give us `.then/.catch/.finally`, and are the foundation on which `async/await` is built. They are the most important async primitive in modern JavaScript.

---

## Promise States

A Promise is always in one of three states:

```
        ┌─────── fulfilled (resolved with a value)
        │
pending ─┤        A settled Promise is IMMUTABLE
        │        — it cannot change state again
        └─────── rejected (rejected with a reason/error)
```

| State | Description | Settled? |
|---|---|---|
| **pending** | Initial state — not yet resolved or rejected | No |
| **fulfilled** | Operation completed successfully | Yes |
| **rejected** | Operation failed | Yes |

---

## Creating a Promise

### The `Promise` Constructor

```js
const myPromise = new Promise((resolve, reject) => {
  // Async operation goes here
  const success = true;

  if (success) {
    resolve("It worked!"); // → fulfilled with value "It worked!"
  } else {
    reject(new Error("It failed!")); // → rejected with error
  }
});
```

> [!tip] **Always reject with an Error object**
> `reject("something went wrong")` loses the stack trace. Use `reject(new Error("something went wrong"))` instead.

### Static Creation Methods

```js
// Already fulfilled
const p1 = Promise.resolve(42);

// Already rejected
const p2 = Promise.reject(new Error("fail"));

// Thenable conversion — wraps non-Promise thenables
const p3 = Promise.resolve({ then(resolve) { resolve(99); } });
```

---

## Consuming Promises: `.then()`, `.catch()`, `.finally()`

### `.then(onFulfilled, onRejected)`

```js
fetchUser(1)
  .then(user => {
    console.log(user.name);
    return fetchPosts(user.id); // return another Promise → chain continues
  })
  .then(posts => {
    console.log(`Found ${posts.length} posts`);
  });
```

**Rules:**
- Returns a **new Promise** (always)
- If the callback returns a value → next `.then` gets that value
- If the callback returns a Promise → next `.then` waits for it
- If the callback throws → the returned Promise is rejected

### `.catch(onRejected)`

Shorthand for `.then(undefined, onRejected)`. Catches any rejection in the chain above it.

```js
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => renderPosts(posts))
  .catch(err => {
    // catches ANY error from the chain above
    console.error("Something failed:", err.message);
  });
```

### `.finally(onFinally)`

Runs **regardless** of outcome (fulfilled or rejected). Does NOT receive the value/error. Returns the original Promise value (passes through).

```js
showSpinner();

fetchData()
  .then(data => renderData(data))
  .catch(err => showError(err))
  .finally(() => {
    hideSpinner(); // cleanup — always runs
  });
```

---

## Promise Chaining

The real power of Promises — each `.then` returns a new Promise, enabling flat chains instead of nested callbacks.

```js
// ❌ Callback Hell
getUser(id, (err, user) => {
  if (err) return handleError(err);
  getPosts(user.id, (err, posts) => {
    if (err) return handleError(err);
    getComments(posts[0].id, (err, comments) => {
      if (err) return handleError(err);
      renderComments(comments);
    });
  });
});

// ✅ Promise Chain
getUser(id)
  .then(user => getPosts(user.id))
  .then(posts => getComments(posts[0].id))
  .then(comments => renderComments(comments))
  .catch(err => handleError(err)); // one catch handles all errors
```

### Chain Behavior

```js
Promise.resolve(1)
  .then(x => x + 1)        // receives 1, returns 2
  .then(x => x * 3)        // receives 2, returns 6
  .then(x => { throw new Error("oops"); }) // throws → skip to catch
  .then(x => x + 100)      // SKIPPED
  .catch(err => {
    console.log(err.message); // "oops"
    return 42;               // recovery — chain continues
  })
  .then(x => console.log(x)); // 42
```

> [!note] **Recovery in `.catch()`**
> Returning a value from `.catch()` "recovers" from the error. The chain continues with the returned value. To keep the chain rejected, re-throw: `throw err;`

---

## Promise Combinators

### `Promise.all(iterable)`

Wait for ALL promises to fulfill. Rejects immediately if ANY promise rejects.

```js
const [users, posts, settings] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
  fetchSettings()
]);
// All three run in PARALLEL — total time = max(individual times)
```

```js
// If one fails, ALL fail:
Promise.all([
  Promise.resolve(1),
  Promise.reject(new Error("fail")),
  Promise.resolve(3)
]).catch(err => {
  console.log(err.message); // "fail"
  // You do NOT get the results of promises 1 and 3
});
```

### `Promise.allSettled(iterable)` — ES2020

Wait for ALL promises to settle (fulfill OR reject). Never short-circuits.

```js
const results = await Promise.allSettled([
  fetchUser(1),           // succeeds
  fetchUser(999),         // fails (user not found)
  fetchUser(2)            // succeeds
]);

results.forEach(result => {
  if (result.status === "fulfilled") {
    console.log("Value:", result.value);
  } else {
    console.log("Error:", result.reason.message);
  }
});
// { status: "fulfilled", value: {...} }
// { status: "rejected", reason: Error("not found") }
// { status: "fulfilled", value: {...} }
```

### `Promise.race(iterable)`

Settles as soon as the FIRST promise settles (win or lose).

```js
// Timeout pattern
function fetchWithTimeout(url, ms) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    )
  ]);
}

const response = await fetchWithTimeout("/api/data", 5000);
```

### `Promise.any(iterable)` — ES2021

Resolves with the FIRST fulfilled promise. Rejects only if ALL reject (with `AggregateError`).

```js
// Try multiple CDN mirrors — use whichever responds first
const resource = await Promise.any([
  fetch("https://cdn1.example.com/lib.js"),
  fetch("https://cdn2.example.com/lib.js"),
  fetch("https://cdn3.example.com/lib.js")
]);
```

```js
// All fail → AggregateError
Promise.any([
  Promise.reject(new Error("a")),
  Promise.reject(new Error("b"))
]).catch(err => {
  console.log(err instanceof AggregateError); // true
  console.log(err.errors); // [Error("a"), Error("b")]
});
```

### Combinator Comparison

| Method | Resolves When | Rejects When | Short-Circuits? |
|---|---|---|---|
| `Promise.all` | ALL fulfill | ANY rejects | Yes (on first reject) |
| `Promise.allSettled` | ALL settle | Never | No |
| `Promise.race` | First settles | First settles | Yes (first to settle) |
| `Promise.any` | First fulfills | ALL reject | Yes (first to fulfill) |

---

## ES2024+ Promise Additions

### `Promise.withResolvers()` — ES2024

Extracts `resolve` and `reject` so you don't need the executor pattern.

```js
// Before:
let resolve, reject;
const promise = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});

// After (ES2024):
const { promise, resolve, reject } = Promise.withResolvers();

// Useful for event-based resolution
const { promise: loaded, resolve: onLoad } = Promise.withResolvers();
image.addEventListener("load", onLoad);
await loaded;
```

### `Promise.try()` — ES2025

Wraps a function that may be sync or async — always returns a Promise, catching both sync throws and async rejections.

```js
// Before:
function execute(fn) {
  return new Promise(resolve => resolve(fn()));
  // or: return Promise.resolve().then(() => fn());
}

// After (ES2025):
const result = Promise.try(() => {
  if (Math.random() > 0.5) throw new Error("sync error");
  return fetch("/api/data"); // async
});

result
  .then(data => console.log(data))
  .catch(err => console.error(err)); // catches both sync and async errors
```

---

## Real-World Patterns

### Sequential Execution

```js
// Process items one at a time
async function processSequentially(urls) {
  const results = [];
  for (const url of urls) {
    const data = await fetch(url).then(r => r.json());
    results.push(data);
  }
  return results;
}
```

### Controlled Concurrency

```js
// Process with a concurrency limit
async function withConcurrency(items, fn, limit = 3) {
  const results = [];
  const executing = new Set();

  for (const [index, item] of items.entries()) {
    const p = fn(item).then(result => {
      executing.delete(p);
      results[index] = result;
    });
    executing.add(p);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

// Use: max 3 concurrent fetches
await withConcurrency(urls, url => fetch(url), 3);
```

### Retry with Backoff

```js
async function retry(fn, maxAttempts = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      const delay = baseDelay * 2 ** (attempt - 1); // exponential backoff
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

const data = await retry(() => fetch("/flaky-api").then(r => r.json()));
```

### Promisifying Callbacks

```js
function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// Node.js built-in:
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
```

---

## Microtask Timing

Promise callbacks (`.then`, `.catch`, `.finally`) are scheduled as **microtasks**. They run after the current synchronous code completes but before any macrotasks.

```js
console.log("A");
Promise.resolve().then(() => console.log("B"));
console.log("C");

// A → C → B (B is a microtask, runs after sync code)
```

See [[02 - The Event Loop]] for the complete execution model.

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Forgetting to return** in `.then()` — breaks the chain:
>    ```js
>    // ❌ Missing return — next .then gets undefined
>    fetchUser(1).then(user => {
>      fetchPosts(user.id); // no return!
>    }).then(posts => {
>      console.log(posts); // undefined 😱
>    });
>    ```
> 2. **Unhandled rejections** — Always have a `.catch()` at the end of every chain. Browsers/Node.js warn about unhandled rejections.
> 3. **`Promise.all` fails fast** — One rejection aborts everything. Use `Promise.allSettled` if you need all results regardless.
> 4. **Promise constructor anti-pattern** — Don't wrap existing Promises in `new Promise`:
>    ```js
>    // ❌ Anti-pattern
>    function fetchData() {
>      return new Promise((resolve, reject) => {
>        fetch("/api").then(r => resolve(r)).catch(reject);
>      });
>    }
>    // ✅ Just return the Promise
>    function fetchData() { return fetch("/api"); }
>    ```
> 5. **Sync errors in `.then()` become rejections** — They don't crash; they propagate down the chain.

---

> [!tip] **Bridge: Callbacks → Promises**
> Promises were created to solve "callback hell." Any callback-based API can be wrapped:
> ```js
> // Callback-based (Node.js style)
> fs.readFile("data.txt", "utf8", (err, data) => {
>   if (err) throw err;
>   console.log(data);
> });
>
> // Promise-wrapped
> const readFile = (path) => new Promise((resolve, reject) => {
>   fs.readFile(path, "utf8", (err, data) => {
>     if (err) reject(err);
>     else resolve(data);
>   });
> });
>
> // Node.js built-in helper
> const { promisify } = require("util");
> const readFile = promisify(fs.readFile);
> ```
> Modern APIs (`fetch`, `navigator.clipboard`, etc.) return Promises natively.

---

## 💼 Common Interview Questions

**Q1: What are the three states of a Promise?**
> - **Pending** — initial state, neither fulfilled nor rejected
> - **Fulfilled** — operation completed successfully, `.then()` fires
> - **Rejected** — operation failed, `.catch()` fires
> Once settled (fulfilled or rejected), a Promise is **immutable** — it can never change state again.

**Q2: Explain the difference between `Promise.all`, `Promise.allSettled`, `Promise.race`, and `Promise.any`.**
> | Method | Resolves when | Rejects when |
> |---|---|---|
> | `all` | All fulfill | Any one rejects (fail-fast) |
> | `allSettled` | All settle (fulfill or reject) | Never rejects |
> | `race` | First to settle (either) | First to settle is a rejection |
> | `any` | First to fulfill | All reject (`AggregateError`) |

**Q3: What is the Promise constructor anti-pattern?**
> Wrapping an existing Promise in `new Promise()`. It’s unnecessary and hides errors:
> ```js
> // ❌ Anti-pattern
> return new Promise((resolve) => { fetch(url).then(resolve); });
> // ✅ Correct
> return fetch(url);
> ```

**Q4: How do you handle errors in a Promise chain?**
> Use `.catch()` at the end of the chain. It catches rejections from ANY preceding `.then()`. For fine-grained handling, add `.catch()` mid-chain — it returns a resolved Promise, allowing the chain to recover.

**Q5: What happens if you forget to return inside `.then()`?**
> The next `.then()` receives `undefined`. The chain continues but with lost data. Always `return` the value or Promise inside `.then()` callbacks.

---

## 🎯 Practice Exercises

1. **Promise from Scratch** — Implement a simplified `MyPromise` class with `.then()`, `.catch()`, and `.finally()`. Support chaining and async resolution.
2. **Sequential Fetch** — Given an array of URLs, fetch them **sequentially** (not in parallel) using a Promise chain with `.reduce()`.
3. **Parallel with Limit** — Implement `promisePool(tasks, concurrency)` that runs at most `concurrency` Promises at a time.
4. **Retry with Backoff** — Write `retry(fn, maxAttempts, delay)` that retries a Promise-returning function with exponential backoff on failure.
5. **Promisify** — Write your own `promisify(fn)` utility that converts a Node.js-style callback function `(err, result)` into a Promise-returning function.

---

## Related Topics

- [[02 - The Event Loop]] — Microtask queue where Promise callbacks execute
- [[04 - Async Await]] — Syntactic sugar over Promises
- [[05 - Error Handling]] — `try/catch` with Promises and async/await
- [[06 - Timers and Scheduling]] — Macrotask-based scheduling

---

**Navigation:**
← [[02 - The Event Loop]] | [[04 - Async Await]] →
