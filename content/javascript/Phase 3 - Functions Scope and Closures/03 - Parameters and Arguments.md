---
title: Parameters and Arguments
phase: 3
topic: Parameters and Arguments
tags: [javascript, functions, parameters, arguments, default-params, rest-params, destructuring]
created: 2025-01-15
---

# Parameters and Arguments

> [!info] **Big Picture**
> Parameters are the **names** listed in a function definition. Arguments are the **values** passed when the function is called. JavaScript is extremely flexible with arguments — you can pass too many, too few, destructure them, set defaults, and collect the rest into an array. Mastering these patterns lets you write APIs that are both powerful and easy to use.

---

## Parameters vs Arguments

```js
//              parameters ↓
function add(a, b) {
  return a + b;
}

//         arguments ↓
add(3, 5);
```

- **Parameters** = variable names declared in the function signature
- **Arguments** = actual values supplied when calling the function

---

## Default Parameters (ES2015)

Provide fallback values when an argument is `undefined` (or not provided).

```js
function greet(name = "World") {
  return `Hello, ${name}!`;
}

greet("Alice"); // "Hello, Alice!"
greet();        // "Hello, World!"
greet(undefined); // "Hello, World!" — undefined triggers default
greet(null);      // "Hello, null!"  — null does NOT trigger default
greet("");        // "Hello, !"      — empty string does NOT trigger default
```

### Default Expressions Are Evaluated at Call Time

```js
function addEntry(item, timestamp = Date.now()) {
  return { item, timestamp };
}

// Each call gets a FRESH timestamp
addEntry("first");  // { item: "first", timestamp: 1705350000000 }
// ... later ...
addEntry("second"); // { item: "second", timestamp: 1705350005000 }
```

### Defaults Can Reference Earlier Parameters

```js
function createRect(width, height = width) {
  return { width, height };
}

createRect(10);     // { width: 10, height: 10 } — square
createRect(10, 5);  // { width: 10, height: 5 }  — rectangle
```

### Defaults Can Be Function Calls

```js
function required(paramName) {
  throw new Error(`Missing required parameter: ${paramName}`);
}

function createUser(name = required("name"), role = "viewer") {
  return { name, role };
}

createUser("Alice");    // { name: "Alice", role: "viewer" }
createUser();           // ❌ Error: Missing required parameter: name
```

> [!tip] **The `required()` pattern** is a clever way to enforce mandatory parameters without writing explicit validation code inside the function body.

---

## Rest Parameters (`...`)

Collect all remaining arguments into a **real array**.

```js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3);       // 6
sum(10, 20, 30, 40); // 100
sum();               // 0

console.log(Array.isArray(numbers)); // true — it's a real array!
```

### Rest Must Be Last

```js
function tag(first, ...rest) {
  console.log(first); // "a"
  console.log(rest);  // ["b", "c", "d"]
}
tag("a", "b", "c", "d");

// ❌ SyntaxError — rest parameter must be last
function bad(...rest, last) { }
```

### Rest vs Spread — They Look the Same But Are Opposites

```js
// REST: Collects multiple values INTO an array (in function parameters)
function log(...args) {
  console.log(args); // [1, 2, 3]
}

// SPREAD: Expands an array INTO individual values (in function calls)
const nums = [1, 2, 3];
log(...nums); // same as log(1, 2, 3)
```

---

## The Legacy `arguments` Object

Before rest parameters existed, `arguments` was the only way to access all arguments.

```js
function oldStyle() {
  console.log(arguments);        // { 0: "a", 1: "b", 2: "c", length: 3 }
  console.log(arguments[0]);     // "a"
  console.log(arguments.length); // 3
}
oldStyle("a", "b", "c");
```

### `arguments` Gotchas

```js
// 1. It's NOT a real array
function demo() {
  // ❌ arguments.map is not a function
  // arguments.map(x => x * 2);

  // ✅ Convert to array first
  const arr = Array.from(arguments);
  // or: const arr = [...arguments];
  return arr.map(x => x * 2);
}

// 2. Arrow functions DON'T have `arguments`
const arrowFn = () => {
  console.log(arguments); // ❌ ReferenceError (or captures outer `arguments`)
};

// 3. In non-strict mode, `arguments` is linked to named parameters (confusing!)
function weird(a) {
  arguments[0] = 99;
  console.log(a); // 99 — `a` changed when `arguments` changed!
}
weird(1);

// In strict mode, this link is broken (safer)
function safe(a) {
  "use strict";
  arguments[0] = 99;
  console.log(a); // 1 — `a` NOT affected
}
safe(1);
```

> [!warning] **Always Prefer Rest Parameters**
> `arguments` is legacy. Use `...args` instead:
> - It's a **real array** (has `.map()`, `.filter()`, etc.)
> - Works in arrow functions
> - Clearer intent
> - No weird aliasing behavior

---

## Parameter Destructuring

Extract values from objects or arrays directly in the parameter list.

