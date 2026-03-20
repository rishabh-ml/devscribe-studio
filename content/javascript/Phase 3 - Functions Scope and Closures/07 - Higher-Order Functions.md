---
title: Higher-Order Functions
phase: 3
topic: Higher-Order Functions
tags: [javascript, higher-order-functions, callbacks, first-class-functions, abstraction]
created: 2025-01-15
---

# Higher-Order Functions

> [!info] **Big Picture**
> A higher-order function (HOF) is a function that **takes a function as an argument**, **returns a function**, or both. This is possible because JavaScript treats functions as **first-class citizens** — they can be assigned to variables, passed as arguments, returned from functions, and stored in data structures, just like any other value. HOFs are the backbone of JavaScript's `map`, `filter`, `reduce`, event handlers, Promises, and virtually every callback-driven API.

---

## First-Class Functions

In JavaScript, functions are values — they are objects with a `typeof` of `"function"`.

```js
// Assign to a variable
const greet = function(name) { return `Hi, ${name}!`; };

// Store in an array
const fns = [Math.floor, Math.ceil, Math.round];

// Store in an object
const strategies = {
  add: (a, b) => a + b,
  multiply: (a, b) => a * b,
};

// Pass as an argument
[1, 2, 3].map(x => x * 2);

// Return from a function
function createGreeter(greeting) {
  return name => `${greeting}, ${name}!`;
}
```

---

## What Makes a Function "Higher-Order"?

A function is higher-order if it does **at least one** of these:

### 1. Takes a Function as an Argument

```js
function repeat(n, action) {
  for (let i = 0; i < n; i++) {
    action(i);
  }
}

repeat(3, console.log);
// 0
// 1
// 2

repeat(3, i => console.log(`Step ${i + 1}`));
// "Step 1"
// "Step 2"
// "Step 3"
```

### 2. Returns a Function

```js
function greaterThan(n) {
  return value => value > n;
}

const greaterThan10 = greaterThan(10);

greaterThan10(15); // true
greaterThan10(5);  // false

// Use directly with filter
[5, 10, 15, 20].filter(greaterThan(12));
// [15, 20]
```

### 3. Both

```js
function unless(test, thenDo) {
  if (!test) thenDo();
}

function transform(fn) {
  return function(value) {
    return fn(value);
  };
}
```

---

## Built-in Higher-Order Functions

You've already been using HOFs:

```js
// Array methods — all take functions as arguments
[1, 2, 3].map(x => x * 2);           // [2, 4, 6]
[1, 2, 3].filter(x => x > 1);        // [2, 3]
[1, 2, 3].reduce((sum, x) => sum + x, 0); // 6
[1, 2, 3].forEach(x => console.log(x));
[1, 2, 3].some(x => x > 2);          // true
[1, 2, 3].every(x => x > 0);         // true
[1, 2, 3].find(x => x > 1);          // 2
[1, 2, 3].sort((a, b) => a - b);     // [1, 2, 3]

// setTimeout / setInterval
setTimeout(() => console.log("later"), 1000);

// addEventListener
button.addEventListener("click", event => {
  console.log("clicked!", event.target);
});

// Promise.then
fetch("/api/data")
  .then(response => response.json())
  .then(data => console.log(data));
```

---

## Callbacks

A **callback** is a function passed to another function to be called later. Callbacks are the foundation of asynchronous JavaScript.

### Synchronous Callbacks

```js
// forEach is synchronous — the callback runs immediately for each element
["a", "b", "c"].forEach(function(item, index) {
  console.log(`${index}: ${item}`);
});
console.log("done");
// 0: a
// 1: b
// 2: c
// done
```

### Asynchronous Callbacks

```js
console.log("start");

setTimeout(function() {
  console.log("timeout fired");
}, 0);

console.log("end");

// Output:
// "start"
// "end"
// "timeout fired" — runs AFTER current code finishes
```

### Node.js Error-First Callbacks

```js
const fs = require("fs");

// Convention: callback(error, result)
fs.readFile("config.json", "utf8", function(error, data) {
  if (error) {
    console.error("Failed to read:", error.message);
    return;
  }
  console.log("File contents:", data);
});
```

---

## Callback Hell (Pyramid of Doom)

When async callbacks are nested, code becomes deeply indented and hard to follow:

```js
// ❌ Callback Hell
getUser(userId, function(error, user) {
  if (error) return handleError(error);
  
  getOrders(user.id, function(error, orders) {
    if (error) return handleError(error);
    
    getOrderDetails(orders[0].id, function(error, details) {
      if (error) return handleError(error);
      
      getShippingInfo(details.trackingId, function(error, shipping) {
        if (error) return handleError(error);
        
        displayShipping(shipping);
        // 4 levels deep... and it keeps going...
      });
    });
  });
});
```

