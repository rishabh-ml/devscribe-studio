---
title: ES Version History
phase: 7
topic: ECMAScript Version History
tags: [javascript, ecmascript, ES2015, ES6, ES2016, ES2017, ES2018, ES2019, TC39, proposals]
created: 2025-01-15
---

# ECMAScript Version History

> [!info] **Big Picture**
> ECMAScript (ES) is the specification behind JavaScript. Starting with ES2015 (ES6) — the biggest update in JavaScript's history — the language receives annual updates every June. Understanding the timeline helps you know which features are available in which environments and what's coming next.

---

## The TC39 Process

All new features go through a 4-stage proposal process before becoming part of the standard.

| Stage | Name | Meaning |
|-------|------|---------|
| **Stage 0** | Strawperson | Just an idea — anyone can submit |
| **Stage 1** | Proposal | TC39 agrees it's worth investigating. Champion(s) assigned |
| **Stage 2** | Draft | Formal spec language drafted. Likely to be included |
| **Stage 2.7** | Testing | Spec text complete, needs Test262 tests and 2+ implementations |
| **Stage 3** | Candidate | Spec finalized, awaiting implementations and real-world feedback |
| **Stage 4** | Finished | Included in the next annual release. At least 2 native implementations |

> [!tip] **Practical Rule**
> Stage 3+ features are generally safe to use (most browsers/engines implement them). Stage 2 features may still change. Don't rely on Stage 0–1 in production.

---

## ES2015 (ES6) — The Big Bang

The largest single update. Transformed JavaScript from a "scripting language" to a modern programming language.

