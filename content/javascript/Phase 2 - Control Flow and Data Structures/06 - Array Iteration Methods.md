---
title: "Array Iteration Methods"
phase: 2
topic: "Array Methods"
tags:
  - phase2
  - data-structures
  - arrays
  - map
  - filter
  - reduce
  - functional
  - interview
created: 2026-03-02
---

# Array Iteration Methods

> [!info] The Big Picture
> Array iteration methods are the **backbone of JavaScript data manipulation**. They replace loops with declarative, functional-style code that's more readable and less error-prone. Mastering `map`, `filter`, and especially `reduce` is essential — you'll use them in every JavaScript project, from simple scripts to complex React applications.

---

## 🎯 The Core Three: map, filter, reduce

### `map()` — Transform Every Element

Creates a **new array** by applying a function to every element. The original array is unchanged.

```javascript
// Syntax: array.map(callback(element, index, array))

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
// doubled = [2, 4, 6, 8, 10]
// numbers = [1, 2, 3, 4, 5] — unchanged!

// With objects
const users = [
    { name: "Alice", age: 25 },
    { name: "Bob", age: 30 },
];
const names = users.map(user => user.name);
// ["Alice", "Bob"]

// Transform objects
const userCards = users.map(user => ({
    ...user,
    displayName: user.name.toUpperCase(),
    isAdult: user.age >= 18,
}));

// Using index parameter
const indexed = ["a", "b", "c"].map((item, i) => `${i}: ${item}`);
// ["0: a", "1: b", "2: c"]
```

> [!tip] When to Use `map()`
> When you want to **transform every element** into something else. The output array always has the **same length** as the input.
> 
> - Convert data formats (API response → UI data)
> - Extract specific fields from objects
> - Apply calculations to every element
> - Create JSX elements from data (React)

**Real-world: API data transformation**

```javascript
// Raw API response
const apiUsers = [
    { user_name: "alice_w", registered_at: "2024-01-15" },
    { user_name: "bob_s", registered_at: "2024-03-20" },
];

// Transform to app format
const appUsers = apiUsers.map(u => ({
    username: u.user_name,
    joinDate: new Date(u.registered_at),
    displayName: u.user_name.replace("_", " "),
}));
```

---

### `filter()` — Keep Elements That Pass a Test

Creates a **new array** with only the elements where the callback returns `true`.

```javascript
// Syntax: array.filter(callback(element, index, array))

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const evens = numbers.filter(n => n % 2 === 0);
// [2, 4, 6, 8, 10]

const bigNumbers = numbers.filter(n => n > 5);
// [6, 7, 8, 9, 10]

// Filter objects
const products = [
    { name: "Laptop", price: 999, inStock: true },
    { name: "Phone", price: 699, inStock: false },
    { name: "Tablet", price: 449, inStock: true },
    { name: "Watch", price: 199, inStock: true },
];

const available = products.filter(p => p.inStock);
const affordable = products.filter(p => p.price < 500);
const affordableAndAvail = products.filter(p => p.inStock && p.price < 500);

// Remove falsy values
const withFalsy = [0, 1, "", "hello", null, undefined, false, true];
const truthy = withFalsy.filter(Boolean);
// [1, "hello", true]
```

> [!tip] When to Use `filter()`
> When you want to **select a subset** of elements based on a condition. The output array can be shorter than (or equal to) the input, never longer.
> 
> - Search/filter features
> - Removing items from lists
> - Selecting items by category
> - Cleaning data (removing nulls, duplicates)

---

### `reduce()` — Accumulate to a Single Value

The most powerful array method. Reduces an entire array down to **a single value** — which can be a number, string, object, array, or anything.

