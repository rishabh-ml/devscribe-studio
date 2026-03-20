---
title: Functional Programming
phase: 9
topic: Functional Programming
tags: [javascript, functional-programming, pure-functions, immutability, composition, currying, monads, transducers]
created: 2025-01-15
---

# Functional Programming

> [!info] **Big Picture**
> Functional programming (FP) is a paradigm where you build programs by composing **pure functions**, avoiding **shared mutable state** and **side effects**. JavaScript isn't purely functional (like Haskell), but its first-class functions, closures, and array methods make it excellent for FP. Understanding FP principles leads to more predictable, testable, and maintainable code.

---

## Core Principles

### Pure Functions

A function is **pure** if:
1. Same inputs → same output (deterministic)
2. No side effects (doesn't modify external state)

```js
// Pure — depends only on inputs
function add(a, b) { return a + b; }
function fullName(first, last) { return `${first} ${last}`; }

// Impure — depends on external state
let tax = 0.1;
function calcPrice(price) { return price * (1 + tax); } // reads external

// Impure — side effect (mutates external state)
let count = 0;
function increment() { count++; } // modifies external

// Impure — side effect (I/O)
function logUser(user) { console.log(user); } // I/O is a side effect
```

> [!tip] **Practical Rule**
> Push side effects to the edges of your program. Keep the core logic pure. I/O, DOM manipulation, API calls — these happen at the boundary, not deep in your business logic.

---

### Immutability

Never mutate data — create new copies instead.

```js
// ❌ Mutation
const user = { name: "Alice", age: 30 };
user.age = 31; // mutated!

// ✅ Immutable update (spread)
const updatedUser = { ...user, age: 31 };

// ❌ Array mutation
const arr = [1, 2, 3];
arr.push(4); // mutated!

// ✅ Immutable array operations
const newArr = [...arr, 4];          // add
const without = arr.filter(x => x !== 2); // remove
const mapped = arr.map(x => x * 2); // transform

// ES2023 — immutable array methods
arr.toSorted();           // instead of .sort()
arr.toReversed();         // instead of .reverse()
arr.toSpliced(1, 1);     // instead of .splice()
arr.with(0, 99);         // instead of arr[0] = 99

// Deep immutability
const config = Object.freeze({
  api: Object.freeze({ url: "https://api.example.com" }),
  debug: false
});

// structuredClone for deep copies
const deepCopy = structuredClone(original);
```

---

### Referential Transparency

An expression is referentially transparent if it can be replaced by its value without changing program behavior.

```js
// Referentially transparent
const result = add(2, 3); // can be replaced with 5 anywhere

// NOT referentially transparent
const time = Date.now(); // different each call
const random = Math.random(); // different each call
```

---

## Function Composition

Combine small functions into larger ones.

```js
// Manual composition
const processUser = user =>
  formatOutput(validateAge(normalizeName(user)));

// Compose utility (right-to-left)
function compose(...fns) {
  return x => fns.reduceRight((acc, fn) => fn(acc), x);
}

// Pipe utility (left-to-right) — more readable
function pipe(...fns) {
  return x => fns.reduce((acc, fn) => fn(acc), x);
}

// Usage
const processName = pipe(
  str => str.trim(),
  str => str.toLowerCase(),
  str => str.replace(/\s+/g, "-"),
  str => str.replace(/[^a-z0-9-]/g, "")
);

processName("  Hello World!  "); // "hello-world"
```

```js
// Composing async functions
function pipeAsync(...fns) {
  return x => fns.reduce(
    (acc, fn) => acc.then(fn),
    Promise.resolve(x)
  );
}

const processUser = pipeAsync(
  fetchUser,
  validateUser,
  saveUser,
  notifyUser
);

await processUser(userId);
```

---

## Currying

Transform a function with multiple arguments into a chain of single-argument functions.

```js
// Regular function
function add(a, b) { return a + b; }

// Curried version
function curriedAdd(a) {
  return function (b) {
    return a + b;
  };
}
// Arrow version
const curriedAdd = a => b => a + b;

curriedAdd(1)(2); // 3
const add10 = curriedAdd(10);
add10(5); // 15

// Generic curry utility
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...moreArgs) => curried(...args, ...moreArgs);
  };
}

const multiply = curry((a, b, c) => a * b * c);
multiply(2)(3)(4);  // 24
multiply(2, 3)(4);  // 24
multiply(2)(3, 4);  // 24
```

### Practical Currying

```js
// Configurable filter
const filterBy = curry((predicate, arr) => arr.filter(predicate));
const getAdults = filterBy(user => user.age >= 18);
const getActive = filterBy(user => user.active);

getAdults(users); // filtered array
getActive(users); // filtered array

// Configurable formatter
const format = curry((template, value) =>
  template.replace("{}", value)
);
const toCurrency = format("${}")
const toPercent = format("{}%");

toCurrency(42.50); // "$42.50"
toPercent(99);      // "99%"
```

---

## Partial Application

Fix some arguments of a function, producing a new function with fewer parameters.

```js
// Using bind
function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

const sayHello = greet.bind(null, "Hello");
sayHello("Alice"); // "Hello, Alice!"

// Manual partial
function partial(fn, ...presetArgs) {
  return (...laterArgs) => fn(...presetArgs, ...laterArgs);
}

const double = partial(multiply, 2);
double(5); // 10
```

> [!note] **Currying vs Partial Application**
> - **Currying**: Transform `f(a, b, c)` into `f(a)(b)(c)` — always one arg at a time.
> - **Partial Application**: Fix some args to get `f(c)` — can fix multiple at once.

---

## Functors

An object that implements `map()` — applies a function to a wrapped value without unwrapping.

```js
// Arrays are functors
[1, 2, 3].map(x => x * 2); // [2, 4, 6]

// Custom functor: Maybe (handles null/undefined)
class Maybe {
  #value;

  constructor(value) {
    this.#value = value;
  }

  static of(value) { return new Maybe(value); }

  get isNothing() {
    return this.#value === null || this.#value === undefined;
  }

  map(fn) {
    return this.isNothing ? this : Maybe.of(fn(this.#value));
  }

  getOrElse(defaultValue) {
    return this.isNothing ? defaultValue : this.#value;
  }

  toString() {
    return this.isNothing ? "Maybe(Nothing)" : `Maybe(${this.#value})`;
  }
}

// Safe property access chain
const getUserCity = user =>
  Maybe.of(user)
    .map(u => u.address)
    .map(a => a.city)
    .map(c => c.toUpperCase())
    .getOrElse("UNKNOWN");

getUserCity({ address: { city: "Paris" } }); // "PARIS"
getUserCity({ address: {} });                 // "UNKNOWN"
getUserCity(null);                             // "UNKNOWN"
```

---

## Monads (Basic Concept)

A monad is a functor that also implements `flatMap()` (or `chain`) — handles sequential operations on wrapped values.

```js
// Promises are monads!
Promise.resolve(5)
  .then(x => x * 2)              // map
  .then(x => Promise.resolve(x + 1))  // flatMap (returns wrapped value)
  .then(console.log);             // 11

// Arrays have flatMap
[[1, 2], [3, 4]].flatMap(x => x); // [1, 2, 3, 4]

// Result monad (for error handling without exceptions)
class Result {
  #value;
  #error;
  #isOk;

  constructor(isOk, value, error) {
    this.#isOk = isOk;
    this.#value = value;
    this.#error = error;
  }

  static ok(value) { return new Result(true, value, null); }
  static err(error) { return new Result(false, null, error); }

  map(fn) {
    return this.#isOk ? Result.ok(fn(this.#value)) : this;
  }

  flatMap(fn) {
    return this.#isOk ? fn(this.#value) : this;
  }

  getOrElse(defaultValue) {
    return this.#isOk ? this.#value : defaultValue;
  }

  match({ ok, err }) {
    return this.#isOk ? ok(this.#value) : err(this.#error);
  }
}

// Usage
function parseJSON(str) {
  try {
    return Result.ok(JSON.parse(str));
  } catch (e) {
    return Result.err(e.message);
  }
}

function getUserName(data) {
  return data.name ? Result.ok(data.name) : Result.err("No name field");
}

parseJSON('{"name":"Alice"}')
  .flatMap(getUserName)
  .map(name => name.toUpperCase())
  .match({
    ok: name => console.log(`User: ${name}`),  // "User: ALICE"
    err: e => console.error(`Error: ${e}`)
  });
```

---

## Transducers

Composable transformation pipelines that avoid intermediate arrays.

```js
// Problem: each method creates an intermediate array
const result = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  .filter(n => n % 2 === 0)   // creates [2, 4, 6, 8, 10]
  .map(n => n * 10)            // creates [20, 40, 60, 80, 100]
  .filter(n => n > 50);        // creates [60, 80, 100]
// 3 intermediate arrays!

// Transducer approach — single pass, no intermediate arrays
const mapT = fn => reducer => (acc, val) => reducer(acc, fn(val));
const filterT = pred => reducer => (acc, val) =>
  pred(val) ? reducer(acc, val) : acc;

// Compose transducers (left-to-right for transducers!)
function composeTransducers(...xforms) {
  return xforms.reduce((a, b) => reducer => a(b(reducer)));
}

const xform = composeTransducers(
  filterT(n => n % 2 === 0),
  mapT(n => n * 10),
  filterT(n => n > 50)
);

const append = (arr, val) => { arr.push(val); return arr; };

[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce(xform(append), []);
// [60, 80, 100] — single pass!
```

> [!note] For practical transducers, consider libraries like **Ramda** or use ES2025 **Iterator Helpers** which achieve lazy evaluation more ergonomically: `arr.values().filter().map().toArray()`.

---

## Point-Free Style

Define functions without explicitly mentioning their arguments.

```js
// Pointed (explicit args)
const getNames = users => users.map(user => user.name);

// Point-free
const prop = key => obj => obj[key];
const getNames = users => users.map(prop("name"));

// More point-free examples
const isEven = n => n % 2 === 0;
const not = fn => (...args) => !fn(...args);
const isOdd = not(isEven);

// Pipeline
const processUsers = pipe(
  filter(prop("active")),
  map(prop("name")),
  map(str => str.toUpperCase())
);
```

> [!tip] Point-free style improves readability when the names are clear, but can harm readability when overdone. Use judiciously.

---

## FP in Practice: Array Methods

JavaScript's array methods ARE functional programming:

```js
const users = [
  { name: "Alice", age: 25, active: true },
  { name: "Bob", age: 17, active: true },
  { name: "Charlie", age: 30, active: false }
];

// Pure, composable, no mutation
const result = users
  .filter(u => u.active)              // predicate → new array
  .filter(u => u.age >= 18)           // predicate → new array
  .map(u => u.name.toUpperCase())     // transform → new array
  .sort((a, b) => a.localeCompare(b)); // compare → new array (toSorted in FP)

// ["ALICE"]

// reduce as universal operation
const sum = nums => nums.reduce((acc, n) => acc + n, 0);
const flatten = arrs => arrs.reduce((acc, arr) => [...acc, ...arr], []);
const groupBy = (arr, fn) => arr.reduce((groups, item) => {
  const key = fn(item);
  return { ...groups, [key]: [...(groups[key] ?? []), item] };
}, {});
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **JavaScript isn't purely functional** — Side effects are everywhere (DOM, I/O, timers). Embrace FP principles where practical, don't fight the language.
> 2. **Performance of immutability** — Creating new arrays/objects on every operation can be expensive with large data. Use libraries like **Immer** for efficient immutable updates.
> 3. **Overusing point-free** — `compose(map(prop("name")), filter(prop("active")))` can be unreadable. Clarity > cleverness.
> 4. **Currying all the things** — Only curry functions that benefit from partial application. Not everything needs to be curried.
> 5. **`Object.freeze` is shallow** — Use `deepFreeze` or `structuredClone` for true immutability.

---

## Related Topics

- [[07 - Higher-Order Functions]] — Functions as arguments and return values
- [[09 - Function Composition and Functional Patterns]] — Compose, pipe, curry
- [[06 - Closures]] — Closures enable currying and partial application
- [[06 - Array Iteration Methods]] — `map`, `filter`, `reduce` are FP in action
- [[05 - Iterators and Generators]] — Lazy evaluation with generators

---

**Navigation:**
← [[02 - Design Patterns in JavaScript]] | [[04 - Testing JavaScript]] →
