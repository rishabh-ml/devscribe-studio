---
title: Iterators and Generators
phase: 7
topic: Iterators and Generators
tags: [javascript, iterators, generators, yield, iterable-protocol, async-generators, lazy-evaluation]
created: 2025-01-15
---

# Iterators and Generators

> [!info] **Big Picture**
> The **iterable protocol** is how JavaScript enables `for...of`, spread syntax, destructuring, and `Promise.all` to work on any collection — arrays, strings, Maps, Sets, and your own custom objects. **Generators** (`function*`) make creating iterators trivially easy and enable **lazy evaluation** — computing values on demand instead of all at once. Combined with ES2025 Iterator Helpers, this is a powerful paradigm for data processing.

---

## The Iterable Protocol

An object is **iterable** if it has a `[Symbol.iterator]()` method that returns an **iterator**.

An **iterator** is an object with a `next()` method that returns `{ value, done }`.

```js
// Built-in iterables: Array, String, Map, Set, NodeList, arguments

const arr = [10, 20, 30];
const iterator = arr[Symbol.iterator]();

iterator.next(); // { value: 10, done: false }
iterator.next(); // { value: 20, done: false }
iterator.next(); // { value: 30, done: false }
iterator.next(); // { value: undefined, done: true }
```

### What Uses the Iterable Protocol?

```js
// for...of
for (const item of iterable) { ... }

// Spread
const arr = [...iterable];

// Destructuring
const [a, b, c] = iterable;

// Array.from
Array.from(iterable);

// Promise.all / Promise.race
Promise.all(iterable);

// Map, Set constructors
new Map(iterable);
new Set(iterable);

// yield*
yield* iterable;
```

---

## Custom Iterables

```js
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;

    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
};

for (const n of range) console.log(n); // 1 2 3 4 5
console.log([...range]);               // [1, 2, 3, 4, 5]
```

### Class-Based Iterable

```js
class LinkedList {
  #head = null;

  add(value) {
    this.#head = { value, next: this.#head };
  }

  [Symbol.iterator]() {
    let current = this.#head;
    return {
      next() {
        if (current) {
          const value = current.value;
          current = current.next;
          return { value, done: false };
        }
        return { done: true };
      }
    };
  }
}

const list = new LinkedList();
list.add(3); list.add(2); list.add(1);

for (const val of list) console.log(val); // 1, 2, 3
```

---

## Generator Functions

Generators simplify creating iterators. The `function*` syntax plus `yield` handles all the protocol boilerplate.

```js
function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = numberGenerator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }

// Generators are iterable
for (const n of numberGenerator()) {
  console.log(n); // 1, 2, 3
}

[...numberGenerator()]; // [1, 2, 3]
```

### How `yield` Works

```js
function* demo() {
  console.log("before first yield");
  yield "A";
  console.log("after first yield");
  yield "B";
  console.log("after second yield");
  return "C"; // return value is only in final next() call
}

const g = demo();
g.next(); // logs "before first yield" → { value: "A", done: false }
g.next(); // logs "after first yield" → { value: "B", done: false }
g.next(); // logs "after second yield" → { value: "C", done: true }
// Note: "C" from return is NOT included in for...of
```

### Range Generator (Replaces Custom Iterator)

```js
function* range(from, to, step = 1) {
  for (let i = from; i <= to; i += step) {
    yield i;
  }
}

[...range(1, 10)];     // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
[...range(0, 20, 5)];  // [0, 5, 10, 15, 20]
```

### Infinite Generators (Lazy)

```js
function* naturals() {
  let n = 1;
  while (true) {
    yield n++;
  }
}

// Take first 5 — only 5 values are computed
function take(gen, count) {
  const result = [];
  for (const val of gen) {
    result.push(val);
    if (result.length >= count) break;
  }
  return result;
}

take(naturals(), 5); // [1, 2, 3, 4, 5]

// Fibonacci
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

take(fibonacci(), 8); // [0, 1, 1, 2, 3, 5, 8, 13]
```

---

## `yield*` — Delegation

Delegate to another generator or iterable.

```js
function* inner() {
  yield "a";
  yield "b";
}

function* outer() {
  yield 1;
  yield* inner(); // delegate to inner generator
  yield 2;
}

[...outer()]; // [1, "a", "b", 2]

// Works with any iterable
function* withArray() {
  yield* [10, 20, 30];
}

[...withArray()]; // [10, 20, 30]
```

### Recursive Tree Traversal

```js
function* traverse(tree) {
  yield tree.value;
  if (tree.children) {
    for (const child of tree.children) {
      yield* traverse(child); // recursive delegation
    }
  }
}

const tree = {
  value: 1,
  children: [
    { value: 2, children: [{ value: 4 }, { value: 5 }] },
    { value: 3 }
  ]
};

[...traverse(tree)]; // [1, 2, 4, 5, 3]
```

