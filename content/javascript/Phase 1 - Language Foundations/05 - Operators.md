---
title: "Operators"
phase: 1
topic: "Operators"
tags:
  - phase1
  - fundamentals
  - operators
  - optional-chaining
  - nullish-coalescing
  - spread
created: 2026-03-02
---

# Operators

> [!info] The Big Picture
> Operators are **symbols that perform operations on values** (operands). JavaScript has a rich set of operators — from basic arithmetic to modern additions like optional chaining (`?.`) and nullish coalescing (`??`). Understanding operators deeply means knowing not just what they do, but their **precedence** (order of execution), **associativity** (left-to-right or right-to-left), and **coercion behavior**.

---

## ➕ Arithmetic Operators

| Operator | Name | Example | Result |
|---|---|---|---|
| `+` | Addition / Concatenation | `5 + 3` | `8` |
| `-` | Subtraction | `5 - 3` | `2` |
| `*` | Multiplication | `5 * 3` | `15` |
| `/` | Division | `10 / 3` | `3.333...` |
| `%` | Remainder (Modulo) | `10 % 3` | `1` |
| `**` | Exponentiation (ES2016) | `2 ** 10` | `1024` |

```javascript
// Addition has dual behavior:
5 + 3        // 8 (numeric)
"5" + 3      // "53" (string concatenation — string wins!)
5 + 3 + "px" // "8px" (left-to-right: 5+3=8, 8+"px"="8px")
"$" + 5 + 3  // "$53" (left-to-right: "$"+5="$5", "$5"+3="$53")

// Remainder is useful for:
// - Checking even/odd: n % 2 === 0
// - Wrapping around: index % array.length
// - Clock arithmetic: (hours + offset) % 24

let hour = 23;
hour = (hour + 3) % 24; // 2 (wraps around midnight)

// Exponentiation replaces Math.pow()
2 ** 10      // 1024
Math.pow(2, 10) // 1024 (legacy)
```

---

## 📝 Assignment Operators

| Operator | Equivalent To | Example |
|---|---|---|
| `=` | Direct assignment | `x = 5` |
| `+=` | `x = x + value` | `x += 3` |
| `-=` | `x = x - value` | `x -= 3` |
| `*=` | `x = x * value` | `x *= 2` |
| `/=` | `x = x / value` | `x /= 2` |
| `%=` | `x = x % value` | `x %= 3` |
| `**=` | `x = x ** value` | `x **= 2` |
| `&&=` | Assign if truthy (ES2021) | `x &&= newVal` |
| `\|\|=` | Assign if falsy (ES2021) | `x \|\|= default` |
| `??=` | Assign if nullish (ES2021) | `x ??= default` |

### Logical Assignment Operators (ES2021)

These are game-changers for default values and conditional assignment:

```javascript
// ||= — Assign if current value is FALSY
let name = "";
name ||= "Anonymous";  // "Anonymous" (because "" is falsy)

// ??= — Assign if current value is NULL or UNDEFINED
let count = 0;
count ??= 10;           // 0 (stays 0! 0 is not null/undefined)

let missing = null;
missing ??= "default";  // "default"

// &&= — Assign if current value is TRUTHY
let user = { name: "Alice" };
user &&= { ...user, loggedIn: true }; // Updates user
// If user were null, it would stay null

// Real-world: lazy initialization
class Cache {
    #data = null;
    
    getData() {
        this.#data ??= expensiveComputation(); // Only compute once
        return this.#data;
    }
}
```

---

## ⚖️ Comparison Operators

| Operator | Name | Coercion? | Example |
|---|---|---|---|
| `==` | Loose equality | ✅ Yes | `5 == "5"` → `true` |
| `===` | Strict equality | ❌ No | `5 === "5"` → `false` |
| `!=` | Loose inequality | ✅ Yes | `5 != "5"` → `false` |
| `!==` | Strict inequality | ❌ No | `5 !== "5"` → `true` |
| `>` | Greater than | ✅ Yes | `10 > 5` → `true` |
| `<` | Less than | ✅ Yes | `3 < 7` → `true` |
| `>=` | Greater or equal | ✅ Yes | `5 >= 5` → `true` |
| `<=` | Less or equal | ✅ Yes | `4 <= 5` → `true` |

