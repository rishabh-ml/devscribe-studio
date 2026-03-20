---
title: "Arrays Foundations"
phase: 2
topic: "Arrays"
tags:
  - phase2
  - data-structures
  - arrays
  - destructuring
  - spread
  - methods
created: 2026-03-02
---

# Arrays Foundations

> [!info] The Big Picture
> Arrays are **ordered collections** of values — the most commonly used data structure in JavaScript. They're used for everything: API response lists, DOM element collections, user inputs, configuration options, and data processing pipelines. Understanding arrays deeply is non-negotiable for any JavaScript developer.

---

## 🏗️ Creating Arrays

```javascript
// Array literal — the standard way
const fruits = ["apple", "banana", "cherry"];

// Empty array
const empty = [];

// Mixed types (valid but usually avoided)
const mixed = [1, "hello", true, null, { name: "Alice" }, [1, 2]];

// Array.of() — creates array from arguments
Array.of(7)         // [7] (NOT 7 empty slots)
Array.of(1, 2, 3)   // [1, 2, 3]

// Array.from() — creates array from iterable or array-like
Array.from("hello")               // ["h", "e", "l", "l", "o"]
Array.from({ length: 5 }, (_, i) => i)  // [0, 1, 2, 3, 4]
Array.from(new Set([1, 2, 2, 3])) // [1, 2, 3] (Set → Array)
Array.from(document.querySelectorAll("div")) // NodeList → Array

// new Array() — ⚠️ inconsistent behavior
new Array(3)        // [ , , ] — 3 empty slots (NOT [3])
new Array(1, 2, 3)  // [1, 2, 3] — when multiple args, creates elements

// Generate sequences
Array.from({ length: 10 }, (_, i) => i + 1); // [1, 2, ..., 10]
[...Array(5).keys()];                         // [0, 1, 2, 3, 4]
```

> [!tip] Always Use Array Literals `[]` or `Array.from()`
> Avoid `new Array()` — the single-argument behavior is a trap.

---

## 📦 Accessing & Modifying

```javascript
const arr = ["a", "b", "c", "d", "e"];

// Bracket notation (0-indexed)
arr[0]          // "a" (first)
arr[4]          // "e" (last)
arr[99]         // undefined (no error for out-of-bounds!)

// .at() — supports negative indices (ES2022)
arr.at(0)       // "a"
arr.at(-1)      // "e" (last element!)
arr.at(-2)      // "d" (second to last)

// Modifying by index
arr[1] = "B";   // arr is now ["a", "B", "c", "d", "e"]

// .length property
arr.length      // 5

// ⚠️ .length is WRITABLE — setting it shorter truncates!
arr.length = 3; // arr is now ["a", "B", "c"] — "d" and "e" are gone!
arr.length = 5; // arr is now ["a", "B", "c", empty × 2]
```

---

## 🔓 Destructuring

Extract values from arrays into variables in a single statement.

```javascript
const colors = ["red", "green", "blue", "yellow", "purple"];

// Basic destructuring
const [first, second, third] = colors;
// first = "red", second = "green", third = "blue"

// Skip elements
const [, , thirdColor] = colors; // thirdColor = "blue"

// Rest operator — collect remaining elements
const [primary, ...rest] = colors;
// primary = "red", rest = ["green", "blue", "yellow", "purple"]

// Default values
const [a, b, c = "fallback"] = [1, 2];
// a = 1, b = 2, c = "fallback"

// Swapping variables (no temp needed!)
let x = 1, y = 2;
[x, y] = [y, x]; // x = 2, y = 1 ✨

// Nested destructuring
const matrix = [[1, 2], [3, 4]];
const [[a1, a2], [b1, b2]] = matrix;
// a1 = 1, a2 = 2, b1 = 3, b2 = 4

// From function returns
function getCoords() {
    return [12.5, 45.3];
}
const [lat, lng] = getCoords();

// In for...of loops
const entries = [["name", "Alice"], ["age", 25]];
for (const [key, value] of entries) {
    console.log(`${key}: ${value}`);
}
```

---

## 📤 Spread Operator with Arrays

```javascript
// Copy an array (shallow)
const original = [1, 2, 3];
const copy = [...original]; // [1, 2, 3] — new independent array

// Merge arrays
const merged = [...arr1, ...arr2, ...arr3];

// Insert elements at any position
const withInsert = [...arr.slice(0, 2), "new", ...arr.slice(2)];

// Convert iterables to arrays
const chars = [..."Hello"]; // ["H", "e", "l", "l", "o"]
const unique = [...new Set([1, 2, 2, 3])]; // [1, 2, 3]

// Function arguments
const numbers = [5, 2, 8, 1, 9];
Math.max(...numbers); // 9
```

