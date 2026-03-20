---
title: Proxy and Reflect
phase: 8
topic: Proxy and Reflect
tags: [javascript, proxy, reflect, traps, metaprogramming, validation, reactive, observable]
created: 2025-01-15
---

# Proxy and Reflect

> [!info] **Big Picture**
> A **Proxy** wraps an object and intercepts fundamental operations (property access, assignment, deletion, function calls, etc.) via **traps**. **Reflect** provides the default behavior for each trap, making it easy to add custom logic while preserving normal behavior. Together, they power reactive frameworks (Vue 3), validation layers, logging, and virtual objects.

---

## Core Concept

```js
const proxy = new Proxy(target, handler);
// target  — the original object to wrap
// handler — an object with "trap" methods
```

```
              proxy.name
                  │
                  ▼
    ┌─────────────────────────┐
    │   Handler (Traps)       │
    │   get(target, prop) {   │──── Custom logic
    │     return ...          │
    │   }                     │
    └──────────┬──────────────┘
               │ Reflect.get(target, prop)
               ▼
    ┌─────────────────────────┐
    │   Target Object         │
    │   { name: "Alice" }     │
    └─────────────────────────┘
```

---

## All Proxy Traps

| Trap | Triggered By | Reflect Method |
|------|-------------|----------------|
| `get(target, prop, receiver)` | Property read | `Reflect.get()` |
| `set(target, prop, value, receiver)` | Property write | `Reflect.set()` |
| `has(target, prop)` | `in` operator | `Reflect.has()` |
| `deleteProperty(target, prop)` | `delete` operator | `Reflect.deleteProperty()` |
| `ownKeys(target)` | `Object.keys()`, `for...in` | `Reflect.ownKeys()` |
| `getOwnPropertyDescriptor(target, prop)` | `Object.getOwnPropertyDescriptor()` | `Reflect.getOwnPropertyDescriptor()` |
| `defineProperty(target, prop, desc)` | `Object.defineProperty()` | `Reflect.defineProperty()` |
| `getPrototypeOf(target)` | `Object.getPrototypeOf()` | `Reflect.getPrototypeOf()` |
| `setPrototypeOf(target, proto)` | `Object.setPrototypeOf()` | `Reflect.setPrototypeOf()` |
| `isExtensible(target)` | `Object.isExtensible()` | `Reflect.isExtensible()` |
| `preventExtensions(target)` | `Object.preventExtensions()` | `Reflect.preventExtensions()` |
| `apply(target, thisArg, args)` | Function call | `Reflect.apply()` |
| `construct(target, args, newTarget)` | `new` operator | `Reflect.construct()` |

---

## The `get` Trap

Intercept property reads.

```js
const user = { name: "Alice", age: 30 };

const proxy = new Proxy(user, {
  get(target, prop, receiver) {
    console.log(`Reading ${prop}`);
    if (prop in target) {
      return Reflect.get(target, prop, receiver);
    }
    return `Property "${prop}" doesn't exist`;
  }
});

proxy.name;     // logs "Reading name" → "Alice"
proxy.email;    // logs "Reading email" → 'Property "email" doesn't exist'
```

### Default Values for Missing Properties

```js
function withDefaults(obj, defaults) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      return defaults[prop];
    }
  });
}

const config = withDefaults(
  { host: "localhost" },
  { host: "0.0.0.0", port: 3000, debug: false }
);

config.host;  // "localhost" (from object)
config.port;  // 3000 (from defaults)
config.debug; // false (from defaults)
```

---

## The `set` Trap

Intercept property assignments. Must return `true` for success.

```js
const validator = {
  set(target, prop, value, receiver) {
    if (prop === "age") {
      if (typeof value !== "number") throw new TypeError("Age must be a number");
      if (value < 0 || value > 150) throw new RangeError("Invalid age");
    }
    if (prop === "email") {
      if (!value.includes("@")) throw new Error("Invalid email");
    }
    return Reflect.set(target, prop, value, receiver);
  }
};

