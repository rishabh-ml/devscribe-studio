---
title: "Objects Foundations"
phase: 2
topic: "Objects"
tags:
  - phase2
  - data-structures
  - objects
  - destructuring
  - spread
  - methods
created: 2026-03-02
---

# Objects Foundations

> [!info] The Big Picture
> Objects are JavaScript's most fundamental data structure. **Almost everything in JavaScript is an object** — arrays, functions, dates, regex, even errors. Objects store data as **key-value pairs** (properties) and can contain functions (methods). Understanding objects is understanding JavaScript.

---

## 🏗️ Creating Objects

```javascript
// Object literal — the standard way
const user = {
    name: "Alice",
    age: 25,
    email: "alice@example.com",
    isActive: true,
};

// Empty object
const empty = {};

// Property shorthand (ES2015) — when variable name matches key
const name = "Alice";
const age = 25;
const user = { name, age }; // Same as { name: name, age: age }

// Computed property names (ES2015) — dynamic keys
const field = "email";
const obj = { [field]: "alice@example.com" };
// { email: "alice@example.com" }

const prefix = "user";
const dynamic = {
    [`${prefix}Name`]: "Alice",    // { userName: "Alice" }
    [`${prefix}Age`]: 25,          // { userAge: 25 }
};

// Methods in objects (shorthand syntax)
const calculator = {
    add(a, b) { return a + b; },       // Method shorthand
    subtract: function(a, b) { return a - b; }, // Traditional
    multiply: (a, b) => a * b,         // Arrow function (⚠️ no own `this`)
};
```

---

## 📖 Accessing Properties

```javascript
const user = {
    name: "Alice",
    age: 25,
    "favorite color": "blue",  // Key with space — must use quotes
    address: {
        city: "Portland",
        state: "OR",
    }
};

// Dot notation — clean, preferred when possible
user.name           // "Alice"
user.address.city   // "Portland"

// Bracket notation — required for:
user["name"]             // "Alice"
user["favorite color"]   // "blue" — keys with special characters
const key = "age";
user[key]                // 25 — dynamic/computed keys
user["to" + "String"]    // function toString() — computed expressions

// Optional chaining — safe deep access
user?.address?.zip       // undefined (no error!)
user?.contacts?.[0]      // undefined (works with arrays too)
user?.getProfile?.()     // undefined (works with methods too)

// Accessing non-existent properties
user.phone              // undefined (no error — just doesn't exist)
```

> [!tip] Dot vs Bracket Notation
> - **Dot notation**: clean, readable — use whenever the key is a valid identifier
> - **Bracket notation**: required for dynamic keys, keys with spaces/special chars, reserved words

---

## ✏️ Adding, Modifying, Deleting Properties

```javascript
const obj = { a: 1 };

// Add new properties
obj.b = 2;
obj["c"] = 3;

// Modify existing
obj.a = 10;

// Delete properties
delete obj.c;        // true
console.log(obj.c);  // undefined

// Check if property exists
"a" in obj                 // true (checks own AND inherited)
obj.hasOwnProperty("a")   // true (own only — legacy)
Object.hasOwn(obj, "a")   // true (own only — ES2022, preferred!)
```

---

## 🔓 Object Destructuring

Extract properties into variables — one of JavaScript's most-used features.

```javascript
const user = {
    name: "Alice",
    age: 25,
    email: "alice@example.com",
    address: {
        city: "Portland",
        state: "OR",
        zip: "97201"
    }
};

// Basic destructuring
const { name, age } = user;
// name = "Alice", age = 25

// With renaming
const { name: userName, email: userEmail } = user;
// userName = "Alice", userEmail = "alice@example.com"

// With default values
const { phone = "N/A", name: n } = user;
// phone = "N/A" (doesn't exist), n = "Alice"

// Nested destructuring
const { address: { city, state } } = user;
// city = "Portland", state = "OR"

// Rest operator — collect remaining properties
const { name: n2, ...rest } = user;
// n2 = "Alice", rest = { age: 25, email: "...", address: {...} }

// In function parameters (VERY common)
function greet({ name, age = 0 }) {
    return `Hello, ${name}! You are ${age} years old.`;
}
greet(user); // "Hello, Alice! You are 25 years old."

// In array of objects (with for...of)
const users = [{ name: "Alice" }, { name: "Bob" }];
for (const { name } of users) {
    console.log(name);
}

// Destructuring with computed property names
const prop = "name";
const { [prop]: value } = user; // value = "Alice"
```

