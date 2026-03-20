---
title: "Basic IO"
phase: 1
topic: "Input/Output"
tags:
  - phase1
  - fundamentals
  - console
  - debugging
  - browser-apis
created: 2026-03-02
---

# Basic I/O (Input/Output)

> [!info] The Big Picture
> I/O is how your program communicates with the outside world. In Phase 1, the two main channels are **browser dialog boxes** (for simple user interaction) and the **console** (for debugging and development). Mastering `console` methods will dramatically improve your debugging speed throughout your entire JavaScript career.

---

## 🌐 Browser Dialog Methods

These are **blocking** — they pause script execution until the user responds. They're useful for quick prototypes and learning, but **never used in production web apps** (they block the UI thread and look ugly).

### `alert(message)`

Displays a message. User must click OK.

```javascript
alert("Welcome to the site!");
alert(42);          // Converts to string: "42"
alert([1, 2, 3]);   // "1,2,3"
alert({ a: 1 });    // "[object Object]" — not useful!
```

### `prompt(message, default)`

Displays a message with a text input. Returns the **string** entered, or `null` if cancelled.

```javascript
const name = prompt("What is your name?");
// Returns: "Alice" (string) or null (if Cancel clicked)

const age = prompt("Enter your age:", "25"); // "25" is default value
// ⚠️ ALWAYS returns a string! Must convert for numbers:
const ageNum = Number(age);

// Common pattern: validate input
const input = prompt("Enter a number:");
if (input === null) {
    console.log("User cancelled");
} else {
    const num = Number(input);
    if (Number.isNaN(num)) {
        console.log("Invalid number");
    } else {
        console.log(`You entered: ${num}`);
    }
}
```

### `confirm(message)`

Displays a message with OK and Cancel buttons. Returns `true` (OK) or `false` (Cancel).

```javascript
const proceed = confirm("Are you sure you want to delete this?");
if (proceed) {
    deleteItem();
}

// Real-world pattern: confirmation before navigating away
window.addEventListener("beforeunload", (event) => {
    if (hasUnsavedChanges) {
        event.preventDefault();
        // Modern browsers show their own dialog, ignoring custom messages
    }
});
```

> [!warning] Why Not to Use These in Production
> - They **block** the main thread (everything freezes)
> - They look different across browsers (inconsistent UX)
> - They can't be styled or customized
> - They prevent async operations from completing
> - Use HTML modals, toast notifications, or UI libraries instead

---

## 🖥️ Console Methods — Your Debugging Toolkit

The `console` object is available in both browsers and Node.js. It's your **primary debugging tool**.

### `console.log()` — The Essential

```javascript
console.log("Hello, World!");

// Multiple values (separated by commas, not +)
console.log("Name:", name, "Age:", age); // Better formatting than concatenation

// Objects are displayed interactively in browser console
const user = { name: "Alice", age: 25, role: "admin" };
console.log(user); // Expandable object in DevTools

// ⚠️ Common mistake: string concatenation vs comma separation
console.log("User: " + user);    // "User: [object Object]" ❌
console.log("User:", user);       // "User:" {...expandable...} ✅

// Template literals for formatted output
console.log(`User ${user.name} is ${user.age} years old`);

// String substitution (less common, but useful)
console.log("Hello, %s! You are %d years old.", "Alice", 25);
// %s = string, %d = integer, %f = float, %o = object, %c = CSS styles

// Styled console output (browser only)
console.log(
    "%cImportant Message!",
    "color: red; font-size: 24px; font-weight: bold;"
);
```

---

### `console.error()` — Errors with Stack Trace

```javascript
console.error("Something went wrong!");
// Outputs in RED with a stack trace showing where the error occurred
// In Node.js: writes to stderr instead of stdout

// Use for actual errors, not just "bad" values
try {
    riskyOperation();
} catch (err) {
    console.error("Operation failed:", err.message);
}
```

### `console.warn()` — Warnings

```javascript
console.warn("This feature is deprecated.");
// Outputs with a YELLOW warning icon
// Use for: deprecation notices, potential issues, non-critical problems
```

### `console.info()` — Informational

```javascript
console.info("Server started on port 3000");
// Similar to log, but with an ℹ️ icon in some browsers
```

---

### `console.table()` — Tabular Data Display

```javascript
const users = [
    { name: "Alice", age: 25, role: "admin" },
    { name: "Bob", age: 30, role: "user" },
    { name: "Charlie", age: 35, role: "moderator" }
];

console.table(users);
// Displays a beautiful formatted table:
// ┌─────────┬───────────┬─────┬─────────────┐
// │ (index) │   name    │ age │    role      │
// ├─────────┼───────────┼─────┼─────────────┤
// │    0    │  'Alice'  │ 25  │  'admin'     │
// │    1    │  'Bob'    │ 30  │  'user'      │
// │    2    │ 'Charlie' │ 35  │ 'moderator'  │
// └─────────┴───────────┴─────┴─────────────┘

// Filter columns
console.table(users, ["name", "role"]); // Only show name and role columns

// Works with objects too
const config = { theme: "dark", lang: "en", debug: true };
console.table(config);
```

> [!tip] When to Use `console.table()`
> Use it whenever you're inspecting arrays of objects, API response data, or any structured data. It's dramatically more readable than `console.log()` for tabular data.

---

### `console.dir()` — Object Inspection