```javascript
// String comparison uses Unicode code points (lexicographic)
"apple" < "banana"   // true (a < b)
"Banana" < "apple"   // true (uppercase B = 66, lowercase a = 97)
"10" < "9"           // true! (compares "1" vs "9" character by character)
"10" < 9             // false (string "10" → number 10, 10 < 9 is false)
```

> [!tip] Always Use `===` and `!==`
> Except for the `value == null` pattern (checks for both null and undefined), always use strict equality. See [[04 - Type Conversion and Coercion]] for detailed rules.

---

## 🔀 Logical Operators

### `&&` (Logical AND)

Returns the **first falsy value** it encounters, or the **last value** if all are truthy.

```javascript
true && "hello"     // "hello" (both truthy → returns last)
false && "hello"    // false (first falsy → short-circuits)
0 && "hello"        // 0 (0 is falsy)
"hi" && "bye"       // "bye"
"hi" && 0 && "bye"  // 0 (stops at first falsy)

// Real-world: conditional rendering (React pattern)
const isLoggedIn = true;
const greeting = isLoggedIn && <WelcomeMessage />;

// Real-world: guard clauses
user && user.profile && user.profile.name
// Modern replacement: optional chaining (see below)
user?.profile?.name
```

### `||` (Logical OR)

Returns the **first truthy value** it encounters, or the **last value** if all are falsy.

```javascript
false || "hello"    // "hello" (first truthy)
"" || "default"     // "default" ("" is falsy)
0 || 42             // 42 (0 is falsy)
null || undefined   // undefined (both falsy → returns last)

// Real-world: default values (legacy pattern)
function greet(name) {
    name = name || "World";        // ⚠️ Problem: treats "" and 0 as falsy
    return `Hello, ${name}!`;
}
greet("");  // "Hello, World!" — Bug! Empty string was a valid input
```

### `!` (Logical NOT)

Returns the **boolean inverse**.

```javascript
!true        // false
!0           // true
!"hello"     // false
!""          // true
!null        // true

// Double NOT (!!) — converts to boolean
!!"hello"    // true (equivalent to Boolean("hello"))
!!0          // false
!!null       // false
```

---

## ❓ Optional Chaining `?.` (ES2020)

Safely access deeply nested properties without checking each level.

```javascript
const user = {
    name: "Alice",
    address: {
        city: "Portland"
    }
};

// Without optional chaining (old way)
const zip = user && user.address && user.address.zip;

// With optional chaining ✨
const zip = user?.address?.zip; // undefined (no error!)

// Works with methods
user.getProfile?.();        // Calls if method exists, undefined if not

// Works with bracket notation
const key = "address";
user?.[key]?.city;          // "Portland"

// Works with arrays
const first = users?.[0]?.name;

// ⚠️ Only short-circuits on null/undefined, NOT on other falsy values
const str = "";
str?.length;  // 0 (does NOT short-circuit — "" is not null/undefined)
```

> [!tip] When to Use `?.`
> - Accessing API response data that might be incomplete
> - Accessing DOM elements that might not exist
> - Accessing optional configuration properties
> - Any chain where an intermediate value could be `null`/`undefined`

---

## ❔ Nullish Coalescing `??` (ES2020)

Returns the right operand when the left is **`null` or `undefined`** only (not other falsy values).

```javascript
// ?? only triggers on null/undefined
0 ?? 42            // 0 (keeps 0 — it's not nullish)
"" ?? "default"    // "" (keeps "" — it's not nullish)
false ?? true      // false (keeps false)
null ?? "fallback" // "fallback" ✅
undefined ?? "fb"  // "fallback" ✅

// Compare with || which triggers on ANY falsy value
0 || 42            // 42 (0 is falsy!)
"" || "default"    // "default" ("" is falsy!)

// Real-world: respecting intentional falsy values
function createConfig(options) {
    return {
        retries: options.retries ?? 3,  // If 0 retries specified, keep 0
        verbose: options.verbose ?? false, // If false specified, keep false
        timeout: options.timeout ?? 5000,
    };
}
createConfig({ retries: 0, verbose: false });
// { retries: 0, verbose: false, timeout: 5000 } ✅
```

