---
title: "Type Conversion and Coercion"
phase: 1
topic: "Type Coercion"
tags:
  - phase1
  - fundamentals
  - coercion
  - truthy-falsy
  - equality
  - interview
  - gotcha
created: 2026-03-02
---

# Type Conversion and Coercion

> [!info] The Big Picture
> JavaScript is a **dynamically typed, weakly typed** language. This means types can change at runtime, and JavaScript will *automatically* convert types when it thinks it needs to. This automatic conversion — called **coercion** — is behind many of JavaScript's most confusing behaviors. Mastering it means you'll never be surprised by `"5" + 3` yielding `"53"` or `[] == false` being `true`.

---

## 🔄 Explicit Conversion (Type Casting)

You deliberately convert from one type to another using built-in functions.

### Converting to String

```javascript
// String() — the recommended way
String(123);       // "123"
String(true);      // "true"
String(null);      // "null"
String(undefined); // "undefined"
String([1, 2]);    // "1,2"
String({});        // "[object Object]"

// .toString() method
(123).toString();     // "123"
(255).toString(16);   // "ff" (hexadecimal)
(10).toString(2);     // "1010" (binary)
true.toString();      // "true"
// null.toString();   // ❌ TypeError — null has no methods
// undefined.toString(); // ❌ TypeError

// Template literal (common in practice)
const age = 25;
const str = `${age}`; // "25"

// String concatenation with empty string
const s = 42 + ""; // "42" (implicit, but commonly used)
```

---

### Converting to Number

```javascript
// Number() — strict, recommended
Number("123");      // 123
Number("123.45");   // 123.45
Number("");         // 0          ← empty string becomes 0!
Number(" ");        // 0          ← whitespace-only becomes 0!
Number("hello");    // NaN        ← non-numeric string
Number(true);       // 1
Number(false);      // 0
Number(null);       // 0          ← null becomes 0!
Number(undefined);  // NaN        ← undefined becomes NaN!
Number([]);         // 0          ← empty array!
Number([5]);        // 5          ← single-element array!
Number([1,2]);      // NaN        ← multi-element array

// parseInt() — parses until non-digit, integer only
parseInt("42px");    // 42        ← stops at "p"
parseInt("  100 ");  // 100       ← trims whitespace
parseInt("0xFF");    // 255       ← hex
parseInt("hello");   // NaN
parseInt("3.99");    // 3         ← no decimals!

// ⚠️ ALWAYS specify radix (base)!
parseInt("010", 10);  // 10       ← explicit decimal
parseInt("010");      // 10 (modern) but was 8 (octal) in old engines!

// parseFloat() — same as parseInt but keeps decimals
parseFloat("3.14px"); // 3.14
parseFloat("3.14.15"); // 3.14 (stops at second dot)

// Unary plus operator (shorthand for Number())
+"42"       // 42
+true       // 1
+""         // 0
+null       // 0
+undefined  // NaN
```

> [!warning] `parseInt` vs `Number` — Know the Difference
> - `Number("42px")` → `NaN` (strict — entire string must be numeric)
> - `parseInt("42px")` → `42` (lenient — parses what it can)
> 
> Use `Number()` when the string should be entirely numeric. Use `parseInt()`/`parseFloat()` when extracting numbers from mixed content like CSS values.

---

### Converting to Boolean

```javascript
// Boolean() — the definitive way
Boolean(1);         // true
Boolean("hello");   // true
Boolean({});        // true  ← empty object is truthy!
Boolean([]);        // true  ← empty array is truthy!

Boolean(0);         // false
Boolean("");        // false
Boolean(null);      // false
Boolean(undefined); // false
Boolean(NaN);       // false

// Double NOT operator (common shorthand)
!!1           // true
!!"hello"     // true
!!0           // false
!!""          // false
!!null        // false
```

---

## 📋 The Complete Falsy Values List

> [!danger] Memorize These — There Are Exactly 8 Falsy Values

