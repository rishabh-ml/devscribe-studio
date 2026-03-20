---
title: Error Handling
phase: 5
topic: Error Handling
tags: [javascript, errors, try-catch, throw, custom-errors, debugging, error-types]
created: 2025-01-15
---

# Error Handling

> [!info] **Big Picture**
> Errors are inevitable — network failures, bad user input, logic bugs. JavaScript provides `try/catch/finally` for handling runtime errors, a hierarchy of built-in error types, and the ability to create custom error classes. Effective error handling means catching errors at the right level, providing meaningful messages, and recovering gracefully. In async code, error handling has additional nuances with Promises and `unhandledrejection`.

---

## `try / catch / finally`

```js
try {
  // Code that might throw
  const data = JSON.parse(invalidJson);
} catch (error) {
  // Runs ONLY if try block throws
  console.error("Parse failed:", error.message);
} finally {
  // ALWAYS runs — whether or not an error occurred
  cleanup();
}
```

### Control Flow Rules

```js
function example() {
  try {
    console.log("1 — try starts");
    throw new Error("oops");
    console.log("2 — never reached");  // ← skipped
  } catch (err) {
    console.log("3 — catch:", err.message);
    return "from catch";               // return is QUEUED
  } finally {
    console.log("4 — finally ALWAYS runs");
    // If finally has a return, it OVERRIDES the catch return
  }
}
// Output: 1, 3, 4
// Returns: "from catch"
```

> [!warning] **`finally` overrides `return`**
> ```js
> function risky() {
>   try { return 1; }
>   finally { return 2; } // overrides!
> }
> risky(); // 2 — NOT 1
> ```
> Avoid returning from `finally`. Use it only for cleanup.

### Optional Catch Binding — ES2019

```js
// Don't need the error variable? Omit it.
try {
  JSON.parse(input);
} catch {          // no (error) parameter needed
  console.log("Invalid JSON");
}
```

---

## The `throw` Statement

You can throw **anything**, but always throw Error objects for stack traces.

```js
// ✅ Correct — Error with stack trace
throw new Error("Something went wrong");

// ⚠️ Works but loses stack trace
throw "something went wrong";         // string
throw 42;                             // number
throw { code: 404, msg: "Not found" }; // object
```

### Conditional Throwing

```js
function divide(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new TypeError("Arguments must be numbers");
  }
  if (b === 0) {
    throw new RangeError("Cannot divide by zero");
  }
  return a / b;
}
```

---

## Built-in Error Types

| Error Type | When It Occurs |
|---|---|
| `Error` | Generic error base class |
| `TypeError` | Wrong type, calling non-function, accessing property of `null`/`undefined` |
| `ReferenceError` | Accessing undeclared variable |
| `SyntaxError` | Invalid syntax (`JSON.parse` failures, `eval` syntax errors) |
| `RangeError` | Value outside allowed range (`new Array(-1)`, infinite recursion) |
| `URIError` | Malformed URI (`decodeURIComponent("%")`) |
| `EvalError` | Legacy — related to `eval()` (rarely seen) |
| `AggregateError` | Multiple errors (`Promise.any` when all reject) — ES2021 |

### Error Properties

```js
try {
  null.property;
} catch (err) {
  console.log(err.name);       // "TypeError"
  console.log(err.message);    // "Cannot read properties of null"
  console.log(err.stack);      // Full stack trace (non-standard but universal)
  console.log(err.cause);      // Linked cause (ES2022)
}
```

### Catching Specific Types

```js
try {
  riskyOperation();
} catch (err) {
  if (err instanceof TypeError) {
    console.error("Type problem:", err.message);
  } else if (err instanceof RangeError) {
    console.error("Range problem:", err.message);
  } else {
    throw err; // re-throw unknown errors — don't swallow them
  }
}
```

> [!tip] **Don't Swallow Errors**
> If you catch an error you can't handle, **re-throw it**. Silent failures are the hardest bugs to debug.

---

## Custom Error Classes

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

class ValidationError extends AppError {
  constructor(field, reason) {
    super(`Validation failed: ${field} — ${reason}`, 400);
    this.name = "ValidationError";
    this.field = field;
  }
}

// Usage
function getUser(id) {
  const user = db.find(id);
  if (!user) throw new NotFoundError("User");
  return user;
}

try {
  getUser(999);
} catch (err) {
  if (err instanceof NotFoundError) {
    res.status(err.statusCode).json({ error: err.message });
  }
}
```

---

## `error.cause` — ES2022

Chain errors to preserve the original cause while adding context.

```js
async function fetchUserData(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    return await res.json();
  } catch (err) {
    throw new Error(`Failed to load user ${id}`, { cause: err });
  }
}

try {
  await fetchUserData(123);
} catch (err) {
  console.log(err.message);        // "Failed to load user 123"
  console.log(err.cause);          // TypeError: Failed to fetch
  console.log(err.cause.message);  // "Failed to fetch"
}
```

> [!tip] **Use `cause` for Error Wrapping**
> Instead of losing the original error when re-throwing, pass it as `{ cause: originalError }`. This creates a linked chain of errors — invaluable for debugging.

---

## Async Error Handling

### With Promises

```js
// .catch() at the end of a chain
fetchData()
  .then(process)
  .then(save)
  .catch(err => {
    console.error("Pipeline failed:", err.message);
  });