```javascript
// Syntax: array.reduce(callback(accumulator, currentValue, index, array), initialValue)

// Sum of numbers
const sum = [1, 2, 3, 4, 5].reduce((acc, curr) => acc + curr, 0);
// Step by step:
// acc=0, curr=1 → 1
// acc=1, curr=2 → 3
// acc=3, curr=3 → 6
// acc=6, curr=4 → 10
// acc=10, curr=5 → 15
// Result: 15

// Product
const product = [2, 3, 4].reduce((acc, curr) => acc * curr, 1);
// 24

// Max value (though Math.max is simpler)
const max = [5, 3, 9, 1].reduce((a, b) => Math.max(a, b), -Infinity);

// Flatten array (though .flat() is simpler)
const nested = [[1, 2], [3, 4], [5, 6]];
const flat = nested.reduce((acc, arr) => [...acc, ...arr], []);
// [1, 2, 3, 4, 5, 6]
```

**The real power: reducing to objects**

```javascript
// Count occurrences
const fruits = ["apple", "banana", "apple", "cherry", "banana", "apple"];
const counts = fruits.reduce((acc, fruit) => {
    acc[fruit] = (acc[fruit] || 0) + 1;
    return acc;
}, {});
// { apple: 3, banana: 2, cherry: 1 }

// Group by property
const people = [
    { name: "Alice", dept: "Engineering" },
    { name: "Bob", dept: "Marketing" },
    { name: "Charlie", dept: "Engineering" },
    { name: "Diana", dept: "Marketing" },
];

const byDept = people.reduce((groups, person) => {
    const dept = person.dept;
    groups[dept] = groups[dept] || [];
    groups[dept].push(person);
    return groups;
}, {});
// { Engineering: [{Alice}, {Charlie}], Marketing: [{Bob}, {Diana}] }

// 💡 ES2024 has Object.groupBy() for this! See [[ES2024 Features]]

// Build a lookup map
const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
];

const userById = users.reduce((map, user) => {
    map[user.id] = user;
    return map;
}, {});
// { 1: {id:1, name:"Alice"}, 2: {id:2, name:"Bob"}, ... }
// Now: userById[2].name → "Bob" (O(1) lookup!)

// Compose pipeline of functions
const pipeline = [
    str => str.trim(),
    str => str.toLowerCase(),
    str => str.replace(/\s+/g, "-"),
];
const slug = pipeline.reduce((result, fn) => fn(result), "  Hello World  ");
// "hello-world"
```

> [!warning] Always Provide an Initial Value
> ```javascript
> // ❌ Without initial value — uses first element as accumulator
> [].reduce((a, b) => a + b); // TypeError: Reduce of empty array with no initial value!
> 
> // ✅ With initial value — safe for empty arrays
> [].reduce((a, b) => a + b, 0); // 0
> ```

