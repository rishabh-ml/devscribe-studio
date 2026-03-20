---
title: Function Composition and Functional Patterns
phase: 3
topic: Function Composition and Functional Patterns
tags: [javascript, composition, currying, partial-application, memoization, pipe, compose, functional-programming]
created: 2025-01-15
---

# Function Composition & Functional Patterns

> [!info] **Big Picture**
> Functional patterns let you build complex behavior by **assembling small, focused functions** rather than writing monolithic procedures. Composition chains functions into pipelines. Currying transforms multi-argument functions into chains of single-argument functions. Partial application "pre-fills" some arguments. Memoization caches expensive computations. These patterns are the building blocks of libraries like Lodash, Ramda, RxJS, and functional React patterns.

---

## Function Composition

**Compose** two or more functions into a single function where the output of one becomes the input of the next.

### The Core Idea

```js
// Without composition — nested calls (read inside-out)
const result = toUpperCase(trim(input));

// With composition — readable pipeline
const cleanString = compose(toUpperCase, trim);
const result = cleanString(input);
```

### `compose` — Right to Left

```js
function compose(...fns) {
  return function(value) {
    return fns.reduceRight((acc, fn) => fn(acc), value);
  };
}

// Read RIGHT to LEFT: first trim, then toUpperCase
const shout = compose(
  s => s + "!!!",
  s => s.toUpperCase(),
  s => s.trim()
);

shout("  hello  "); // "HELLO!!!"
```

### `pipe` — Left to Right (More Readable)

```js
function pipe(...fns) {
  return function(value) {
    return fns.reduce((acc, fn) => fn(acc), value);
  };
}

// Read LEFT to RIGHT: trim → uppercase → add "!!!"
const shout = pipe(
  s => s.trim(),
  s => s.toUpperCase(),
  s => s + "!!!"
);

shout("  hello  "); // "HELLO!!!"
```

> [!tip] **`pipe` vs `compose`**
> - `compose(f, g, h)(x)` = `f(g(h(x)))` — right-to-left (mathematical convention)
> - `pipe(f, g, h)(x)` = `h(g(f(x)))` — left-to-right (reading order)
> 
> Most developers prefer `pipe` because it reads in execution order.

### Real-World Pipeline

```js
const processOrder = pipe(
  validateOrder,
  calculateTax,
  applyDiscount,
  formatReceipt
);

const receipt = processOrder(rawOrder);
```

---

## Currying

**Currying** transforms a function that takes multiple arguments into a sequence of functions that each take a **single argument**.

```js
// Un-curried
function add(a, b) {
  return a + b;
}
add(2, 3); // 5

// Manually curried
function curriedAdd(a) {
  return function(b) {
    return a + b;
  };
}
curriedAdd(2)(3); // 5

// Arrow function version
const curriedAdd = a => b => a + b;
curriedAdd(2)(3); // 5
```

### Why Curry?

Currying creates **specialized functions** from general ones:

```js
const multiply = a => b => a * b;

const double = multiply(2); // specialized: always multiplies by 2
const triple = multiply(3); // specialized: always multiplies by 3

double(5);  // 10
triple(5);  // 15

// Use with array methods
[1, 2, 3, 4].map(double); // [2, 4, 6, 8]
[1, 2, 3, 4].map(triple); // [3, 6, 9, 12]
```

### Generic Curry Utility

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      // All arguments supplied — call the original function
      return fn.apply(this, args);
    }
    // Not enough arguments — return a function that waits for more
    return function(...moreArgs) {
      return curried.apply(this, [...args, ...moreArgs]);
    };
  };
}

// Usage
const add = curry((a, b, c) => a + b + c);

add(1, 2, 3);    // 6 — all at once
add(1)(2)(3);     // 6 — one at a time
add(1, 2)(3);     // 6 — mixed
add(1)(2, 3);     // 6 — mixed

// Create specialized versions
const add10 = add(10);
add10(5, 3);      // 18
```

### Currying with `pipe`

```js
const add = curry((a, b) => a + b);
const multiply = curry((a, b) => a * b);

// Build a pipeline of specialized functions
const transform = pipe(
  add(1),         // x → x + 1
  multiply(2),    // x → x * 2
  add(10)         // x → x + 10
);

transform(5); // ((5 + 1) * 2) + 10 = 22
```

---

## Partial Application

**Partial application** fixes (pre-fills) some arguments of a function, returning a new function that takes the remaining arguments. Similar to currying, but more flexible — you can fix any number of arguments at once.

### Using `Function.prototype.bind()`

```js
function greet(greeting, punctuation, name) {
  return `${greeting}, ${name}${punctuation}`;
}

// Fix the first two arguments
const enthusiasticHello = greet.bind(null, "Hello", "!");
enthusiasticHello("Alice"); // "Hello, Alice!"
enthusiasticHello("Bob");   // "Hello, Bob!"

// Fix just the first argument
const casualGreet = greet.bind(null, "Hey");
casualGreet(".", "Charlie"); // "Hey, Charlie."
```

> [!note] **`bind(null, ...)`**
> The first argument to `bind` is the `this` value. Pass `null` when you don't care about `this`.

### Custom `partial` Function

```js
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

function volume(length, width, height) {
  return length * width * height;
}

