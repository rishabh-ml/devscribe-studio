---
title: WeakRef and FinalizationRegistry
phase: 8
topic: WeakRef and FinalizationRegistry
tags: [javascript, weakref, finalization-registry, garbage-collection, memory, caching]
created: 2025-01-15
---

# WeakRef and FinalizationRegistry

> [!info] **Big Picture**
> **`WeakRef`** holds a *weak reference* to an object — it doesn't prevent garbage collection. **`FinalizationRegistry`** lets you register a callback that fires when an object is garbage collected. Together, they enable memory-sensitive caching, resource cleanup, and object lifetime observation. These are advanced features (ES2021) primarily for library/framework authors.

---

## Why They Exist

Normal references (variables, properties) keep objects alive:

```js
let user = { name: "Alice" };
const cache = new Map();
cache.set("user", user);

user = null; // Object is NOT collected — cache still holds it!
```

**Problem**: Caches, registries, and metadata stores can cause memory leaks by keeping objects alive indefinitely.

**WeakMap/WeakSet** solve this partially (automatic cleanup, no iteration), but `WeakRef` gives you more control — you can check if an object still exists.

---

## `WeakRef`

### Basic Usage

```js
let target = { name: "Alice", data: new Array(1000000) };
const weakRef = new WeakRef(target);

// Access the object
weakRef.deref(); // { name: "Alice", data: [...] }

// Release the strong reference
target = null;

// At some later point (after GC runs):
weakRef.deref(); // undefined (object was garbage-collected)
```

### Key Rules

```js
const ref = new WeakRef(obj);

// .deref() returns the object or undefined
const obj = ref.deref();
if (obj) {
  // Object is still alive — use it
  obj.doSomething();
} else {
  // Object was garbage collected
}
```

> [!warning] **Important Timing**
> - GC timing is **non-deterministic** — you cannot predict WHEN an object will be collected.
> - `deref()` is guaranteed to return the same value within a single **synchronous turn** (microtask checkpoint).
> - Don't rely on prompt garbage collection for correctness.

---

## `FinalizationRegistry`

Register a callback that fires when a registered object is garbage collected.

```js
const registry = new FinalizationRegistry(heldValue => {
  console.log(`Object identified by "${heldValue}" was garbage collected`);
});

let obj = { data: "important" };
registry.register(obj, "my-object"); // heldValue = "my-object"

obj = null; // object becomes eligible for GC

// Eventually, logs: 'Object identified by "my-object" was garbage collected'
```

### API Details

```js
const registry = new FinalizationRegistry(callback);

// Register an object
registry.register(target, heldValue);
// target: the object to observe
// heldValue: passed to callback when target is GC'd (any value)

// Optionally provide an unregister token
registry.register(target, heldValue, unregisterToken);

// Unregister (prevent callback)
registry.unregister(unregisterToken);
```

---

## Pattern: Memory-Sensitive Cache

The primary use case — a cache that automatically releases entries when memory pressure occurs.

```js
class WeakCache {
  #cache = new Map(); // key → WeakRef
  #registry;

  constructor() {
    // Clean up map entry when cached object is GC'd
    this.#registry = new FinalizationRegistry(key => {
      const ref = this.#cache.get(key);
      // Only delete if the ref is still the dead one (not replaced)
      if (ref && ref.deref() === undefined) {
        this.#cache.delete(key);
        console.log(`Cache entry "${key}" cleaned up`);
      }
    });
  }

  set(key, value) {
    // Clean up old entry if exists
    const oldRef = this.#cache.get(key);
    if (oldRef) {
      this.#registry.unregister(oldRef);
    }

    const ref = new WeakRef(value);
    this.#cache.set(key, ref);
    this.#registry.register(value, key, ref); // value observed, key is heldValue
  }

  get(key) {
    const ref = this.#cache.get(key);
    if (!ref) return undefined;
    const value = ref.deref();
    if (value === undefined) {
      // Already GC'd but registry hasn't fired yet
      this.#cache.delete(key);
      return undefined;
    }
    return value;
  }

  has(key) {
    return this.get(key) !== undefined;
  }
}

// Usage
const cache = new WeakCache();

function fetchUserData(id) {
  const cached = cache.get(id);
  if (cached) return cached;

  const data = { id, name: "Alice", largePayload: new Array(100000) };
  cache.set(id, data);
  return data;
}
```