| Value | Type | Notes |
|---|---|---|
| `false` | boolean | The literal false |
| `0` | number | Zero |
| `-0` | number | Negative zero (yes, it exists) |
| `0n` | bigint | BigInt zero |
| `""` | string | Empty string |
| `null` | null | Intentional absence |
| `undefined` | undefined | Unset value |
| `NaN` | number | Not a Number |

**Everything else is truthy**, including:
- `"0"` (string with zero) → **truthy** ⚠️
- `" "` (string with space) → **truthy** ⚠️
- `[]` (empty array) → **truthy** ⚠️
- `{}` (empty object) → **truthy** ⚠️
- `function(){}` → **truthy**
- `"false"` (string "false") → **truthy** ⚠️
- `-1` or any non-zero number → **truthy**

```javascript
// This catches many beginners:
if ([]) console.log("Empty array is truthy!");   // ✅ Runs!
if ({}) console.log("Empty object is truthy!");  // ✅ Runs!
if ("0") console.log("String '0' is truthy!");   // ✅ Runs!
if ("false") console.log("String 'false' is truthy!"); // ✅ Runs!
```

---

## 🔀 Implicit Coercion (Automatic Conversion)

JavaScript automatically converts types in certain contexts. This is where the "weird" behavior comes from.

### String Coercion (The `+` operator with strings)

When `+` has **any string operand**, everything becomes a string:

```javascript
"5" + 3         // "53"      ← string wins! Concatenation, not addition
"5" + true      // "5true"
"5" + null      // "5null"
"5" + undefined // "5undefined"
"5" + [1, 2]    // "51,2"    ← array.toString() called first
5 + "3"         // "53"      ← order doesn't matter

// Even with objects:
"Result: " + {}  // "Result: [object Object]"
```

### Numeric Coercion (Other operators)

When `-`, `*`, `/`, `%` are used, everything converts to numbers:

```javascript
"5" - 3         // 2         ← numeric!
"5" * "2"       // 10
"10" / "2"      // 5
"5" - true      // 4         ← true → 1
"5" - false     // 5         ← false → 0
"5" - null      // 5         ← null → 0
"5" - undefined // NaN       ← undefined → NaN (poisons everything)
"hello" - 5     // NaN
```

> [!tip] The Pattern
> - `+` with a string → **string concatenation**
> - `-`, `*`, `/`, `%` → **numeric conversion**
> - This is the single most important coercion rule to remember.

### Boolean Coercion (Logical contexts)

Values are coerced to booleans in `if`, `while`, ternary `? :`, and logical `&&` `||` `!`:

```javascript
if ("hello") {
    // Runs — "hello" is truthy
}

if (0) {
    // Does NOT run — 0 is falsy
}

// Practical use: default values
const name = userInput || "Anonymous"; // If userInput is falsy, use "Anonymous"

// ⚠️ But || treats 0 and "" as falsy!
const count = inputCount || 10; // If inputCount is 0, this gives 10! Bug!

// ✅ Use nullish coalescing for better defaults
const count = inputCount ?? 10; // Only if inputCount is null/undefined
```

---

## ⚖️ Equality Operators — The Full Rules

### `===` Strict Equality (Use This!)

No coercion. Both **type AND value** must match.

```javascript
5 === 5         // true
5 === "5"       // false ← different types
null === undefined // false ← different types
NaN === NaN     // false ← NaN is not equal to itself!
0 === -0        // true  ← considered equal
```

### `==` Loose Equality (Avoid This)

Performs type coercion before comparing. The rules are complex:

```javascript
// Number vs String → convert string to number
5 == "5"        // true   ("5" → 5)

// Boolean vs anything → convert boolean to number first
true == 1       // true   (true → 1)
false == 0      // true   (false → 0)
true == "1"     // true   (true → 1, "1" → 1)

// null and undefined are only equal to each other
null == undefined  // true  ← special rule
null == 0          // false ← null doesn't coerce to 0 here!
null == ""         // false
null == false      // false

// Object vs primitive → call ToPrimitive on object
[] == false        // true  ← [] → "" → 0, false → 0
[] == 0            // true
[""] == ""         // true
[0] == false       // true  ← 🤯

// The famous WATs
"" == false        // true
" " == false       // false?! Actually true in most engines... 
"0" == false       // true  ← "0" → 0, false → 0
```