const squareColumn = partial(volume, 10, 10); // length=10, width=10
squareColumn(5);  // 500 (10 × 10 × 5)
squareColumn(20); // 2000 (10 × 10 × 20)
```

### Currying vs Partial Application

| Feature | Currying | Partial Application |
|---|---|---|
| Transforms to | Chain of **unary** (one-arg) functions | Function with **some args pre-filled** |
| How many args fixed | Always one at a time | Any number at once |
| Number of steps | Always `n` (one per original arg) | Flexible (usually 2: preset + rest) |
| Created with | `curry()` utility | `bind()` or `partial()` utility |

---

## Memoization

**Memoization** caches a function's results so that subsequent calls with the same arguments return the cached result instead of recomputing.

### Basic Memoize

```js
function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      console.log("Cache hit:", key);
      return cache.get(key);
    }

    console.log("Computing:", key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Usage
const expensiveCalc = memoize((n) => {
  // Simulate expensive computation
  let result = 0;
  for (let i = 0; i < n * 1000000; i++) result += i;
  return result;
});

expensiveCalc(100); // "Computing: [100]" — slow
expensiveCalc(100); // "Cache hit: [100]"  — instant!
expensiveCalc(50);  // "Computing: [50]"   — new input, computed
```

### Memoized Fibonacci

```js
const fib = memoize(function(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

fib(100); // 354224848179261915075 — instant!
// Without memoization, fib(100) would take longer than the age of the universe
```

### Memoize with Limited Cache Size

```js
function memoizeWithLimit(fn, maxSize = 100) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      // Move to end (most recently used)
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    }

    const result = fn.apply(this, args);

    if (cache.size >= maxSize) {
      // Delete oldest entry (first key in Map)
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    cache.set(key, result);
    return result;
  };
}
```

> [!warning] **When NOT to Memoize**
> - Functions with **side effects** (API calls, DOM mutations, logging)
> - Functions whose output depends on **external state** (time, random, global variables)
> - Functions with **many unique inputs** (cache grows unboundedly unless limited)
> - Functions that are already **fast** (memoization overhead exceeds savings)

---

## Point-Free Style

Write functions without explicitly mentioning their arguments. Made possible by composition and currying.

```js
// Normal style
const doubleAll = arr => arr.map(x => x * 2);

// Point-free style
const double = x => x * 2;
const doubleAll = arr => arr.map(double);

// More point-free with curried map
const map = curry((fn, arr) => arr.map(fn));
const doubleAll = map(double);
```

```js
// Normal
const getNames = users => users.map(user => user.name);

// Point-free
const prop = curry((key, obj) => obj[key]);
const getNames = map(prop("name"));

getNames([{ name: "Alice" }, { name: "Bob" }]); // ["Alice", "Bob"]
```

> [!note] **Point-free is a style choice**, not a requirement. Use it when it improves readability. If the point-free version is harder to understand than the explicit version, keep it explicit.

---

## Putting It All Together — Real-World Example

```js
// Utilities
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);
const curry = fn => {
  const curried = (...args) =>
    args.length >= fn.length
      ? fn(...args)
      : (...more) => curried(...args, ...more);
  return curried;
};

// Curried helpers
const filter = curry((pred, arr) => arr.filter(pred));
const map = curry((fn, arr) => arr.map(fn));
const sort = curry((compareFn, arr) => [...arr].sort(compareFn));
const take = curry((n, arr) => arr.slice(0, n));
const prop = curry((key, obj) => obj[key]);

// Domain logic
const isActive = user => user.active;
const byAge = (a, b) => a.age - b.age;

// Compose a data pipeline
const getYoungestActiveNames = pipe(
  filter(isActive),          // keep only active users
  sort(byAge),               // sort by age ascending
  take(3),                   // take first 3
  map(prop("name"))          // extract names
);

// Use it
const users = [
  { name: "Alice", age: 32, active: true },
  { name: "Bob", age: 28, active: false },
  { name: "Charlie", age: 19, active: true },
  { name: "Diana", age: 45, active: true },
  { name: "Eve", age: 23, active: true },
  { name: "Frank", age: 38, active: true },
];

getYoungestActiveNames(users);
// ["Charlie", "Eve", "Alice"]
```

---

## Pattern Summary

| Pattern | What It Does | Use When |
|---|---|---|
| `compose(f, g)` | `x → f(g(x))` | Building right-to-left pipelines |
| `pipe(f, g)` | `x → g(f(x))` | Building left-to-right pipelines |
| `curry(fn)` | `(a, b, c) → a → b → c` | Creating specialized functions |
| `partial(fn, a)` | `(a, b, c) → (b, c)` with `a` pre-filled | Fixing some arguments |
| `memoize(fn)` | Caches results by input | Expensive pure computations |
| Point-free | Omit explicit arguments | When it improves readability |

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Over-abstracting** — Don't compose/curry everything. If the composition is harder to read than plain code, keep it plain.
> 2. **Memoize key collisions** — `JSON.stringify` may produce the same key for different inputs (`{a:1}` vs `{a:1}` from different constructors). For complex objects, consider a custom key function.
> 3. **Memoize memory leaks** — Unbounded caches grow forever. Add a max size or TTL.
> 4. **`this` in curried/composed functions** — Currying and composition don't preserve `this`. Use `.bind()` or arrow functions if `this` matters.
> 5. **Debugging pipelines** — Insert a `tap` function to inspect values mid-pipeline:
>    ```js
>    const tap = label => value => { console.log(label, value); return value; };
>    
>    const pipeline = pipe(
>      filter(isActive),
>      tap("after filter"),   // logs without changing the value
>      sort(byAge),
>      tap("after sort"),
>    );
>    ```

---

## Related Topics

- [[06 - Closures]] — Currying, partial application, and memoization all use closures
- [[07 - Higher-Order Functions]] — Composition is built from HOFs
- [[08 - Recursion]] — Memoization dramatically speeds up recursive solutions
- [[06 - Array Iteration Methods]] — `map`, `filter`, `reduce` are functional primitives

---

**Navigation:**
← [[08 - Recursion]] | [[01 - Phase 3 - Overview]] | Phase 4 → [[01 - Phase 4 - Overview]]
