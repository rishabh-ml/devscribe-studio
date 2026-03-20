---
title: Closures
phase: 3
topic: Closures
tags: [javascript, closures, lexical-scope, data-privacy, factory-functions, module-pattern, interview]
created: 2025-01-15
---

# Closures

> [!info] **Big Picture**
> A closure is a function that **retains access to its lexical scope** even when executed outside that scope. This isn't a special opt-in feature — it's a natural consequence of lexical scoping and first-class functions. Every function in JavaScript forms a closure. Closures enable **data privacy**, **stateful functions**, **factory patterns**, **partial application**, and are the foundation of how modules work. If you understand scope, you already understand closures — you just need to see them in action.

---

## What Is a Closure?

```js
function outer() {
  const message = "Hello from outer!";

  function inner() {
    console.log(message); // inner "closes over" message
  }

  return inner; // return the function itself (not invoked)
}

const fn = outer();  // outer() runs and returns inner
fn();                // "Hello from outer!"
// ↑ outer() has finished, its local variables should be gone...
// ...but inner() still has access to `message` via closure!
```

> [!quote] **Definition**
> A **closure** is the combination of a function and the lexical environment (scope) in which that function was declared. The function "remembers" the variables from its birth scope, even after that scope has finished executing.

---

## Why Closures Exist

JavaScript has two features that together create closures:

1. **Lexical scoping** — A function can access variables from its surrounding scope
2. **First-class functions** — Functions can be returned from other functions, stored in variables, passed as arguments

When you return a function from another function, the returned function keeps a **live reference** to the outer function's variables — not a snapshot copy, but a living connection.

```js
function createGreeter(greeting) {
  // `greeting` lives in createGreeter's scope
  return function(name) {
    // This inner function closes over `greeting`
    return `${greeting}, ${name}!`;
  };
}

const sayHello = createGreeter("Hello");
const sayHi = createGreeter("Hi");

sayHello("Alice"); // "Hello, Alice!"
sayHi("Bob");      // "Hi, Bob!"
// Each closure has its OWN `greeting` — they don't share
```

---

## Closures Are Live References (Not Snapshots)

```js
function counter() {
  let count = 0;

  return {
    increment() { count++; },
    getCount() { return count; },
  };
}

const c = counter();
c.increment();
c.increment();
c.increment();
c.getCount(); // 3 — the closure has a LIVE reference to count

// count is NOT frozen at 0 — both methods share the SAME count variable
```

> [!warning] **Live Reference Gotcha**
> Closures capture variables **by reference**, not by value. If the variable changes, the closure sees the change.
> ```js
> function makeCallbacks() {
>   const fns = [];
>   for (var i = 0; i < 3; i++) {
>     fns.push(function() { return i; });
>   }
>   return fns;
> }
> 
> const callbacks = makeCallbacks();
> callbacks[0](); // 3 — NOT 0!
> callbacks[1](); // 3 — NOT 1!
> callbacks[2](); // 3 — NOT 2!
> // All three closures share the SAME `i`, which is 3 after the loop
> ```

---

## The Classic Loop Pitfall and Solutions

### The Problem: `var` in Loops

```js
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // All print 3
  }, 100);
}
// Output: 3, 3, 3
// Because `var i` is function-scoped — all callbacks share ONE i
```

### Solution 1: Use `let` (Modern, Recommended)

```js
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // Prints 0, 1, 2
  }, 100);
}
// `let` creates a new `i` for each iteration — each callback has its own
```

### Solution 2: IIFE (Pre-ES2015)

```js
for (var i = 0; i < 3; i++) {
  (function(j) {
    // j is a NEW variable in a NEW scope per iteration
    setTimeout(function() {
      console.log(j);
    }, 100);
  })(i); // pass current i as argument
}
// Output: 0, 1, 2
```

### Solution 3: `bind` or Extra Function

```js
for (var i = 0; i < 3; i++) {
  setTimeout(console.log.bind(null, i), 100);
}
// Output: 0, 1, 2 — i is "captured" as an argument at bind time
```