> [!danger] Why You Should Almost Always Use `===`
> The `==` coercion rules are notoriously complex and lead to counterintuitive results. The only reasonable use of `==` is `value == null` which checks for both `null` and `undefined` in one expression:
> ```javascript
> if (value == null) {
>     // value is null OR undefined
> }
> // Equivalent to:
> if (value === null || value === undefined) { ... }
> ```

### `Object.is()` — The Most Precise

Like `===` but handles two edge cases differently:

```javascript
Object.is(NaN, NaN);   // true  ← NaN equals itself!
Object.is(0, -0);       // false ← 0 and -0 are different!

// Compare:
NaN === NaN;            // false
0 === -0;               // true
```

---

## 🎭 Where Coercion Happens (Hidden Contexts)

```javascript
// 1. if/while/ternary — Boolean coercion
if (user.name) { ... }          // truthy check

// 2. Template literals — String coercion
`Score: ${100}`                  // "Score: 100"

// 3. Logical operators — Boolean coercion for decision, return original
const name = "" || "Default";   // "Default" (first truthy)
const age = 0 ?? 25;            // 0 (only null/undefined trigger ??)

// 4. Unary +/- — Numeric coercion
+true                            // 1
-"5"                             // -5

// 5. Comparison operators — Numeric coercion
"10" > 9                         // true ("10" → 10)
"abc" > "abd"                    // false (compared by char code)

// 6. Arithmetic operators (except +) — Numeric coercion
"6" / "2"                        // 3
```

---

## 🌍 Real-World Patterns

### Safe Defaults with `??` (Nullish Coalescing)

```javascript
// ❌ Old way — treats 0 and "" as "missing"
function getPort(config) {
    return config.port || 3000; // Bug: port 0 becomes 3000!
}

// ✅ Modern way — only null/undefined trigger fallback
function getPort(config) {
    return config.port ?? 3000; // Port 0 stays as 0 ✅
}
```

### Type-Safe Input Validation

```javascript
function processAge(input) {
    const age = Number(input);
    
    if (Number.isNaN(age)) {
        throw new Error("Invalid age: not a number");
    }
    if (!Number.isInteger(age)) {
        throw new Error("Age must be a whole number");
    }
    if (age < 0 || age > 150) {
        throw new Error("Age out of range");
    }
    
    return age;
}
```

### Consistent Boolean Conversion

```javascript
// Converting user input to boolean
const flags = ["true", "1", "yes", "on"];
const isEnabled = flags.includes(userInput.toLowerCase());

// NOT just Boolean(userInput) — "false" is truthy!
```

---

## 🧠 Mental Model: The Coercion Algorithm

When JavaScript needs to convert a value, it follows these priorities:

```
1. ToPrimitive (for objects)
   → Calls [Symbol.toPrimitive](hint), or
   → If hint is "number": try valueOf(), then toString()
   → If hint is "string": try toString(), then valueOf()

2. ToNumber
   true → 1, false → 0, null → 0, undefined → NaN
   "" → 0, "123" → 123, "abc" → NaN

3. ToString
   null → "null", undefined → "undefined"
   true → "true", 123 → "123"

4. ToBoolean
   Falsy → false (the 8 values)
   Everything else → true
```

---

## ⚠️ Common Interview Questions

```javascript
// What does each evaluate to?
[] + []           // "" (both convert to "", "" + "" = "")
[] + {}           // "[object Object]"
{} + []           // 0 (in console: {} is empty block, +[] = 0)
true + true       // 2
true + "1"        // "true1"
null + 1          // 1
undefined + 1     // NaN
"" - 1            // -1
```

---

## 🔗 Related Topics

- [[03 - Data Types in Depth]] — The types being converted
- [[05 - Operators]] — Where coercion is triggered
- [[06 - Expressions vs Statements]] — Expression context triggers coercion
- [[02 - The this Keyword]] — `this` can be affected by coercion in some contexts

---

**← Previous:** [[03 - Data Types in Depth]] | **Next →** [[05 - Operators]]
