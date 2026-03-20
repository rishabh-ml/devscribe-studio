---
title: "Data Types in Depth"
phase: 1
topic: "Data Types"
tags:
  - phase1
  - fundamentals
  - types
  - primitives
  - reference-types
  - interview
created: 2026-03-02
---

# Data Types in Depth

> [!info] The Big Picture
> JavaScript has two categories of data types: **primitives** (simple, immutable values) and **reference types** (complex, mutable objects). Understanding this distinction is critical because it affects how data is stored, compared, copied, and passed to functions. Many bugs trace back to confusing primitives with reference types.

---

## 🏗️ The Two Categories

```
JavaScript Types
├── Primitives (7 types) — stored by VALUE
│   ├── string
│   ├── number
│   ├── boolean
│   ├── null
│   ├── undefined
│   ├── Symbol (ES2015)
│   └── BigInt (ES2020)
│
└── Reference Types — stored by REFERENCE
    ├── Object
    ├── Array (special object)
    ├── Function (special object)
    ├── Date
    ├── RegExp
    ├── Map, Set, WeakMap, WeakSet
    └── ... (everything else is an object)
```

---

## 📦 Primitive Types

Primitives are **immutable** — their value cannot be changed. When you "modify" a string, you're creating a new string.

### `string`

Text data enclosed in single quotes, double quotes, or backticks.

```javascript
const single = 'Hello';
const double = "World";
const backtick = `Hello ${double}`; // Template literal → "Hello World"

// Strings are IMMUTABLE
let greeting = "Hello";
greeting[0] = "J";        // Silently fails
console.log(greeting);     // "Hello" — unchanged

greeting = "Jello";        // This works — you're REASSIGNING, not mutating
```

> [!tip] Real-World Usage
> Template literals (backticks) are the modern standard. Use them for string interpolation, multiline strings, and tagged templates (used in libraries like `styled-components`).

---

### `number`

JavaScript uses **IEEE 754 double-precision floating-point** for ALL numbers (both integers and decimals). This means:

```javascript
const integer = 42;
const float = 3.14;
const negative = -7;
const scientific = 2.5e6;    // 2,500,000
const hex = 0xFF;             // 255
const octal = 0o77;           // 63
const binary = 0b1010;        // 10
const withSeparator = 1_000_000; // 1000000 (ES2021 numeric separator)

// Special numeric values
const inf = Infinity;         // Overflow result
const negInf = -Infinity;     // Negative overflow
const notANumber = NaN;       // "Not a Number" — result of invalid math

// ⚠️ Floating-point precision issue
console.log(0.1 + 0.2);      // 0.30000000000000004 (NOT 0.3!)
console.log(0.1 + 0.2 === 0.3); // false

// Safe integer range
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991 (2^53 - 1)
console.log(Number.MIN_SAFE_INTEGER); // -9007199254740991
```

> [!warning] Why `0.1 + 0.2 !== 0.3`
> Computers store numbers in binary. Just as 1/3 can't be exactly represented in decimal (0.333...), 0.1 can't be exactly represented in binary. This is not a JavaScript bug — it happens in ALL languages using IEEE 754. For money calculations, use integers (cents) or a library like `decimal.js`.

See [[07 - Numbers and Math]] for full coverage of numeric operations.

---

### `boolean`

Only two values: `true` and `false`. The result of comparisons and logical operations.

```javascript
const isActive = true;
const isDeleted = false;

// Booleans from comparisons
const isAdult = age >= 18;        // true or false
const hasAccess = role === "admin"; // true or false
```

---

### `null`

**Intentional absence of value.** You use `null` to explicitly say "this variable has no value right now."

```javascript
let selectedUser = null; // We haven't selected anyone yet

// Real-world: clearing a reference
let cachedData = fetchFromAPI(); // has data
cachedData = null;               // explicitly clearing it
```

> [!danger] The Famous `typeof null` Bug
> ```javascript
> typeof null // "object" — THIS IS A BUG from 1995!
> ```
> This was caused by how the original JavaScript engine stored type information. The TC39 committee decided fixing it would break too many existing websites. Use `value === null` to check for null, never `typeof`.

---

### `undefined`

**Unintentional absence of value.** This is what JavaScript gives you when a value hasn't been set.

```javascript
let x;
console.log(x);              // undefined — declared but not assigned

function greet(name) {
    console.log(name);
}
greet();                       // undefined — parameter not provided

const obj = { a: 1 };
console.log(obj.b);           // undefined — property doesn't exist

function noReturn() { /* no return statement */ }
console.log(noReturn());      // undefined — functions without return
```

