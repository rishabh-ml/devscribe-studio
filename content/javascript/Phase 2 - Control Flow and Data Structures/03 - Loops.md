---
title: "Loops"
phase: 2
topic: "Loops"
tags:
  - phase2
  - control-flow
  - loops
  - iteration
  - for-of
  - for-in
created: 2026-03-02
---

# Loops

> [!info] The Big Picture
> Loops repeat a block of code until a condition is met. Choosing the **right loop** for the job makes your code more readable, performant, and bug-free. JavaScript has 6 loop types, and each has a specific best use case.

---

## 🔁 The Classic `for` Loop

Most versatile loop. Use when you **need the index** or need precise control over iteration.

```javascript
// Syntax: for (initialization; condition; update)
for (let i = 0; i < 5; i++) {
    console.log(i); // 0, 1, 2, 3, 4
}

// Counting backwards
for (let i = 10; i >= 0; i--) {
    console.log(i); // 10, 9, 8, ..., 0
}

// Step by 2
for (let i = 0; i < 20; i += 2) {
    console.log(i); // 0, 2, 4, 6, ..., 18
}

// Iterating an array with index access
const fruits = ["apple", "banana", "cherry"];
for (let i = 0; i < fruits.length; i++) {
    console.log(`${i}: ${fruits[i]}`);
}

// Multiple variables
for (let i = 0, j = 10; i < j; i++, j--) {
    console.log(i, j); // 0 10, 1 9, 2 8, 3 7, 4 6
}

// Early termination with break
for (let i = 0; i < 100; i++) {
    if (i === 42) break; // Stop the loop
    // ... process
}

// Skip iteration with continue
for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) continue; // Skip even numbers
    console.log(i); // 1, 3, 5, 7, 9
}
```

