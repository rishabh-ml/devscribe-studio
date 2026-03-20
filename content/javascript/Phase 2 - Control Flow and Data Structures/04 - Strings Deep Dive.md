---
title: "Strings Deep Dive"
phase: 2
topic: "Strings"
tags:
  - phase2
  - data-structures
  - strings
  - template-literals
  - methods
created: 2026-03-02
---

# Strings Deep Dive

> [!info] The Big Picture
> Strings are arguably the most-used data type in JavaScript. From user input to API responses to HTML generation — strings are everywhere. JavaScript has **30+ string methods** and powerful template literal syntax. Mastering them means you can parse, transform, and generate text effortlessly.

---

## 📝 String Creation

```javascript
// Three ways to create strings — all produce the same type
const single = 'Hello';           // Single quotes
const double = "Hello";           // Double quotes
const backtick = `Hello`;         // Template literal (ES2015)

// All three are equivalent for simple strings
typeof single === typeof double && typeof double === typeof backtick; // true
```

### Template Literals (Backticks) — The Modern Way

```javascript
// 1. String interpolation — embed expressions with ${}
const name = "Alice";
const age = 25;
const greeting = `Hello, ${name}! You are ${age} years old.`;
// "Hello, Alice! You are 25 years old."

// Any expression works inside ${}
`Total: $${(price * quantity).toFixed(2)}`;   // "Total: $45.00"
`Status: ${isActive ? "Active" : "Inactive"}`; // "Status: Active"
`Items: ${items.length}`;                       // "Items: 5"
`Upper: ${name.toUpperCase()}`;                 // "Upper: ALICE"

// 2. Multiline strings — preserves line breaks
const html = `
    <div class="card">
        <h2>${title}</h2>
        <p>${description}</p>
    </div>
`;

// 3. Nesting template literals
const list = `
    <ul>
        ${items.map(item => `<li>${item}</li>`).join("")}
    </ul>
`;
```

### Tagged Template Literals

A function that processes template string parts and expressions:

```javascript
function highlight(strings, ...values) {
    return strings.reduce((result, str, i) => {
        const value = values[i] !== undefined ? `<mark>${values[i]}</mark>` : "";
        return result + str + value;
    }, "");
}

const name = "Alice";
const role = "admin";
highlight`User ${name} has role ${role}`;
// "User <mark>Alice</mark> has role <mark>admin</mark>"

// Real-world: styled-components (React)
// const Button = styled.button`
//     background: ${props => props.primary ? "blue" : "gray"};
//     color: white;
// `;

// Real-world: SQL injection protection
function sql(strings, ...values) {
    return {
        text: strings.join("$"),
        values: values
    };
    // Returns parameterized query instead of string concatenation
}
```

---

## 🔒 String Immutability

Strings **cannot be changed** after creation. Every method returns a **new string**.

```javascript
let str = "Hello";
str[0] = "J";        // Silently fails
console.log(str);     // "Hello" — unchanged!

// Methods create NEW strings
const upper = str.toUpperCase(); // "HELLO" — new string
console.log(str);                 // "Hello" — original unchanged

// To "modify" a string, reassign the variable
str = "Jello";       // This works — new string assigned
```

---

## 📖 Complete String Methods Reference

### Accessing Characters

```javascript
const str = "Hello, World!";

str.length              // 13 (property, not method)
str[0]                  // "H" (bracket notation)
str.charAt(0)           // "H" (method)
str.at(0)               // "H" (ES2022)
str.at(-1)              // "!" (negative index — counts from end!)
str.charCodeAt(0)       // 72 (UTF-16 code unit)
str.codePointAt(0)      // 72 (full Unicode code point — handles emoji)

// ✅ Use .at() for negative indexing
"Hello".at(-1);         // "o" — much cleaner than str[str.length - 1]
```

---

### Searching & Testing

```javascript
const text = "The quick brown fox jumps over the lazy dog";

// indexOf / lastIndexOf — returns position or -1
text.indexOf("fox")         // 16
text.indexOf("cat")         // -1 (not found)
text.lastIndexOf("the")     // 31 (finds last occurrence, case-sensitive!)
text.indexOf("the", 5)      // 31 (start searching from index 5)

