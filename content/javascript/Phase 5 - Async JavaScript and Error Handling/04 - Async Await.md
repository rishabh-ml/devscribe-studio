---
title: Async Await
phase: 5
topic: Async Await
tags: [javascript, async, await, promises, error-handling, concurrency]
created: 2025-01-15
---

# Async / Await

> [!info] **Big Picture**
> `async/await` is **syntactic sugar** over Promises. It makes asynchronous code look and behave like synchronous code — no `.then()` chains, no nesting. Under the hood, `async` functions always return a Promise, and `await` pauses execution until a Promise settles, scheduling the rest of the function as a microtask. It is the modern standard for writing async JavaScript.

---

## `async` Functions

Adding `async` before a function declaration makes it **always return a Promise**.

```js
async function greet() {
  return "Hello";
}

greet().then(msg => console.log(msg)); // "Hello"

// Equivalent to:
function greet() {
  return Promise.resolve("Hello");
}
```

### Works with All Function Forms

```js
// Declaration
async function fetchData() { ... }

// Expression
const fetchData = async function() { ... };

// Arrow
const fetchData = async () => { ... };

// Method
const obj = {
  async getData() { ... }
};

// Class method
class Api {
  async request() { ... }
}
```

### Return Values

```js
async function example() {
  return 42;          // → Promise.resolve(42)
}

async function example2() {
  throw new Error("fail"); // → Promise.reject(Error("fail"))
}

async function example3() {
  return Promise.resolve(99); // → Promise that resolves to 99 (not wrapped twice)
}
```

---

## `await`

Pauses the `async` function until the Promise settles. Returns the resolved value (or throws the rejected reason).

```js
async function loadUser() {
  const response = await fetch("/api/user/1");  // pause until response
  const user = await response.json();            // pause until parsed
  console.log(user.name);
  return user;
}
```

### What Can Be Awaited?

```js
// Promises — the main use case
const data = await fetch("/api");

// Non-Promise values — returned immediately (wrapped in Promise.resolve)
const num = await 42; // 42

// Thenables — any object with a .then() method
const val = await { then(resolve) { resolve("thenable!"); } };
```

---

## Error Handling with `try/catch`

```js
async function loadData() {
  try {
    const res = await fetch("/api/data");

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to load:", err.message);
    return null; // fallback
  } finally {
    hideSpinner(); // always runs
  }
}
```

> [!tip] **`try/catch` with `await` catches both sync and async errors**
> Unlike `.then()/.catch()`, `try/catch` naturally handles both synchronous throws and rejected Promises in one block.

---

## Sequential vs Parallel Execution

### Sequential (One After Another)

```js
// ❌ SLOW — each await waits for the previous one
async function loadAll() {
  const users = await fetchUsers();     // 500ms
  const posts = await fetchPosts();     // 300ms
  const comments = await fetchComments(); // 200ms
  // Total: ~1000ms (sequential)
}
```

### Parallel (All at Once)

```js
// ✅ FAST — all requests fire simultaneously
async function loadAll() {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),     // 500ms ─┐
    fetchPosts(),     // 300ms ─┤ all run at once
    fetchComments()   // 200ms ─┘
  ]);
  // Total: ~500ms (max of the three)
}
```

### When to Use Which

```js
// Sequential — when each step depends on the previous
async function processOrder(orderId) {
  const order = await getOrder(orderId);          // need order first
  const user = await getUser(order.userId);        // need userId from order
  const address = await getAddress(user.addressId); // need addressId from user
  return { order, user, address };
}

// Parallel — when requests are independent
async function getDashboard(userId) {
  const [profile, notifications, feed] = await Promise.all([
    getProfile(userId),
    getNotifications(userId),
    getFeed(userId)
  ]);
  return { profile, notifications, feed };
}
```

### The "Fire Then Await" Pattern

```js
// Start both requests immediately, then await results
async function loadUserAndPosts(userId) {
  const userPromise = fetchUser(userId);     // fires immediately
  const postsPromise = fetchPosts(userId);   // fires immediately — no await yet

  const user = await userPromise;   // now wait for user
  const posts = await postsPromise; // and posts (probably already done)
  
  return { user, posts };
}
// Equivalent to Promise.all, but lets you handle separately
```

> [!warning] **Common Pitfall: Accidental Sequential**
> ```js
> // ❌ These look parallel but they're sequential!
> const users = await fetchUsers();   // waits...
> const posts = await fetchPosts();   // THEN waits...
> 
> // ✅ Fire both first
> const usersP = fetchUsers();
> const postsP = fetchPosts();
> const users = await usersP;
> const posts = await postsP;
> ```

---

## Loops with `await`