> [!tip] Real-World: API Response Destructuring
> ```javascript
> // Instead of:
> const data = await response.json();
> const id = data.id;
> const results = data.results;
> const nextPage = data.pagination.nextPage;
> 
> // Do this:
> const { 
>     id, 
>     results, 
>     pagination: { nextPage } 
> } = await response.json();
> ```

---

## 📤 Spread Operator with Objects

```javascript
// Shallow copy
const original = { a: 1, b: 2, c: 3 };
const copy = { ...original };

// Merge objects (later properties override earlier ones)
const defaults = { theme: "light", lang: "en", debug: false };
const userPrefs = { theme: "dark", lang: "fr" };
const config = { ...defaults, ...userPrefs };
// { theme: "dark", lang: "fr", debug: false }

// Add/override specific properties
const updated = { ...user, age: 26, lastLogin: new Date() };

// Conditionally add properties
const query = {
    page: 1,
    ...(searchTerm && { search: searchTerm }),  // Only add if searchTerm exists
    ...(category !== "all" && { category }),
};
```

> [!warning] Spread Creates Shallow Copies
> ```javascript
> const original = { a: 1, nested: { b: 2 } };
> const copy = { ...original };
> copy.nested.b = 999;
> console.log(original.nested.b); // 999! 😱 Nested objects are shared!
> 
> // ✅ For deep copies:
> const deep = structuredClone(original); // ES2022+
> ```

---

## 🔧 Key `Object` Static Methods

### Iteration Methods

```javascript
const user = { name: "Alice", age: 25, city: "Portland" };

// Object.keys() — array of keys
Object.keys(user)     // ["name", "age", "city"]

// Object.values() — array of values
Object.values(user)   // ["Alice", 25, "Portland"]

// Object.entries() — array of [key, value] pairs
Object.entries(user)  // [["name","Alice"], ["age",25], ["city","Portland"]]

// Iterate over objects cleanly
for (const [key, value] of Object.entries(user)) {
    console.log(`${key}: ${value}`);
}

// Object.fromEntries() — reverse of entries (ES2019)
const entries = [["name", "Alice"], ["age", 25]];
Object.fromEntries(entries) // { name: "Alice", age: 25 }

// Real-world: transform object
const prices = { apple: 1.5, banana: 0.75, cherry: 2.0 };
const discounted = Object.fromEntries(
    Object.entries(prices).map(([fruit, price]) => [fruit, price * 0.9])
);
// { apple: 1.35, banana: 0.675, cherry: 1.8 }
```

### Copying/Merging

```javascript
// Object.assign(target, ...sources) — copies properties into target
const target = { a: 1 };
Object.assign(target, { b: 2 }, { c: 3 });
// target = { a: 1, b: 2, c: 3 } — target is MUTATED!

// For non-mutating copy, use empty target:
const copy = Object.assign({}, source);
// Or just use spread: const copy = { ...source };
```

### Freezing/Sealing

```javascript
// Object.freeze() — no changes at all (shallow!)
const frozen = Object.freeze({ name: "Alice", age: 25 });
frozen.age = 30;       // Silently fails (or TypeError in strict mode)
frozen.email = "a@b";  // Silently fails
delete frozen.name;    // Silently fails

// Object.seal() — can modify existing, cannot add/remove
const sealed = Object.seal({ name: "Alice", age: 25 });
sealed.age = 30;       // ✅ Works! Can modify existing
sealed.email = "a@b";  // ❌ Fails — cannot add
delete sealed.name;    // ❌ Fails — cannot delete

// Object.preventExtensions() — cannot add, but can modify and delete
const limited = Object.preventExtensions({ name: "Alice" });
limited.name = "Bob";  // ✅ Works
limited.age = 25;      // ❌ Fails — cannot add
delete limited.name;   // ✅ Works — can delete

// Check status
Object.isFrozen(frozen)        // true
Object.isSealed(sealed)        // true
Object.isExtensible(limited)   // false
```

