---
title: Maps Sets and WeakVariants
phase: 7
topic: Maps, Sets, WeakMaps, and WeakSets
tags: [javascript, map, set, weakmap, weakset, collections, es2025]
created: 2025-01-15
---

# Maps, Sets, WeakMaps, and WeakSets

> [!info] **Big Picture**
> `Map` and `Set` are purpose-built collections introduced in ES2015. `Map` is a key-value store where keys can be **any type** (not just strings like objects). `Set` stores **unique values**. Their `Weak` variants hold references that don't prevent garbage collection — perfect for caching and metadata without memory leaks. ES2025 adds powerful set theory methods to `Set`.

---

## Map

An ordered collection of key-value pairs where keys can be **any type**.

### Creating and Using

```js
const map = new Map();

// Set entries
map.set("name", "John");
map.set(42, "the answer");
map.set(true, "yes");
map.set({ id: 1 }, "user object as key");

// Get entries
map.get("name");    // "John"
map.get(42);        // "the answer"
map.get("missing"); // undefined

// Check and delete
map.has("name");    // true
map.delete("name"); // true (was found and deleted)
map.clear();        // remove all entries

// Size
map.size; // number of entries
```

### Initialize from Entries

```js
const map = new Map([
  ["name", "John"],
  ["age", 30],
  ["role", "admin"]
]);

// From Object
const obj = { a: 1, b: 2, c: 3 };
const fromObj = new Map(Object.entries(obj));

// Back to Object
const backToObj = Object.fromEntries(map);
```

### Iteration

```js
const map = new Map([["a", 1], ["b", 2], ["c", 3]]);

// for...of (entries by default)
for (const [key, value] of map) {
  console.log(key, value);
}

// Specific iterators
for (const key of map.keys()) { ... }
for (const value of map.values()) { ... }
for (const [key, value] of map.entries()) { ... }

// forEach
map.forEach((value, key) => console.log(key, value));

// Convert to array
const entries = [...map];           // [["a", 1], ["b", 2], ["c", 3]]
const keys = [...map.keys()];       // ["a", "b", "c"]
const values = [...map.values()];   // [1, 2, 3]
```

### Map vs Object

| Feature | `Map` | `Object` |
|---|---|---|
| Key types | **Any type** (objects, functions, etc.) | Strings and Symbols only |
| Order | Insertion order (guaranteed) | Mostly insertion order |
| Size | `map.size` | `Object.keys(obj).length` |
| Iteration | Direct (`for...of`, `forEach`) | `Object.entries()`, `for...in` |
| Performance | Better for frequent add/delete | Better for static data |
| Prototype | No inherited keys | Has prototype keys |
| Serialization | No native JSON support | `JSON.stringify` works |

```js
// Use Map when:
// - Keys aren't strings
// - You need guaranteed order
// - You're frequently adding/deleting entries
// - You need .size

// Use Object when:
// - Keys are strings
// - You need JSON serialization
// - You need destructuring
// - It's a simple data record
```

---

## Set

A collection of **unique values**. Duplicates are automatically ignored.

### Creating and Using

```js
const set = new Set();

set.add(1);
set.add(2);
set.add(2); // ignored — already exists
set.add("hello");
set.add({ id: 1 }); // objects are compared by reference

set.has(1);      // true
set.delete(2);   // true
set.clear();     // remove all
set.size;        // number of values
```

### Common Use Cases

```js
// Remove duplicates from array
const arr = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(arr)]; // [1, 2, 3, 4]

// Unique strings
const tags = new Set(["js", "css", "js", "html"]);
// Set(3) {"js", "css", "html"}

// Track seen values
const seen = new Set();
function processOnce(item) {
  if (seen.has(item)) return;
  seen.add(item);
  // process item...
}
```

### Iteration

```js
const set = new Set([10, 20, 30]);

for (const value of set) { console.log(value); }
set.forEach(value => console.log(value));

// Convert to array
const arr = [...set];
const arr2 = Array.from(set);
```

---

## ES2025 Set Methods

Major addition — proper set theory operations built into `Set`.

```js
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5, 6]);

// Union — all elements from both
a.union(b);                    // Set {1, 2, 3, 4, 5, 6}

// Intersection — elements in both
a.intersection(b);             // Set {3, 4}

// Difference — in A but not in B
a.difference(b);               // Set {1, 2}

// Symmetric Difference — in either but not both
a.symmetricDifference(b);      // Set {1, 2, 5, 6}

// Subset — is A a subset of B?
new Set([3, 4]).isSubsetOf(b);       // true

// Superset — does A contain all of B?
a.isSupersetOf(new Set([1, 2]));     // true

// Disjoint — no elements in common?
new Set([1, 2]).isDisjointFrom(new Set([5, 6])); // true
```

