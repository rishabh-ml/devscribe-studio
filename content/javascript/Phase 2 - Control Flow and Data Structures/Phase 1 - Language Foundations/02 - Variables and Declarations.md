---
title: "Variables and Declarations"
phase: 1
topic: "Variables"
tags:
  - phase1
  - fundamentals
  - variables
  - hoisting
  - scope
  - interview
created: 2026-03-02
---

# Variables and Declarations

> [!info] The Big Picture
> Variables are **named containers for data**. JavaScript has three ways to declare them — `var`, `let`, and `const` — and understanding their differences is one of the most fundamental JavaScript concepts. Getting this wrong causes bugs that are notoriously hard to track down.

---

## 📌 What Are Variables?

A variable is a **label** that points to a value stored in memory. When you declare a variable, you're telling the JavaScript engine: "Reserve a space in memory and let me refer to it by this name."

```javascript
let username = "Alice";  // "username" is the label, "Alice" is the value
```

---

## 🔑 The Three Declaration Keywords

### `var` — The Original (ES1, 1997)

**Scope:** Function-scoped (or global if declared outside a function)
**Hoisting:** Declaration is hoisted and initialized as `undefined`
**Reassignment:** ✅ Allowed
**Redeclaration:** ✅ Allowed (in the same scope)

```javascript
// var is FUNCTION-scoped, not block-scoped
function example() {
    if (true) {
        var x = 10;
    }
    console.log(x); // 10 — x "escapes" the if block!
}

// var hoisting — declaration moves to top, value stays
console.log(name); // undefined (not an error!)
var name = "Alice";

// This is what the engine actually does:
// var name;           ← declaration hoisted
// console.log(name);  ← undefined
// name = "Alice";     ← assignment stays in place
```

> [!warning] Why Avoid `var`
> `var` leaks out of blocks (like `if`, `for`, `while`), which causes unintended side effects. It was the only option before ES2015, but **modern JavaScript should almost never use `var`**. Use `let` and `const` instead.

**Real-world problem with `var`:**

```javascript
// Classic loop bug
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 — NOT 0, 1, 2!
// Because var is function-scoped, there's only ONE i
// By the time the timeouts run, i is already 3
```

---

### `let` — Block-Scoped Variable (ES2015)

**Scope:** Block-scoped (`{ }`)
**Hoisting:** Hoisted but NOT initialized → **Temporal Dead Zone (TDZ)**
**Reassignment:** ✅ Allowed
**Redeclaration:** ❌ Not allowed in the same scope

```javascript
// let is BLOCK-scoped
if (true) {
    let y = 20;
}
// console.log(y); // ReferenceError: y is not defined

// let fixes the loop problem
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2 ✅ — each iteration gets its own i

// Temporal Dead Zone (TDZ)
// console.log(score); // ReferenceError: Cannot access 'score' before initialization
let score = 100;

// let allows reassignment
let count = 1;
count = 2; // ✅ Fine
// let count = 3; // ❌ SyntaxError: 'count' has already been declared
```

> [!tip] When to Use `let`
> Use `let` when you **need to reassign** the variable — loop counters, accumulators, values that change over time.

---

### `const` — Block-Scoped Constant (ES2015)

**Scope:** Block-scoped (`{ }`)
**Hoisting:** Hoisted but NOT initialized → **Temporal Dead Zone (TDZ)**
**Reassignment:** ❌ Not allowed
**Redeclaration:** ❌ Not allowed

```javascript
const PI = 3.14159;
// PI = 3.14; // ❌ TypeError: Assignment to constant variable

// IMPORTANT: const does NOT mean immutable!
// It prevents REASSIGNMENT of the variable, not mutation of the value
const user = { name: "Alice", age: 25 };
user.age = 26;          // ✅ This works! We're mutating the object, not reassigning
// user = { name: "Bob" }; // ❌ TypeError — can't reassign to different object

const colors = ["red", "blue"];
colors.push("green");   // ✅ Works — we're mutating the array
// colors = ["yellow"];  // ❌ Can't reassign

// To make an object truly immutable, use Object.freeze()
const frozen = Object.freeze({ name: "Alice" });
frozen.name = "Bob";     // Silently fails (or TypeError in strict mode)
console.log(frozen.name); // "Alice"
```

> [!tip] When to Use `const`
> Use `const` by default for **everything**. Only switch to `let` when you genuinely need reassignment. This makes your code easier to reason about — when you see `const`, you instantly know that variable won't change its binding.

---

## 🧊 The Temporal Dead Zone (TDZ)