### Object Destructuring

```js
function createUser({ name, age, role = "viewer" }) {
  return { name, age, role };
}

createUser({ name: "Alice", age: 30 });
// { name: "Alice", age: 30, role: "viewer" }

createUser({ name: "Bob", age: 25, role: "admin" });
// { name: "Bob", age: 25, role: "admin" }
```

### With Renaming

```js
function printCoords({ x: horizontal, y: vertical }) {
  console.log(`H: ${horizontal}, V: ${vertical}`);
}

printCoords({ x: 10, y: 20 }); // "H: 10, V: 20"
```

### Nested Destructuring

```js
function displayAddress({ name, address: { city, zip } }) {
  console.log(`${name} lives in ${city} (${zip})`);
}

displayAddress({
  name: "Alice",
  address: { city: "Portland", zip: "97201" },
});
// "Alice lives in Portland (97201)"
```

### Default for the Entire Parameter

```js
// If no argument is passed, the destructuring would throw on `undefined`
// Fix: provide a default empty object
function drawChart({ width = 400, height = 300, color = "blue" } = {}) {
  console.log(`${width}x${height} in ${color}`);
}

drawChart();                  // "400x300 in blue"
drawChart({ width: 800 });   // "800x300 in blue"
drawChart({ color: "red" }); // "400x300 in red"
```

> [!tip] **The `= {}` Default Pattern**
> Without `= {}`, calling `drawChart()` with no arguments would throw `TypeError: Cannot destructure property 'width' of undefined`. Always add `= {}` when the entire object argument is optional.

### Array Destructuring in Parameters

```js
function getDistance([x1, y1], [x2, y2]) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

getDistance([0, 0], [3, 4]); // 5
```

---

## JavaScript's Flexibility with Arguments

### Too Few Arguments

```js
function add(a, b) {
  return a + b;
}

add(5);       // 5 + undefined = NaN
add();        // undefined + undefined = NaN
// No error thrown! Missing arguments become `undefined`
```

### Too Many Arguments

```js
function add(a, b) {
  return a + b;
}

add(1, 2, 3, 4, 5); // 3 — extra arguments silently ignored
// (unless you use `...rest` or `arguments` to capture them)
```

---

## Real-World Patterns

### Options Object Pattern

Instead of many positional parameters, use a single options object:

```js
// ❌ Hard to read — what do these arguments mean?
createUser("Alice", 30, true, false, "admin");

// ✅ Self-documenting with an options object
createUser({
  name: "Alice",
  age: 30,
  active: true,
  verified: false,
  role: "admin",
});

function createUser({ name, age, active = true, verified = false, role = "viewer" } = {}) {
  return { name, age, active, verified, role };
}
```

### Overloaded Functions (Multiple Signatures)

```js
function createElement(tag, propsOrChildren, children) {
  // Check argument types to determine what was passed
  if (typeof propsOrChildren === "string" || Array.isArray(propsOrChildren)) {
    // createElement("div", "Hello") — no props
    return { tag, props: {}, children: propsOrChildren };
  }
  // createElement("div", { class: "box" }, "Hello") — with props
  return { tag, props: propsOrChildren || {}, children };
}
```

### Validation with Defaults

```js
function fetchData(url, { 
  method = "GET", 
  timeout = 5000,
  retries = 3,
  headers = {},
} = {}) {
  if (!url) throw new Error("URL is required");
  if (timeout < 0) throw new RangeError("Timeout must be positive");
  
  console.log(`${method} ${url} (timeout: ${timeout}ms, retries: ${retries})`);
  // ... actual fetch logic ...
}

fetchData("/api/users");
// "GET /api/users (timeout: 5000ms, retries: 3)"

fetchData("/api/users", { method: "POST", timeout: 10000 });
// "POST /api/users (timeout: 10000ms, retries: 3)"
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`null` doesn't trigger defaults** — Only `undefined` does. `greet(null)` uses `null`, not the default.
> 2. **Rest must be last** — `function f(...rest, last)` is a `SyntaxError`.
> 3. **Destructured parameter without `= {}`** — Calling with no arguments throws `TypeError`.
> 4. **`arguments` is NOT an array** — Can't call `.map()`, `.filter()`, etc. directly.
> 5. **Arrow functions have no `arguments`** — Use rest parameters instead.
> 6. **Default expressions run at call time** — Side effects in defaults happen on every call where the default is used.
> 7. **Too few arguments is NOT an error** — JavaScript silently uses `undefined` for missing args.

---

## Related Topics

- [[02 - Function Forms]] — Different ways to define functions
- [[04 - Scope]] — How parameter variables are scoped
- [[06 - Closures]] — Default values and closures can interact
- [[07 - Objects Foundations]] — Destructuring in parameters mirrors object destructuring

---

**Navigation:**
← [[02 - Function Forms]] | [[01 - Phase 3 - Overview]] | [[04 - Scope]] →