These methods accept any **iterable**, not just Sets:

```js
const set = new Set([1, 2, 3]);
set.union([3, 4, 5]);        // Set {1, 2, 3, 4, 5} — accepts array
set.intersection([2, 3, 4]); // Set {2, 3}
```

---

## WeakMap

Like `Map`, but keys must be objects (or symbols) and are **weakly held** — they don't prevent garbage collection.

```js
const cache = new WeakMap();

function processUser(user) {
  if (cache.has(user)) return cache.get(user);

  const result = expensiveComputation(user);
  cache.set(user, result);
  return result;
}

let user = { name: "John" };
processUser(user); // cached

user = null; // the entry is automatically garbage-collected
// No memory leak! The WeakMap entry is cleaned up.
```

### WeakMap Characteristics

- **Keys must be objects** (or non-registered Symbols)
- **Not iterable** — no `for...of`, `forEach`, `keys()`, `values()`
- **No `.size`** — can't know how many entries
- Methods: `get()`, `set()`, `has()`, `delete()`

### Use Cases

```js
// Private data storage
const privateData = new WeakMap();

class Person {
  constructor(name, ssn) {
    this.name = name;
    privateData.set(this, { ssn }); // truly private
  }

  getSSN() {
    return privateData.get(this).ssn;
  }
}

// DOM element metadata
const elementData = new WeakMap();

function trackElement(el) {
  elementData.set(el, {
    clicks: 0,
    created: Date.now()
  });
}
// When el is removed from DOM and dereferenced,
// the WeakMap entry is automatically cleaned up
```

---

## WeakSet

Like `Set`, but values must be objects and are weakly held.

```js
const visited = new WeakSet();

function processNode(node) {
  if (visited.has(node)) return; // already processed
  visited.add(node);
  // process...
}

// When node is garbage-collected, it's automatically
// removed from the WeakSet — no memory leak
```

### Use Cases

- Tracking visited objects (avoid infinite recursion in tree traversal)
- Branding/tagging objects without modifying them
- Detecting circular references

```js
// Circular reference detection
function deepClone(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (seen.has(obj)) throw new Error("Circular reference detected");
  seen.add(obj);

  const clone = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    clone[key] = deepClone(obj[key], seen);
  }
  return clone;
}
```

---

## `Map.groupBy` and `Object.groupBy` — ES2024

Group iterable elements by a key function.

```js
const people = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 25 },
  { name: "Diana", age: 30 }
];

// Object.groupBy — returns plain object (string keys)
const byAge = Object.groupBy(people, person => person.age);
// { "25": [{name: "Alice"...}, {name: "Charlie"...}],
//   "30": [{name: "Bob"...}, {name: "Diana"...}] }

// Map.groupBy — returns Map (any key type)
const byAgeMap = Map.groupBy(people, person => person.age);
// Map { 25 => [...], 30 => [...] }
```

---

## Quick Reference

| Collection | Keys | Values | GC-friendly | Iterable | `.size` |
|---|---|---|---|---|---|
| `Map` | Any type | Any | No | Yes | Yes |
| `Set` | — | Any (unique) | No | Yes | Yes |
| `WeakMap` | Objects only | Any | **Yes** | No | No |
| `WeakSet` | — | Objects only | **Yes** | No | No |

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Object keys in Map** — `map.set({}, 1); map.get({})` returns `undefined`! Different object references. Store the reference.
> 2. **Set equality** — Objects in a Set are compared by **reference**, not deep equality: `new Set([{a: 1}, {a: 1}]).size === 2`.
> 3. **WeakMap is not iterable** — You can't list all entries. Design accordingly.
> 4. **NaN equality in Map/Set** — `NaN === NaN` is `false`, but Map/Set treat NaN as equal to itself (special case).
> 5. **JSON serialization** — `JSON.stringify(map)` returns `"{}"`. Convert to entries first: `JSON.stringify([...map])`.

---

## Related Topics

- [[07 - Objects Foundations]] — Plain objects vs Map
- [[05 - Arrays Foundations]] — Arrays vs Set for unique values
- [[04 - Symbols]] — Symbol keys in Map/WeakMap
- [[06 - Modern ES Features]] — `Object.groupBy`, `Map.groupBy`

---

**Navigation:**
← [[02 - ES Modules]] | [[04 - Symbols]] →
