---
title: Hoisting
phase: 3
topic: Hoisting
tags: [javascript, hoisting, tdz, temporal-dead-zone, var, let, const, declarations, interview]
created: 2025-01-15
---

# Hoisting

> [!info] **Big Picture**
> Hoisting is JavaScript's behavior of **processing declarations before executing code**. During compilation, the engine registers all variable and function declarations in their respective scopes. This means some declarations are "available" before their line in the code — but the rules differ dramatically between `var`, `let`/`const`, function declarations, function expressions, and classes. Understanding hoisting eliminates an entire category of confusing bugs.

---

## What Hoisting Really Is

Hoisting is **not** the engine physically moving your code to the top of the file. It's the result of how JavaScript's two-phase execution works:

1. **Creation Phase (Compilation)** — The engine scans the code, finds all declarations, and registers them in the appropriate scope
2. **Execution Phase** — The engine runs the code line by line

What gets "hoisted" depends on the declaration type.

---

## `var` Hoisting

`var` declarations are hoisted and **initialized to `undefined`**.

```js
console.log(x); // undefined — not an error!
var x = 5;
console.log(x); // 5
```

What the engine effectively sees:

```js
var x;           // Declaration hoisted and initialized to undefined
console.log(x);  // undefined
x = 5;           // Assignment stays in place
console.log(x);  // 5
```

### `var` in Functions

```js
function example() {
  console.log(a); // undefined — hoisted to function top
  if (false) {
    var a = 10;   // even though this never runs, var is still hoisted!
  }
  console.log(a); // undefined
}
example();
```

> [!warning] **The Trap**
> `var` is hoisted even from blocks that never execute (like `if (false)`). The declaration is registered; the assignment is skipped.

---

## `let` and `const` Hoisting — The Temporal Dead Zone

`let` and `const` **are hoisted** (the engine knows about them), but they are **NOT initialized**. Accessing them before their declaration line throws a `ReferenceError`. The period between the start of the scope and the declaration line is called the **Temporal Dead Zone (TDZ)**.

```js
// ┌─── TDZ for `x` starts here ───┐
// │                                │
console.log(x); // ❌ ReferenceError: Cannot access 'x' before initialization
// │                                │
let x = 5;      // ← TDZ ends here │
// └────────────────────────────────┘
console.log(x); // 5 ✅
```

### Proving `let` is Hoisted

```js
let x = "outer";

function test() {
  // If `let x` below were NOT hoisted, this would print "outer"
  // But it throws, proving the engine KNOWS about the inner x
  console.log(x); // ❌ ReferenceError — TDZ!
  let x = "inner";
}
test();
```

> [!note] **TDZ Exists for Safety**
> The TDZ catches the bug of using a variable before it's defined. With `var`, you'd silently get `undefined` — with `let`/`const`, you get a clear error.

### `const` Requires Immediate Assignment

```js
const a;     // ❌ SyntaxError: Missing initializer in const declaration
const b = 5; // ✅ Must be assigned at declaration
```

---

## Function Declaration Hoisting

Function declarations are **fully hoisted** — both the name AND the function body.

```js
// ✅ This works! Function declarations are fully hoisted
greet("Alice"); // "Hello, Alice!"

function greet(name) {
  return `Hello, ${name}!`;
}
```

This is the only type of hoisting where you can safely use the value before its declaration line.

### Function Declarations in Blocks (Don't Do This)

```js
// ⚠️ Behavior varies between engines and strict/non-strict mode!
if (true) {
  function blockFn() {
    return "I exist";
  }
}

blockFn(); // May or may not work depending on engine/mode

// ✅ Instead, use a variable:
let blockFn;
if (true) {
  blockFn = function() {
    return "I exist";
  };
}
```

> [!danger] **Never put function declarations inside blocks** (`if`, `for`, etc.). The behavior is inconsistent across environments. Use function expressions or arrow functions assigned to `let`/`const` instead.

---

## Function Expression and Arrow Function Hoisting

Function expressions and arrow functions follow the hoisting rules of **their variable** (`var`, `let`, or `const`).

```js
// With var — hoisted as undefined, but NOT callable
console.log(greet); // undefined
greet("Alice");     // ❌ TypeError: greet is not a function
var greet = function(name) {
  return `Hello, ${name}!`;
};

// With let — TDZ applies
greet("Alice");     // ❌ ReferenceError: Cannot access 'greet' before initialization
let greet = function(name) {
  return `Hello, ${name}!`;
};

// With const — same TDZ behavior
add(2, 3);          // ❌ ReferenceError
const add = (a, b) => a + b;
```

> [!tip] **The Difference Matters**
> ```js
> // Function declaration — WORKS before its line
> getName(); // "Alice"
> function getName() { return "Alice"; }
> 
> // Function expression — DOES NOT work before its line
> getName(); // ❌ TypeError or ReferenceError
> const getName = function() { return "Alice"; };
> ```

---

## Class Hoisting

Classes are hoisted like `let`/`const` — they're in the **TDZ** until the declaration.

```js
// ❌ ReferenceError: Cannot access 'User' before initialization
const u = new User("Alice");

class User {
  constructor(name) {
    this.name = name;
  }
}
```

This applies to both class declarations and class expressions:

```js
// Class declaration — TDZ
const u = new User(); // ❌ ReferenceError
class User {}

// Class expression with const — TDZ
const u = new Animal(); // ❌ ReferenceError
const Animal = class {};

// Class expression with var — hoisted as undefined
const u = new Animal(); // ❌ TypeError: Animal is not a constructor
var Animal = class {};
```

---

## Complete Hoisting Rules Table

