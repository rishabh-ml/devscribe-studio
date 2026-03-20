---
title: Recursion
phase: 3
topic: Recursion
tags: [javascript, recursion, call-stack, base-case, tree-traversal, tail-call]
created: 2025-01-15
---

# Recursion

> [!info] **Big Picture**
> Recursion is when a function **calls itself** to solve a problem by breaking it into smaller sub-problems. Every recursive solution has two parts: a **base case** (when to stop) and a **recursive case** (how to break the problem down). Recursion is the natural approach for tree-like and nested data structures — DOM traversal, file systems, nested comments, JSON trees — anywhere the data is self-similar at different scales.

---

## Anatomy of Recursion

Every recursive function needs:

1. **Base case** — The condition that stops recursion (prevents infinite loops)
2. **Recursive case** — The function calls itself with a "smaller" or "simpler" input
3. **Progress toward base case** — Each recursive call must get closer to the base case

```js
function countdown(n) {
  // Base case: stop when n reaches 0
  if (n <= 0) {
    console.log("Done!");
    return;
  }

  // Recursive case: do work, then call with smaller input
  console.log(n);
  countdown(n - 1); // n gets smaller → progresses toward base case
}

countdown(3);
// 3
// 2
// 1
// Done!
```

---

## The Call Stack

Each function call creates a **stack frame** — a record of the function's local variables, arguments, and return address. Recursive calls stack these frames on top of each other.

```js
function factorial(n) {
  if (n <= 1) return 1;        // base case
  return n * factorial(n - 1); // recursive case
}

factorial(4); // 24
```

### Call Stack Visualization

```
factorial(4)                          ← call 1
  → 4 * factorial(3)                 ← call 2
    → 3 * factorial(2)               ← call 3
      → 2 * factorial(1)             ← call 4
        → returns 1          (base case hit)
      → returns 2 * 1 = 2    (unwinding)
    → returns 3 * 2 = 6      (unwinding)
  → returns 4 * 6 = 24       (unwinding)
```

> [!warning] **Stack Overflow**
> Each recursive call adds a frame to the call stack. Too many calls (thousands to tens of thousands, depending on the engine) causes a **stack overflow** error:
> ```js
> function infinite() {
>   return infinite(); // ❌ never stops
> }
> infinite(); // RangeError: Maximum call stack size exceeded
> ```

---

## Classic Recursive Problems

### Factorial

```js
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

factorial(5); // 120 (5 × 4 × 3 × 2 × 1)
factorial(0); // 1
```

### Fibonacci

```js
// ❌ Naive — exponential time O(2^n), very slow for large n
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

fib(10); // 55
fib(40); // 102334155 — takes SECONDS

// ✅ With memoization — linear time O(n)
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

fibMemo(40); // 102334155 — instant!
fibMemo(100); // 354224848179261915075n (might need BigInt for precision)
```

### Exponentiation

```js
function power(base, exp) {
  if (exp === 0) return 1;
  return base * power(base, exp - 1);
}

power(2, 10); // 1024
```

### Sum of Array

```js
function sum(arr) {
  if (arr.length === 0) return 0;           // base case: empty array
  return arr[0] + sum(arr.slice(1));        // first element + sum of rest
}

sum([1, 2, 3, 4]); // 10
```

---

## Practical Recursive Patterns

### Flatten Nested Arrays

```js
function flatten(arr) {
  const result = [];

  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item)); // recurse into nested arrays
    } else {
      result.push(item);
    }
  }

  return result;
}

flatten([1, [2, [3, [4]], 5], 6]);
// [1, 2, 3, 4, 5, 6]
```

> [!note] **Built-in Alternative**
> `Array.prototype.flat(Infinity)` does the same thing — but understanding the recursive approach is valuable.

### Deep Clone

```js
function deepClone(value) {
  // Primitives and null — return as-is
  if (value === null || typeof value !== "object") {
    return value;
  }

  // Arrays
  if (Array.isArray(value)) {
    return value.map(item => deepClone(item));
  }

  // Date
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  // RegExp
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags);
  }

  // Plain objects
  const cloned = {};
  for (const key of Object.keys(value)) {
    cloned[key] = deepClone(value[key]); // recurse into each property
  }
  return cloned;
}

const original = { a: 1, b: { c: [2, 3], d: new Date() } };
const copy = deepClone(original);
copy.b.c.push(4);
console.log(original.b.c); // [2, 3] — unaffected
```

> [!tip] **In Production, Use `structuredClone()`**
> `structuredClone()` handles circular references, Maps, Sets, ArrayBuffers, and more. Use the recursive approach for learning and for environments without `structuredClone`.

### Tree Traversal (DOM)

```js
function walkDOM(node, callback) {
  callback(node);
  for (const child of node.children) {
    walkDOM(child, callback); // recurse into children
  }
}

// Print all element tag names in a page
walkDOM(document.body, node => {
  console.log(node.tagName);
});
```

### File System Tree (Conceptual)

