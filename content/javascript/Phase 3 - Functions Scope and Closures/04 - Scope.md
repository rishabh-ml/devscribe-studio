---
title: Scope
phase: 3
topic: Scope
tags: [javascript, scope, lexical-scope, block-scope, function-scope, scope-chain, module-scope, interview]
created: 2025-01-15
---

# Scope

> [!info] **Big Picture**
> Scope determines **where a variable is accessible** in your code. It is the fundamental mechanism that prevents naming collisions, enables data privacy, and makes closures possible. JavaScript uses **lexical (static) scoping** — a function's scope is determined by where it is **written** in the source code, not where it is called. Understanding scope is prerequisite for understanding closures, hoisting, and modules.

---

## What Is Scope?

Scope is the **set of rules** that determines how the JavaScript engine looks up variables by name. When you reference a variable, the engine searches through a hierarchy of scopes to find it.

```js
const global = "I'm global";

function outer() {
  const outerVar = "I'm in outer";

  function inner() {
    const innerVar = "I'm in inner";
    console.log(innerVar);  // ✅ found in current scope
    console.log(outerVar);  // ✅ found in outer scope
    console.log(global);    // ✅ found in global scope
  }

  inner();
  console.log(innerVar);    // ❌ ReferenceError — not accessible here
}

outer();
console.log(outerVar);      // ❌ ReferenceError — not accessible here
```

---

## Types of Scope

### 1. Global Scope

Variables declared outside any function or block. Accessible **everywhere**.

```js
// In a script (not a module)
var globalVar = "var global";
let globalLet = "let global";
const globalConst = "const global";

// Without any keyword (implicit global — NEVER DO THIS)
function leaky() {
  leaked = "I'm accidentally global"; // attaches to window/globalThis
}
leaky();
console.log(leaked); // "I'm accidentally global" 😱
```

> [!danger] **Don't Pollute the Global Scope**
> - Every global variable can clash with other scripts
> - Use modules (`import`/`export`) for isolation
> - Use `"use strict"` to prevent accidental globals
> ```js
> "use strict";
> function safe() {
>   leaked = "nope"; // ❌ ReferenceError in strict mode!
> }
> ```

### 2. Function Scope

Variables declared with `var` are scoped to the **enclosing function**. They are accessible anywhere within that function, regardless of blocks.

```js
function example() {
  var x = 10;

  if (true) {
    var y = 20; // var is NOT block-scoped — still function-scoped
    console.log(x); // 10 ✅
  }

  console.log(y); // 20 ✅ — y is accessible here because var is function-scoped
}

console.log(x); // ❌ ReferenceError — function scope ends here
```

### 3. Block Scope (ES2015+)

Variables declared with `let` and `const` are scoped to the **nearest enclosing block** `{ }` — `if`, `for`, `while`, or any standalone block.

```js
function example() {
  let a = 1;

  if (true) {
    let b = 2;
    const c = 3;
    console.log(a); // 1 ✅ — outer block accessible
    console.log(b); // 2 ✅
    console.log(c); // 3 ✅
  }

  console.log(b); // ❌ ReferenceError — b only exists inside the if block
  console.log(c); // ❌ ReferenceError — same for c
}
```

### The Classic `var` vs `let` in Loops

```js
// ❌ var — shared across all iterations
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 3, 3, 3 — all callbacks share the same `i`

// ✅ let — new binding per iteration
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 0, 1, 2 — each callback has its own `i`
```

> [!tip] **Why `let` Works**
> `let` in a `for` loop creates a **new binding** for each iteration. Each closure captures a different `i`. With `var`, there's only ONE `i` shared across all iterations, and it's `3` by the time the callbacks run.

### 4. Module Scope

In ES modules, top-level variables are scoped to the **module**, not the global scope.

```js
// module.js
const secret = "only in this module"; // NOT global

export function getSecret() {
  return secret; // accessible within the module
}
```

```js
// main.js
import { getSecret } from "./module.js";

console.log(getSecret()); // "only in this module"
console.log(secret);      // ❌ ReferenceError — not accessible
```

---

## Lexical (Static) Scope

JavaScript uses **lexical scoping**: a function's scope is determined by **where it is defined** in the source code, not where it is called.

```js
const x = "global";

function outer() {
  const x = "outer";

  function inner() {
    console.log(x); // Where was inner WRITTEN? Inside outer. So x = "outer"
  }

  return inner;
}

const fn = outer();
fn(); // "outer" — NOT "global"
// Even though fn() is called in the global scope,
// inner() was DEFINED inside outer(), so it uses outer's x
```

> [!quote] **Key Rule**
> "Scope is determined at **author time** (where you write the code), not at **runtime** (where you call the function)."

### Lexical Scope vs Dynamic Scope

```
Lexical scope (JavaScript):  "Where was the function WRITTEN?"
Dynamic scope (not JS):      "Where was the function CALLED?"
```

JavaScript **always** uses lexical scope. This is what makes closures predictable.

---

## The Scope Chain

When the engine needs to resolve a variable, it walks **outward** through nested scopes until it finds a match or reaches the global scope.

```js
const a = "global a";

function first() {
  const b = "first b";

  function second() {
    const c = "second c";

    function third() {
      console.log(c); // Found in second's scope    ✅
      console.log(b); // Found in first's scope     ✅
      console.log(a); // Found in global scope      ✅
      console.log(d); // Not found anywhere          ❌ ReferenceError
    }

    third();
  }

  second();
}

first();
```

### Scope Chain Visualization

```
third() scope:      { c }  ← not found? go up ↑
    ↓
second() scope:     { c }  ← not found? go up ↑
    ↓
first() scope:      { b }  ← not found? go up ↑
    ↓
Global scope:       { a }  ← not found? ReferenceError!
```

