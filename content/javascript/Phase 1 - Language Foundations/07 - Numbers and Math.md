---
title: "Numbers and Math"
phase: 1
topic: "Numbers and Math"
tags:
  - phase1
  - fundamentals
  - numbers
  - math
  - IEEE754
  - gotcha
created: 2026-03-02
---

# Numbers and Math

> [!info] The Big Picture
> JavaScript uses a **single number type** — IEEE 754 double-precision 64-bit floating point — for both integers and decimals. This gives you huge range (up to ~1.8 × 10³⁰⁸) but introduces precision quirks that every JavaScript developer must understand. The `Math` object provides essential mathematical operations.

---

## 🔢 How JavaScript Numbers Work

### IEEE 754 Double Precision

Every JavaScript number is stored as a 64-bit floating-point value:
- **1 bit** for sign (+/-)
- **11 bits** for exponent (range)
- **52 bits** for mantissa/significand (precision)

This means:
- **Integers** are exact up to $2^{53} - 1$ = `9,007,199,254,740,991`
- **Decimals** are approximations (like writing 1/3 in decimal → 0.333...)

```javascript
// The famous precision problem
console.log(0.1 + 0.2);             // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);     // false 😱

// Why? 0.1 in binary is 0.0001100110011... (repeating)
// Just like 1/3 = 0.333... in decimal

// ✅ Solutions:
// 1. Use epsilon comparison for floating-point equality
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON  // true

// 2. Work with integers (best for money!)
const priceInCents = 199;   // $1.99 stored as 199 cents
const total = 199 + 350;    // $5.49 = 549 cents
const display = (total / 100).toFixed(2); // "$5.49"

// 3. Use a library for financial math
// decimal.js, dinero.js, or currency.js
```

> [!danger] Real-World Consequence: Money
> Never use floating-point for financial calculations. `0.1 + 0.2 !== 0.3` in a payment system could mean incorrect charges, audit failures, or legal issues. Always use **integer cents** or a decimal arithmetic library.

---

## 🔍 Special Numeric Values

### `NaN` (Not a Number)

The result of a failed numeric operation. Despite its name, `typeof NaN` is `"number"`.

```javascript
// Operations that produce NaN
0 / 0               // NaN
parseInt("hello")    // NaN
Math.sqrt(-1)        // NaN
undefined + 1        // NaN
"abc" * 3            // NaN

// NaN is the ONLY value not equal to itself
NaN === NaN          // false! 🤯
NaN == NaN           // false!

// Checking for NaN:
Number.isNaN(NaN)    // true ✅ (strict — only true for actual NaN)
Number.isNaN("hello") // false ✅ (string is not NaN)

isNaN(NaN)           // true
isNaN("hello")       // true ⚠️ (coerces to number first, "hello" → NaN, then checks)

// NaN is "toxic" — any operation with NaN produces NaN
NaN + 5              // NaN
NaN * 10             // NaN
Math.max(1, NaN, 3)  // NaN
```

> [!tip] Real-World Pattern: Validate Before Computing
> ```javascript
> function calculateDiscount(price, percent) {
>     if (Number.isNaN(price) || Number.isNaN(percent)) {
>         throw new Error("Invalid input: expected numbers");
>     }
>     return price * (1 - percent / 100);
> }
> ```

---

### `Infinity` and `-Infinity`

```javascript
1 / 0                  // Infinity
-1 / 0                 // -Infinity
Infinity + 1           // Infinity
Infinity - Infinity    // NaN  ← indeterminate!
Infinity * 0           // NaN  ← indeterminate!
Infinity * -1          // -Infinity

// Checking
Number.isFinite(42)       // true
Number.isFinite(Infinity) // false
Number.isFinite(NaN)      // false
Number.isFinite("42")     // false ← strict, no coercion

isFinite("42")            // true ⚠️ coerces string first
```

---

### Safe Integer Range

```javascript
Number.MAX_SAFE_INTEGER  // 9007199254740991 (2^53 - 1)
Number.MIN_SAFE_INTEGER  // -9007199254740991

// Beyond this range, precision is lost
9007199254740991 + 1     // 9007199254740992 ✅
9007199254740991 + 2     // 9007199254740992 ❌ Same value!

Number.isSafeInteger(42)                  // true
Number.isSafeInteger(9007199254740992)    // false

// Use BigInt for larger integers
const big = 9007199254740993n; // ✅ exact
```

### Other Numeric Constants

```javascript
Number.MAX_VALUE         // ~1.8 × 10^308 (largest positive number)
Number.MIN_VALUE         // ~5 × 10^-324 (smallest positive number > 0)
Number.EPSILON           // ~2.2 × 10^-16 (smallest difference between two numbers)
Number.POSITIVE_INFINITY // Infinity
Number.NEGATIVE_INFINITY // -Infinity
```

