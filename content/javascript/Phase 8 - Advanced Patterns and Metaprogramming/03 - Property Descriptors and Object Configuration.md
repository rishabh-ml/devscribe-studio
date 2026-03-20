---
title: Property Descriptors and Object Configuration
phase: 8
topic: Property Descriptors
tags: [javascript, property-descriptors, defineProperty, getters, setters, freeze, seal, preventExtensions]
created: 2025-01-15
---

# Property Descriptors and Object Configuration

> [!info] **Big Picture**
> Every property on a JavaScript object has hidden attributes called **descriptors** that control whether it can be changed, deleted, or enumerated. Understanding these gives you fine-grained control over object behavior — how frameworks build reactive systems, how `Object.freeze()` works, and how the spec defines built-in properties.

---

## Property Descriptor Types

There are two kinds of property descriptors:

### Data Descriptors

| Attribute | Default | Description |
|-----------|---------|-------------|
| `value` | `undefined` | The property's value |
| `writable` | `true` | Can the value be changed? |
| `enumerable` | `true` | Shows up in `for...in` and `Object.keys()`? |
| `configurable` | `true` | Can the descriptor be modified or property deleted? |

### Accessor Descriptors

| Attribute | Default | Description |
|-----------|---------|-------------|
| `get` | `undefined` | Getter function |
| `set` | `undefined` | Setter function |
| `enumerable` | `true` | Shows up in loops? |
| `configurable` | `true` | Can be modified/deleted? |

> [!warning] A property is either a **data descriptor** or an **accessor descriptor** — never both. You cannot have `value`/`writable` AND `get`/`set` on the same property.

---

## Reading Descriptors

```js
const obj = { name: "Alice", age: 30 };

// Single property
Object.getOwnPropertyDescriptor(obj, "name");
// { value: "Alice", writable: true, enumerable: true, configurable: true }

// All properties
Object.getOwnPropertyDescriptors(obj);
// {
//   name: { value: "Alice", writable: true, enumerable: true, configurable: true },
//   age: { value: 30, writable: true, enumerable: true, configurable: true }
// }
```

---

## `Object.defineProperty()`

Define or modify a single property with explicit descriptor attributes.

```js
const user = {};

// Define a property with custom attributes
Object.defineProperty(user, "id", {
  value: 1,
  writable: false,      // cannot be changed
  enumerable: true,
  configurable: false    // cannot be deleted or reconfigured
});

user.id = 2;       // silently fails (or TypeError in strict mode)
delete user.id;     // silently fails
console.log(user.id); // 1
```

> [!danger] **Default Values Differ!**
> When creating via `Object.defineProperty()`, omitted attributes default to `false`/`undefined`, NOT `true`!
> ```js
> Object.defineProperty(obj, "key", { value: 42 });
> // writable: false, enumerable: false, configurable: false
>
> // vs. normal assignment:
> obj.key = 42;
> // writable: true, enumerable: true, configurable: true
> ```

---

## `Object.defineProperties()`

Define multiple properties at once.

```js
const product = {};

Object.defineProperties(product, {
  name: {
    value: "Widget",
    writable: true,
    enumerable: true,
    configurable: true
  },
  _price: {
    value: 0,
    writable: true,
    enumerable: false,     // hidden from enumeration
    configurable: true
  },
  price: {
    get() { return `$${this._price.toFixed(2)}`; },
    set(val) {
      if (val < 0) throw new Error("Price can't be negative");
      this._price = val;
    },
    enumerable: true,
    configurable: true
  }
});

product.price = 29.99;
console.log(product.price);      // "$29.99"
Object.keys(product);            // ["name", "price"] (_price excluded)
```

---

## Attribute Deep Dive

### `writable: false` — Read-Only Properties

```js
const config = {};
Object.defineProperty(config, "API_KEY", {
  value: "abc123",
  writable: false,
  enumerable: true,
  configurable: false
});

config.API_KEY = "xyz"; // silently fails (strict mode: TypeError)
config.API_KEY; // "abc123"
```

### `enumerable: false` — Hidden Properties

```js
const obj = {};
Object.defineProperty(obj, "hidden", {
  value: "secret",
  enumerable: false
});

obj.visible = "public";

Object.keys(obj);          // ["visible"]
JSON.stringify(obj);       // '{"visible":"public"}'
for (const key in obj) {}  // only iterates "visible"

// But it's still accessible
obj.hidden;                // "secret"
Object.getOwnPropertyNames(obj); // ["hidden", "visible"]
```

### `configurable: false` — Locked Descriptor

```js
const obj = {};
Object.defineProperty(obj, "locked", {
  value: 42,
  configurable: false,
  writable: true,
  enumerable: true
});

// Can still change value (writable is true)
obj.locked = 100; // works

// Cannot delete
delete obj.locked; // fails

// Cannot change configurable or enumerable
Object.defineProperty(obj, "locked", {
  enumerable: false // TypeError!
});

// CAN change writable from true→false (but not back!)
Object.defineProperty(obj, "locked", {
  writable: false // OK, one-way
});
```

---

## Getters and Setters

### In Object Literals

```js
const circle = {
  _radius: 5,

  get radius() {
    return this._radius;
  },

  set radius(val) {
    if (val <= 0) throw new RangeError("Radius must be positive");
    this._radius = val;
  },

  get area() {
    return Math.PI * this._radius ** 2;
  },

  get circumference() {
    return 2 * Math.PI * this._radius;
  }
};

circle.radius = 10;           // calls setter
console.log(circle.area);     // 314.159... (computed property)
console.log(circle.circumference); // 62.831...
```