---

## Pattern: Resource Cleanup

Track resources that need cleanup when their owner is garbage collected.

```js
class FileHandleTracker {
  #registry = new FinalizationRegistry(handle => {
    console.warn(`File handle ${handle} was not properly closed!`);
    closeFileHandle(handle); // cleanup
  });

  track(owner, fileHandle) {
    this.#registry.register(owner, fileHandle, owner);
  }

  release(owner) {
    this.#registry.unregister(owner);
  }
}

const tracker = new FileHandleTracker();

function processFile(path) {
  const handle = openFile(path);
  const processor = { handle, path };
  tracker.track(processor, handle);

  // If processor is GC'd without closing handle,
  // FinalizationRegistry will clean up
  return processor;
}
```

---

## Pattern: DOM Node Metadata

Store metadata about DOM nodes that auto-cleans when nodes are removed and GC'd.

```js
class NodeMetadata {
  #refs = new Map(); // id → WeakRef<Node>
  #data = new Map(); // id → metadata
  #counter = 0;
  #registry = new FinalizationRegistry(id => {
    this.#refs.delete(id);
    this.#data.delete(id);
  });

  attach(node, metadata) {
    const id = ++this.#counter;
    this.#refs.set(id, new WeakRef(node));
    this.#data.set(id, metadata);
    this.#registry.register(node, id);
    node.__metadataId = id;
    return id;
  }

  get(node) {
    const id = node.__metadataId;
    return id ? this.#data.get(id) : undefined;
  }
}
```

---

## When to Use (and When NOT to)

> [!tip] **Decision Guide**

**Use WeakRef/FinalizationRegistry when:**
- Building caches that should release memory under pressure
- Tracking object lifetimes for debugging/monitoring
- Managing external resources tied to object lifetime
- You need something WeakMap can't do (like iteration or string keys)

**Do NOT use when:**
- WeakMap/WeakSet solve your problem (prefer them — simpler, more predictable)
- You need guaranteed cleanup timing (use `try/finally` or `using` instead)
- You're writing application code (these are primarily for libraries)
- You need the callback to run promptly or at all (GC is non-deterministic)

---

## WeakRef vs WeakMap vs `using`

| Feature | WeakMap | WeakRef | `using` (ES2025) |
|---------|---------|---------|------------------|
| Purpose | Associate data with an object | Check if object exists | Deterministic cleanup |
| GC allows collection | ✅ | ✅ | N/A |
| Can check if alive | ❌ | ✅ (`deref()`) | N/A |
| Cleanup timing | Non-deterministic | Non-deterministic | **Deterministic** (end of block) |
| Iteration | ❌ | N/A | N/A |
| Best for | Metadata, private data | Caches, monitoring | File handles, DB connections |

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **GC is non-deterministic** — `FinalizationRegistry` callbacks may fire late, never, or in any order. Don't rely on them for program correctness.
> 2. **Don't use `deref()` result without null-check** — The object can be collected between any two asynchronous operations.
> 3. **`FinalizationRegistry` callback runs in its own turn** — It doesn't have access to the collected object (it's already gone). Only `heldValue` is available.
> 4. **Unregister to prevent leaks in the registry itself** — If you no longer need to observe an object, call `registry.unregister()`.
> 5. **Testing is hard** — You can't force GC in standard JavaScript. Some environments offer `global.gc()` for testing, but it's non-standard.
> 6. **Prefer `using`/`Symbol.dispose` for deterministic cleanup** — ES2025's explicit resource management is almost always a better choice for resource cleanup.

---

## Related Topics

- [[03 - Maps Sets and WeakVariants]] — WeakMap and WeakSet fundamentals
- [[04 - Proxy and Reflect]] — Combine with Proxy for memory-aware patterns
- [[06 - Modern ES Features]] — `using` / `Symbol.dispose` for deterministic cleanup
- [[05 - Memory Management and Performance]] — GC algorithms and memory leak prevention

---

**Navigation:**
← [[04 - Proxy and Reflect]] | [[06 - Metaprogramming]] →
