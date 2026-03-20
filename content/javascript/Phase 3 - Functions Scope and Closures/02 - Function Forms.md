---
title: Function Forms
phase: 3
topic: Function Forms
tags: [javascript, functions, declarations, expressions, arrow-functions, iife]
created: 2025-01-15
---

# Function Forms

> [!info] **Big Picture**
> JavaScript gives you **multiple ways** to create functions, and they are NOT interchangeable. Each form has different behavior around hoisting, `this` binding, the `arguments` object, and whether it can be used as a constructor. Choosing the right form for the right situation is a skill that separates beginners from competent developers.

---

## 1. Function Declarations

A function declaration **has a name** and is defined as a standalone statement.

```js
function greet(name) {
  return `Hello, ${name}!`;
}

greet("Alice"); // "Hello, Alice!"
```

### Key Characteristics

| Feature | Behavior |
|---|---|
| Hoisted? | **Yes — fully** (name AND body). Can be called before it appears in code |
| Has own `this`? | Yes |
| Has `arguments`? | Yes |
| Can be a constructor? | Yes (`new greet()` works, though unusual) |
| Named? | Always |

```js
// Hoisting: This works!
sayHi(); // "Hi!"

function sayHi() {
  console.log("Hi!");
}
```

> [!tip] **When to Use**
> Use function declarations for **top-level, named functions** that you want available throughout the scope. They read clearly and their hoisting makes code organization flexible.

---

## 2. Function Expressions

A function is created as part of an expression, typically assigned to a variable.

```js
const greet = function(name) {
  return `Hello, ${name}!`;
};

greet("Bob"); // "Hello, Bob!"
```

### Named vs Anonymous Function Expressions

```js
// Anonymous function expression
const add = function(a, b) {
  return a + b;
};

// Named function expression — the name is only accessible inside the function
const factorial = function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1); // 'fact' is accessible here
};

console.log(factorial(5)); // 120
console.log(typeof fact);  // "undefined" — 'fact' is NOT accessible outside
```

### Key Characteristics

| Feature | Behavior |
|---|---|
| Hoisted? | **No** — follows the variable's hoisting rules (`var` → `undefined`, `let`/`const` → TDZ) |
| Has own `this`? | Yes |
| Has `arguments`? | Yes |
| Can be a constructor? | Yes (anonymous) / Yes (named) |

```js
// ❌ This fails — function expression is NOT hoisted
greet("Alice"); // ReferenceError: Cannot access 'greet' before initialization

const greet = function(name) {
  return `Hello, ${name}!`;
};
```

> [!tip] **Named Function Expressions Are Better**
> Always prefer named function expressions over anonymous ones. The name appears in:
> - **Stack traces** (easier debugging)
> - **Self-references** (recursion without external variable)
> ```js
> // ✅ Better
> const handler = function handleClick(event) { /* ... */ };
> 
> // ❌ Worse  
> const handler = function(event) { /* ... */ };
> ```

---

## 3. Arrow Functions (`=>`)

Introduced in ES2015. Shorter syntax with fundamentally different behavior around `this`.

### Syntax Variations

```js
// Full body
const add = (a, b) => {
  return a + b;
};

// Implicit return (single expression — no braces, no return keyword)
const add = (a, b) => a + b;

// Single parameter — parentheses optional
const double = x => x * 2;

// No parameters — parentheses required
const roll = () => Math.ceil(Math.random() * 6);

// Returning an object literal — wrap in parentheses!
const makeUser = (name, age) => ({ name, age });
// Without parens: { name, age } would be a code block, not an object
```

### Key Characteristics

| Feature | Behavior |
|---|---|
| Hoisted? | **No** — follows variable hoisting rules |
| Has own `this`? | **No** — inherits `this` from enclosing lexical scope |
| Has `arguments`? | **No** — use rest parameters instead |
| Can be a constructor? | **No** — `new (() => {})` throws TypeError |
| Has `prototype`? | **No** |

### The `this` Difference — Why It Matters

```js
const timer = {
  seconds: 0,

  // ❌ Arrow function — `this` is the surrounding scope (window/undefined), NOT timer
  startBroken: function() {
    setInterval(() => {
      this.seconds++; // ✅ Arrow inherits `this` from startBroken — which IS timer
      console.log(this.seconds);
    }, 1000);
  },

  // ❌ If startBroken were an arrow too, `this` would NOT be timer
};

// The key insight:
// Arrow functions DON'T get their own `this` — they capture it from where they're WRITTEN
```

```js
// Classic problem that arrow functions solve:
function Timer() {
  this.seconds = 0;

  // ❌ Regular function — `this` inside setInterval is NOT the Timer instance
  setInterval(function() {
    this.seconds++; // `this` is `window` (or undefined in strict mode)
  }, 1000);

  // ✅ Arrow function — `this` is inherited from the Timer constructor
  setInterval(() => {
    this.seconds++; // `this` IS the Timer instance
  }, 1000);
}
```