> [!warning] Cannot Mix `??` with `&&`/`||` Without Parentheses
> ```javascript
> // a || b ?? c  → SyntaxError!
> // Must be explicit:
> (a || b) ?? c   // ✅
> a || (b ?? c)   // ✅
> ```

---

## 🧮 Unary Operators

| Operator | Name | Example | Result |
|---|---|---|---|
| `typeof` | Type check | `typeof "hi"` | `"string"` |
| `delete` | Delete property | `delete obj.key` | `true`/`false` |
| `void` | Evaluate and return undefined | `void 0` | `undefined` |
| `+` | Unary plus (to number) | `+"42"` | `42` |
| `-` | Unary negation | `-5` | `-5` |
| `!` | Logical NOT | `!true` | `false` |
| `~` | Bitwise NOT | `~5` | `-6` |
| `++` | Increment | `x++` or `++x` | Depends |
| `--` | Decrement | `x--` or `--x` | Depends |

### Prefix vs Postfix `++`/`--`

```javascript
let a = 5;
let b = a++;  // b = 5, a = 6 (returns THEN increments)
let c = ++a;  // c = 7, a = 7 (increments THEN returns)

// In a for loop, it doesn't matter:
for (let i = 0; i < 10; i++)  { }  // Same as
for (let i = 0; i < 10; ++i) { }  // This
```

### `typeof` — Quick Reference

```javascript
typeof "hello"       // "string"
typeof 42            // "number"
typeof true          // "boolean"
typeof undefined     // "undefined"
typeof null          // "object" ← BUG
typeof Symbol()      // "symbol"
typeof 42n           // "bigint"
typeof {}            // "object"
typeof []            // "object"
typeof function(){} // "function"

// Safe way to check if variable exists (doesn't throw for undeclared)
if (typeof maybeUndeclared !== "undefined") { ... }
```

### `void` — Niche but Important

```javascript
// Returns undefined for any expression
void 0          // undefined
void "hello"    // undefined

// Use case: ensuring link doesn't navigate
// <a href="javascript:void(0)">Click</a>

// Use case: arrow functions that should not return a value
const logAndIgnore = (x) => void console.log(x);
// Returns undefined, not the return value of console.log
```

---

## 🔧 Spread Operator `...`

Not technically an operator — it's **syntax** — but it's used like one.

```javascript
// Spread in arrays — expands an iterable
const arr1 = [1, 2, 3];
const arr2 = [0, ...arr1, 4]; // [0, 1, 2, 3, 4]

// Spread in objects — copies properties
const defaults = { theme: "light", lang: "en" };
const custom = { ...defaults, theme: "dark" }; // Override theme

// Spread in function calls
const nums = [5, 2, 8, 1];
Math.max(...nums);     // 8

// ⚠️ Spread creates SHALLOW copies only
const nested = { a: { b: 1 } };
const copy = { ...nested };
copy.a.b = 999;
console.log(nested.a.b); // 999! Inner object is shared
```

See [[05 - Arrays Foundations]] and [[07 - Objects Foundations]] for more spread usage.

---

## 🔢 Bitwise Operators

Used for low-level number manipulation. Numbers are converted to 32-bit integers.

| Operator | Name | Example | Result |
|---|---|---|---|
| `&` | AND | `5 & 3` | `1` |
| `\|` | OR | `5 \| 3` | `7` |
| `^` | XOR | `5 ^ 3` | `6` |
| `~` | NOT | `~5` | `-6` |
| `<<` | Left shift | `5 << 1` | `10` |
| `>>` | Right shift (signed) | `-10 >> 1` | `-5` |
| `>>>` | Right shift (unsigned) | `-1 >>> 0` | `4294967295` |