> [!tip] **Solutions to Callback Hell**
> 1. **Promises** — Chain `.then()` calls for flat sequential async code
> 2. **Async/Await** — Write async code that reads like synchronous code
> 3. **Named functions** — Extract callbacks into named functions
> 
> ```js
> // ✅ Same logic with async/await
> try {
>   const user = await getUser(userId);
>   const orders = await getOrders(user.id);
>   const details = await getOrderDetails(orders[0].id);
>   const shipping = await getShippingInfo(details.trackingId);
>   displayShipping(shipping);
> } catch (error) {
>   handleError(error);
> }
> ```
> 
> See [[Phase 5 - Overview|Phase 5 — Async JavaScript]] for full coverage.

---

## Writing Your Own Higher-Order Functions

### Custom `map`

```js
function myMap(array, transform) {
  const result = [];
  for (const item of array) {
    result.push(transform(item));
  }
  return result;
}

myMap([1, 2, 3], x => x ** 2); // [1, 4, 9]
```

### Custom `filter`

```js
function myFilter(array, test) {
  const result = [];
  for (const item of array) {
    if (test(item)) result.push(item);
  }
  return result;
}

myFilter([1, 2, 3, 4, 5], x => x % 2 === 0); // [2, 4]
```

### Custom `reduce`

```js
function myReduce(array, combine, initial) {
  let accumulator = initial;
  for (const item of array) {
    accumulator = combine(accumulator, item);
  }
  return accumulator;
}

myReduce([1, 2, 3, 4], (sum, n) => sum + n, 0); // 10
```

### Authorization Middleware Pattern

```js
function requireRole(role) {
  return function(req, res, next) {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

// Usage (Express.js)
app.delete("/users/:id", requireRole("admin"), deleteUser);
app.get("/reports", requireRole("manager"), getReports);
```

### Event Handler Factory

```js
function createLogger(level) {
  return function(message) {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  };
}

const info = createLogger("log");
const warn = createLogger("warn");
const error = createLogger("error");

info("Server started");    // [2025-01-15T...] [LOG] Server started
warn("Low memory");        // [2025-01-15T...] [WARN] Low memory
error("Connection lost");  // [2025-01-15T...] [ERROR] Connection lost
```

---

## Abstraction Power

HOFs let you abstract **patterns of computation**, not just values:

```js
// Without HOFs — repetitive patterns
function sumArray(arr) {
  let total = 0;
  for (const n of arr) total += n;
  return total;
}
function productArray(arr) {
  let total = 1;
  for (const n of arr) total *= n;
  return total;
}

// With HOFs — abstract the pattern
const sum = arr => arr.reduce((acc, n) => acc + n, 0);
const product = arr => arr.reduce((acc, n) => acc * n, 1);
const max = arr => arr.reduce((a, b) => a > b ? a : b);
const min = arr => arr.reduce((a, b) => a < b ? a : b);
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`this` in callbacks** — When passing a method as a callback, `this` can change. Use `.bind()` or arrow functions:
>    ```js
>    // ❌ this is wrong
>    button.addEventListener("click", obj.handleClick); // `this` ≠ obj
>    // ✅ fix
>    button.addEventListener("click", () => obj.handleClick());
>    button.addEventListener("click", obj.handleClick.bind(obj));
>    ```
> 2. **Forgotten return** — `map` callbacks must `return` a value (or use implicit arrow return)
>    ```js
>    [1, 2, 3].map(x => { x * 2 });  // [undefined, undefined, undefined] ❌
>    [1, 2, 3].map(x => x * 2);      // [2, 4, 6] ✅
>    ```
> 3. **Callback vs immediately invoked** — Pass the function, don't call it:
>    ```js
>    setTimeout(myFunc, 1000);   // ✅ pass the function
>    setTimeout(myFunc(), 1000); // ❌ calls myFunc immediately, passes its RESULT
>    ```

---

## Related Topics

- [[06 - Array Iteration Methods]] — Built-in HOFs for arrays
- [[06 - Closures]] — HOFs that return functions create closures
- [[09 - Function Composition and Functional Patterns]] — Compose HOFs into pipelines
- [[08 - Recursion]] — Alternative to iterative HOFs for tree-like data
- [[02 - Function Forms]] — Arrow functions and expressions used as callbacks

---

**Navigation:**
← [[06 - Closures]] | [[01 - Phase 3 - Overview]] | [[08 - Recursion]] →