// includes — returns boolean (ES2015)
text.includes("fox")        // true
text.includes("Fox")        // false (case-sensitive!)
text.includes("quick", 10)  // false (starts search at index 10)

// startsWith / endsWith (ES2015)
text.startsWith("The")      // true
text.endsWith("dog")        // true
text.startsWith("quick", 4) // true (starts checking at index 4)

// search — uses regex, returns index or -1
text.search(/fox/i)         // 16
text.search(/[0-9]/)        // -1 (no digits)
```

> [!tip] Which Search Method to Use?
> - Need position? → `indexOf()` or `search()`
> - Need true/false? → `includes()`, `startsWith()`, `endsWith()`
> - Need regex? → `search()`, `match()`, `matchAll()`

---

### Extracting Substrings

```javascript
const str = "Hello, World!";

// slice(start, end) — most versatile, supports negative indices
str.slice(0, 5)       // "Hello"
str.slice(7)          // "World!" (from index to end)
str.slice(-6)         // "orld!" — wait...
str.slice(-6)         // "orld!" — actually counts 6 from end
str.slice(-6, -1)     // "orld"
str.slice(7, 12)      // "World"

// substring(start, end) — like slice but NO negative indices
str.substring(0, 5)   // "Hello"
str.substring(7)      // "World!"
str.substring(7, 0)   // "Hello, " — swaps if start > end (unlike slice!)

// ❌ substr() — DEPRECATED, do not use
// str.substr(7, 5)   // "World" (start, LENGTH not end)
```

> [!tip] Just Use `slice()`
> - Supports negative indices
> - Behavior is predictable (doesn't swap arguments)
> - Works on arrays too (consistent API)

---

### Transforming

```javascript
// Case conversion
"Hello".toUpperCase()  // "HELLO"
"Hello".toLowerCase()  // "hello"

// Trimming whitespace
"  hello  ".trim()       // "hello"
"  hello  ".trimStart()  // "hello  "
"  hello  ".trimEnd()    // "  hello"

// Padding (ES2017)
"5".padStart(3, "0")     // "005"
"hi".padStart(10)        // "        hi" (pads with spaces by default)
"42".padEnd(5, ".")      // "42..."

// Real-world: formatting
const hours = String(9).padStart(2, "0");   // "09"
const minutes = String(5).padStart(2, "0"); // "05"
const time = `${hours}:${minutes}`;         // "09:05"

// Repeating
"ha".repeat(3)           // "hahaha"
"-".repeat(40)           // "----------------------------------------"

// Replacing
"hello world".replace("world", "JS")     // "hello JS" (first occurrence only!)
"aabbcc".replace("b", "X")               // "aaXbcc" (only first!)
"aabbcc".replaceAll("b", "X")            // "aaXXcc" (ES2021 — all occurrences)

// With regex
"Hello World".replace(/[aeiou]/gi, "*")  // "H*ll* W*rld"
"2024-01-15".replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1") // "15/01/2024"

// Concatenation
"Hello".concat(", ", "World")  // "Hello, World" (rarely used — use template literals)
```

---

### Splitting & Joining

```javascript
// split(separator) — string → array
"apple,banana,cherry".split(",")     // ["apple", "banana", "cherry"]
"Hello World".split(" ")             // ["Hello", "World"]
"hello".split("")                    // ["h", "e", "l", "l", "o"]
"a::b::c".split("::")               // ["a", "b", "c"]

// With limit
"a,b,c,d,e".split(",", 3)           // ["a", "b", "c"]

// join(separator) — array → string (the reverse of split)
["apple", "banana", "cherry"].join(", ")  // "apple, banana, cherry"
["2024", "01", "15"].join("-")            // "2024-01-15"
["h", "e", "l", "l", "o"].join("")        // "hello"
```

---

### Matching & Regex Methods

```javascript
const text = "Call 555-1234 or 555-5678 for info";

// match — returns matches array
text.match(/\d{3}-\d{4}/)                  // ["555-1234"] (first match)
text.match(/\d{3}-\d{4}/g)                 // ["555-1234", "555-5678"] (all matches)