> [!tip] When to Use `reduce()`
> When the output is a **different shape** than the input:
> - Array → Number (sum, count, average)
> - Array → Object (grouping, indexing, counting)
> - Array → String (joining with custom logic)
> - Array → Array (complex transformations that `map`/`filter` can't do)
> - Any accumulation pattern

---

## 🔍 Finding Methods

```javascript
const users = [
    { id: 1, name: "Alice", active: true },
    { id: 2, name: "Bob", active: false },
    { id: 3, name: "Charlie", active: true },
    { id: 4, name: "Diana", active: false },
];

// find() — returns FIRST element that passes test (or undefined)
const bob = users.find(u => u.name === "Bob");
// { id: 2, name: "Bob", active: false }

// findIndex() — returns INDEX of first match (or -1)
const bobIndex = users.findIndex(u => u.name === "Bob");
// 1

// findLast() — returns LAST element that passes test (ES2023)
const lastInactive = users.findLast(u => !u.active);
// { id: 4, name: "Diana", active: false }

// findLastIndex() — returns index of LAST match (ES2023)
const lastInactiveIdx = users.findLastIndex(u => !u.active);
// 3
```

> [!tip] `find` vs `filter`
> - `find()` returns **one element** (the first match) or `undefined`
> - `filter()` returns **all matching elements** in an array
> 
> Use `find()` when you need exactly one result (like finding by ID).

---

## ✅ Testing Methods

```javascript
const numbers = [2, 4, 6, 8, 10];

// some() — at LEAST ONE element passes? Returns boolean
numbers.some(n => n > 8);     // true (10 > 8)
numbers.some(n => n > 100);   // false

// every() — ALL elements pass? Returns boolean
numbers.every(n => n % 2 === 0); // true (all even)
numbers.every(n => n > 5);       // false (2 and 4 fail)

// Real-world: form validation
const fields = [
    { name: "email", value: "alice@example.com", valid: true },
    { name: "password", value: "secret", valid: false },
];

const allValid = fields.every(f => f.valid); // false
const anyValid = fields.some(f => f.valid);  // true
```

---

## 🔄 `forEach()` — Side Effects Only

Executes a function for each element. Returns `undefined` — **cannot** be chained, **cannot** break early.

```javascript
const fruits = ["apple", "banana", "cherry"];

fruits.forEach((fruit, index) => {
    console.log(`${index}: ${fruit}`);
});

// Real-world: DOM updates
document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", handleCardClick);
});
```

> [!warning] Limitations of `forEach`
> - **Cannot break or continue** (use `for...of` if you need to)
> - **Cannot use `await`** inside (use `for...of` for async iteration)
> - Returns `undefined` (cannot chain)
> 
> ```javascript
> // ❌ Cannot break
> [1, 2, 3].forEach(n => {
>     if (n === 2) break; // SyntaxError!
> });
> 
> // ❌ Cannot await properly
> urls.forEach(async url => {
>     await fetch(url); // These fire in PARALLEL, not sequentially!
> });
> 
> // ✅ Use for...of for both cases
> for (const url of urls) {
>     await fetch(url); // Sequential ✅
> }
> ```

---

## ⛓️ Method Chaining

The real power comes from **combining** methods in pipelines:

```javascript
const transactions = [
    { id: 1, type: "sale", amount: 100, date: "2024-01" },
    { id: 2, type: "refund", amount: 50, date: "2024-01" },
    { id: 3, type: "sale", amount: 200, date: "2024-02" },
    { id: 4, type: "sale", amount: 150, date: "2024-01" },
    { id: 5, type: "refund", amount: 30, date: "2024-02" },
];

// Total sales revenue for January
const janRevenue = transactions
    .filter(t => t.type === "sale")       // Keep sales only
    .filter(t => t.date === "2024-01")    // Keep January only
    .map(t => t.amount)                    // Extract amounts
    .reduce((sum, amt) => sum + amt, 0);   // Sum them up
// 250

// Get sorted unique transaction types
const types = [...new Set(
    transactions.map(t => t.type)
)].sort();
// ["refund", "sale"]

// Transform for display
const summary = transactions
    .filter(t => t.type === "sale")
    .map(t => ({
        ...t,
        display: `Sale #${t.id}: $${t.amount}`,
        month: new Date(t.date + "-01").toLocaleDateString("en", { month: "long" }),
    }))
    .sort((a, b) => b.amount - a.amount);
```

> [!tip] Reading Chains
> Read chains **top-to-bottom**: each method transforms the data for the next step. Think of it as a data pipeline:
> ```
> raw data → filter → transform → accumulate → result
> ```

---

## `reduceRight()`

Same as `reduce()` but processes from **right to left**.

```javascript
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

const processString = compose(
    s => s.toUpperCase(),    // Step 3: uppercase
    s => s.trim(),            // Step 2: trim
    s => s.replace(/\s+/g, " ") // Step 1: normalize spaces
);