```javascript
// Practical use cases:

// 1. Quick Math.floor for positive numbers
~~3.7        // 3 (double bitwise NOT truncates decimal)
3.7 | 0      // 3 (bitwise OR with 0)
3.7 >> 0     // 3 (shift by 0)

// 2. Check if number is even/odd
const isEven = (n) => (n & 1) === 0;

// 3. Swap without temp variable
let a = 5, b = 3;
a ^= b; b ^= a; a ^= b; // a = 3, b = 5

// 4. Permission flags (very common in systems programming)
const READ = 0b001;    // 1
const WRITE = 0b010;   // 2
const EXEC = 0b100;    // 4

let permissions = READ | WRITE; // 3 (READ + WRITE)
const canRead = (permissions & READ) !== 0;    // true
const canExec = (permissions & EXEC) !== 0;    // false
permissions |= EXEC;   // Add EXEC permission
permissions &= ~WRITE; // Remove WRITE permission

// 5. Color manipulation
const color = 0xFF5733;
const red   = (color >> 16) & 0xFF; // 255
const green = (color >> 8) & 0xFF;  // 87
const blue  = color & 0xFF;         // 51
```

---

## , Comma Operator

Evaluates all operands left-to-right, returns the **last** value. Rarely used directly.

```javascript
const x = (1, 2, 3); // x = 3

// Most common: multiple variables in for loop
for (let i = 0, j = 10; i < j; i++, j--) {
    console.log(i, j);
}
```

---

## 📊 Operator Precedence (Most Important Rules)

Higher precedence = evaluated first. Full table has 19 levels.

| Priority | Operators | Example |
|---|---|---|
| 1 (highest) | Grouping `()` | `(2 + 3) * 4` |
| 2 | Member access `.`, `[]`, `?.` | `obj.prop`, `arr[0]` |
| 3 | Call `()`, `new` | `fn()`, `new Obj()` |
| 4 | Postfix `++`, `--` | `x++` |
| 5 | Prefix `!`, `typeof`, `++`,`--`,`+`,`-`,`~` | `!x`, `typeof x` |
| 6 | Exponentiation `**` | `2 ** 3` |
| 7 | Multiply/Divide `*`, `/`, `%` | `6 * 2` |
| 8 | Add/Subtract `+`, `-` | `3 + 4` |
| 9 | Shift `<<`, `>>`, `>>>` | `x << 2` |
| 10 | Relational `<`, `>`, `<=`, `>=`, `in`, `instanceof` | `x < 5` |
| 11 | Equality `==`, `===`, `!=`, `!==` | `x === 5` |
| 12 | Bitwise AND `&` | `x & y` |
| 13 | Bitwise XOR `^` | `x ^ y` |
| 14 | Bitwise OR `\|` | `x \| y` |
| 15 | Logical AND `&&` | `x && y` |
| 16 | Logical OR `\|\|` | `x \|\| y` |
| 17 | Nullish `??` | `x ?? y` |
| 18 | Ternary `? :` | `x ? a : b` |
| 19 | Assignment `=`, `+=`, etc. | `x = 5` |
| 20 (lowest) | Comma `,` | `a, b` |

> [!tip] The Rules That Matter Most
> 1. **`*` `/` `%` before `+` `-`** → `2 + 3 * 4 = 14` not `20`
> 2. **`&&` before `||`** → `a || b && c` = `a || (b && c)`
> 3. **Comparison before equality** → `a < b === true` works but is confusing
> 4. **When in doubt, use parentheses** → `(a + b) * c` is always clear

---

## 🌍 Real-World Operator Patterns

### Safe Property Access Chain

```javascript
// Config from API — any part could be missing
const fontSize = config?.theme?.typography?.fontSize ?? 16;
```

### Feature Detection

```javascript
const supportsIntersectionObserver = typeof IntersectionObserver !== "undefined";
```

### Toggle Boolean

```javascript
let isOpen = false;
isOpen = !isOpen; // true
isOpen = !isOpen; // false
```

### Clamp a Value

```javascript
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
clamp(150, 0, 100); // 100
clamp(-5, 0, 100);  // 0
```

---

## 🔗 Related Topics

- [[04 - Type Conversion and Coercion]] — How operators trigger coercion
- [[06 - Expressions vs Statements]] — Operators create expressions
- [[07 - Numbers and Math]] — Numeric operations in detail
- [[03 - Data Types in Depth]] — Operand types

---

**← Previous:** [[04 - Type Conversion and Coercion]] | **Next →** [[06 - Expressions vs Statements]]