| Feature | Notes |
|---------|-------|
| `let` / `const` | Block-scoped declarations |
| Arrow functions `=>` | Lexical `this`, concise syntax |
| Template literals | Backtick strings with `${}` interpolation |
| Destructuring | `const { a, b } = obj;` and `const [x, y] = arr;` |
| Default parameters | `function f(x = 10) {}` |
| Rest / Spread | `...args` in params; `[...arr]` for spread |
| Classes | `class`, `extends`, `super`, `constructor` |
| Modules | `import` / `export` (ESM) |
| Promises | `new Promise()`, `.then()`, `.catch()` |
| Symbols | `Symbol()`, well-known symbols |
| Iterators | `Symbol.iterator`, `for...of` loop |
| Generators | `function*`, `yield` |
| `Map` / `Set` | New collection types |
| `WeakMap` / `WeakSet` | Weakly-held collection types |
| `Proxy` / `Reflect` | Meta-programming |
| `for...of` | Iterate any iterable |
| `Array.from()`, `Array.of()` | New Array static methods |
| `.find()`, `.findIndex()` | Array search methods |
| `.includes()` (String) | `"hello".includes("ell")` |
| `Object.assign()` | Shallow merge |
| `Number.isFinite()`, `.isNaN()`, `.isInteger()`, `.isSafeInteger()` | Number checks |
| `Number.EPSILON`, `MAX_SAFE_INTEGER`, `MIN_SAFE_INTEGER` | Constants |
| Binary / Octal literals | `0b1010`, `0o755` |
| Computed property names | `{ [expr]: value }` |
| Shorthand properties / methods | `{ x, y, method() {} }` |
| `String.raw` | Tagged template for raw strings |
| `.startsWith()`, `.endsWith()`, `.repeat()` | String methods |
| Tail call optimization | (Spec'd but only Safari implements) |

---

## ES2016 (ES7)

The smallest update — only 2 features.

| Feature | Example |
|---------|---------|
| `Array.prototype.includes()` | `[1, 2, 3].includes(2)` → `true` |
| Exponentiation operator `**` | `2 ** 10` → `1024` |

---

## ES2017 (ES8)

| Feature | Example / Notes |
|---------|-----------------|
| `async` / `await` | `async function f() { await promise; }` |
| `Object.values()` | `Object.values({ a: 1, b: 2 })` → `[1, 2]` |
| `Object.entries()` | `Object.entries({ a: 1 })` → `[["a", 1]]` |
| `Object.getOwnPropertyDescriptors()` | For correct copying with getters/setters |
| `String.prototype.padStart()` / `padEnd()` | `"5".padStart(3, "0")` → `"005"` |
| Trailing commas in function params | `function f(a, b,) {}` |
| Shared memory (`SharedArrayBuffer`) | For web workers communication |
| `Atomics` | Atomic operations on shared memory |

---

## ES2018 (ES9)

| Feature | Example / Notes |
|---------|-----------------|
| Async iteration | `for await (const x of asyncIterable) {}` |
| Rest/Spread for objects | `const { a, ...rest } = obj;` / `{ ...obj, b: 2 }` |
| `Promise.prototype.finally()` | `.finally(() => cleanup())` |
| Named capture groups | `(?<year>\d{4})` |
| RegExp lookbehind assertions | `(?<=\$)\d+` |
| RegExp `s` (dotAll) flag | `.` matches newlines |
| RegExp Unicode property escapes | `\p{Script=Greek}` |

---

## ES2019 (ES10)

| Feature | Example / Notes |
|---------|-----------------|
| `Array.prototype.flat()` | `[1, [2, [3]]].flat(2)` → `[1, 2, 3]` |
| `Array.prototype.flatMap()` | Map + flatten in one step |
| `Object.fromEntries()` | `Object.fromEntries([["a", 1]])` → `{ a: 1 }` |
| `String.prototype.trimStart()` / `trimEnd()` | Directional trim |
| Optional `catch` binding | `try {} catch {}` (no `(err)` needed) |
| `Symbol.prototype.description` | `Symbol("foo").description` → `"foo"` |
| Stable `Array.prototype.sort()` | Guaranteed stable sort (was impl-dependent) |
| `Function.prototype.toString()` | Returns exact source text |
| Well-formed `JSON.stringify()` | Handles lone surrogates |

---

## ES2020 (ES11)

| Feature | Notes |
|---------|-------|
| Optional chaining `?.` | `obj?.prop?.method?.()` |
| Nullish coalescing `??` | `value ?? fallback` |
| `BigInt` | `123n`, arbitrary precision |
| `Promise.allSettled()` | Waits for all, no short-circuit |
| `globalThis` | Universal global reference |
| `String.prototype.matchAll()` | All regex matches with groups |
| Dynamic `import()` | Lazy loading modules |
| `export * as ns from "mod"` | Namespace re-export |
| `import.meta` | Module metadata |
| `for...in` order | Guaranteed enumeration order |

---

## ES2021 (ES12)

| Feature | Notes |
|---------|-------|
| `String.prototype.replaceAll()` | Replace without `/g` regex |
| `Promise.any()` + `AggregateError` | First fulfilled promise |
| Logical assignment `\|\|=`, `&&=`, `??=` | Shorthand assign |
| Numeric separators `_` | `1_000_000` |
| `WeakRef` | Weak object reference |
| `FinalizationRegistry` | GC notification callback |

---

## ES2022 (ES13)

| Feature | Notes |
|---------|-------|
| Top-level `await` | `await` in module scope |
| Class fields (public + private `#`) | `#privateField` |
| Private methods and accessors | `#privateMethod() {}` |
| Static class features | `static #field`, `static {}` block |
| `in` for private fields | `#field in obj` |
| `Array.at()` / `String.at()` | Negative indexing `.at(-1)` |
| `Object.hasOwn()` | Safe `hasOwnProperty` |
| `error.cause` | `new Error("msg", { cause })` |
| RegExp `/d` flag | Match indices |
| `structuredClone()` | Deep clone |

---

## ES2023 (ES14)

| Feature | Notes |
|---------|-------|
| `findLast()` / `findLastIndex()` | Search from end |
| `toSorted()` | Immutable sort |
| `toReversed()` | Immutable reverse |
| `toSpliced()` | Immutable splice |
| `Array.with()` | Immutable index set |
| Symbols as `WeakMap` keys | Non-registered symbols |
| Hashbang `#!` | Shebang support |

---

## ES2024 (ES15)

| Feature | Notes |
|---------|-------|
| `Object.groupBy()` / `Map.groupBy()` | Group by callback |
| `Promise.withResolvers()` | Extract resolve/reject |
| `String.isWellFormed()` / `toWellFormed()` | Handle lone surrogates |
| `ArrayBuffer.transfer()` | Zero-copy transfer |
| Resizable `ArrayBuffer` | `.resize()`, `.maxByteLength` |
| `Atomics.waitAsync()` | Non-blocking wait |
| RegExp `v` flag (Unicode Sets) | Set operations in char classes |

---

## ES2025 (ES16)

| Feature | Notes |
|---------|-------|
| Iterator Helpers | `.map()`, `.filter()`, `.take()`, `.drop()`, etc. |
| `Iterator.from()` | Wrap any iterable → iterator with helpers |
| New Set methods | `.union()`, `.intersection()`, `.difference()`, etc. |
| Import attributes | `import x from "y" with { type: "json" }` |
| `RegExp.escape()` | Escape string for regex |
| `Promise.try()` | Sync-safe promise start |
| Pattern modifiers | `(?i:...)` inline flags |
| Duplicate named capture groups | Same name across alternations |
| `Float16Array` / `Math.f16round()` | Half-precision float |
| Explicit resource management | `using` / `await using` / `Symbol.dispose` |
| `DisposableStack` / `AsyncDisposableStack` | Manage multiple disposables |

---

## Proposals to Watch (Stage 2–3)

> [!note] **These are NOT finalized yet** — APIs may change.

| Proposal | Stage | Description |
|----------|-------|-------------|
| **Temporal** | Stage 3 | Modern date/time API replacing `Date` — `Temporal.PlainDate`, `PlainTime`, `ZonedDateTime`, etc. |
| **Decorators** | Stage 3 | `@decorator` syntax for classes — `@logged`, `@memoize`, etc. |
| **JSON Modules** | Stage 3 | `import data from "./data.json" with { type: "json" }` (now part of Import Attributes) |
| **Pattern Matching** | Stage 2 | `match (value) { when ... }` — Powerful switching |
| **Signals** | Stage 1 | Reactive primitives for state management |
| **Record & Tuple** | Withdrawn | Immutable `#[1, 2, 3]` and `#{ a: 1 }` — withdrawn due to complexity |
| **Pipeline Operator** | Stage 2 | `value |> fn1 |> fn2` — function chaining |
| **`do` Expressions** | Stage 1 | `const x = do { if (cond) "a"; else "b"; }` |
| **Throw Expressions** | Stage 2 | `const x = val ?? throw new Error()` |

---

## Browser Support Strategy

```js
// Check feature availability at runtime
if (typeof globalThis.structuredClone === "function") {
  // Use native structuredClone
} else {
  // Polyfill or fallback
}

// Common tools for compatibility:
// - Babel — transpile modern syntax to older JS
// - core-js — polyfill library
// - @babel/preset-env — target specific browsers
// - Browserslist — define browser targets
// - caniuse.com — check feature support
```

> [!tip] **Practical Advice**
> 1. **Use `browserslist` queries** in your build config to automatically target the right ES version.
> 2. **Check caniuse.com** and **MDN compatibility tables** before using new features without transpilation.
> 3. **Features in this roadmap (Phases 1–9) use ES2020+ freely** — all modern browsers and Node 18+ support them.
> 4. **ES2025 features** may need transpilation via Babel in early 2025.

---

## Related Topics

- [[06 - Modern ES Features]] — Detailed coverage of ES2020–ES2025 features with examples
- [[02 - ES Modules]] — Module system evolution
- [[05 - Iterators and Generators]] — ES2025 Iterator Helpers
- [[03 - Maps Sets and WeakVariants]] — ES2025 Set Methods

---

**Navigation:**
← [[06 - Modern ES Features]] | [[01 - Phase 8 - Overview]] →