---

## Sending Values INTO Generators

`next(value)` sends a value back into the generator — it becomes the result of the `yield` expression.

```js
function* conversation() {
  const name = yield "What is your name?";
  const age = yield `Hello ${name}! How old are you?`;
  return `${name} is ${age} years old.`;
}

const chat = conversation();
chat.next();          // { value: "What is your name?", done: false }
chat.next("Alice");   // { value: "Hello Alice! How old are you?", done: false }
chat.next(30);        // { value: "Alice is 30 years old.", done: true }
```

### `generator.throw()` and `generator.return()`

```js
function* gen() {
  try {
    const val = yield "hello";
  } catch (err) {
    console.log("Caught:", err.message);
  }
}

const g = gen();
g.next();                       // { value: "hello", done: false }
g.throw(new Error("oops"));    // logs "Caught: oops"

// Force completion
const g2 = gen();
g2.next();
g2.return("done");              // { value: "done", done: true }
```

---

## Async Generators

Combine generators with async operations — yield Promises.

```js
async function* fetchPages(baseUrl) {
  let page = 1;
  while (true) {
    const res = await fetch(`${baseUrl}?page=${page}`);
    const data = await res.json();
    if (data.length === 0) return; // no more data
    yield data;
    page++;
  }
}

// Consume with for await...of
for await (const pageData of fetchPages("/api/users")) {
  renderUsers(pageData);
  // Fetches lazily — next page only loads when current one is consumed
}
```

### Async Iterable Protocol

```js
const asyncIterable = {
  async *[Symbol.asyncIterator]() {
    yield 1;
    await new Promise(r => setTimeout(r, 100));
    yield 2;
    await new Promise(r => setTimeout(r, 100));
    yield 3;
  }
};

for await (const val of asyncIterable) {
  console.log(val); // 1, 2, 3 (with delays)
}
```

---

## ES2025: Iterator Helpers

Lazy, chainable methods on iterators — no intermediate arrays.

```js
function* naturals() {
  let n = 1;
  while (true) yield n++;
}

// Chain operations lazily
const result = naturals()
  .filter(n => n % 2 === 0)   // even numbers
  .map(n => n ** 2)            // squared
  .take(5)                     // first 5
  .toArray();                  // materialize

// [4, 16, 36, 64, 100]
// Only 10 numbers were generated (not infinite!)

// Available methods:
// .map(fn), .filter(fn), .take(n), .drop(n),
// .flatMap(fn), .reduce(fn, init), .toArray(),
// .forEach(fn), .some(fn), .every(fn), .find(fn)

// Iterator.from() — convert any iterable to an iterator with helpers
const iter = Iterator.from([1, 2, 3, 4, 5]);
iter.filter(n => n > 2).toArray(); // [3, 4, 5]
```

---

## Real-World Patterns

### ID Generator

```js
function* idGenerator(prefix = "id") {
  let id = 0;
  while (true) {
    yield `${prefix}_${++id}`;
  }
}

const nextId = idGenerator("user");
nextId.next().value; // "user_1"
nextId.next().value; // "user_2"
```

### Chunking Data

```js
function* chunk(arr, size) {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size);
  }
}

[...chunk([1, 2, 3, 4, 5, 6, 7], 3)];
// [[1, 2, 3], [4, 5, 6], [7]]
```

### State Machine

```js
function* trafficLight() {
  while (true) {
    yield "green";
    yield "yellow";
    yield "red";
  }
}

const light = trafficLight();
light.next().value; // "green"
light.next().value; // "yellow"
light.next().value; // "red"
light.next().value; // "green" (cycles)
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Generators are one-time use** — Once exhausted, calling `next()` always returns `{ done: true }`. Create a new generator instance to iterate again.
> 2. **`return` values are invisible to `for...of`** — `for...of` and spread only see `yield`ed values, not the `return` value.
> 3. **First `next()` value is ignored** — The first `next(value)` call's argument is discarded because there's no `yield` to receive it yet.
> 4. **Memory with infinite generators** — If you spread an infinite generator (`[...infinite()]`), it will run forever and crash. Always use `take()` or `break`.
> 5. **Generator methods** — `function*` works for standalone functions and object methods, but arrow functions cannot be generators.

---

## Related Topics

- [[04 - Symbols]] — `Symbol.iterator` and `Symbol.asyncIterator`
- [[06 - Modern ES Features]] — ES2025 Iterator Helpers
- [[04 - Async Await]] — `for await...of` for async iterables
- [[07 - Higher-Order Functions]] — Lazy vs eager evaluation

---

**Navigation:**
← [[04 - Symbols]] | [[06 - Modern ES Features]] →
