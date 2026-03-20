---
title: Modern ES Features
phase: 7
topic: Modern ES Features (ES2020–ES2025)
tags: [javascript, ES2020, ES2021, ES2022, ES2023, ES2024, ES2025, modern-javascript]
created: 2025-01-15
---

# Modern ES Features (ES2020–ES2025)

> [!info] **Big Picture**
> JavaScript evolves annually through the TC39 proposals process. This note covers the most impactful features from ES2020 through ES2025, organized by the problem they solve. Earlier features (ES2015–ES2019) are covered in [[07 - ES Version History]]. Many of these features have already been discussed in their topic-specific notes — this note consolidates and fills gaps.

---

## ES2020 (ES11)

### Optional Chaining (`?.`)

Safely access nested properties without checking each level.

```js
const user = { address: { street: "Main St" } };

// Without optional chaining
const zip = user && user.address && user.address.zip;

// With optional chaining
const zip = user?.address?.zip; // undefined (no error)

// Works with methods and bracket notation
user?.getAddress?.();        // method call
user?.address?.["zip-code"]; // bracket access

// Works with arrays
const first = arr?.[0];
```

### Nullish Coalescing (`??`)

Only falls back if left side is `null` or `undefined` — unlike `||` which also catches `0`, `""`, `false`.

```js
const count = 0;

count || 10;  // 10 — wrong! 0 is falsy
count ?? 10;  // 0  — correct! 0 is not nullish

const name = "";
name || "Anonymous";  // "Anonymous" — wrong!
name ?? "Anonymous";  // ""           — correct!

// Assignment version (ES2021)
let config = null;
config ??= { debug: false }; // assigns only if null/undefined
```

### `BigInt`

Arbitrary-precision integers for values beyond `Number.MAX_SAFE_INTEGER`.

```js
const big = 9007199254740993n; // suffix with 'n'
const also = BigInt("9007199254740993");

big + 1n;  // 9007199254740994n
big * 2n;  // 18014399481481986n

// Cannot mix BigInt and Number
// big + 1; // TypeError!
big + BigInt(1); // OK

typeof 42n; // "bigint"
```

### `Promise.allSettled()`

Waits for ALL promises to settle (resolve or reject), unlike `Promise.all` which short-circuits on first rejection.

```js
const results = await Promise.allSettled([
  fetch("/api/users"),
  fetch("/api/posts"),
  fetch("/api/broken")
]);

// [
//   { status: "fulfilled", value: Response },
//   { status: "fulfilled", value: Response },
//   { status: "rejected", reason: Error }
// ]

const successful = results
  .filter(r => r.status === "fulfilled")
  .map(r => r.value);
```

### `globalThis`

Universal reference to the global object across all environments.

```js
// Before: window (browser), global (Node), self (worker)
// Now:
globalThis.setTimeout === window.setTimeout; // true in browser
```

### `String.prototype.matchAll()`

Returns all regex matches with capture groups — no more `while` loops.

```js
const text = "test1foo test2bar";
const regex = /test(\d)(\w+)/g;

for (const match of text.matchAll(regex)) {
  console.log(match[0]); // "test1foo", "test2bar"
  console.log(match[1]); // "1", "2"
  console.log(match[2]); // "foo", "bar"
}
```

### Dynamic `import()`