processString("  hello   world  "); // "HELLO WORLD"
```

---

## 📊 Quick Decision Guide

```
What do I want?                    → Method
────────────────────────────────── ──────────
Transform every element            → map()
Keep matching elements             → filter()
Accumulate to single value         → reduce()
Find one element                   → find()
Find element index                 → findIndex()
Check if any match                 → some()
Check if all match                 → every()
Just do something (side effect)    → forEach()
Check if element exists            → includes()
Find from the end                  → findLast() / findLastIndex()
```

---

## 🌍 Real-World: Complete Data Pipeline

```javascript
// E-commerce dashboard: process orders
const orders = [
    { id: 1, customer: "Alice", items: [{name: "Laptop", price: 999}], status: "delivered" },
    { id: 2, customer: "Bob", items: [{name: "Phone", price: 699}, {name: "Case", price: 29}], status: "delivered" },
    { id: 3, customer: "Alice", items: [{name: "Tablet", price: 449}], status: "cancelled" },
    { id: 4, customer: "Charlie", items: [{name: "Watch", price: 199}], status: "delivered" },
];

// Revenue by customer (delivered orders only)
const revenueByCustomer = orders
    .filter(o => o.status === "delivered")
    .reduce((acc, order) => {
        const total = order.items.reduce((sum, item) => sum + item.price, 0);
        acc[order.customer] = (acc[order.customer] || 0) + total;
        return acc;
    }, {});
// { Alice: 999, Bob: 728, Charlie: 199 }

// Top customer
const topCustomer = Object.entries(revenueByCustomer)
    .sort(([, a], [, b]) => b - a)
    [0];
// ["Alice", 999]
```

---

## � Common Interview Questions

**Q1: What's the difference between `map()` and `forEach()`?**
> `map()` returns a **new array** with transformed elements. `forEach()` returns `undefined` — it's for side effects only. Use `map()` when you need the result, `forEach()` when you just need to iterate.

**Q2: Implement `Array.prototype.reduce` from scratch.**
> ```js
> Array.prototype.myReduce = function(callback, initialValue) {
>   let acc = initialValue;
>   let startIndex = 0;
>   if (acc === undefined) {
>     acc = this[0];
>     startIndex = 1;
>   }
>   for (let i = startIndex; i < this.length; i++) {
>     acc = callback(acc, this[i], i, this);
>   }
>   return acc;
> };
> ```

**Q3: How do you flatten a nested array?**
> - `arr.flat(depth)` — flattens to specified depth (default 1)
> - `arr.flat(Infinity)` — fully flattens any depth
> - Manual: `arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? val.flat(Infinity) : val), [])`

**Q4: Find the first duplicate in an array.**
> ```js
> function firstDuplicate(arr) {
>   const seen = new Set();
>   for (const item of arr) {
>     if (seen.has(item)) return item;
>     seen.add(item);
>   }
>   return undefined;
> }
> ```

**Q5: What does `some()` vs `every()` return on an empty array?**
> `[].some(fn)` returns `false` (no element satisfies the condition). `[].every(fn)` returns `true` (vacuous truth — no element violates the condition).

---

## 🎯 Practice Exercises

1. **Method Reimplementation** — Implement your own versions of `map`, `filter`, `find`, and `every` using only `for` loops.
2. **Data Pipeline** — Given an array of transaction objects `{amount, type, date}`, use chained methods to: filter by type, sort by date, calculate running totals with `reduce`, and format as strings with `map`.
3. **Group By** — Write `groupBy(arr, keyFn)` using `reduce` that groups array elements by the result of `keyFn`. Example: `groupBy([6.1, 4.2, 6.3], Math.floor)` → `{4: [4.2], 6: [6.1, 6.3]}`.
4. **Flatten Deep** — Write `flattenDeep(arr)` recursively without using `.flat()`.
5. **Array Intersection** — Write a function that takes multiple arrays and returns elements common to ALL of them using `filter` and `every`.

---

## �🔗 Related Topics

- [[05 - Arrays Foundations]] — Array basics, creation, mutating methods
- [[07 - Higher-Order Functions]] — Understanding functions as arguments
- [[03 - Functional Programming]] — Deep dive in Phase 9
- [[05 - Iterators and Generators]] — Lazy iteration (Phase 7)

---

**← Previous:** [[05 - Arrays Foundations]] | **Next →** [[07 - Objects Foundations]]