---

## 🔧 Mutating Methods (Change the Original Array)

> [!warning] These methods **modify the original array**. Use with care!

### Adding/Removing Elements

```javascript
const arr = [1, 2, 3];

// push() — add to END, returns new length
arr.push(4);          // arr = [1, 2, 3, 4], returns 4
arr.push(5, 6);       // arr = [1, 2, 3, 4, 5, 6], returns 6

// pop() — remove from END, returns removed element
arr.pop();            // arr = [1, 2, 3, 4, 5], returns 6

// unshift() — add to START, returns new length
arr.unshift(0);       // arr = [0, 1, 2, 3, 4, 5], returns 6

// shift() — remove from START, returns removed element
arr.shift();          // arr = [1, 2, 3, 4, 5], returns 0
```

### splice() — The Swiss Army Knife

```javascript
const arr = ["a", "b", "c", "d", "e"];

// splice(startIndex, deleteCount, ...itemsToInsert)

// Remove 2 elements at index 1
arr.splice(1, 2);     // Returns ["b", "c"], arr = ["a", "d", "e"]

// Insert without deleting
arr.splice(1, 0, "x", "y"); // arr = ["a", "x", "y", "d", "e"]

// Replace
arr.splice(1, 2, "B", "C"); // Returns ["x", "y"], arr = ["a", "B", "C", "d", "e"]

// Remove last 2 elements
arr.splice(-2);       // Returns ["d", "e"]
```

### Ordering

```javascript
// reverse() — reverses in place
[1, 2, 3].reverse();  // [3, 2, 1]

// sort() — sorts IN PLACE, converts to strings by default!
[10, 1, 5, 2].sort();           // [1, 10, 2, 5] ❌ (string order!)
[10, 1, 5, 2].sort((a, b) => a - b); // [1, 2, 5, 10] ✅ (numeric asc)
[10, 1, 5, 2].sort((a, b) => b - a); // [10, 5, 2, 1] ✅ (numeric desc)

// String sort
["banana", "apple", "cherry"].sort(); // ["apple", "banana", "cherry"]
// Case-insensitive
["Banana", "apple", "Cherry"].sort((a, b) => 
    a.toLowerCase().localeCompare(b.toLowerCase())
);
```

> [!danger] `sort()` Without Comparator is Almost Always Wrong
> ```javascript
> [10, 9, 80].sort()  // [10, 80, 9] ← sorts as strings!
> [10, 9, 80].sort((a, b) => a - b)  // [9, 10, 80] ✅
> ```

### fill() and copyWithin()

```javascript
// fill(value, start, end) — fill with a value
[0, 0, 0, 0, 0].fill(7);        // [7, 7, 7, 7, 7]
[0, 0, 0, 0, 0].fill(7, 2, 4);  // [0, 0, 7, 7, 0]
new Array(5).fill(0);             // [0, 0, 0, 0, 0]

// copyWithin(target, start, end) — copy within the array
[1, 2, 3, 4, 5].copyWithin(0, 3); // [4, 5, 3, 4, 5]
```

---

## 🔒 Non-Mutating Methods (Return New Array/Value)

### Extracting

```javascript
const arr = [1, 2, 3, 4, 5];

// slice(start, end) — extract portion, returns new array
arr.slice(1, 3)     // [2, 3] — original unchanged!
arr.slice(2)        // [3, 4, 5]
arr.slice(-2)       // [4, 5]
arr.slice()         // [1, 2, 3, 4, 5] — shallow copy!

// concat() — merge arrays, returns new array
[1, 2].concat([3, 4])        // [1, 2, 3, 4]
[1, 2].concat([3], [4], [5]) // [1, 2, 3, 4, 5]
```

### Searching

```javascript
const arr = [10, 20, 30, 20, 10];

arr.indexOf(20)       // 1 (first occurrence)
arr.lastIndexOf(20)   // 3 (last occurrence)
arr.indexOf(99)       // -1 (not found)

arr.includes(30)      // true (ES2016)
arr.includes(99)      // false
```

### Flattening