---

## 🔨 Number Methods

### Checking Methods

```javascript
Number.isNaN(value)        // True only if value is NaN
Number.isFinite(value)     // True if finite number (no coercion)
Number.isInteger(value)    // True if integer (no coercion)
Number.isSafeInteger(value) // True if safe integer (-(2^53-1) to 2^53-1)
Number.parseFloat(str)     // Same as global parseFloat
Number.parseInt(str, radix) // Same as global parseInt
```

### Formatting Methods

```javascript
const num = 3.14159;

// toFixed(digits) — rounds to N decimal places, returns STRING
num.toFixed(2)       // "3.14"
num.toFixed(0)       // "3"
(1.005).toFixed(2)   // "1.00" ⚠️ (not "1.01" — floating-point rounding!)

// toPrecision(digits) — total significant digits, returns STRING
num.toPrecision(4)   // "3.142"
(123.456).toPrecision(5) // "123.46"
(0.00123).toPrecision(2) // "0.0012"

// toExponential(digits) — scientific notation, returns STRING
(123456).toExponential(2) // "1.23e+5"

// toString(radix) — convert to string in given base
(255).toString(16)   // "ff" (hexadecimal)
(10).toString(2)     // "1010" (binary)
(8).toString(8)      // "10" (octal)

// Intl.NumberFormat — locale-aware formatting
new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
}).format(1234.5); // "$1,234.50"

new Intl.NumberFormat('de-DE').format(1234567.89); // "1.234.567,89"

new Intl.NumberFormat('en', { 
    notation: 'compact' 
}).format(1500000); // "1.5M"
```

> [!tip] Real-World: Displaying Prices
> ```javascript
> function formatPrice(cents, locale = 'en-US', currency = 'USD') {
>     return new Intl.NumberFormat(locale, {
>         style: 'currency',
>         currency
>     }).format(cents / 100);
> }
> 
> formatPrice(1999);        // "$19.99"
> formatPrice(1999, 'ja-JP', 'JPY'); // "￥20" (JPY has no cents)
> ```

---

## 📐 The Math Object

`Math` is a built-in object with static methods for mathematical operations. It's NOT a constructor — you don't use `new Math()`.

### Rounding

```javascript
Math.floor(4.7)    // 4   — rounds DOWN (toward -∞)
Math.floor(-4.3)   // -5  — toward -∞, not toward zero!

Math.ceil(4.2)     // 5   — rounds UP (toward +∞)
Math.ceil(-4.7)    // -4  — toward +∞

Math.round(4.5)    // 5   — rounds to nearest (0.5 rounds UP)
Math.round(4.4)    // 4
Math.round(-4.5)   // -4  — rounds toward +∞ for .5

Math.trunc(4.9)    // 4   — removes decimal, keeps integer part
Math.trunc(-4.9)   // -4  — toward zero (unlike floor!)
```

> [!warning] `floor` vs `trunc` for Negative Numbers
> ```javascript
> Math.floor(-3.2)  // -4 (rounds toward -∞)
> Math.trunc(-3.2)  // -3 (removes decimal, toward zero)
> ```
> Use `Math.trunc()` if you want to "chop off" decimals. Use `Math.floor()` for mathematical floor division.

---

### Min, Max, Abs

```javascript
Math.max(1, 5, 3, 9, 2)  // 9
Math.min(1, 5, 3, 9, 2)  // 1

// With arrays — use spread
const scores = [85, 92, 78, 95, 88];
Math.max(...scores)       // 95
Math.min(...scores)       // 78

Math.abs(-7)              // 7
Math.abs(7)               // 7

// Real-world: difference between two values
const difference = Math.abs(targetTemp - currentTemp);
```

---

### Powers and Roots

```javascript
Math.pow(2, 10)    // 1024 (legacy — use ** operator instead)
2 ** 10            // 1024 ✅

Math.sqrt(144)     // 12
Math.cbrt(27)      // 3 (cube root)
Math.hypot(3, 4)   // 5 (Pythagorean: √(3² + 4²))

// Real-world: distance between two points
function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}
distance(0, 0, 3, 4); // 5
```

---

### Random Numbers

```javascript
Math.random()  // Random float [0, 1) — includes 0, excludes 1

// Random integer between min (inclusive) and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
randomInt(1, 6);  // Dice roll: 1, 2, 3, 4, 5, or 6

// Random array element
function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
randomElement(["red", "green", "blue"]); // Random color

// Shuffle array (Fisher-Yates algorithm)
function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// Random hex color
function randomColor() {
    return '#' + Math.floor(Math.random() * 0xFFFFFF)
        .toString(16).padStart(6, '0');
}
```