---

## Practical Applications

### 1. Data Privacy (Encapsulation)

The most important use of closures — hiding internal state.

```js
function createBankAccount(initialBalance) {
  let balance = initialBalance; // private — not accessible from outside

  return {
    deposit(amount) {
      if (amount <= 0) throw new Error("Amount must be positive");
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
      return balance;
    },
    getBalance() {
      return balance;
    },
  };
}

const account = createBankAccount(100);
account.deposit(50);     // 150
account.withdraw(30);    // 120
account.getBalance();    // 120
account.balance;         // undefined — truly private!
```

### 2. Factory Functions

Create specialized functions from a template.

```js
function createMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);
const toPercent = createMultiplier(100);

double(5);     // 10
triple(5);     // 15
toPercent(0.75); // 75
```

### 3. Event Handlers That Remember State

```js
function createClickCounter(buttonId) {
  let clicks = 0; // private to this button

  const button = document.getElementById(buttonId);
  button.addEventListener("click", function() {
    clicks++;
    button.textContent = `Clicked ${clicks} times`;
  });
}

createClickCounter("btn-a"); // Each button gets its own counter
createClickCounter("btn-b"); // Independent of btn-a's counter
```

### 4. Debounce (Common Interview Question)

```js
function debounce(fn, delay) {
  let timerId; // closure over timerId

  return function(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Usage
const handleSearch = debounce(function(query) {
  console.log("Searching for:", query);
}, 300);

// Rapid calls → only the last one fires (after 300ms of quiet)
handleSearch("j");
handleSearch("ja");
handleSearch("jav");
handleSearch("java"); // Only this one actually runs
```

### 5. Once (Run a Function Only Once)

```js
function once(fn) {
  let called = false;
  let result;

  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

const initialize = once(() => {
  console.log("Initializing...");
  return { ready: true };
});

initialize(); // "Initializing..." → { ready: true }
initialize(); // No log, returns same { ready: true }
initialize(); // Same — fn never runs again
```

### 6. The Module Pattern (Pre-ES Modules)

```js
const Calculator = (function() {
  // Private variables and functions
  let history = [];

  function addToHistory(operation) {
    history.push(operation);
  }

  // Public API (revealed through the returned object)
  return {
    add(a, b) {
      const result = a + b;
      addToHistory(`${a} + ${b} = ${result}`);
      return result;
    },
    subtract(a, b) {
      const result = a - b;
      addToHistory(`${a} - ${b} = ${result}`);
      return result;
    },
    getHistory() {
      return [...history]; // return copy, not the actual array
    },
  };
})();

Calculator.add(2, 3);       // 5
Calculator.subtract(10, 4); // 6
Calculator.getHistory();    // ["2 + 3 = 5", "10 - 4 = 6"]
Calculator.history;          // undefined — private!
```

---

## How Closures Work Under the Hood

When a function is created, the engine attaches a hidden `[[Environment]]` property that references the **Lexical Environment** of the scope where the function was created.

```
outer() called:
┌────────────────────────────────┐
│ Lexical Environment            │
│   message: "Hello"             │
│   inner: function              │
│   [[outer]]: → Global Env      │
└────────────────────────────────┘
          ↑
inner() created here, so inner.[[Environment]] = this environment

When inner() is returned and later called:
┌────────────────────────────────┐
│ inner's Lexical Environment    │
│   (no local variables)         │
│   [[outer]]: → outer's Env ───→ message: "Hello" (still alive!)
└────────────────────────────────┘
```

The garbage collector **cannot reclaim** `outer`'s Lexical Environment as long as `inner` exists, because `inner` holds a reference to it.