// Per-step error handling
fetchData()
  .then(data => process(data))
  .catch(err => {
    console.warn("Process failed, using defaults");
    return defaults; // recovery — chain continues
  })
  .then(data => save(data))
  .catch(err => console.error("Save failed:", err.message));
```

### With `async/await`

```js
async function pipeline() {
  try {
    const data = await fetchData();
    const processed = await process(data);
    await save(processed);
  } catch (err) {
    console.error("Pipeline failed:", err.message);
  }
}
```

### Handling Errors for Individual Awaits

```js
async function loadDashboard() {
  // Each operation handles its own errors
  const user = await fetchUser().catch(() => defaultUser);
  const prefs = await fetchPrefs().catch(() => defaultPrefs);
  const feed = await fetchFeed().catch(() => []);

  return { user, prefs, feed };
}
```

---

## Global Error Handlers

### Browser: `window.onerror` / `error` Event

```js
// Catches uncaught synchronous errors
window.addEventListener("error", (event) => {
  console.error("Uncaught error:", event.message);
  console.error("File:", event.filename, "Line:", event.lineno);
  // event.preventDefault(); // prevents default browser error logging
});
```

### Browser: `unhandledrejection`

```js
// Catches unhandled Promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled rejection:", event.reason);
  event.preventDefault(); // prevents default warning in console
  
  // Log to error tracking service
  errorTracker.report(event.reason);
});
```

### Node.js

```js
process.on("uncaughtException", (err, origin) => {
  console.error("Uncaught:", err);
  process.exit(1); // recommended — state may be corrupt
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
});
```

> [!danger] **Global handlers are a safety net, not a strategy**
> Always handle errors locally with `try/catch` or `.catch()`. Global handlers should only log and report — not recover.

---

## Error Handling Patterns

### Guard Clauses (Fail Fast)

```js
function processPayment(amount, currency) {
  if (!amount || amount <= 0) throw new RangeError("Invalid amount");
  if (!currency) throw new TypeError("Currency required");
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    throw new ValidationError("currency", `${currency} not supported`);
  }

  // Happy path continues...
  return chargeCard(amount, currency);
}
```

### Result Pattern (Inspired by Rust)

```js
class Result {
  constructor(ok, value, error) {
    this.ok = ok;
    this.value = value;
    this.error = error;
  }
  static Ok(value) { return new Result(true, value, null); }
  static Err(error) { return new Result(false, null, error); }
}

function parseJSON(str) {
  try {
    return Result.Ok(JSON.parse(str));
  } catch (err) {
    return Result.Err(err);
  }
}

const result = parseJSON('{"valid": true}');
if (result.ok) {
  console.log(result.value); // { valid: true }
} else {
  console.error(result.error.message);
}
```

### Error Boundary (React Pattern)

```js
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    logErrorToService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

---

## Debugging Strategies

### Stack Traces

```js
function a() { b(); }
function b() { c(); }
function c() { throw new Error("deep error"); }

try { a(); } catch (err) {
  console.error(err.stack);
  // Error: deep error
  //     at c (script.js:3)
  //     at b (script.js:2)
  //     at a (script.js:1)
}
```

### `console` Methods for Debugging

```js
console.error("Error:", err);          // red in console
console.warn("Warning:", msg);         // yellow
console.trace("Call trace");           // prints stack trace without throwing
console.assert(x > 0, "x must > 0");  // logs only if assertion fails
console.table(dataArray);             // tabular display
console.group("Operation");           // group related logs
console.time("fetch");                // start timer
// ... operation ...
console.timeEnd("fetch");             // "fetch: 234ms"
```

### `debugger` Statement

```js
function suspiciousFunction(data) {
  debugger; // browser DevTools pauses here if open
  return transform(data);
}
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Swallowing errors silently** — Empty `catch {}` hides bugs:
>    ```js
>    try { riskyCode(); } catch {} // ❌ error vanishes
>    ```
> 2. **`finally` return overrides** — A `return` in `finally` overrides `try`/`catch` returns.
> 3. **Async errors escape `try/catch`** — `try/catch` doesn't catch errors from callbacks:
>    ```js
>    try {
>      setTimeout(() => { throw new Error("oops"); }, 0);
>    } catch (err) {
>      // ❌ NEVER catches — the error is in a different call stack
>    }
>    ```
> 4. **Forgetting `.catch()`** — Unhandled Promise rejections crash Node.js (v15+).
> 5. **Throwing strings** — `throw "error"` loses stack trace. Always: `throw new Error("error")`.
> 6. **`JSON.parse` can throw** — Always wrap it in `try/catch`.

---

## Related Topics

- [[03 - Promises]] — `.catch()` and rejection handling
- [[04 - Async Await]] — `try/catch` with `await`
- [[02 - The Event Loop]] — Why `try/catch` can't catch async callback errors
- [[05 - ES6 Classes]] — Custom error classes extend `Error`

---

**Navigation:**
← [[04 - Async Await]] | [[06 - Timers and Scheduling]] →