```js
function printTree(node, indent = "") {
  console.log(`${indent}${node.name}`);

  if (node.children) {
    for (const child of node.children) {
      printTree(child, indent + "  ");
    }
  }
}

const fileSystem = {
  name: "src/",
  children: [
    { name: "index.js" },
    {
      name: "components/",
      children: [
        { name: "Header.js" },
        { name: "Footer.js" },
        {
          name: "ui/",
          children: [
            { name: "Button.js" },
            { name: "Modal.js" },
          ],
        },
      ],
    },
    { name: "utils.js" },
  ],
};

printTree(fileSystem);
/*
src/
  index.js
  components/
    Header.js
    Footer.js
    ui/
      Button.js
      Modal.js
  utils.js
*/
```

### Nested Data Search

```js
function findInTree(tree, predicate) {
  if (predicate(tree)) return tree;

  if (tree.children) {
    for (const child of tree.children) {
      const found = findInTree(child, predicate);
      if (found) return found;
    }
  }

  return null;
}

// Find a node by name
const result = findInTree(fileSystem, node => node.name === "Modal.js");
console.log(result); // { name: "Modal.js" }
```

### Object Path Access

```js
function getNestedValue(obj, path) {
  const keys = Array.isArray(path) ? path : path.split(".");

  if (keys.length === 0 || obj == null) return obj;

  const [first, ...rest] = keys;
  return getNestedValue(obj[first], rest);
}

const data = { user: { address: { city: "Portland" } } };
getNestedValue(data, "user.address.city"); // "Portland"
getNestedValue(data, "user.phone.number"); // undefined (safe)
```

---

## Recursion vs Iteration

Every recursive solution can be rewritten iteratively (and vice versa). Choose based on clarity and the problem structure.

| Aspect | Recursion | Iteration |
|---|---|---|
| Best for | Tree/nested structures | Linear sequences |
| Readability | Often clearer for tree problems | Usually clearer for simple loops |
| Performance | Call stack overhead, risk of overflow | No stack overhead |
| Memory | O(n) stack frames | O(1) for simple loops |
| State management | Implicit via call stack | Explicit via variables |

### Same Problem, Both Ways

```js
// Recursive factorial
function factorialRecursive(n) {
  if (n <= 1) return 1;
  return n * factorialRecursive(n - 1);
}

// Iterative factorial
function factorialIterative(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
```

> [!tip] **Rule of Thumb**
> - **Linear data** (arrays, strings) → iteration is usually simpler
> - **Nested/tree data** (DOM, file systems, JSON) → recursion is often clearer
> - **Unknown depth** → recursion handles it naturally; iteration needs an explicit stack

---

## Tail Call Optimization (TCO)

A **tail call** is when the recursive call is the **very last** operation in the function (nothing happens to the result after the call returns).

```js
// ❌ NOT a tail call — multiplication happens AFTER the recursive call
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1); // must wait for result, then multiply
}

// ✅ Tail call — the recursive call IS the final action
function factorialTCO(n, accumulator = 1) {
  if (n <= 1) return accumulator;
  return factorialTCO(n - 1, n * accumulator); // nothing happens after this call
}
```

> [!warning] **TCO in Practice**
> ES2015 specified tail call optimization, where the engine reuses the current stack frame instead of creating a new one (preventing stack overflow). However, **only Safari implements it**. V8 (Chrome/Node.js) and SpiderMonkey (Firefox) chose not to implement it. Don't rely on TCO — use iteration for deep recursion in production.

---

## Avoiding Stack Overflow

### Use a Trampoline

A trampoline converts recursion into iteration by returning thunks (functions that continue the computation):

```js
function trampoline(fn) {
  return function(...args) {
    let result = fn(...args);
    while (typeof result === "function") {
      result = result(); // keep calling until we get a non-function
    }
    return result;
  };
}

// Convert recursive function to use thunks
function factorialThunk(n, acc = 1) {
  if (n <= 1) return acc;
  return () => factorialThunk(n - 1, n * acc); // return a function, don't call it
}

const factorial = trampoline(factorialThunk);
factorial(100000); // Works! No stack overflow
```

### Use an Explicit Stack

```js
// Recursive tree traversal → iterative with explicit stack
function walkTreeIterative(root, callback) {
  const stack = [root];

  while (stack.length > 0) {
    const node = stack.pop();
    callback(node);

    if (node.children) {
      // Push children in reverse order to process left-to-right
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]);
      }
    }
  }
}
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Missing base case** → Infinite recursion → Stack overflow
> 2. **Not progressing toward base case** → Infinite recursion
>    ```js
>    function broken(n) {
>      if (n === 0) return 0;
>      return broken(n); // ❌ n never changes!
>    }
>    ```
> 3. **Naive Fibonacci** → Exponential time. Always memoize.
> 4. **Stack overflow on large inputs** → Use iteration or trampolines
> 5. **Mutating shared state** → Pass accumulated results as parameters, don't mutate outer variables
> 6. **`arr.slice(1)` is O(n)** → Recursive array sum with `slice` is O(n²). Use an index parameter instead.

---

## Related Topics

- [[07 - Higher-Order Functions]] — Recursion is an alternative to HOF-based iteration
- [[06 - Closures]] — Memoized recursion uses closures
- [[09 - Function Composition and Functional Patterns]] — Memoization pattern

---

**Navigation:**
← [[07 - Higher-Order Functions]] | [[01 - Phase 3 - Overview]] | [[09 - Function Composition and Functional Patterns]] →