const user = new Proxy({}, validator);
user.name = "Alice";   // OK
user.age = 30;         // OK
user.age = -5;         // RangeError: Invalid age
user.email = "bad";    // Error: Invalid email
```

---

## The `has` Trap

Intercept the `in` operator.

```js
const range = new Proxy({ from: 1, to: 100 }, {
  has(target, prop) {
    const num = Number(prop);
    if (!isNaN(num)) {
      return num >= target.from && num <= target.to;
    }
    return Reflect.has(target, prop);
  }
});

50 in range;  // true
150 in range; // false
"from" in range; // true
```

---

## The `deleteProperty` Trap

Protect properties from deletion.

```js
const protected = new Proxy({ id: 1, name: "Alice", role: "admin" }, {
  deleteProperty(target, prop) {
    if (prop === "id") {
      throw new Error("Cannot delete id");
    }
    return Reflect.deleteProperty(target, prop);
  }
});

delete protected.name; // OK
delete protected.id;   // Error: Cannot delete id
```

---

## The `ownKeys` Trap

Control which properties appear in `Object.keys()`, `for...in`, etc.

```js
const obj = { name: "Alice", _secret: "hidden", age: 30 };

const proxy = new Proxy(obj, {
  ownKeys(target) {
    // Hide properties starting with _
    return Reflect.ownKeys(target).filter(key =>
      typeof key !== "string" || !key.startsWith("_")
    );
  }
});

Object.keys(proxy); // ["name", "age"]
```

---

## The `apply` Trap (Function Proxy)

Intercept function calls.

```js
function sum(a, b) {
  return a + b;
}

const logged = new Proxy(sum, {
  apply(target, thisArg, args) {
    console.log(`Calling ${target.name}(${args.join(", ")})`);
    const result = Reflect.apply(target, thisArg, args);
    console.log(`Result: ${result}`);
    return result;
  }
});

logged(1, 2);
// "Calling sum(1, 2)"
// "Result: 3"
// → 3
```

---

## The `construct` Trap

Intercept `new` operator.

```js
class User {
  constructor(name) {
    this.name = name;
  }
}

const TrackedUser = new Proxy(User, {
  construct(target, args, newTarget) {
    console.log(`Creating User: ${args[0]}`);
    const instance = Reflect.construct(target, args, newTarget);
    instance.createdAt = new Date();
    return instance;
  }
});

const user = new TrackedUser("Alice");
// "Creating User: Alice"
user.createdAt; // Date object
```

---

## The Reflect API

`Reflect` provides methods that mirror every Proxy trap, offering the default operation behavior.

### Why Use `Reflect` Instead of Direct Operations?

```js
// 1. Consistent return values (boolean instead of throwing)
Reflect.defineProperty(obj, "x", { value: 1 }); // returns true/false
Object.defineProperty(obj, "x", { value: 1 });  // returns obj or throws

// 2. Proper receiver handling in Proxy
const proxy = new Proxy(target, {
  get(target, prop, receiver) {
    // WRONG: ignores inheritance chain
    return target[prop];

    // CORRECT: respects receiver (important for inheritance)
    return Reflect.get(target, prop, receiver);
  }
});

// 3. Function-based operators
Reflect.has(obj, "key");           // instead of "key" in obj
Reflect.deleteProperty(obj, "x"); // instead of delete obj.x
Reflect.ownKeys(obj);             // Object.getOwnPropertyNames + Symbols
```

### All Reflect Methods

```js
Reflect.get(target, prop, receiver)
Reflect.set(target, prop, value, receiver)  // returns boolean
Reflect.has(target, prop)                   // returns boolean
Reflect.deleteProperty(target, prop)        // returns boolean
Reflect.ownKeys(target)                     // returns array
Reflect.getOwnPropertyDescriptor(target, prop)
Reflect.defineProperty(target, prop, desc)  // returns boolean
Reflect.getPrototypeOf(target)
Reflect.setPrototypeOf(target, proto)       // returns boolean
Reflect.isExtensible(target)
Reflect.preventExtensions(target)           // returns boolean
Reflect.apply(fn, thisArg, args)
Reflect.construct(Target, args, newTarget)
```

---

## Revocable Proxies

Create a proxy that can be permanently disabled.

```js
const { proxy, revoke } = Proxy.revocable({ name: "Alice" }, {
  get(target, prop) {
    return Reflect.get(target, prop);
  }
});

proxy.name; // "Alice"

revoke(); // permanently disable the proxy