> [!tip] When to Use the Classic `for` Loop
> - When you need the **index** for calculations
> - When you need to **break early** (can't with `forEach`)
> - When iterating backwards or with custom step sizes
> - When performance is critical (fastest loop type)

---

## 🔄 `while` Loop

Checks condition **before** each iteration. Use when you don't know how many iterations ahead of time.

```javascript
// Basic while
let count = 0;
while (count < 5) {
    console.log(count); // 0, 1, 2, 3, 4
    count++;
}

// Real-world: reading until end of data
let input = prompt("Enter a number (or 'quit'):");
while (input !== "quit") {
    console.log(`You entered: ${input}`);
    input = prompt("Enter a number (or 'quit'):");
}

// Real-world: binary search
function binarySearch(sortedArr, target) {
    let low = 0;
    let high = sortedArr.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (sortedArr[mid] === target) return mid;
        if (sortedArr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1; // Not found
}

// ⚠️ Infinite loop danger!
// while (true) { } // Never does this without a break condition inside
```

---

## 🔃 `do...while` Loop

Executes the body **at least once**, then checks the condition.

```javascript
// Always runs at least once
let num;
do {
    num = Math.floor(Math.random() * 10);
    console.log(`Got: ${num}`);
} while (num !== 7); // Keep going until we get 7

// Real-world: menu system
let choice;
do {
    choice = prompt(`
        1. View profile
        2. Edit settings
        3. Logout
        Choose an option:
    `);

    switch (choice) {
        case "1": viewProfile(); break;
        case "2": editSettings(); break;
        case "3": console.log("Goodbye!"); break;
        default: console.log("Invalid option");
    }
} while (choice !== "3");

// Real-world: pagination — fetch at least one page
let page = 1;
let data;
do {
    data = await fetchPage(page);
    processData(data.results);
    page++;
} while (data.hasNextPage);
```

> [!tip] When to Use `do...while`
> When the action must happen **at least once** before checking the condition — user input loops, pagination, retry logic.

---

## 🔑 `for...in` — Object Keys

Iterates over an object's **enumerable string property keys** (including inherited ones!).

```javascript
const person = { name: "Alice", age: 25, city: "Portland" };

for (const key in person) {
    console.log(`${key}: ${person[key]}`);
}
// name: Alice
// age: 25
// city: Portland

// ⚠️ DANGER: for...in includes inherited properties!
function Animal(name) {
    this.name = name;
}
Animal.prototype.type = "creature";

const dog = new Animal("Rex");
for (const key in dog) {
    console.log(key); // "name", "type" ← includes prototype!
}

// Fix: filter own properties
for (const key in dog) {
    if (Object.hasOwn(dog, key)) { // ES2022+
        console.log(key); // Only "name"
    }
}

// ⚠️ DON'T use for...in with arrays!
const arr = ["a", "b", "c"];
for (const index in arr) {
    console.log(typeof index); // "string"! Not number!
    // Also iterates non-numeric properties if any exist
}
```

> [!danger] Never Use `for...in` on Arrays
> - Keys are **strings**, not numbers (` "0"`, `"1"`, `"2"`)
> - Includes inherited and non-index properties
> - Order is not guaranteed for numeric-like keys in all engines
> - Use `for...of` or `forEach` for arrays instead

---

## 📦 `for...of` — Iterable Values (ES2015)

Iterates over **values** of any iterable (arrays, strings, Maps, Sets, generators, NodeLists).

```javascript
// Arrays — iterates VALUES (not indices)
const colors = ["red", "green", "blue"];
for (const color of colors) {
    console.log(color); // "red", "green", "blue"
}

// Strings — iterates characters (handles Unicode correctly!)
for (const char of "Hello 👋") {
    console.log(char); // "H", "e", "l", "l", "o", " ", "👋"
}

// Maps
const userRoles = new Map([["Alice", "admin"], ["Bob", "user"]]);
for (const [name, role] of userRoles) {
    console.log(`${name} is ${role}`);
}

// Sets
const uniqueNums = new Set([1, 2, 3, 2, 1]);
for (const num of uniqueNums) {
    console.log(num); // 1, 2, 3
}

// NodeList (from DOM queries)
const buttons = document.querySelectorAll("button");
for (const button of buttons) {
    button.addEventListener("click", handleClick);
}

// With destructuring
const people = [
    { name: "Alice", age: 25 },
    { name: "Bob", age: 30 }
];
for (const { name, age } of people) {
    console.log(`${name} is ${age}`);
}

// Getting index with entries()
for (const [index, color] of colors.entries()) {
    console.log(`${index}: ${color}`);
}
```

> [!warning] `for...of` Does NOT Work on Plain Objects
> ```javascript
> const obj = { a: 1, b: 2 };
> // for (const val of obj) { } // ❌ TypeError: obj is not iterable
> 
> // ✅ Convert to iterable first:
> for (const [key, val] of Object.entries(obj)) { }
> for (const key of Object.keys(obj)) { }
> for (const val of Object.values(obj)) { }
> ```

---

## 🏷️ Labeled Statements

Control flow for **nested loops** — break or continue a specific outer loop.

```javascript
// Label a loop
outer: for (let i = 0; i < 3; i++) {
    inner: for (let j = 0; j < 3; j++) {
        if (i === 1 && j === 1) {
            break outer; // Breaks the OUTER loop entirely
        }
        console.log(`i=${i}, j=${j}`);
    }
}
// i=0,j=0  i=0,j=1  i=0,j=2  i=1,j=0  (stops here)

// continue with label
outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (j === 1) {
            continue outer; // Skip rest of inner loop, go to next i
        }
        console.log(`i=${i}, j=${j}`);
    }
}
// i=0,j=0  i=1,j=0  i=2,j=0  (skips j=1 and j=2 each time)

// Real-world: matrix search
function findInMatrix(matrix, target) {
    search: for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] === target) {
                console.log(`Found at [${row}][${col}]`);
                break search;
            }
        }
    }
}
```

---

## 📊 Which Loop to Use?

| Situation | Best Loop | Why |
|---|---|---|
| Array with index needed | `for` | Direct index access, break/continue |
| Array values only | `for...of` | Clean, readable, handles Unicode |
| Array transformation | `map`/`filter`/`reduce` | Functional, returns new array |
| Object keys | `for...in` + `hasOwn` or `Object.keys()` | Designed for object enumeration |
| Object entries | `for...of` + `Object.entries()` | Key-value pairs |
| Unknown iteration count | `while` | Condition-based stopping |
| At least one execution | `do...while` | Guaranteed first run |
| Nested loop control | Labeled `for` | `break outer`/`continue outer` |
| Map/Set | `for...of` | Natively iterable |
| Side effects on array | `forEach` | When no return value needed |

---

## 🌍 Real-World Patterns

### Retry Logic

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            const response = await fetch(url);
            if (response.ok) return await response.json();
            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            attempt++;
            if (attempt >= maxRetries) throw error;
            console.warn(`Attempt ${attempt} failed, retrying...`);
            await new Promise(r => setTimeout(r, 1000 * attempt)); // Backoff
        }
    }
}
```

### Processing Chunks

```javascript
function processInChunks(items, chunkSize = 100) {
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        processChunk(chunk);
    }
}
```

### Iterating DOM Elements

```javascript
// Add click handler to all buttons
for (const button of document.querySelectorAll(".action-btn")) {
    button.addEventListener("click", (e) => {
        console.log(`Clicked: ${e.target.textContent}`);
    });
}
```

---

## ⚠️ Common Pitfalls

> [!danger] Off-By-One Errors
> ```javascript
> const arr = [1, 2, 3];
> // ❌ i <= arr.length — accesses arr[3] which is undefined!
> for (let i = 0; i <= arr.length; i++) { }
> // ✅ i < arr.length
> for (let i = 0; i < arr.length; i++) { }
> ```

> [!danger] Infinite Loops
> ```javascript
> // ❌ Forgot to increment — runs forever!
> let i = 0;
> while (i < 10) {
>     console.log(i);
>     // i++ is missing!
> }
> ```

> [!danger] Modifying Array During Iteration
> ```javascript
> // ❌ Removing items while iterating — skips elements!
> const arr = [1, 2, 3, 4, 5];
> for (let i = 0; i < arr.length; i++) {
>     if (arr[i] % 2 === 0) arr.splice(i, 1);
> }
> // ✅ Use filter instead
> const odd = arr.filter(n => n % 2 !== 0);
> ```

---

## 🔗 Related Topics

- [[02 - Conditionals]] — Conditions used in loop tests
- [[06 - Array Iteration Methods]] — Functional alternatives to loops
- [[05 - Iterators and Generators]] — The protocol behind `for...of`

---

**← Previous:** [[02 - Conditionals]] | **Next →** [[04 - Strings Deep Dive]]
