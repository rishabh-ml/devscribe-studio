---
title: The this Keyword
phase: 4
topic: The this Keyword
tags: [javascript, this, binding, call, apply, bind, arrow-functions, context, interview]
created: 2025-01-15
---

# The `this` Keyword — Every Rule

> [!info] **Big Picture**
> `this` is **not** static — its value is determined by **how a function is called**, not where it is written (except for arrow functions). There are exactly **five binding rules**, and they have a clear priority order. Once you know these rules, `this` is never confusing again.

---

## The Five Binding Rules

### Rule 1: Default Binding (Standalone Function Call)

When a function is called without any object, `new`, or explicit binding:

```js
function showThis() {
  console.log(this);
}

showThis(); // window (browser, non-strict) / globalThis (Node)

// In strict mode:
"use strict";
function showThisStrict() {
  console.log(this);
}
showThisStrict(); // undefined
```

> [!warning] **Strict mode changes `this`** from `globalThis` to `undefined` for standalone function calls. Modules are always in strict mode.

### Rule 2: Implicit Binding (Method Call)

When a function is called as a method of an object, `this` is the object **before the dot**.

```js
const user = {
  name: "Alice",
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  },
};

user.greet(); // "Hi, I'm Alice" — this = user (object before the dot)
```

#### Implicit Binding is Lost When Extracted

```js
const user = {
  name: "Alice",
  greet() {
    console.log(this.name);
  },
};

const fn = user.greet; // extract the method
fn(); // undefined (or error in strict mode)
// `fn()` is a standalone call → default binding, NOT implicit
```

```js
// Same problem with callbacks:
const user = {
  name: "Alice",
  greet() { console.log(this.name); },
};

setTimeout(user.greet, 100); // undefined — greet is extracted, losing `this`

// Fix: wrap in arrow function or bind
setTimeout(() => user.greet(), 100);        // "Alice" ✅
setTimeout(user.greet.bind(user), 100);     // "Alice" ✅
```

### Rule 3: Explicit Binding (`call`, `apply`, `bind`)

Manually set `this` using `call()`, `apply()`, or `bind()`.

#### `call(thisArg, arg1, arg2, ...)`

Invokes the function immediately with a specified `this` and arguments.

```js
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const user = { name: "Alice" };

greet.call(user, "Hello", "!");    // "Hello, Alice!"
greet.call(user, "Hey", "...");    // "Hey, Alice..."
```

#### `apply(thisArg, [argsArray])`

Like `call`, but arguments are passed as an **array**.

```js
greet.apply(user, ["Hi", "?"]);    // "Hi, Alice?"

// Useful when you have an array of arguments
const args = ["Howdy", "!"];
greet.apply(user, args);           // "Howdy, Alice!"
```

> [!tip] **`call` vs `apply` Mnemonic**
> - **C**all = **C**omma-separated arguments
> - **A**pply = **A**rray of arguments
> 
> In modern JS, you can always use `call` with spread: `fn.call(obj, ...args)`

#### `bind(thisArg, ...args)`

Returns a **new function** permanently bound to `thisArg`. Does NOT invoke immediately.

```js
const user = { name: "Alice" };

function greet() {
  console.log(`Hi, ${this.name}`);
}

const boundGreet = greet.bind(user);
boundGreet(); // "Hi, Alice"

// bind can also pre-fill arguments (partial application)
function add(a, b) {
  return a + b;
}
const add5 = add.bind(null, 5);
add5(3); // 8
```

> [!note] **`bind` is permanent**
> Once bound, `this` cannot be re-bound:
> ```js
> const bound = greet.bind(user);
> const reBound = bound.bind({ name: "Bob" }); // ignored!
> reBound(); // "Hi, Alice" — still uses original binding
> ```

### Rule 4: `new` Binding (Constructor Call)

When a function is called with `new`, `this` is the newly created object.

```js
function User(name) {
  // `this` = new empty object {}
  this.name = name;
  this.greet = function() {
    console.log(`Hi, I'm ${this.name}`);
  };
  // implicit: return this
}