See also: [[ES Modules#Dynamic Imports]]

```js
const module = await import("./utils.js");
module.doSomething();
```

---

## ES2021 (ES12)

### Logical Assignment Operators

```js
// ||=  assigns if falsy
x ||= defaultValue; // x = x || defaultValue

// &&=  assigns if truthy
x &&= newValue;     // x = x && newValue

// ??=  assigns if nullish (null or undefined)
x ??= fallback;     // x = x ?? fallback
```

### `String.prototype.replaceAll()`

```js
"aabbcc".replaceAll("b", "x"); // "aaxxcc"

// Before ES2021, needed regex with /g flag
"aabbcc".replace(/b/g, "x");   // "aaxxcc"
```

### Numeric Separators

```js
const million = 1_000_000;        // 1000000
const bytes = 0xFF_FF_FF;         // 16777215
const binary = 0b1010_0001;      // 161
const bigNum = 1_000_000_000n;   // BigInt
```

### `Promise.any()`

Resolves with the first fulfilled promise. Only rejects if ALL promises reject.

```js
const fastest = await Promise.any([
  fetch("https://cdn1.example.com/data"),
  fetch("https://cdn2.example.com/data"),
  fetch("https://cdn3.example.com/data")
]);
// Uses whichever CDN responds first

// All reject → AggregateError
try {
  await Promise.any([
    Promise.reject("a"),
    Promise.reject("b")
  ]);
} catch (err) {
  err instanceof AggregateError; // true
  err.errors; // ["a", "b"]
}
```

### `WeakRef` and `FinalizationRegistry`

```js
// WeakRef — hold a weak reference to an object
let target = { data: "important" };
const weakRef = new WeakRef(target);

weakRef.deref(); // { data: "important" } or undefined (if GC'd)
target = null;   // now the object CAN be garbage collected

// FinalizationRegistry — callback when object is GC'd
const registry = new FinalizationRegistry(heldValue => {
  console.log(`${heldValue} was garbage collected`);
});

registry.register(someObject, "my-object-label");
```

> [!warning] These are advanced features primarily for cache/library implementations. See [[05 - WeakRef and FinalizationRegistry]] for details.

---

## ES2022 (ES13)

### Top-Level `await`

Use `await` at the module top level — no async wrapper needed.

```js
// config.js (ES module)
const response = await fetch("/api/config");
export const config = await response.json();
```

### Class Enhancements

```js
class User {
  // Public field declarations
  name = "Anonymous";

  // Private fields (# prefix)
  #password;

  // Private methods
  #validate() {
    return this.#password.length >= 8;
  }

  // Static fields + private static
  static #count = 0;
  static getCount() {
    return User.#count;
  }

  // Static initialization block
  static {
    // Complex static initialization
    console.log("User class initialized");
    User.#count = 0;
  }

  constructor(name, password) {
    this.name = name;
    this.#password = password;
    User.#count++;
  }
}

// Private field check with 'in'
function hasPassword(obj) {
  return #password in obj;
}
```

### `error.cause`

Chain errors with root cause context.

```js
try {
  await fetch("/api/data");
} catch (err) {
  throw new Error("Data fetch failed", { cause: err });
}

// Later in error handler:
catch (err) {
  console.log(err.message);       // "Data fetch failed"
  console.log(err.cause.message); // Original fetch error
}
```

### `Array.at()` and `String.at()`

Negative indexing!

```js
const arr = [1, 2, 3, 4, 5];
arr.at(0);   // 1
arr.at(-1);  // 5  (last element)
arr.at(-2);  // 4

"hello".at(-1); // "o"
```

### `Object.hasOwn()`

Better than `obj.hasOwnProperty()` — works on null-prototype objects.

```js
const obj = Object.create(null); // no prototype
obj.key = "value";

// obj.hasOwnProperty("key"); // TypeError! No prototype
Object.hasOwn(obj, "key");     // true — always works
```

### `structuredClone()`

Deep clone objects, including nested objects, arrays, Maps, Sets, Dates, RegExps.

```js
const original = {
  name: "Alice",
  scores: [100, 95],
  date: new Date(),
  map: new Map([["key", "value"]])
};

const clone = structuredClone(original);
clone.scores.push(90);
original.scores; // [100, 95] — unaffected

// Limitations: cannot clone functions, DOM nodes, symbols
```

---

## ES2023 (ES14)

### Array Find From Last

Search from the end of an array.

```js
const arr = [1, 2, 3, 4, 5, 4, 3];

arr.findLast(n => n > 3);       // 4  (second occurrence)
arr.findLastIndex(n => n > 3);  // 5  (index of second 4)
```

### Immutable Array Methods (Change By Copy)

New methods that return a new array instead of mutating.

```js
const arr = [3, 1, 4, 1, 5];

// Sorting — returns new array
arr.toSorted();             // [1, 1, 3, 4, 5]
arr;                        // [3, 1, 4, 1, 5] — unchanged!

// Reversing — returns new array
arr.toReversed();           // [5, 1, 4, 1, 3]

// Splicing — returns new array
arr.toSpliced(1, 2, 99);   // [3, 99, 1, 5]

// Setting by index — returns new array
arr.with(0, 100);           // [100, 1, 4, 1, 5]
```

| Mutating      | Non-Mutating (ES2023) |
|---------------|----------------------|
| `sort()`      | `toSorted()`         |
| `reverse()`   | `toReversed()`       |
| `splice()`    | `toSpliced()`        |
| `arr[i] = v`  | `with(i, v)`         |

### WeakMap Supports Symbols as Keys

```js
const wm = new WeakMap();
const sym = Symbol("key");
wm.set(sym, "value");
wm.get(sym); // "value"
```

### Hashbang / Shebang Support

```js
#!/usr/bin/env node
console.log("Hello from CLI!");
```

---

## ES2024 (ES15)

### `Object.groupBy()` and `Map.groupBy()`

Group array elements by a key function.

```js
const people = [
  { name: "Alice", role: "dev" },
  { name: "Bob", role: "design" },
  { name: "Charlie", role: "dev" }
];

// Returns a null-prototype object
const byRole = Object.groupBy(people, p => p.role);
byRole.dev;    // [{ name: "Alice"... }, { name: "Charlie"... }]
byRole.design; // [{ name: "Bob"... }]

// Returns a Map (useful for non-string keys)
const byLength = Map.groupBy(people, p => p.name.length);
byLength.get(3); // [{ name: "Bob"... }]
```

### `Promise.withResolvers()`

Extract `resolve` and `reject` from a Promise without the executor pattern.

```js
// Before
let resolve, reject;
const promise = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});

// After
const { promise, resolve, reject } = Promise.withResolvers();

// Useful for event-to-promise conversion
function waitForClick(element) {
  const { promise, resolve } = Promise.withResolvers();
  element.addEventListener("click", resolve, { once: true });
  return promise;
}
```

### `String.isWellFormed()` and `String.toWellFormed()`

Handle lone surrogates in strings (important for `encodeURIComponent`).

```js
const bad = "hello\uD800world"; // lone surrogate

bad.isWellFormed();   // false
bad.toWellFormed();   // "hello�world" (replaces with U+FFFD)

// Use case: avoid URIError
if (str.isWellFormed()) {
  encodeURIComponent(str); // safe
}
```

### `ArrayBuffer.transfer()` and Resizable `ArrayBuffer`

```js
// Transfer ownership (zero-copy)
const buf = new ArrayBuffer(8);
const newBuf = buf.transfer();
buf.byteLength;     // 0 (detached)
newBuf.byteLength;  // 8

// Resizable buffer
const resizable = new ArrayBuffer(8, { maxByteLength: 64 });
resizable.resize(16);
resizable.byteLength; // 16
```

### `Atomics.waitAsync()`

Non-blocking version of `Atomics.wait()` — usable in the main thread.

```js
const sab = new SharedArrayBuffer(4);
const int32 = new Int32Array(sab);

const result = Atomics.waitAsync(int32, 0, 0);
result.value.then(() => {
  console.log("Value changed!");
});
```

### RegExp `v` Flag (Unicode Sets)

```js
// Set operations in character classes
const emoji = /[\p{Emoji}--\p{ASCII}]/v; // Emoji minus ASCII
const greek = /[\p{Script=Greek}&&\p{Letter}]/v; // Greek AND Letter

// String properties
const family = /\p{RGI_Emoji_Tag_Sequence}/v;
```

---

## ES2025 (ES16)

### Iterator Helpers

Lazy, chainable operations on iterators. See [[Iterators and Generators#ES2025 Iterator Helpers]]

```js
const evens = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  .values()
  .filter(n => n % 2 === 0)
  .map(n => n * 10)
  .toArray(); // [20, 40, 60, 80, 100]
```

### New Set Methods

Complete set operations. See [[Maps Sets and WeakVariants#ES2025 Set Methods]]

```js
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

a.union(b);              // Set {1, 2, 3, 4}
a.intersection(b);       // Set {2, 3}
a.difference(b);         // Set {1}
a.symmetricDifference(b); // Set {1, 4}
a.isSubsetOf(b);         // false
a.isSupersetOf(b);       // false
a.isDisjointFrom(b);     // false
```

### Import Attributes

```js
import data from "./config.json" with { type: "json" };
import styles from "./app.css" with { type: "css" };
```

### `RegExp.escape()`

Safely escape strings for use in regular expressions.

```js
const userInput = "price: $10.00 (USD)";
const escaped = RegExp.escape(userInput);
// "price\\:\\ \\$10\\.00\\ \\(USD\\)"

new RegExp(escaped).test(userInput); // true
```

### `Promise.try()`

Start a promise chain synchronously-safely. Catches both sync and async errors.

```js
// Before — sync errors in fn slip through
Promise.resolve().then(() => fn());

// After — always returns a Promise, catching sync throws too
Promise.try(() => {
  if (badInput) throw new Error("bad"); // sync throw
  return fetch("/api/data");            // async
});
```

### Pattern Modifiers (Inline Flags)

```js
// Enable/disable flags within parts of a regex
/(?i:hello) world/; // case-insensitive for "hello" only
```

### Duplicate Named Capture Groups

```js
// Different branches can share the same group name
const dateRegex = /(?<year>\d{4})-(?<month>\d{2})|(?<month>\d{2})\/(?<year>\d{4})/;

"2024-03".match(dateRegex).groups;  // { year: "2024", month: "03" }
"03/2024".match(dateRegex).groups;  // { year: "2024", month: "03" }
```

### `Float16Array` and `Math.f16round()`

Half-precision (16-bit) floating point for WebGL, machine learning.

```js
const f16 = new Float16Array([1.5, 2.5, 3.5]);
Math.f16round(1.337); // 1.3369140625
```

### Explicit Resource Management (`using` / `await using`)

Automatic cleanup via `Symbol.dispose` / `Symbol.asyncDispose`.

```js
// Define disposable resources
class DatabaseConnection {
  [Symbol.dispose]() {
    this.close();
    console.log("Connection closed");
  }
}

// 'using' auto-disposes at end of block
{
  using conn = new DatabaseConnection();
  using reader = conn.query("SELECT * FROM users");
  // ... use resources
} // conn.close() and reader.close() called automatically!

// Async version
{
  await using file = await openFile("data.txt");
  // file automatically closed at end of block
}
```

### `DisposableStack` and `AsyncDisposableStack`

```js
{
  using stack = new DisposableStack();
  const conn = stack.use(getConnection());
  const reader = stack.use(getReader(conn));
  stack.defer(() => console.log("Cleanup complete"));
  // All disposed in reverse order at end of block
}
```

---

## Quick Reference: Feature Lookup

| Feature | Version | Category |
|---------|---------|----------|
| `?.` optional chaining | ES2020 | Syntax |
| `??` nullish coalescing | ES2020 | Syntax |
| `BigInt` | ES2020 | Type |
| `Promise.allSettled()` | ES2020 | Async |
| `globalThis` | ES2020 | Global |
| `matchAll()` | ES2020 | String |
| Dynamic `import()` | ES2020 | Modules |
| `||=`, `&&=`, `??=` | ES2021 | Syntax |
| `replaceAll()` | ES2021 | String |
| Numeric separators | ES2021 | Syntax |
| `Promise.any()` | ES2021 | Async |
| `WeakRef` | ES2021 | Memory |
| Top-level `await` | ES2022 | Async |
| Private fields `#` | ES2022 | Classes |
| `error.cause` | ES2022 | Error |
| `.at()` | ES2022 | Array/String |
| `Object.hasOwn()` | ES2022 | Object |
| `structuredClone()` | ES2022 | Utility |
| `findLast()` / `findLastIndex()` | ES2023 | Array |
| `toSorted()` / `toReversed()` / `toSpliced()` / `with()` | ES2023 | Array |
| `Object.groupBy()` / `Map.groupBy()` | ES2024 | Object/Map |
| `Promise.withResolvers()` | ES2024 | Async |
| `isWellFormed()` / `toWellFormed()` | ES2024 | String |
| RegExp `v` flag | ES2024 | RegExp |
| Iterator Helpers | ES2025 | Iterators |
| Set methods | ES2025 | Set |
| Import attributes | ES2025 | Modules |
| `RegExp.escape()` | ES2025 | RegExp |
| `Promise.try()` | ES2025 | Async |
| `using` / `Symbol.dispose` | ES2025 | Resource |
| `Float16Array` | ES2025 | TypedArray |

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`??` vs `||`** — `??` only checks `null`/`undefined`. Use `||` when you want to catch all falsy values.
> 2. **Cannot mix `??` with `||`/`&&` without parentheses** — `a ?? b || c` is a SyntaxError. Write `(a ?? b) || c`.
> 3. **`structuredClone` can't clone functions** — It throws on functions, Symbols, and DOM nodes.
> 4. **Private fields are truly private** — No reflection, no `Object.keys()`, no JSON.stringify access.
> 5. **`using` requires transpilation** — As of early 2025, not all runtimes support it natively yet.

---

## Related Topics

- [[07 - ES Version History]] — Full chronological feature list ES2015–ES2025
- [[05 - Iterators and Generators]] — Iterator Helpers deep dive
- [[03 - Maps Sets and WeakVariants]] — Set methods and groupBy
- [[02 - ES Modules]] — Import attributes
- [[03 - Promises]] — `Promise.withResolvers()` and `Promise.try()`

---

**Navigation:**
← [[05 - Iterators and Generators]] | [[07 - ES Version History]] →