> [!note] **Variable Shadowing**
> When an inner scope declares a variable with the same name as an outer scope, the inner variable **shadows** (hides) the outer one:
> ```js
> const x = "global";
> 
> function example() {
>   const x = "local";   // shadows the global x
>   console.log(x);       // "local"
> }
> 
> example();
> console.log(x);         // "global" — unaffected
> ```

---

## Scope and `this`

> [!warning] **Scope ≠ `this`**
> Scope and `this` are **completely separate mechanisms**.
> - **Scope** = where variables are accessible (lexical, compile-time)
> - **`this`** = the execution context of a function (dynamic, call-time)
> 
> ```js
> const obj = {
>   name: "Alice",
>   greet() {
>     // `this` → obj (because greet is called as obj.greet())
>     // scope chain → greet's scope → global scope
>     console.log(this.name); // "Alice" — via `this`
>   },
> };
> ```
>
> See [[Phase 4 - Overview|Phase 4]] for full `this` coverage.

---

## Scope in Practice

### Encapsulating State

```js
function createCounter() {
  let count = 0; // private — only accessible inside createCounter

  return {
    increment() { count++; },
    decrement() { count--; },
    getCount() { return count; },
  };
}

const counter = createCounter();
counter.increment();
counter.increment();
counter.getCount(); // 2
// count is NOT accessible directly — fully encapsulated!
```

### Block Scoping for Safety

```js
{
  const temp = computeExpensiveValue();
  processResult(temp);
}
// temp is now gone — can't accidentally use it later
```

### `switch` Statement Block Scoping

```js
switch (action) {
  case "create": {
    // Without braces, `let` declarations would conflict between cases
    const result = createItem();
    return result;
  }
  case "delete": {
    const result = deleteItem(); // No conflict — different block
    return result;
  }
}
```

---

## Summary Table

| Scope Type | Created By | `var` Respects? | `let`/`const` Respect? |
|---|---|---|---|
| Global | Top-level code | ✅ | ✅ |
| Function | `function` keyword | ✅ | ✅ |
| Block | `{ }`, `if`, `for`, `while` | ❌ (leaks out) | ✅ |
| Module | ES module files | ✅ | ✅ |

| Concept | Meaning |
|---|---|
| Lexical scope | Scope is set where code is written |
| Scope chain | Outward lookup path from inner → global |
| Shadowing | Inner variable hides outer with same name |
| Closure | Function retaining access to its birth scope |

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`var` ignores block scope** — `var` in an `if` or `for` leaks into the function scope
> 2. **Accidental globals** — Assigning to an undeclared variable creates a global (use `"use strict"`)
> 3. **`var` in loops** — All iterations share the same variable (use `let`)
> 4. **Shadowing confusion** — An inner `let x` hides outer `x`; modifications don't affect the outer variable
> 5. **Scope ≠ `this`** — They are unrelated concepts. Don't confuse variable lookup with `this` binding.

---

## 💼 Common Interview Questions

**Q1: What is the difference between lexical scope and dynamic scope?**
> JavaScript uses **lexical (static) scope** — scope is determined by where a function is **written**, not where it is **called**. Dynamic scope (used by some languages like Bash) resolves variables based on the call stack.

**Q2: What will this output?**
```js
var x = 1;
function foo() {
  console.log(x);
  var x = 2;
}
foo();
```
> **Answer:** `undefined` — `var x` inside `foo` is hoisted to the top of the function scope, shadowing the outer `x`. At the time of `console.log`, the local `x` exists but hasn't been assigned yet.

**Q3: Explain the scope chain.**
> When a variable is referenced, the engine searches the current scope first, then moves outward through each enclosing scope until it reaches the global scope. If not found anywhere, a `ReferenceError` is thrown. This chain is defined at **write-time** (lexical), not at runtime.

**Q4: What's the difference between block scope and function scope?**
> `let` and `const` are **block-scoped** — they exist only within the nearest `{ }` (if, for, standalone block). `var` is **function-scoped** — it ignores blocks and is scoped to the nearest function (or global). This is why `var` in a `for` loop leaks.

**Q5: How does `"use strict"` affect scope?**
> In strict mode, assigning to an undeclared variable throws a `ReferenceError` instead of silently creating a global. It also prevents `with` statements (which dynamically modify scope) and makes `eval` run in its own scope.

---

## 🎯 Practice Exercises

1. **Scope Identifier** — Write 5 code snippets each demonstrating: global scope, function scope, block scope, module scope, and the scope chain. Predict the output before running.
2. **Shadow Hunt** — Create a nested function where an inner variable shadows an outer one. Log both the inner and outer values to prove they are independent.
3. **IIFE Encapsulation** — Use an IIFE to create a mini-module that exposes a public API but keeps internal variables private.
4. **Loop Scope Fix** — Write a `for` loop with `var` that logs `0, 1, 2` after a `setTimeout`. Then fix it using (a) `let`, (b) an IIFE, (c) `forEach`.
5. **Strict Mode Audit** — Take a sloppy-mode script that accidentally creates globals and convert it to strict mode. Fix all errors that arise.

---

## Related Topics

- [[02 - Variables and Declarations]] — `var`, `let`, `const` and their scope behavior
- [[05 - Hoisting]] — How declarations are processed before execution
- [[06 - Closures]] — The natural consequence of lexical scope + first-class functions
- [[02 - Function Forms]] — Different function types and their scoping implications

---

**Navigation:**
← [[03 - Parameters and Arguments]] | [[01 - Phase 3 - Overview]] | [[05 - Hoisting]] →