```javascript
// flat(depth) — flatten nested arrays (ES2019)
[1, [2, 3], [4, [5]]].flat()     // [1, 2, 3, 4, [5]] — one level
[1, [2, [3, [4]]]].flat(Infinity) // [1, 2, 3, 4] — all levels

// flatMap() — map then flat(1) — very common
const sentences = ["Hello World", "Foo Bar"];
sentences.flatMap(s => s.split(" ")); // ["Hello", "World", "Foo", "Bar"]

// vs map + flat
sentences.map(s => s.split(" "));     // [["Hello", "World"], ["Foo", "Bar"]]
sentences.map(s => s.split(" ")).flat(); // ["Hello", "World", "Foo", "Bar"]
```

### Joining

```javascript
// join(separator) — array → string
["2024", "01", "15"].join("-")   // "2024-01-15"
[1, 2, 3].join(", ")            // "1, 2, 3"
["a", "b", "c"].join("")         // "abc"
```

---

## ✨ ES2023 "Change by Copy" Methods

These return **new arrays** without modifying the original — a big deal for immutable state patterns (React, Redux).

```javascript
const original = [3, 1, 4, 1, 5];

// toSorted() — sort without mutating
const sorted = original.toSorted((a, b) => a - b);
// sorted = [1, 1, 3, 4, 5], original = [3, 1, 4, 1, 5] ✅

// toReversed() — reverse without mutating
const reversed = original.toReversed();
// reversed = [5, 1, 4, 1, 3], original unchanged ✅

// toSpliced(start, deleteCount, ...items) — splice without mutating
const spliced = original.toSpliced(1, 2, 99, 88);
// spliced = [3, 99, 88, 1, 5], original unchanged ✅

// with(index, value) — replace at index without mutating
const replaced = original.with(2, 999);
// replaced = [3, 1, 999, 1, 5], original unchanged ✅
```

> [!tip] Use the ES2023 Methods for Immutable Patterns
> In React, you should never mutate state directly. These methods eliminate the need for `[...arr].sort()` or `[...arr].reverse()` patterns.

---

## 🔍 Checking Arrays

```javascript
// Array.isArray() — the correct way
Array.isArray([1, 2])      // true
Array.isArray("hello")     // false
Array.isArray({ length: 3 }) // false — array-like but not array

// typeof is useless for arrays!
typeof [1, 2]              // "object" — doesn't tell you it's an array
```

---

## 🌍 Real-World Patterns

### Remove Duplicates

```javascript
const unique = [...new Set([1, 2, 2, 3, 3, 3])]; // [1, 2, 3]
```

### Remove Item by Value

```javascript
const arr = ["a", "b", "c", "d"];
const withoutB = arr.filter(item => item !== "b"); // ["a", "c", "d"]
```

### Chunk Array

```javascript
function chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}
chunk([1, 2, 3, 4, 5, 6, 7], 3); // [[1,2,3], [4,5,6], [7]]
```

### Last N Elements

```javascript
const last3 = arr.slice(-3);
```

### Random Element

```javascript
const random = arr[Math.floor(Math.random() * arr.length)];
```

---

## 🎯 Practice Exercises

1. **Array Method Flashcards** — Without looking at docs, list which methods mutate and which return new arrays. Verify with code. (`push`, `pop`, `splice`, `slice`, `sort`, `reverse`, `concat`, `map`, `filter`).
2. **Matrix Operations** — Create a 3×3 matrix (array of arrays). Write functions to: (a) get a specific element, (b) transpose the matrix, (c) flatten it.
3. **Deduplication** — Remove duplicates from an array three ways: `Set`, `filter` + `indexOf`, and `reduce`.
4. **Array From** — Use `Array.from()` to: (a) create an array from a string, (b) generate a range `[1..10]`, (c) convert a NodeList to an array.
5. **Chunk Array** — Write `chunk(arr, size)` that splits an array into sub-arrays of the given size. Example: `chunk([1,2,3,4,5], 2)` → `[[1,2],[3,4],[5]]`.

---

## 🔗 Related Topics

- [[06 - Array Iteration Methods]] — `map`, `filter`, `reduce` and more
- [[04 - Strings Deep Dive]] — `split()` creates arrays, `join()` creates strings
- [[07 - Objects Foundations]] — Objects vs arrays for different data shapes
- [[05 - Iterators and Generators]] — The protocol behind `for...of` with arrays

---

**← Previous:** [[04 - Strings Deep Dive]] | **Next →** [[06 - Array Iteration Methods]]