The TDZ is the period between entering a scope and reaching the declaration. During this time, the variable **exists** (it's hoisted) but **cannot be accessed**.

```javascript
{
    // TDZ for `greeting` starts here ──────────────┐
    //                                               │
    // console.log(greeting); // ReferenceError      │ TDZ
    //                                               │
    const greeting = "Hello"; // TDZ ends here ─────┘
    console.log(greeting);    // "Hello" ✅
}
```

> [!question] Why Does the TDZ Exist?
> It catches the bug of using variables before they're declared. With `var`, accessing a variable before its declaration silently gives you `undefined` — a source of subtle bugs. The TDZ forces you to structure your code so variables are declared before use.

---

## 📏 Naming Conventions

| Convention | Used For | Example |
|---|---|---|
| `camelCase` | Variables, functions, methods | `userName`, `getTotal()` |
| `PascalCase` | Classes, constructors, components | `UserProfile`, `EventEmitter` |
| `UPPER_SNAKE_CASE` | True constants (values that never change) | `MAX_RETRIES`, `API_URL` |
| `_prefixed` | "Private" by convention (not enforced) | `_internalState` |
| `$prefixed` | jQuery elements, observables | `$element`, `$stream` |

**Rules:**
- Must start with a letter, `_`, or `$`
- Cannot be a [[reserved word]] (`let`, `class`, `return`, etc.)
- Are case-sensitive (`myVar` ≠ `MyVar`)
- Should be descriptive (`userAge` not `u`)

---

## 🔒 Strict Mode

```javascript
"use strict";

// Without strict mode, typos create global variables
// mistypedVariable = 10; // In sloppy mode: creates global variable
                          // In strict mode: ReferenceError ✅

// Strict mode also:
// - Prevents deleting variables: delete x; → SyntaxError
// - Prevents duplicate parameter names
// - Makes `this` in regular functions `undefined` instead of `window`
// - Prevents octal numeric literals (0123)
// - Makes eval() safer (has its own scope)
```

> [!note] Modern Code is Already Strict
> ES modules (`import`/`export`) and class bodies are automatically in strict mode. If you're writing modern JavaScript, you often don't need the `"use strict"` directive explicitly.

---

## 🌍 Real-World Use Cases

### Configuration Values → `const`
```javascript
const API_BASE_URL = "https://api.example.com/v2";
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;
```

### Loop Counters → `let`
```javascript
let totalPrice = 0;
for (let i = 0; i < cart.length; i++) {
    totalPrice += cart[i].price;
}
```

### State That Changes → `let`
```javascript
let isLoggedIn = false;
let currentPage = 1;
let retryCount = 0;
```

### Object/Array References → `const`
```javascript
const settings = { theme: "dark", fontSize: 14 };
settings.theme = "light"; // ✅ Fine — mutating, not reassigning

const items = [];
items.push("new item"); // ✅ Fine — mutating the array
```

---

## ⚠️ Common Gotchas

> [!danger] Gotcha #1: `const` with Objects
> `const` only prevents reassignment of the **variable binding**. The object/array it points to is still fully mutable. This confuses many beginners.

> [!danger] Gotcha #2: `var` in Loops
> `var` in a `for` loop does NOT create a new variable per iteration. All iterations share the same variable. This is the #1 source of closure bugs.

> [!danger] Gotcha #3: Undeclared Variables
> Assigning to a variable without `var`/`let`/`const` creates a global variable in sloppy mode. Always use `"use strict"` or ES modules to prevent this.

---

## 🧠 Mental Model

Think of variables as **labels on boxes**, not the boxes themselves:

- `const` → The label is **glued** to the box. You can't move it to another box. But you can still change what's *inside* the box (if it's an object/array).
- `let` → The label is on **Velcro**. You can peel it off and stick it on a different box.
- `var` → The label is on a **string** that can float around the entire function, even outside the block where you put it.

---

## 🎯 Practice Exercises

1. **Declaration Exploration** — Declare the same variable name with `var`, `let`, and `const` in different scopes. Log each and observe behavior differences (redeclaration, reassignment, block scope).
2. **Const Mutation** — Create a `const` array and a `const` object. Prove you can mutate their contents. Then use `Object.freeze()` to prevent mutation and observe the result.
3. **TDZ Challenge** — Write 3 code snippets that trigger a Temporal Dead Zone error with `let`/`const`. Explain why each fails.
4. **Swap Variables** — Swap two variables three ways: (a) temp variable, (b) destructuring `[a, b] = [b, a]`, (c) arithmetic (numbers only).
5. **Naming Conventions** — Create variables demonstrating camelCase, UPPER_SNAKE_CASE, PascalCase, and _privateConvention. Write a comment explaining when each is used.

---

## 🔗 Related Topics

- [[04 - Scope]] — Where variables are accessible
- [[05 - Hoisting]] — How declarations move to the top
- [[06 - Closures]] — Functions remembering their variables
- [[03 - Data Types in Depth]] — What variables hold

---

**Next →** [[03 - Data Types in Depth]]