proxy.name; // TypeError: Cannot perform 'get' on a proxy that has been revoked
```

### Use Cases for Revocable Proxies
- **API tokens** — Revoke access after logout
- **Temporary access** — Time-limited data views
- **Security** — Revoke 3rd party access to data

---

## Real-World Patterns

### Negative Array Indexing

```js
function negativeIndex(arr) {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      const index = Number(prop);
      if (Number.isInteger(index) && index < 0) {
        return target[target.length + index];
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

const arr = negativeIndex([1, 2, 3, 4, 5]);
arr[-1]; // 5
arr[-2]; // 4
```

### Reactive Data (Vue 3 Style)

```js
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value, receiver) {
      const oldValue = target[prop];
      const result = Reflect.set(target, prop, value, receiver);
      if (oldValue !== value) {
        onChange(prop, oldValue, value);
      }
      return result;
    },
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      // Deep reactivity — wrap nested objects too
      if (value && typeof value === "object") {
        return reactive(value, onChange);
      }
      return value;
    }
  });
}

const state = reactive({ count: 0, user: { name: "Alice" } }, (prop, old, val) => {
  console.log(`${prop}: ${old} → ${val}`);
});

state.count = 1;          // "count: 0 → 1"
state.user.name = "Bob";  // "name: Alice → Bob"
```

### API Request Caching

```js
function cachedApi(api) {
  const cache = new Map();
  return new Proxy(api, {
    get(target, method) {
      return async (...args) => {
        const key = `${method}:${JSON.stringify(args)}`;
        if (cache.has(key)) return cache.get(key);
        const result = await target[method](...args);
        cache.set(key, result);
        return result;
      };
    }
  });
}
```

### Logging / Debugging Proxy

```js
function logAccess(obj, label = "Proxy") {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      console.log(`[${label}] GET ${String(prop)}`);
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      console.log(`[${label}] SET ${String(prop)} = ${value}`);
      return Reflect.set(target, prop, value, receiver);
    }
  });
}
```

### Type-Safe Object

```js
function typedObject(schema) {
  return new Proxy({}, {
    set(target, prop, value) {
      if (!(prop in schema)) {
        throw new Error(`Unknown property: ${prop}`);
      }
      if (typeof value !== schema[prop]) {
        throw new TypeError(`${prop} must be ${schema[prop]}, got ${typeof value}`);
      }
      target[prop] = value;
      return true;
    }
  });
}

const user = typedObject({ name: "string", age: "number", active: "boolean" });
user.name = "Alice"; // OK
user.age = "30";     // TypeError: age must be number, got string
user.email = "x";    // Error: Unknown property: email
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Proxy identity** — `proxy !== target`. A proxied object is a different reference. This can break `Map`/`Set` lookups and `===` comparisons.
> 2. **`this` inside target methods** — When calling `target.method()` through a proxy, `this` refers to the proxy, not the target. This is usually desired but can cause issues with private fields.
> 3. **Private fields `#` break with Proxy** — Private fields are bound to the target, so accessing `this.#field` through a proxy throws. Workaround: call method on the target directly.
> 4. **Performance** — Proxies are slower than direct property access. Don't use them in hot paths (tight loops, animations).
> 5. **`set` must return `true`** — Returning `false` or nothing causes a TypeError in strict mode.
> 6. **Invariants** — Some traps have invariants (rules). E.g., `get` cannot return a value different from the target's if the property is non-writable and non-configurable.

```js
// Gotcha #3: Private fields and Proxy
class Foo {
  #value = 42;
  getValue() { return this.#value; }
}

const foo = new Foo();
const proxy = new Proxy(foo, {});
proxy.getValue(); // TypeError: Cannot read private member from a Proxy
```

---

## Related Topics

- [[03 - Property Descriptors and Object Configuration]] — What Proxy intercepts at the descriptor level
- [[04 - Symbols]] — Well-known symbols used in Proxy patterns
- [[06 - Metaprogramming]] — Broader metaprogramming context
- [[05 - WeakRef and FinalizationRegistry]] — Memory-aware proxying

---

**Navigation:**
← [[03 - Property Descriptors and Object Configuration]] | [[05 - WeakRef and FinalizationRegistry]] →