const alice = new User("Alice");
alice.greet(); // "Hi, I'm Alice"
// `this` inside User was the new alice object
```

See [[04 - Constructor Functions]] for the full 5-step process.

### Rule 5: Arrow Function Binding (Lexical `this`)

Arrow functions **do not have their own `this`**. They inherit `this` from the **enclosing lexical scope** at the time they are defined.

```js
const user = {
  name: "Alice",
  
  // Regular method — gets its own `this`
  regularGreet() {
    console.log(this.name); // "Alice"
    
    // Arrow function — inherits `this` from regularGreet
    const inner = () => {
      console.log(this.name); // "Alice" — same `this` as regularGreet
    };
    inner();
  },

  // Arrow as method — `this` is enclosing scope (NOT user)
  arrowGreet: () => {
    console.log(this.name); // undefined — `this` is the module/global scope
  },
};

user.regularGreet(); // "Alice", "Alice"
user.arrowGreet();   // undefined
```

> [!danger] **Never use arrow functions as object methods**
> Arrow functions as methods don't get `this` as the object — they get `this` from wherever the object was created (usually global/module scope).

---

## Binding Priority

When multiple rules could apply, they follow this precedence (highest to lowest):

```
1. new binding           → newly created object
2. Explicit binding      → call/apply/bind specified object
3. Implicit binding      → object before the dot
4. Default binding       → globalThis / undefined (strict)

Arrow functions: ALWAYS lexical (ignores all other rules)
```

```js
function foo() {
  console.log(this.a);
}

const obj1 = { a: 1, foo };
const obj2 = { a: 2, foo };

// Implicit vs explicit: explicit wins
obj1.foo.call(obj2); // 2 — explicit (call) beats implicit (obj1.)

// new vs implicit: new wins
function Bar(val) { this.a = val; }
const obj = { a: "obj", Bar };
const baz = new obj.Bar("new"); // new wins
console.log(baz.a); // "new"
```

---

## `this` in Event Handlers

```js
const button = document.querySelector("button");

// Regular function — `this` is the element
button.addEventListener("click", function(event) {
  console.log(this);         // <button> element
  console.log(event.target); // <button> element (same)
  this.classList.toggle("active");
});

// Arrow function — `this` is the enclosing scope (NOT the element)
button.addEventListener("click", (event) => {
  console.log(this);         // window / module scope
  event.target.classList.toggle("active"); // use event.target instead
});
```

> [!tip] **In event handlers:**
> - Use **regular functions** if you need `this` to be the element
> - Use **arrow functions** if you need `this` to be the component/class instance (common in React)

---

## `this` in Classes

```js
class Timer {
  seconds = 0;

  start() {
    // ❌ Regular function in setInterval — `this` is NOT the Timer instance
    // setInterval(function() { this.seconds++; }, 1000); 

    // ✅ Arrow function — `this` inherits from start(), which IS the Timer
    setInterval(() => {
      this.seconds++;
      console.log(this.seconds);
    }, 1000);
  }
}

const t = new Timer();
t.start(); // 1, 2, 3, ...
```

### Class Method Extraction Problem

```js
class Logger {
  prefix = "[LOG]";

  log(message) {
    console.log(`${this.prefix} ${message}`);
  }
}

const logger = new Logger();
logger.log("hello"); // "[LOG] hello" ✅

const fn = logger.log;
fn("hello"); // ❌ TypeError: Cannot read properties of undefined (this.prefix)

// Solutions:
// 1. Bind in constructor
class Logger1 {
  constructor() { this.log = this.log.bind(this); }
  log(message) { console.log(`${this.prefix} ${message}`); }
}

// 2. Class field with arrow function (modern, recommended)
class Logger2 {
  prefix = "[LOG]";
  log = (message) => {
    console.log(`${this.prefix} ${message}`);
  };
}

const logger2 = new Logger2();
const fn2 = logger2.log;
fn2("hello"); // "[LOG] hello" ✅ — arrow function preserves `this`
```

---

## `globalThis` (ES2020)

`globalThis` provides a universal way to access the global object across environments:

```js
// Browser: globalThis === window
// Node.js:  globalThis === global
// Workers:  globalThis === self