### Property Checking

```javascript
// Object.hasOwn(obj, prop) — ES2022, preferred method
Object.hasOwn(user, "name")    // true
Object.hasOwn(user, "toString") // false (inherited, not own)

// Legacy: obj.hasOwnProperty(prop)
user.hasOwnProperty("name")   // true
// ⚠️ Can break if object has no prototype or own prop named "hasOwnProperty"
```

---

## 🔄 Shallow vs Deep Copying

```javascript
const original = {
    name: "Alice",
    scores: [90, 85, 92],
    address: { city: "Portland" }
};

// SHALLOW copy — top-level properties are independent, nested are shared
const shallow = { ...original };
shallow.name = "Bob";        // ✅ Independent
shallow.scores.push(100);   // ⚠️ ALSO modifies original.scores!
shallow.address.city = "NY"; // ⚠️ ALSO modifies original.address!

// DEEP copy — everything is independent
const deep = structuredClone(original); // ES2022+ ✅
deep.scores.push(100);      // Only affects deep copy
deep.address.city = "NY";   // Only affects deep copy

// structuredClone limitations:
// ❌ Cannot clone functions
// ❌ Cannot clone DOM nodes
// ❌ Cannot clone Symbol properties
// ✅ Handles circular references
// ✅ Handles Date, RegExp, Map, Set, ArrayBuffer
```

---

## 🌍 Real-World Patterns

### Configuration Objects

```javascript
function createServer(options = {}) {
    const config = {
        port: 3000,
        host: "localhost",
        cors: true,
        logging: true,
        ...options  // User options override defaults
    };
    // ... start server with config
}

createServer({ port: 8080, logging: false });
```

### Object as Enum/Map

```javascript
const HTTP_STATUS = Object.freeze({
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
});

if (response.status === HTTP_STATUS.NOT_FOUND) {
    showErrorPage();
}
```

### Transform Object Shape

```javascript
// Rename keys
function renameKeys(obj, keyMap) {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [keyMap[key] || key, value])
    );
}

renameKeys(
    { first_name: "Alice", last_name: "Smith" },
    { first_name: "firstName", last_name: "lastName" }
);
// { firstName: "Alice", lastName: "Smith" }
```

### Pick/Omit Properties

```javascript
// Pick specific properties
function pick(obj, keys) {
    return Object.fromEntries(
        keys.filter(key => key in obj).map(key => [key, obj[key]])
    );
}
pick(user, ["name", "email"]); // { name: "Alice", email: "..." }

// Omit specific properties
function omit(obj, keys) {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => !keys.includes(key))
    );
}
omit(user, ["password", "ssn"]); // Everything except sensitive fields
```

---

## ⚠️ Common Gotchas

> [!danger] Object Comparison is by Reference
> ```javascript
> {} === {}     // false — two different objects!
> [] === []     // false — two different arrays!
> 
> const a = { x: 1 };
> const b = a;     // Same reference
> a === b          // true
> 
> // To compare by value, use deep comparison
> JSON.stringify(a) === JSON.stringify(b) // Simple but fragile
> // Or use a library: lodash.isEqual(a, b)
> ```

> [!danger] Property Order
> Object property order generally follows insertion order for string keys (ES2015+), but **numeric-like string keys** are sorted numerically first:
> ```javascript
> const obj = { b: 2, a: 1, 2: "two", 1: "one" };
> Object.keys(obj); // ["1", "2", "b", "a"] ← numbers first, sorted!
> ```

---

## 🔗 Related Topics

- [[03 - Prototypes and the Prototype Chain]] — How objects inherit properties
- [[02 - The this Keyword]] — How `this` works in object methods
- [[05 - ES6 Classes]] — Class-based object creation
- [[Property Descriptors]] — Fine-grained property control (Phase 8)
- [[08 - JSON]] — Serializing objects

---

**← Previous:** [[06 - Array Iteration Methods]] | **Next →** [[08 - JSON]]