> [!warning] `Math.random()` is NOT Cryptographically Secure
> For passwords, tokens, or security-sensitive operations, use:
> ```javascript
> // Browser
> crypto.getRandomValues(new Uint32Array(1))[0]
> 
> // Node.js
> import { randomBytes, randomInt } from 'crypto';
> randomInt(1, 100); // Cryptographically secure random integer
> ```

---

### Logarithms and Trigonometry

```javascript
// Logarithms
Math.log(Math.E)    // 1 (natural log)
Math.log2(8)        // 3 (log base 2)
Math.log10(1000)    // 3 (log base 10)

// Trigonometry (angles in RADIANS, not degrees!)
Math.PI             // 3.141592653589793
Math.sin(Math.PI / 2)  // 1
Math.cos(0)             // 1
Math.tan(Math.PI / 4)   // ~1
Math.atan2(y, x)        // Angle in radians from x-axis to point (x,y)

// Convert degrees ↔ radians
const toRadians = (degrees) => degrees * (Math.PI / 180);
const toDegrees = (radians) => radians * (180 / Math.PI);
```

---

### Other Useful Math Methods

```javascript
Math.sign(5)     // 1 (positive)
Math.sign(0)     // 0
Math.sign(-5)    // -1 (negative)

Math.clz32(1)    // 31 (count leading zeros in 32-bit)

// Fround — round to nearest 32-bit float
Math.fround(1.337)  // 1.3370000123977661

// ES2025: Math.f16round() — round to nearest 16-bit float
// Math.f16round(1.337) // For half-precision float operations
```

---

## 📊 Complete Math Object Reference

| Method | Description | Example → Result |
|---|---|---|
| `Math.abs(x)` | Absolute value | `Math.abs(-5)` → `5` |
| `Math.ceil(x)` | Round up | `Math.ceil(4.1)` → `5` |
| `Math.floor(x)` | Round down | `Math.floor(4.9)` → `4` |
| `Math.round(x)` | Round to nearest | `Math.round(4.5)` → `5` |
| `Math.trunc(x)` | Remove decimal | `Math.trunc(4.9)` → `4` |
| `Math.max(…)` | Largest value | `Math.max(1,5,3)` → `5` |
| `Math.min(…)` | Smallest value | `Math.min(1,5,3)` → `1` |
| `Math.pow(x,y)` | x raised to y | `Math.pow(2,3)` → `8` |
| `Math.sqrt(x)` | Square root | `Math.sqrt(16)` → `4` |
| `Math.cbrt(x)` | Cube root | `Math.cbrt(27)` → `3` |
| `Math.hypot(…)` | Euclidean distance | `Math.hypot(3,4)` → `5` |
| `Math.random()` | Random [0, 1) | `Math.random()` → `0.xyz...` |
| `Math.sign(x)` | Sign of number | `Math.sign(-5)` → `-1` |
| `Math.log(x)` | Natural log | `Math.log(Math.E)` → `1` |
| `Math.log2(x)` | Log base 2 | `Math.log2(8)` → `3` |
| `Math.log10(x)` | Log base 10 | `Math.log10(100)` → `2` |
| `Math.sin(x)` | Sine (radians) | `Math.sin(Math.PI/2)` → `1` |
| `Math.cos(x)` | Cosine (radians) | `Math.cos(0)` → `1` |
| `Math.tan(x)` | Tangent (radians) | `Math.tan(Math.PI/4)` → `~1` |
| `Math.atan2(y,x)` | Angle to point | Used for rotation |

---

## 🌍 Real-World Recipes

### Clamp a Value to a Range

```javascript
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Use case: slider value, scroll position, volume control
const volume = clamp(userInput, 0, 100);
```

### Round to N Decimal Places (Correctly)

```javascript
// toFixed has rounding issues, this is more reliable
function roundTo(num, decimals) {
    const factor = 10 ** decimals;
    return Math.round((num + Number.EPSILON) * factor) / factor;
}

roundTo(1.005, 2);  // 1.01 (toFixed gives "1.00"!)
roundTo(3.14159, 3); // 3.142
```

### Percentage Calculation

```javascript
function percentage(part, total) {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
}

percentage(75, 200); // 38 (38%)
```

### Map a Value from One Range to Another

```javascript
function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Use case: Convert mouse position (0-1920px) to rotation (0-360°)
mapRange(960, 0, 1920, 0, 360); // 180
```

---

## 🔗 Related Topics

- [[03 - Data Types in Depth]] — Number as a primitive type
- [[04 - Type Conversion and Coercion]] — How strings/booleans become numbers
- [[05 - Operators]] — Arithmetic operators

---

**← Previous:** [[06 - Expressions vs Statements]] | **Next →** [[08 - Basic IO]]