### In Classes

```js
class Temperature {
  #celsius;

  constructor(celsius) {
    this.#celsius = celsius;
  }

  get fahrenheit() {
    return this.#celsius * 9 / 5 + 32;
  }

  set fahrenheit(f) {
    this.#celsius = (f - 32) * 5 / 9;
  }

  get celsius() {
    return this.#celsius;
  }

  set celsius(c) {
    if (c < -273.15) throw new RangeError("Below absolute zero");
    this.#celsius = c;
  }
}

const temp = new Temperature(100);
temp.fahrenheit; // 212
temp.fahrenheit = 32;
temp.celsius;    // 0
```

### Lazy Getters (Compute Once)

```js
const obj = {
  get expensive() {
    console.log("Computing...");
    const result = heavyComputation();
    // Replace getter with cached value
    Object.defineProperty(this, "expensive", {
      value: result,
      writable: false,
      configurable: false
    });
    return result;
  }
};

obj.expensive; // "Computing..." → result
obj.expensive; // result (no recomputation, getter replaced)
```

---

## Object Immutability Methods

Three levels of immutability, from weakest to strongest:

### `Object.preventExtensions()`

Cannot add new properties. Existing properties can still be modified or deleted.

```js
const obj = { a: 1, b: 2 };
Object.preventExtensions(obj);

obj.c = 3;       // silently fails (TypeError in strict)
obj.a = 10;      // OK — existing property
delete obj.b;    // OK — can still delete

Object.isExtensible(obj); // false
```

### `Object.seal()`

Cannot add or delete properties. Cannot reconfigure. Can still change existing values.

```js
const obj = { a: 1, b: 2 };
Object.seal(obj);

obj.c = 3;       // fails — no new properties
delete obj.a;    // fails — no deleting
obj.a = 100;     // OK — can change values

Object.isSealed(obj); // true
// All properties become configurable: false
```

### `Object.freeze()`

Completely immutable (shallow). Cannot add, delete, or change anything.

```js
const obj = { a: 1, b: { c: 2 } };
Object.freeze(obj);

obj.a = 10;      // fails
obj.d = 4;       // fails
delete obj.a;    // fails

// BUT — it's SHALLOW
obj.b.c = 999;   // WORKS! Nested objects are NOT frozen
Object.isFrozen(obj.b); // false
```

### Deep Freeze

```js
function deepFreeze(obj) {
  Object.freeze(obj);
  for (const key of Object.getOwnPropertyNames(obj)) {
    const val = obj[key];
    if (val && typeof val === "object" && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }
  return obj;
}

const config = deepFreeze({
  api: { url: "https://api.example.com", timeout: 5000 },
  debug: false
});

config.api.url = "hacked"; // fails — deeply frozen
```

### Comparison Table

| Feature | `preventExtensions` | `seal` | `freeze` |
|---------|-------------------|--------|----------|
| Add properties | ❌ | ❌ | ❌ |
| Delete properties | ✅ | ❌ | ❌ |
| Change values | ✅ | ✅ | ❌ |
| Reconfigure descriptors | ✅ | ❌ | ❌ |
| Deep? | No | No | No |

---

## Correct Object Copying with Descriptors

```js
// Object.assign() loses getters/setters — they become plain values
const source = {
  get name() { return "Alice"; }
};
const wrong = Object.assign({}, source);
Object.getOwnPropertyDescriptor(wrong, "name");
// { value: "Alice", writable: true, ... } — getter is gone!

// Correct: use Object.defineProperties + Object.getOwnPropertyDescriptors
const correct = Object.defineProperties(
  {},
  Object.getOwnPropertyDescriptors(source)
);
Object.getOwnPropertyDescriptor(correct, "name");
// { get: [Function], set: undefined, ... } — getter preserved!
```

---

## Real-World Patterns

### Constants Object

```js
const HTTP_STATUS = Object.freeze({
  OK: 200,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
});
// Cannot be modified accidentally
```

### Observable Property

```js
function makeObservable(obj, prop, callback) {
  let value = obj[prop];
  Object.defineProperty(obj, prop, {
    get() { return value; },
    set(newVal) {
      const oldVal = value;
      value = newVal;
      callback(prop, oldVal, newVal);
    },
    enumerable: true,
    configurable: true
  });
}

const user = { name: "Alice" };
makeObservable(user, "name", (prop, oldVal, newVal) => {
  console.log(`${prop} changed: ${oldVal} → ${newVal}`);
});

user.name = "Bob"; // "name changed: Alice → Bob"
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`defineProperty` defaults are `false`** — Unlike normal assignment where `writable`, `enumerable`, `configurable` are `true`.
> 2. **`Object.freeze()` is shallow** — Nested objects need `deepFreeze`.
> 3. **`Object.assign()` copies values, not descriptors** — Getters are called and the return value is assigned as a plain property.
> 4. **Sealed/frozen objects fail silently** — In sloppy mode. Use strict mode to get TypeErrors.
> 5. **Cannot have both `value`+`writable` AND `get`+`set`** — It's one or the other.

---

## Related Topics

- [[04 - Proxy and Reflect]] — Intercept property access at a higher level
- [[05 - ES6 Classes]] — Getters/setters in classes
- [[06 - OOP Principles in JavaScript]] — Encapsulation via descriptors
- [[06 - Metaprogramming]] — Symbols and protocol customization

---

**Navigation:**
← [[02 - Regular Expressions]] | [[04 - Proxy and Reflect]] →
