---
title: Symbols
phase: 7
topic: Symbols
tags: [javascript, symbol, well-known-symbols, iterator, toPrimitive, metaprogramming]
created: 2025-01-15
---

# Symbols

> [!info] **Big Picture**
> `Symbol` is a **primitive type** (added in ES2015) that creates guaranteed **unique identifiers**. Symbols are primarily used as object property keys that can never clash with other keys — even if they have the same description. JavaScript also defines "well-known" symbols (`Symbol.iterator`, `Symbol.toPrimitive`, etc.) that hook into language internals, letting you customize how your objects behave with built-in operations.

---

## Creating Symbols

```js
const sym1 = Symbol();
const sym2 = Symbol("description"); // description is just a label for debugging
const sym3 = Symbol("description");

sym2 === sym3; // false — every Symbol is UNIQUE
sym2.toString();    // "Symbol(description)"
sym2.description;   // "description"

typeof sym1; // "symbol"
```

> [!note] **No `new Symbol()`**
> Symbols are primitives, not objects. `new Symbol()` throws a TypeError.

---

## Symbols as Property Keys

```js
const id = Symbol("id");
const user = {
  name: "John",
  [id]: 42 // symbol key — won't clash with any string key
};

user[id]; // 42
user.id;  // undefined — different key entirely!

// Symbols are NOT enumerable by default
Object.keys(user);                 // ["name"]
JSON.stringify(user);              // '{"name":"John"}'
for (const key in user) { ... }    // only "name"

// Access symbols specifically
Object.getOwnPropertySymbols(user); // [Symbol(id)]
Reflect.ownKeys(user);              // ["name", Symbol(id)]
```

### Use Case: Clash-Free Properties

```js
// Library adds metadata without risking key collision
const CACHE_KEY = Symbol("cache");
const TIMESTAMP = Symbol("timestamp");

function processItem(item) {
  item[CACHE_KEY] = computeCache(item);
  item[TIMESTAMP] = Date.now();
  // These symbols won't collide with any user-defined properties
}
```

---

## Global Symbol Registry

`Symbol.for()` creates/retrieves symbols from a **global registry** — same key returns same symbol across files, iframes, and even workers.

```js
const s1 = Symbol.for("app.id");
const s2 = Symbol.for("app.id");

s1 === s2; // true — SAME symbol (global registry lookup)

// Get the key back
Symbol.keyFor(s1); // "app.id"
Symbol.keyFor(Symbol("local")); // undefined — not in registry
```

**Use case:** Cross-module/cross-realm communication with guaranteed identical symbols.

---

## Well-Known Symbols

JavaScript defines special symbols that customize how objects interact with the language.

### `Symbol.iterator` — Make Objects Iterable

```js
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { done: true };
      }
    };
  }
};

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}

[...range]; // [1, 2, 3, 4, 5]
```

### `Symbol.toPrimitive` — Custom Type Conversion

```js
const money = {
  amount: 42,
  currency: "USD",

  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case "number": return this.amount;        // +money, Number(money)
      case "string": return `${this.amount} ${this.currency}`; // `${money}`
      default: return this.amount;              // money + 10
    }
  }
};

+money;          // 42
`${money}`;      // "42 USD"
money + 8;       // 50
```

### `Symbol.hasInstance` — Custom `instanceof`

```js
class EvenNumber {
  static [Symbol.hasInstance](num) {
    return typeof num === "number" && num % 2 === 0;
  }
}

4 instanceof EvenNumber;  // true
5 instanceof EvenNumber;  // false
```

### `Symbol.toStringTag` — Custom `Object.prototype.toString`

```js
class Validator {
  get [Symbol.toStringTag]() {
    return "Validator";
  }
}

Object.prototype.toString.call(new Validator()); // "[object Validator]"
```

### `Symbol.species` — Constructor for Derived Objects

```js
class MyArray extends Array {
  static get [Symbol.species]() {
    return Array; // .map(), .filter() return plain Arrays, not MyArray
  }
}

const myArr = new MyArray(1, 2, 3);
const mapped = myArr.map(x => x * 2);
mapped instanceof MyArray; // false
mapped instanceof Array;   // true
```

### `Symbol.isConcatSpreadable`

```js
const arr = [1, 2];
const nonSpreadable = { 0: 3, 1: 4, length: 2, [Symbol.isConcatSpreadable]: true };
arr.concat(nonSpreadable); // [1, 2, 3, 4]

// Prevent array spreading
const noSpread = [3, 4];
noSpread[Symbol.isConcatSpreadable] = false;
arr.concat(noSpread); // [1, 2, [3, 4]]
```

### `Symbol.asyncIterator`

```js
const asyncIterable = {
  async *[Symbol.asyncIterator]() {
    yield 1;
    await new Promise(r => setTimeout(r, 100));
    yield 2;
  }
};

for await (const val of asyncIterable) {
  console.log(val); // 1, then 2
}
```

---

## All Well-Known Symbols

| Symbol | Purpose |
|---|---|
| `Symbol.iterator` | Define iteration behavior (`for...of`, spread) |
| `Symbol.asyncIterator` | Define async iteration (`for await...of`) |
| `Symbol.toPrimitive` | Control type conversion |
| `Symbol.hasInstance` | Customize `instanceof` |
| `Symbol.toStringTag` | Customize `Object.prototype.toString` |
| `Symbol.species` | Constructor for derived objects |
| `Symbol.isConcatSpreadable` | Control `Array.concat` spreading |
| `Symbol.match/replace/search/split` | Custom regex-like behavior |
| `Symbol.dispose` | Explicit resource cleanup (ES2026) |
| `Symbol.asyncDispose` | Async resource cleanup (ES2026) |

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Symbols are not auto-converted to strings** — `"value is " + sym` throws TypeError. Use `sym.toString()` or `sym.description`.
> 2. **Not enumerable** — `Object.keys()`, `for...in`, `JSON.stringify` all skip symbol properties. Use `Object.getOwnPropertySymbols()` or `Reflect.ownKeys()`.
> 3. **`Symbol()` vs `Symbol.for()`** — `Symbol()` always creates a new unique symbol. `Symbol.for()` returns the same symbol for the same key.
> 4. **WeakMap keys** — Registered symbols (created with `Symbol.for()`) can be used as WeakMap keys (ES2023+), but regular symbols cannot.

---

## Related Topics

- [[05 - Iterators and Generators]] — `Symbol.iterator` in practice
- [[03 - Prototypes and the Prototype Chain]] — `Symbol.hasInstance`, `Symbol.species`
- [[04 - Type Conversion and Coercion]] — `Symbol.toPrimitive`
- [[03 - Maps Sets and WeakVariants]] — Symbol keys in collections

---

**Navigation:**
← [[03 - Maps Sets and WeakVariants]] | [[05 - Iterators and Generators]] →