```javascript
const element = document.getElementById("myDiv");

console.log(element);    // Shows the HTML representation
console.dir(element);    // Shows the JavaScript object with all properties

// Useful for DOM elements — log shows HTML, dir shows the object
// In Node.js, dir shows object properties with depth control:
console.dir(deepObject, { depth: null }); // Show ALL nested levels
```

---

### `console.time()` / `console.timeEnd()` — Performance Measurement

```javascript
console.time("array creation");
const arr = Array.from({ length: 1_000_000 }, (_, i) => i);
console.timeEnd("array creation");
// → "array creation: 42.123ms"

// Can run multiple timers simultaneously
console.time("fetch");
console.time("processing");
const data = await fetch("/api/data").then(r => r.json());
console.timeEnd("fetch"); // → "fetch: 234ms"
processData(data);
console.timeEnd("processing"); // → "processing: 12ms"

// console.timeLog() — check without ending
console.time("loop");
for (let i = 0; i < 1000; i++) {
    if (i === 500) console.timeLog("loop", "halfway"); // Check progress
}
console.timeEnd("loop");
```

> [!tip] Real-World: Performance Debugging
> When something feels slow, wrap it with `console.time()`/`console.timeEnd()` to measure exactly where the time is spent. This is often the first debugging step before reaching for Chrome DevTools Performance tab.

---

### `console.group()` / `console.groupEnd()` — Organized Output

```javascript
console.group("User Authentication");
    console.log("Checking credentials...");
    console.log("Token valid: true");
    
    console.group("Permissions");
        console.log("Read: ✅");
        console.log("Write: ✅");
        console.log("Admin: ❌");
    console.groupEnd();
    
    console.log("Login successful");
console.groupEnd();

// Output is indented and collapsible in DevTools:
// ▼ User Authentication
//   Checking credentials...
//   Token valid: true
//   ▼ Permissions
//     Read: ✅
//     Write: ✅
//     Admin: ❌
//   Login successful

// console.groupCollapsed() — starts collapsed (great for verbose output)
console.groupCollapsed("Debug Data (click to expand)");
    console.log("Detailed info here...");
console.groupEnd();
```

---

### `console.assert()` — Conditional Logging

Only logs if the assertion **fails** (is falsy).

```javascript
const age = 15;
console.assert(age >= 18, "User is underage!", { age });
// → Assertion failed: User is underage! {age: 15}

console.assert(age >= 0, "Age is negative"); // Nothing — assertion passed

// Real-world: sanity checks during development
function processOrder(order) {
    console.assert(order.items.length > 0, "Order has no items!", order);
    console.assert(order.total > 0, "Order total is zero!", order);
    // ... proceed with processing
}
```

---

### `console.trace()` — Stack Trace

Shows the call stack leading to this point (no error needed).

```javascript
function a() { b(); }
function b() { c(); }
function c() {
    console.trace("How did we get here?");
}
a();
// Trace: How did we get here?
//   at c (script.js:3)
//   at b (script.js:2)
//   at a (script.js:1)
//   at script.js:5
```

> [!tip] When to Use `console.trace()`
> When a function is being called from multiple places and you need to know which call path triggered a specific execution. Extremely useful for debugging event handlers and callbacks.

---

### `console.count()` / `console.countReset()`

Counts how many times a label has been logged.

```javascript
function processItem(type) {
    console.count(type);
}

processItem("fruit");  // fruit: 1
processItem("veggie"); // veggie: 1
processItem("fruit");  // fruit: 2
processItem("fruit");  // fruit: 3

console.countReset("fruit"); // Resets "fruit" counter
processItem("fruit");  // fruit: 1

// Use case: counting how many times a render function fires
function render() {
    console.count("render called");
    // ... render logic
}
```

---

### `console.clear()`

Clears the console output.

```javascript
console.clear(); // Wipes the console
// Shows: "Console was cleared" in most browsers
```

---

## 📊 Console Methods Quick Reference

| Method | Purpose | When to Use |
|---|---|---|
| `console.log()` | General output | Default for inspecting values |
| `console.error()` | Error output (red) | Actual errors, catch blocks |
| `console.warn()` | Warning output (yellow) | Deprecations, potential issues |
| `console.info()` | Informational (blue ℹ️) | Status updates |
| `console.table()` | Tabular display | Arrays of objects, structured data |
| `console.dir()` | Object properties | DOM elements, deep inspection |
| `console.time()`/`timeEnd()` | Performance timing | Measuring execution speed |
| `console.group()`/`groupEnd()` | Grouped output | Organizing related logs |
| `console.assert()` | Conditional log | Sanity checks during dev |
| `console.trace()` | Stack trace | Tracking function call paths |
| `console.count()` | Execution counter | Counting function calls |
| `console.clear()` | Clear console | Fresh start |

---

## 🛡️ Production Best Practices

> [!warning] Remove Console Logs Before Production
> Console statements in production code:
> - Leak potentially sensitive data
> - Clutter the console for other developers
> - Have a (tiny) performance cost
> 
> Use a linter rule (`no-console`) or a build tool to strip them:
> ```javascript
> // ESLint rule
> // "no-console": "warn"
> 
> // Or wrap in development check
> if (import.meta.env.DEV) {
>     console.log("Debug info:", data);
> }
> ```

---

## 🔗 Related Topics

- [[05 - Error Handling]] — `console.error()` and proper error management
- [[06 - Events]] — Browser event handling as alternative to dialog boxes
- [[Performance Optimization]] — `console.time()` for performance measurement

---

**← Previous:** [[07 - Numbers and Math]] | **Next Phase →** [[01 - Phase 2 - Overview]]