console.log(globalThis); // works everywhere
```

---

## Quick Reference Table

| Call Style | `this` Value | Example |
|---|---|---|
| Standalone | `globalThis` (non-strict) / `undefined` (strict) | `fn()` |
| Method | Object before the dot | `obj.fn()` |
| `call`/`apply` | First argument | `fn.call(obj)` |
| `bind` | Permanently bound | `const bound = fn.bind(obj)` |
| `new` | Newly created object | `new Fn()` |
| Arrow function | Enclosing scope's `this` | `() => this` |
| Event handler (regular) | The DOM element | `el.addEventListener('click', fn)` |
| Event handler (arrow) | Enclosing scope's `this` | `el.addEventListener('click', () => {})` |

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Method extraction** — `const fn = obj.method; fn()` loses `this`
> 2. **Callbacks lose `this`** — `setTimeout(obj.method, 100)` → `this` is `undefined`
> 3. **Arrow methods on objects** — `{ greet: () => this.name }` → `this` is NOT the object
> 4. **`this` in nested functions** — Inner regular functions get their own `this` (usually `undefined` in strict mode)
> 5. **`bind` is permanent** — Can't re-bind after first `bind()`
> 6. **`call`/`apply` on arrow functions** — Setting `this` is silently ignored

---

## 💼 Common Interview Questions

**Q1: Explain `this` in JavaScript. How is it determined?**
> `this` is NOT determined by where a function is defined, but by **how it is called**. Four rules in priority order:
> 1. **`new`** → newly created object
> 2. **Explicit** (`call`/`apply`/`bind`) → specified object
> 3. **Implicit** (method call `obj.fn()`) → the object before the dot
> 4. **Default** → `globalThis` (sloppy) or `undefined` (strict)
> Arrow functions are the exception — they inherit `this` from their enclosing scope.

**Q2: What will this output?**
```js
const obj = {
  name: "Alice",
  greet: () => `Hi, ${this.name}`
};
console.log(obj.greet());
```
> **Answer:** `"Hi, undefined"` — Arrow functions don't get their own `this`. Here `this` refers to the enclosing scope (module/global), not `obj`.

**Q3: How do `call`, `apply`, and `bind` differ?**
> - `call(thisArg, a, b)` — Invokes immediately, args listed individually
> - `apply(thisArg, [a, b])` — Invokes immediately, args as array
> - `bind(thisArg, a)` — Returns a **new function** with `this` permanently set. Does NOT invoke.

**Q4: How would you fix `this` in a callback?**
```js
class Timer {
  constructor() { this.seconds = 0; }
  start() {
    setInterval(function() {
      this.seconds++; // BUG: `this` is undefined/global
    }, 1000);
  }
}
```
> Three fixes: (a) Arrow function: `setInterval(() => { this.seconds++; }, 1000)` (b) `bind`: `setInterval(function() { this.seconds++; }.bind(this), 1000)` (c) Closure: `const self = this; setInterval(function() { self.seconds++; }, 1000)`

**Q5: Can you re-bind an arrow function's `this`?**
> No. Arrow functions permanently capture `this` from their lexical scope at creation time. `call()`, `apply()`, and `bind()` are silently ignored for the `this` value.

---

## 🎯 Practice Exercises

1. **Binding Detective** — Write 6 `console.log(this)` examples: one for each binding rule (default, implicit, explicit with call/apply/bind, new, arrow). Predict the output before running.
2. **Method Extraction Fix** — Extract a method from an object, demonstrate that `this` is lost, then fix it three ways (bind, arrow, wrapper).
3. **Custom `bind`** — Implement your own `Function.prototype.myBind(thisArg, ...args)` that works like native `bind`.
4. **Event Handler `this`** — Create a button, add a click handler as a regular function (observe `this` = element), then as an arrow function (observe `this` = enclosing scope). Log both.
5. **Chaining with `this`** — Build a `QueryBuilder` class where methods like `.select()`, `.where()`, `.limit()` each return `this` to enable chaining.

---

## Related Topics

- [[02 - Function Forms]] — Arrow vs regular functions and `this`
- [[03 - Prototypes and the Prototype Chain]] — `this` and prototype method calls
- [[04 - Constructor Functions]] — `new` binding explained in detail
- [[05 - ES6 Classes]] — `this` in class methods and fields

---

**Navigation:**
← [[01 - Phase 4 - Overview]] | [[03 - Prototypes and the Prototype Chain]] →