> [!tip] `null` vs `undefined` — The Simple Rule
> - **`null`** = "I deliberately set this to nothing" (programmer's choice)
> - **`undefined`** = "No value has been assigned yet" (JavaScript's default)
> 
> Use `null` when you want to explicitly clear a value. Don't assign `undefined` manually — let JavaScript do that.

---

### `Symbol` (ES2015)

A **unique, immutable identifier**. No two Symbols are ever equal, even with the same description.

```javascript
const id1 = Symbol("id");
const id2 = Symbol("id");
console.log(id1 === id2); // false — every Symbol is unique!

// Use case: unique property keys that won't clash
const USER_ID = Symbol("userId");
const user = {
    name: "Alice",
    [USER_ID]: 12345  // Hidden from normal iteration
};

console.log(user[USER_ID]); // 12345
console.log(Object.keys(user)); // ["name"] — Symbol keys are not enumerable!

// Global Symbol registry
const globalSym = Symbol.for("app.id"); // Creates or retrieves
const same = Symbol.for("app.id");
console.log(globalSym === same); // true — shared globally
```

> [!note] Real-World Use
> Symbols are heavily used internally by JavaScript (see [[04 - Symbols]] in Phase 7). They define protocols like `Symbol.iterator` (makes objects iterable in `for...of` loops) and `Symbol.toPrimitive` (controls type conversion). Libraries use them for private-like properties that don't collide with user code.

---

### `BigInt` (ES2020)

Integers of **arbitrary precision** — numbers beyond the safe integer limit.

```javascript
// Regular numbers lose precision beyond 2^53 - 1
console.log(9007199254740991 + 1); // 9007199254740992 ✅
console.log(9007199254740991 + 2); // 9007199254740992 ❌ Same value!

// BigInt fixes this
const big = 9007199254740991n + 2n; // 9007199254740993n ✅
const alsoBig = BigInt("9007199254740993"); // From string

// Rules:
// - Cannot mix BigInt and regular numbers
// 10n + 5;     // ❌ TypeError
// 10n + BigInt(5); // ✅ 15n

// - Cannot use with Math methods
// Math.sqrt(4n); // ❌ TypeError

// - Division truncates (no decimals)
console.log(7n / 2n); // 3n (not 3.5)
```

> [!tip] Real-World Use
> - Database IDs that exceed safe integer range (Twitter/X snowflake IDs, Discord IDs)
> - Cryptographic calculations
> - Financial systems requiring exact large-number arithmetic
> - High-precision timestamps (nanoseconds)

---

## 🔗 Reference Types

Reference types are **objects stored in memory** — the variable holds a **pointer** to where the object lives, not the object itself.

### Objects

```javascript
const person = {
    name: "Alice",
    age: 30,
    greet() {
        return `Hi, I'm ${this.name}`;
    }
};
```

### Arrays (Ordered objects with numeric keys)

```javascript
const fruits = ["apple", "banana", "cherry"];
console.log(typeof fruits); // "object" — arrays ARE objects!
console.log(Array.isArray(fruits)); // true — proper way to check
```

### Functions (Callable objects)

```javascript
function add(a, b) { return a + b; }
console.log(typeof add); // "function" — special typeof result
// But functions ARE objects — they can have properties!
add.description = "Adds two numbers";
```

---

## ⚖️ Value vs Reference — The Critical Difference

This is one of the **most important concepts in JavaScript**. Misunderstanding this causes countless bugs.

### Primitives: Copied by Value

```javascript
let a = 10;
let b = a;    // b gets a COPY of the value
b = 20;
console.log(a); // 10 — unchanged! a and b are independent
```

```
Memory:
  a → [10]    (separate box)
  b → [20]    (separate box)
```

### Objects: Copied by Reference

```javascript
let obj1 = { name: "Alice" };
let obj2 = obj1;  // obj2 gets a copy of the REFERENCE (pointer)
obj2.name = "Bob";
console.log(obj1.name); // "Bob" — BOTH changed! They point to the same object!
```

```
Memory:
  obj1 ──→ { name: "Bob" }  ← same object in memory!
  obj2 ──↗
```

### Real-World Impact: Function Arguments

```javascript
// Primitives are safe — function gets a copy
function double(num) {
    num = num * 2;
    return num;
}
let price = 50;
double(price);
console.log(price); // 50 — unchanged ✅