### `for...of` — Sequential

```js
async function processItems(urls) {
  const results = [];
  for (const url of urls) {
    const data = await fetch(url).then(r => r.json()); // one at a time
    results.push(data);
  }
  return results;
}
```

### `Promise.all` + `map` — Parallel

```js
async function fetchAll(urls) {
  const results = await Promise.all(
    urls.map(url => fetch(url).then(r => r.json()))
  );
  return results;
}
```

### `forEach` Does NOT Work with `await`

```js
// ❌ BROKEN — forEach doesn't await anything
urls.forEach(async (url) => {
  const data = await fetch(url); // fires all at once, BUT
  console.log(data);              // forEach doesn't wait for completion
});
console.log("done"); // runs BEFORE any fetch completes!

// ✅ Use for...of for sequential
for (const url of urls) {
  const data = await fetch(url);
  console.log(data);
}
```

---

## Top-Level Await — ES2022

In ES modules (not CommonJS), you can use `await` outside of `async` functions.

```js
// config.mjs (ES module)
const response = await fetch("/api/config");
export const config = await response.json();

// The module doesn't finish loading until the await resolves
```

```html
<!-- In the browser -->
<script type="module">
  const data = await fetch("/api/data").then(r => r.json());
  console.log(data);
</script>
```

> [!note] **Module Execution**
> Top-level await blocks the importing module from executing until the awaited Promise settles. Use it sparingly — it can delay your application's startup.

---

## `for await...of` — Async Iteration

Iterate over async iterables (streams, paginated APIs).

```js
async function* generateNumbers() {
  yield 1;
  await sleep(100);
  yield 2;
  await sleep(100);
  yield 3;
}

for await (const num of generateNumbers()) {
  console.log(num); // 1, then 2, then 3 (with delays)
}
```

```js
// Real-world: reading a stream
const response = await fetch("/api/large-data");
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(decoder.decode(value));
}
```

---

## Advanced Patterns

### Async IIFE

```js
// When you need async in a non-async context
(async () => {
  const data = await loadData();
  renderApp(data);
})();
```

### Async Error Wrapper (Avoiding Repetitive try/catch)

```js
// Utility: returns [error, data] tuple
async function to(promise) {
  try {
    const data = await promise;
    return [null, data];
  } catch (err) {
    return [err, null];
  }
}

// Usage — inspired by Go's error handling
async function loadUser(id) {
  const [err, response] = await to(fetch(`/api/users/${id}`));
  if (err) return handleError(err);

  const [parseErr, user] = await to(response.json());
  if (parseErr) return handleError(parseErr);

  return user;
}
```

### Timeout Wrapper

```js
async function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

const data = await withTimeout(fetch("/api/slow"), 5000);
```

### AbortController Integration

```js
async function fetchWithAbort(url) {
  const controller = new AbortController();

  // Auto-cancel after 10 seconds
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.json();
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("Request was cancelled");
    } else {
      throw err;
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

## Under the Hood

What happens when an `async` function hits `await`:

```js
async function example() {
  console.log("A");
  const result = await somePromise;
  console.log("B");
  return result;
}
```

Is roughly equivalent to:

```js
function example() {
  console.log("A");
  return somePromise.then(result => {
    console.log("B");
    return result;
  });
}
```

**Key insight:** Everything after `await` is scheduled as a **microtask** (just like `.then()` callbacks). The function "pauses" and the call stack unwinds — the event loop continues processing other tasks.

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`await` only works inside `async` functions** (or at module top-level in ES2022+). Using it in a regular function throws `SyntaxError`.
> 2. **`forEach` ignores `await`** — Use `for...of` for sequential, `Promise.all(arr.map(...))` for parallel.
> 3. **Forgetting `await`** — You get a Promise object instead of the value:
>    ```js
>    const data = fetch("/api"); // Missing await — data is a Promise!
>    ```
> 4. **Unhandled rejections** — If you don't `try/catch` and the Promise rejects, it becomes an unhandled rejection.
> 5. **Accidental sequential execution** — Each `await` pauses. Use `Promise.all` for independent operations.
> 6. **`return await` is usually unnecessary** — `return somePromise` and `return await somePromise` are equivalent, EXCEPT inside `try/catch` where you need `return await` to catch errors.

---

## Related Topics

- [[03 - Promises]] — The foundation `async/await` is built on
- [[02 - The Event Loop]] — How microtasks from `await` are scheduled
- [[05 - Error Handling]] — `try/catch` patterns with async code
- [[06 - Timers and Scheduling]] — `AbortController`, timeouts

---

**Navigation:**
← [[03 - Promises]] | [[05 - Error Handling]] →