> [!warning] **Memory Implications**
> Closures keep their outer scope alive. If a closure holds onto a large scope with big data, that data stays in memory. Be intentional about what your closures capture.
> ```js
> function processData() {
>   const hugeArray = new Array(1_000_000).fill("data");
>   const summary = hugeArray.length; // extract what you need
>
>   return function getSummary() {
>     return summary; // ✅ Only captures `summary`, not `hugeArray`
>     // If we referenced `hugeArray` here, it would stay in memory
>   };
> }
> ```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Live references, not snapshots** — Closures see the **current** value of closed-over variables, not the value at creation time
> 2. **`var` in loops** — All iterations share one variable. Use `let` or an IIFE
> 3. **Memory leaks** — Closures prevent garbage collection of their outer scope. Be careful with closures that live a long time (event handlers, intervals)
> 4. **Accidental closures** — Every function is a closure. If you pass a callback that references an outer variable, that variable is captured
> 5. **Stale closures in React** — A common React bug where `useEffect` or event handlers capture old state values. (Solved with dependency arrays or refs)

---

## Mental Model

> [!quote] **Think of it this way**
> Every function has an invisible **backpack** (its closure). When the function is created, it packs all the variables from its surrounding scope into this backpack. Wherever the function travels — returned from another function, passed as a callback, stored in a variable — it carries that backpack with it. When the function runs and needs a variable it doesn't have locally, it reaches into the backpack.

---

## 💼 Common Interview Questions

**Q1: What will this output?**
```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
```
> **Answer:** `3, 3, 3` — `var` is function-scoped, so all callbacks share the same `i`, which is `3` after the loop ends. Fix with `let` (block-scoped) or an IIFE: `(function(j) { setTimeout(() => console.log(j), 100); })(i);`

**Q2: How do you create private variables in JavaScript?**
> Use a closure:
> ```js
> function createWallet(initial) {
>   let balance = initial; // private
>   return {
>     deposit(amount) { balance += amount; },
>     getBalance() { return balance; }
>   };
> }
> const wallet = createWallet(100);
> wallet.deposit(50);
> wallet.getBalance(); // 150
> // wallet.balance → undefined (private)
> ```

**Q3: What is a closure?**
> A closure is a function that retains access to its **lexical scope** even when executed outside that scope. Every function in JS forms a closure — it "remembers" the variables from where it was created.

**Q4: What will this output and why?**
```js
function createFunctions() {
  const fns = [];
  for (let i = 0; i < 3; i++) {
    fns.push(() => i);
  }
  return fns;
}
console.log(createFunctions().map(fn => fn()));
```
> **Answer:** `[0, 1, 2]` — `let` creates a new binding per iteration, so each closure captures a different `i`.

**Q5: How do closures relate to memory leaks?**
> Closures prevent garbage collection of their outer scope. If a closure holds a reference to a large object or DOM node and lives longer than needed (e.g., event listener never removed), that memory is retained. Fix by nullifying references or removing listeners.

---

## 🎯 Practice Exercises

1. **Counter Factory** — Write `createCounter(start)` that returns an object with `increment()`, `decrement()`, and `getCount()`. No external access to the count.
2. **Once Function** — Implement `once(fn)` that returns a function which calls `fn` only the first time. Subsequent calls return the first result.
3. **Memoize** — Write `memoize(fn)` that caches results for given arguments. Test with an expensive calculation like Fibonacci.
4. **Rate Limiter** — Build `rateLimiter(fn, limit)` that allows `fn` to be called at most `limit` times per second using closures and timestamps.
5. **Secret Keeper** — Create `createSecret(secret)` that returns `{ getSecret(password), setSecret(password, newSecret) }`. The secret is only accessible with the correct password.

---

## Related Topics

- [[04 - Scope]] — Closures are a consequence of lexical scope
- [[05 - Hoisting]] — Understanding what's available in scope at creation time
- [[07 - Higher-Order Functions]] — Functions returning functions create closures
- [[09 - Function Composition and Functional Patterns]] — Currying and partial application rely on closures

---

**Navigation:**
← [[05 - Hoisting]] | [[01 - Phase 3 - Overview]] | [[07 - Higher-Order Functions]] →