> [!warning] **Don't Use Arrow Functions For**
> 1. **Object methods** — `this` won't be the object
>    ```js
>    const obj = {
>      name: "Alice",
>      greet: () => `Hi, ${this.name}`, // ❌ `this` is NOT obj
>    };
>    ```
> 2. **Event handlers** (when you need `this` to be the element)
>    ```js
>    button.addEventListener("click", () => {
>      this.classList.toggle("active"); // ❌ `this` is NOT the button
>    });
>    ```
> 3. **Constructors** — Arrow functions can't be used with `new`
> 4. **Methods that need `arguments`** — Arrow functions don't have it

---

## 4. IIFEs — Immediately Invoked Function Expressions

A function that runs immediately after it's defined.

```js
// Classic syntax
(function() {
  const secret = "hidden";
  console.log("IIFE ran!");
})();

// Arrow function IIFE
(() => {
  const secret = "hidden";
  console.log("Arrow IIFE ran!");
})();

// With parameters
(function(greeting) {
  console.log(greeting); // "Hello!"
})("Hello!");

// Named IIFE (useful for debugging)
(function init() {
  console.log("Initializing...");
})();
```

### Why IIFEs Exist

```js
// Before ES2015 (no let/const, no modules), IIFEs were the ONLY way to create scope

// Problem: var pollutes global scope
var counter = 0;     // conflicts with other scripts' variables

// Solution: IIFE creates a local scope
(function() {
  var counter = 0;   // hidden from global scope
  // ... all code here ...
})();
```

> [!note] **IIFEs in Modern JavaScript**
> IIFEs are **largely obsolete** thanks to:
> - `let`/`const` for block scoping
> - ES Modules for file-level scope
> 
> You'll still see them in:
> - Legacy codebases
> - Scripts that must work without a module system
> - One-off initialization in older patterns
> - Sometimes in configuration files

---

## 5. The `Function` Constructor

Creates a function from strings. **Avoid in production.**

```js
const add = new Function("a", "b", "return a + b");
add(2, 3); // 5
```

> [!danger] **Why to Avoid**
> - Functions created this way **only have access to global scope** (not lexical scope)
> - Similar security risks to `eval()`
> - Prevents engine optimizations
> - Very hard to debug
> - Only use case: dynamically generating functions from user input (rare, and usually a code smell)

---

## 6. Generator Functions

Covered in depth in [[Phase 7 - Overview|Phase 7]], but here's the basic syntax:

```js
function* count() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = count();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }
```

---

## 7. Async Functions

Covered in depth in [[Phase 5 - Overview|Phase 5]], but here's the basic syntax:

```js
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

---

## Decision Guide: Which Function Form to Use

```
Do you need `this` to be the surrounding object?
├── Yes → arrow function
└── No
    ├── Is it a standalone, reusable function?
    │   ├── Yes → function declaration
    │   └── No → 
    │       ├── Assigning to a variable? → function expression / arrow
    │       ├── Passing as a callback? → arrow (usually)
    │       └── Running immediately? → IIFE (rare in modern code)
    └── Is it an object method?
        ├── Yes → shorthand method syntax: { greet() {} }
        └── Or function expression (not arrow!)
```

> [!tip] **Practical Defaults**
> - **Top-level functions**: function declarations
> - **Callbacks / inline functions**: arrow functions
> - **Object methods**: shorthand method syntax `{ method() {} }`
> - **Methods that need `this` in nested callbacks**: use arrow functions inside regular methods

---

## Comparison Table

| Feature | Declaration | Expression | Arrow | IIFE |
|---|---|---|---|---|
| Hoisted | ✅ Fully | ❌ | ❌ | N/A |
| Own `this` | ✅ | ✅ | ❌ | ✅ |
| `arguments` | ✅ | ✅ | ❌ | ✅ |
| Constructor (`new`) | ✅ | ✅ | ❌ | ❌* |
| Implicit return | ❌ | ❌ | ✅ | ❌ |
| Typical use | Named reusable | Conditional/assigned | Callbacks | Scope isolation |

*technically possible but not meaningful

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Arrow functions and `this`** — The #1 source of bugs. If you need `this` to be dynamic, don't use an arrow function.
> 2. **Returning objects from arrows** — `() => { key: "value" }` is a code block with a label, NOT an object. Use `() => ({ key: "value" })`.
> 3. **Hoisting confusion** — `const fn = function() {}` is NOT hoisted like `function fn() {}`.
> 4. **`typeof` for functions** — `typeof function() {}` returns `"function"`, not `"object"` (even though functions ARE objects).

---

## Related Topics

- [[03 - Parameters and Arguments]] — What goes into functions
- [[04 - Scope]] — Where function variables are accessible
- [[05 - Hoisting]] — Why declaration order matters (or doesn't)
- [[06 - Closures]] — What functions remember from their birth scope
- [[07 - Higher-Order Functions]] — Functions that take or return functions

---

**Navigation:**
← [[01 - Phase 3 - Overview]] | [[03 - Parameters and Arguments]] →