| Declaration | Hoisted? | Initialized? | Usable Before Declaration? |
|---|---|---|---|
| `var x = 5` | ✅ Yes | ✅ As `undefined` | ⚠️ Yes, but value is `undefined` |
| `let x = 5` | ✅ Yes | ❌ TDZ | ❌ ReferenceError |
| `const x = 5` | ✅ Yes | ❌ TDZ | ❌ ReferenceError |
| `function f() {}` | ✅ Yes | ✅ Fully (name + body) | ✅ Yes, fully callable |
| `var f = function() {}` | ✅ Yes | ✅ As `undefined` | ❌ TypeError (not a function) |
| `const f = () => {}` | ✅ Yes | ❌ TDZ | ❌ ReferenceError |
| `class C {}` | ✅ Yes | ❌ TDZ | ❌ ReferenceError |
| `import x from '...'` | ✅ Yes | ✅ Fully | ✅ Yes (live binding) |

---

## Hoisting Priority (Same Scope)

When both a function declaration and a `var` have the same name:

```js
console.log(typeof foo); // "function" — function wins over var

var foo = "string";
function foo() { return "function"; }

console.log(typeof foo); // "string" — assignment overrides
```

**Rule**: Function declarations are hoisted **above** `var` declarations. But the assignment (`var foo = "string"`) still happens at its line position.

### Multiple Function Declarations

```js
foo(); // "second" — the LAST declaration wins

function foo() { console.log("first"); }
function foo() { console.log("second"); }
```

---

## Real-World Implications

### Pattern: Organize Code with Hoisted Functions

```js
// ✅ This pattern works because function declarations are fully hoisted
// Put the "main" logic at the top for readability

initialize();

function initialize() {
  const data = loadConfig();
  setupUI(data);
  attachEvents();
}

function loadConfig() {
  // ...implementation details below
}

function setupUI(config) {
  // ...implementation details below
}

function attachEvents() {
  // ...implementation details below
}
```

### Anti-Pattern: Relying on `var` Hoisting

```js
// ❌ Don't do this — confusing and bug-prone
function processData(items) {
  for (var i = 0; i < items.length; i++) {
    // process items[i]
  }
  console.log(i); // items.length — var leaked out of the loop!
  
  // ✅ With let, i is gone after the loop
}
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`var` = `undefined`, not an error** — Using `var` before assignment gives `undefined`, not an error. This hides bugs.
> 2. **Function expressions are NOT fully hoisted** — `var fn = function(){}` hoists `fn` as `undefined`, not as a function.
> 3. **TDZ is temporal, not spatial** — It's about execution order, not position in code:
>    ```js
>    function check() {
>      return x; // This line is ABOVE the let, but doesn't run before it
>    }
>    let x = 42;
>    check(); // 42 ✅ — no TDZ error because check() runs AFTER let x
>    ```
> 4. **`typeof` in the TDZ** — `typeof undeclaredVar` returns `"undefined"` safely, but `typeof letVar` (in TDZ) throws `ReferenceError`.
> 5. **Function declarations in blocks** — Behavior is inconsistent across engines. Avoid it.

---

## 💼 Common Interview Questions

**Q1: What will this output?**
```js
console.log(a);
console.log(b);
var a = 1;
let b = 2;
```
> **Answer:** `undefined` for `a` (var is hoisted with value `undefined`), then `ReferenceError` for `b` (`let` is in the TDZ until its declaration is reached).

**Q2: Why does this work?**
```js
greet(); // "Hello!"
function greet() { console.log("Hello!"); }
```
> **Answer:** Function **declarations** are fully hoisted — both the name and the body are moved to the top of the scope. They can be called before they appear in code.

**Q3: What's the Temporal Dead Zone?**
> The TDZ is the period between entering a scope and the point where a `let`/`const` variable is declared. During this time, the variable exists but accessing it throws a `ReferenceError`. It prevents using variables before they’re explicitly initialized.

**Q4: What's the difference between these two?**
```js
// Version A
var fn = function() { return 1; };
// Version B
function fn() { return 1; }
```
> **Version B** (function declaration) is fully hoisted. **Version A** (function expression assigned to var) only hoists the variable name as `undefined` — calling `fn()` before the assignment throws `TypeError: fn is not a function`.

**Q5: Are classes hoisted?**
> Yes, but like `let`/`const`, they enter the TDZ. You cannot use a class before its declaration: `new MyClass()` before `class MyClass {}` throws `ReferenceError`.

---

## 🎯 Practice Exercises

1. **Prediction Challenge** — Write 5 snippets mixing `var`, `let`, `const`, function declarations, and function expressions. Predict the output before running each one.
2. **TDZ Explorer** — Create a snippet that triggers a TDZ `ReferenceError` with `let`. Then modify it so the same code runs without error by reordering statements.
3. **Hoisting Rewrite** — Take a working script that uses `var` and relies on hoisting. Refactor it to use `let`/`const` without changing behavior. Document which changes were needed.
4. **typeof in TDZ** — Demonstrate the difference between `typeof undeclaredVar` (safe) and `typeof tdzVar` (throws) with code examples.
5. **Block-Scoped Functions** — Write a function declaration inside an `if` block. Test in Chrome vs Node.js. Document the inconsistency and rewrite using a function expression.

---

## Related Topics

- [[02 - Variables and Declarations]] — `var`, `let`, `const` fundamentals and TDZ
- [[04 - Scope]] — Hoisting happens within scope boundaries
- [[02 - Function Forms]] — Different function types have different hoisting behavior
- [[06 - Closures]] — Understanding hoisting is prerequisite for closures

---

**Navigation:**
← [[04 - Scope]] | [[01 - Phase 3 - Overview]] | [[06 - Closures]] →