// Objects are risky — function gets the same reference
function updateUser(user) {
    user.name = "Modified!"; // This MUTATES the original!
}
const myUser = { name: "Alice" };
updateUser(myUser);
console.log(myUser.name); // "Modified!" — original changed! 😱
```

> [!warning] How to Safely Copy Objects
> ```javascript
> // Shallow copy (one level deep)
> const copy1 = { ...original };          // Spread operator
> const copy2 = Object.assign({}, original);
> 
> // Deep copy (nested objects too) — MODERN APPROACH
> const deepCopy = structuredClone(original); // Available since 2022
> 
> // Deep copy — LEGACY APPROACH (loses functions, dates, etc.)
> const legacyCopy = JSON.parse(JSON.stringify(original));
> ```

---

## 🔍 The `typeof` Operator

Returns a string indicating the type of a value.

```javascript
typeof "hello"       // "string"
typeof 42            // "number"
typeof true          // "boolean"
typeof undefined     // "undefined"
typeof Symbol()      // "symbol"
typeof 42n           // "bigint"

// ⚠️ The quirks:
typeof null          // "object"     ← famous bug!
typeof []            // "object"     ← arrays are objects
typeof {}            // "object"
typeof function(){}  // "function"   ← special case (functions are objects too)
typeof NaN           // "number"     ← "Not a Number" is a... number 🤦
```

### Better Type Checking

```javascript
// For null
value === null

// For arrays
Array.isArray(value)

// For NaN
Number.isNaN(value)      // ✅ strict — only true for NaN
isNaN(value)             // ❌ loose — isNaN("hello") is true! (coerces to number first)

// For any type — the nuclear option
Object.prototype.toString.call(value)
// "[object String]", "[object Array]", "[object Null]", etc.
```

---

## 🧠 Primitive Wrapper Objects

When you call a method on a primitive, JavaScript **temporarily wraps it** in an object:

```javascript
const str = "hello";
console.log(str.toUpperCase()); // "HELLO"

// What actually happens:
// 1. JavaScript creates: new String("hello")
// 2. Calls .toUpperCase() on it → "HELLO"
// 3. Destroys the wrapper object
// 4. Returns the result

// This is why primitives can have methods even though they're not objects!
// But you can't add properties to primitives:
str.myProp = "test";
console.log(str.myProp); // undefined — wrapper was discarded
```

> [!note] Never Use Wrapper Constructors Directly
> ```javascript
> // ❌ NEVER do this
> const str = new String("hello");
> typeof str;          // "object" — not "string"!
> str === "hello";     // false — object vs primitive
> 
> // ✅ Always use primitive literals
> const str = "hello";
> typeof str;          // "string"
> str === "hello";     // true
> ```

---

## 📊 Summary Table

| Type | `typeof` Result | Falsy Value(s) | Immutable? | Category |
|---|---|---|---|---|
| `string` | `"string"` | `""` (empty string) | ✅ | Primitive |
| `number` | `"number"` | `0`, `-0`, `NaN` | ✅ | Primitive |
| `boolean` | `"boolean"` | `false` | ✅ | Primitive |
| `null` | `"object"` ⚠️ | `null` | ✅ | Primitive |
| `undefined` | `"undefined"` | `undefined` | ✅ | Primitive |
| `Symbol` | `"symbol"` | — (never falsy) | ✅ | Primitive |
| `BigInt` | `"bigint"` | `0n` | ✅ | Primitive |
| `Object` | `"object"` | — (never falsy) | ❌ | Reference |
| `Array` | `"object"` | — (never falsy) | ❌ | Reference |
| `Function` | `"function"` | — (never falsy) | ❌ | Reference |

---

## 🎯 Practice Exercises

1. **Type Detective** — Write a function `typeOf(value)` that returns the *actual* type: `"null"`, `"array"`, `"date"`, `"regexp"`, `"map"`, `"set"`, or the standard `typeof` result. Use `Object.prototype.toString.call()`.
2. **Primitive vs Reference** — Create two objects with identical properties. Prove `===` returns `false`. Then demonstrate that assigning one to another creates a shared reference (mutation affects both).
3. **Falsy Gauntlet** — Write a function that takes any value and logs (a) the value, (b) its type, (c) whether it’s falsy, (d) its boolean coercion. Test all 8 falsy values.
4. **Symbol Keys** — Create an object with both string and Symbol keys. Show that `Object.keys()` misses Symbols but `Object.getOwnPropertySymbols()` finds them.
5. **BigInt Calculator** — Write a function that calculates factorial using BigInt for numbers > 20 (where `Number` overflows). Compare results.

---

## 🔗 Related Topics

- [[04 - Type Conversion and Coercion]] — How types convert between each other
- [[02 - Variables and Declarations]] — How to store these types
- [[05 - Operators]] — Operations on different types
- [[04 - Symbols]] — Deep dive in Phase 7
- [[07 - Objects Foundations]] — Full object coverage in Phase 2

---

**← Previous:** [[02 - Variables and Declarations]] | **Next →** [[04 - Type Conversion and Coercion]]