// matchAll — returns iterator of detailed matches (ES2020)
for (const match of text.matchAll(/(\d{3})-(\d{4})/g)) {
    console.log(`Full: ${match[0]}, Area: ${match[1]}, Line: ${match[2]}`);
    console.log(`Index: ${match.index}`);
}

// Named capture groups
const dateStr = "2024-01-15";
const { groups } = dateStr.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);
console.log(groups.year, groups.month, groups.day); // "2024" "01" "15"
```

---

### Unicode & Normalization

```javascript
// normalize — Unicode normalization (important for comparison!)
"café".normalize("NFC") === "café".normalize("NFC"); // true
// Some characters have multiple Unicode representations

// ES2024: Well-formed strings
"Hello \uD800".isWellFormed()   // false (lone surrogate)
"Hello 👋".isWellFormed()       // true
"Hello \uD800".toWellFormed()   // "Hello �" (replaces lone surrogates)

// localeCompare — language-aware comparison
"ä".localeCompare("z", "de")   // -1 (in German, ä comes before z)
"ä".localeCompare("z", "sv")   // 1 (in Swedish, ä comes after z!)

// Useful for sorting
const names = ["Ötzi", "Alice", "Über", "Bob"];
names.sort((a, b) => a.localeCompare(b, "en")); // Proper alphabetical sort
```

---

## 📊 String Methods Quick Reference

| Method | Returns | Purpose |
|---|---|---|
| `.length` | `number` | Character count |
| `.at(i)` | `string` | Character at index (negative OK) |
| `.indexOf(s)` | `number` | First position of s (-1 if none) |
| `.includes(s)` | `boolean` | Contains s? |
| `.startsWith(s)` | `boolean` | Begins with s? |
| `.endsWith(s)` | `boolean` | Ends with s? |
| `.slice(i, j)` | `string` | Extract substring |
| `.toUpperCase()` | `string` | All uppercase |
| `.toLowerCase()` | `string` | All lowercase |
| `.trim()` | `string` | Remove surrounding whitespace |
| `.padStart(n, c)` | `string` | Pad beginning |
| `.padEnd(n, c)` | `string` | Pad end |
| `.repeat(n)` | `string` | Repeat n times |
| `.replace(a, b)` | `string` | Replace first a with b |
| `.replaceAll(a, b)` | `string` | Replace all a with b |
| `.split(sep)` | `string[]` | Split into array |
| `.match(regex)` | `array\|null` | Find regex matches |
| `.matchAll(regex)` | `iterator` | All matches with details |
| `.search(regex)` | `number` | Position of regex match |
| `.normalize()` | `string` | Unicode normalization |
| `.localeCompare()` | `number` | Locale-aware comparison |

---

## 🌍 Real-World Recipes

### Capitalize First Letter

```javascript
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
capitalize("hello"); // "Hello"
```

### Title Case

```javascript
function titleCase(str) {
    return str.split(" ").map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ");
}
titleCase("hello world from javascript"); // "Hello World From Javascript"
```

### Slugify (URL-safe strings)

```javascript
function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")     // Remove non-word chars
        .replace(/[\s_]+/g, "-")       // Spaces/underscores → hyphens
        .replace(/^-+|-+$/g, "");      // Remove leading/trailing hyphens
}
slugify("Hello, World! This is a Test"); // "hello-world-this-is-a-test"
```

### Truncate with Ellipsis

```javascript
function truncate(str, maxLength = 100) {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + "...";
}
truncate("A very long string that needs to be shortened", 20);
// "A very long strin..."
```

### Extract Email Parts

```javascript
const email = "alice@example.com";
const [username, domain] = email.split("@");
// username: "alice", domain: "example.com"
```

---

## 🔗 Related Topics

- [[02 - Regular Expressions]] — Pattern matching on strings (Phase 8)
- [[04 - Type Conversion and Coercion]] — String coercion rules
- [[05 - Arrays Foundations]] — `split()` creates arrays, `join()` creates strings
- [[03 - Data Types in Depth]] — String as a primitive type

---

**← Previous:** [[03 - Loops]] | **Next →** [[05 - Arrays Foundations]]
