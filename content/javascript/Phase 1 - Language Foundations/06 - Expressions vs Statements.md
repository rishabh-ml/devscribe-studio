---
title: "Expressions vs Statements"
phase: 1
topic: "Expressions and Statements"
tags:
  - phase1
  - fundamentals
  - expressions
  - statements
created: 2026-03-02
---

# Expressions vs Statements

> [!info] The Big Picture
> This distinction seems academic but is **practically critical**. It determines where you can use arrow functions, ternaries, template literals, and JSX. If you've ever wondered why `if` can't go inside a template literal but a ternary can — this is why.

---

## 📌 The Core Difference

| | Expression | Statement |
|---|---|---|
| **Does what?** | **Produces a value** | **Performs an action** |
| **Can be used in** | Anywhere a value is expected | Only as standalone instructions |
| **Examples** | `2 + 3`, `x > 5 ? "yes" : "no"` | `if (...)`, `for (...)`, `let x = 5` |

> [!quote] Simple Rule
> If you can assign it to a variable, pass it to a function, or put it in a template literal — it's an **expression**. If you can't — it's a **statement**.

---

## 🟢 Expressions (Produce Values)

Every expression resolves to a single value.

```javascript
// Literal expressions
42                          // → 42
"hello"                     // → "hello"
true                        // → true

// Arithmetic expressions
2 + 3                       // → 5
10 * (4 - 1)                // → 30

// String expressions
"Hello" + " " + "World"    // → "Hello World"
`Age: ${25 + 1}`           // → "Age: 26"

// Logical expressions
true && "yes"               // → "yes"
null ?? "default"           // → "default"

// Comparison expressions
5 > 3                       // → true
x === y                     // → true or false

// Ternary expression (conditional EXPRESSION — not statement!)
const label = age >= 18 ? "Adult" : "Minor";  // → "Adult" or "Minor"

// Function expression
const add = function(a, b) { return a + b; };  // → function value

// Arrow function expression
const double = x => x * 2;  // → function value

// Assignment expression (yes, assignment RETURNS a value!)
let x;
console.log(x = 5);         // → 5 (logs 5, also assigns 5 to x)

// Call expression
Math.max(1, 5, 3)           // → 5
[1, 2, 3].map(x => x * 2)  // → [2, 4, 6]

// Object/Array expressions
({ name: "Alice" })         // → object value
[1, 2, 3]                   // → array value

// typeof expression
typeof "hello"              // → "string"

// Comma expression
(1, 2, 3)                   // → 3 (evaluates all, returns last)
```

---

## 🔴 Statements (Perform Actions)

Statements are instructions that **do** something but don't produce a value you can use.

```javascript
// Variable declaration statements
let x = 5;
const name = "Alice";
var old = true;

// Control flow statements
if (x > 3) {
    // do something
}

if (x > 0) {
    console.log("positive");
} else if (x < 0) {
    console.log("negative");
} else {
    console.log("zero");
}

// Loop statements
for (let i = 0; i < 10; i++) { }
while (condition) { }
do { } while (condition);
for (const item of array) { }
for (const key in object) { }

// Switch statement
switch (action) {
    case "save": save(); break;
    case "load": load(); break;
    default: error();
}

// Function declaration statement
function greet(name) {
    return `Hello, ${name}`;
}

// Class declaration statement
class Animal {
    constructor(name) {
        this.name = name;
    }
}

// throw statement
throw new Error("Something went wrong");

// try/catch/finally statement
try { riskyOperation(); }
catch (err) { handleError(err); }
finally { cleanup(); }

// return statement
return value;

// break / continue statements
break;
continue;

// import/export statements
import { something } from './module.js';
export const myFunc = () => {};
```

---

## 🎯 Why This Matters in Practice

### 1. Template Literals Only Accept Expressions

```javascript
const name = "Alice";
const age = 25;

// ✅ Expressions work inside ${ }
`Hello, ${name}!`                       // String expression
`Status: ${age >= 18 ? "Adult" : "Minor"}`  // Ternary expression
`Items: ${[1,2,3].join(", ")}`          // Method call expression

// ❌ Statements DON'T work inside ${ }
// `Status: ${if (age >= 18) "Adult"}`  // SyntaxError!
// `Items: ${for (let i...)}`            // SyntaxError!
```

### 2. Arrow Functions with Implicit Return

Arrow functions without `{ }` implicitly return an **expression**:

```javascript
// ✅ Expression body — implicit return
const double = x => x * 2;              // returns the expression x * 2
const greet = name => `Hi, ${name}`;     // returns the expression

// ❌ Statement body — needs explicit return
const double = x => { return x * 2; };  // must use return
const greet = name => { 
    if (!name) return "Hi, stranger";    // if is a statement
    return `Hi, ${name}`;
};

// ⚠️ Returning an object literal? Wrap in parentheses!
const makeUser = name => ({ name, active: true });  // ✅
// const makeUser = name => { name, active: true };  // ❌ {} is a block!
```

### 3. React JSX Only Accepts Expressions

```javascript
// ✅ Expressions work in JSX
<div>{isLoggedIn ? <Dashboard /> : <Login />}</div>
<ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>
<p>{count > 0 && <span>{count} items</span>}</p>

// ❌ Statements don't work in JSX
// <div>{if (isLoggedIn) <Dashboard />}</div>  // SyntaxError!
// <ul>{for (const item of items) ...}</ul>    // SyntaxError!
```

### 4. Ternary vs If/Else

```javascript
// Ternary is an expression — can be used inline
const message = status === "ok" ? "Success" : "Error";
console.log(`Result: ${x > 0 ? "positive" : "negative"}`);
const fees = isMember ? "$2.00" : "$10.00";

// If/else is a statement — requires separate variable
let message;
if (status === "ok") {
    message = "Success";
} else {
    message = "Error";
}

// Don't nest ternaries! Use if/else for complex logic
// ❌ Hard to read:
// const x = a ? b ? c : d : e ? f : g;
// ✅ Use if/else for complex branching
```

---

## 🔄 Expression Statements

Some expressions can stand alone as statements:

```javascript
// These are expressions used as statements
x = 5;                  // Assignment expression as a statement
myFunction();            // Call expression as a statement
console.log("hello");   // Call expression as a statement
x++;                     // Increment expression as a statement
delete obj.prop;         // Delete expression as a statement
```

---

## 📊 Quick Reference

```
Can I do this?                     Expression?  Statement?
─────────────────────────────────  ──────────  ──────────
Put it in ${ template } ?          ✅ Yes       ❌ No
Use it after => without { } ?      ✅ Yes       ❌ No
Pass it as function argument?      ✅ Yes       ❌ No
Assign it to a variable?           ✅ Yes       ❌ No
Use it in JSX { }?                 ✅ Yes       ❌ No
```

---

## 🔗 Related Topics

- [[05 - Operators]] — Operators create expressions
- [[04 - Type Conversion and Coercion]] — Expressions can trigger coercion
- [[02 - Function Forms]] — Expression vs declaration forms of functions

---

**← Previous:** [[05 - Operators]] | **Next →** [[07 - Numbers and Math]]
