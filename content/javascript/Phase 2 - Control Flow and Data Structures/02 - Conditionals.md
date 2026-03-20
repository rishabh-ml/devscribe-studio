---
title: "Conditionals"
phase: 2
topic: "Conditionals"
tags:
  - phase2
  - control-flow
  - conditionals
  - switch
  - ternary
  - short-circuit
created: 2026-03-02
---

# Conditionals

> [!info] The Big Picture
> Conditionals let your program **make decisions**. Based on conditions (true/false values), your code takes different paths. This is fundamental to every program — from form validation to game logic to API routing.

---

## 🔀 `if` / `else if` / `else`

The most common branching construct. Evaluates conditions top-to-bottom; executes the **first** block whose condition is truthy.

```javascript
const temperature = 32;

if (temperature > 30) {
    console.log("It's hot outside! 🔥");
} else if (temperature > 20) {
    console.log("Nice weather! ☀️");
} else if (temperature > 10) {
    console.log("A bit chilly 🧥");
} else {
    console.log("It's cold! ❄️");
}
// → "It's hot outside! 🔥"
```

### Key Rules

```javascript
// 1. The condition is coerced to boolean (see truthy/falsy in [[04 - Type Conversion and Coercion]])
if ("hello") { }   // Runs — "hello" is truthy
if (0) { }         // Skipped — 0 is falsy
if ([]) { }        // Runs — empty array is truthy!
if (null) { }      // Skipped — null is falsy

// 2. Single-line if (no braces) — works but controversial
if (isReady) doSomething(); // ✅ Valid but risky

// 3. Always use braces for clarity and safety
if (isReady) {
    doSomething();  // ✅ Clear and safe
}

// 4. else if is just syntactic sugar for else { if ... }
// These are identical:
if (a) { } else if (b) { } else { }
if (a) { } else { if (b) { } else { } }
```

### Real-World: Guard Clauses (Early Return Pattern)

```javascript
// ❌ Nested — hard to read
function processOrder(order) {
    if (order) {
        if (order.items.length > 0) {
            if (order.paymentVerified) {
                // finally do the work
                ship(order);
            } else {
                throw new Error("Payment not verified");
            }
        } else {
            throw new Error("No items");
        }
    } else {
        throw new Error("No order");
    }
}

// ✅ Guard clauses — flat and readable
function processOrder(order) {
    if (!order) throw new Error("No order");
    if (order.items.length === 0) throw new Error("No items");
    if (!order.paymentVerified) throw new Error("Payment not verified");

    ship(order); // Happy path is at the end, un-nested
}
```

> [!tip] The Guard Clause Pattern
> Check for invalid conditions **first** and return/throw early. This keeps the "happy path" (the main logic) un-nested and easy to read. Professional codebases use this extensively.

---

## 🔄 `switch` Statement

Best for comparing one value against multiple specific cases.

```javascript
const day = "Monday";

switch (day) {
    case "Monday":
    case "Tuesday":
    case "Wednesday":
    case "Thursday":
    case "Friday":
        console.log("Weekday — time to work!");
        break;
    case "Saturday":
    case "Sunday":
        console.log("Weekend — time to rest!");
        break;
    default:
        console.log("Invalid day");
}
```

### Critical Rules

```javascript
// 1. Switch uses STRICT equality (===) — no coercion!
switch (1) {
    case "1":
        console.log("String 1"); // Does NOT match!
        break;
    case 1:
        console.log("Number 1"); // ✅ Matches
        break;
}

// 2. ALWAYS use break (unless intentional fall-through)
const fruit = "apple";
switch (fruit) {
    case "apple":
        console.log("Apple selected");
        // ⚠️ No break! Falls through to next case!
    case "banana":
        console.log("Banana selected");
        break;
}
// Output: "Apple selected" AND "Banana selected"!

// 3. Intentional fall-through (grouping cases)
const month = 2;
switch (month) {
    case 1: case 3: case 5: case 7: case 8: case 10: case 12:
        console.log("31 days");
        break;
    case 4: case 6: case 9: case 11:
        console.log("30 days");
        break;
    case 2:
        console.log("28 or 29 days");
        break;
}

// 4. Variables in cases need block scoping
switch (action) {
    case "create": {
        const item = buildItem(); // Scoped to this block
        save(item);
        break;
    }
    case "delete": {
        const item = findItem(); // Different variable, no conflict
        remove(item);
        break;
    }
}
```

### When to Use Switch vs If/Else

| Use `switch` when... | Use `if`/`else` when... |
|---|---|
| Comparing one value against many constants | Conditions involve ranges (`x > 10`) |
| Cases are discrete values (strings, numbers) | Conditions involve multiple variables |
| More than 3-4 equality checks | Complex boolean logic |

---

## ❓ Ternary Operator

A **conditional expression** — it produces a value, unlike `if`/`else` which is a statement.

```javascript
// Syntax: condition ? valueIfTrue : valueIfFalse
const status = age >= 18 ? "adult" : "minor";

// It's an EXPRESSION — can be used anywhere a value is expected
console.log(`You are ${age >= 18 ? "an adult" : "a minor"}`);

// In JSX/React
const button = <button>{isLoading ? "Loading..." : "Submit"}</button>;

// Assignment based on condition
const discount = isMember ? 0.2 : 0;
const greeting = user ? `Hello, ${user.name}` : "Hello, Guest";
```

> [!warning] Don't Nest Ternaries
> ```javascript
> // ❌ Unreadable
> const result = a ? b ? c : d : e ? f : g;
> 
> // ✅ Use if/else for complex branching
> let result;
> if (a) {
>     result = b ? c : d;
> } else {
>     result = e ? f : g;
> }
> ```

---

## ⚡ Short-Circuit Evaluation

Logical operators `&&` and `||` **stop evaluating** as soon as the result is determined.

### `&&` — Returns First Falsy (or Last Value)

```javascript
// Evaluates left-to-right, stops at first falsy
true && true && "hello"    // "hello" (all truthy, returns last)
true && false && "hello"   // false (stopped at false)
null && "hello"            // null (stopped at null)

// Real-world: conditional execution
const user = getUser();
user && user.sendNotification(); // Only calls if user is truthy

// Modern equivalent: optional chaining
user?.sendNotification(); // Same thing, more readable
```

### `||` — Returns First Truthy (or Last Value)

```javascript
// Evaluates left-to-right, stops at first truthy
"" || null || "fallback"   // "fallback"
"Alice" || "Bob"           // "Alice" (first truthy)
0 || "" || null            // null (all falsy, returns last)

// Real-world: default values
function createUser(name, role) {
    return {
        name: name || "Anonymous",  // ⚠️ "" becomes "Anonymous"
        role: role || "viewer",     // ⚠️ 0 or false would also trigger
    };
}

// Better: use nullish coalescing ??
function createUser(name, role) {
    return {
        name: name ?? "Anonymous",  // Only null/undefined triggers
        role: role ?? "viewer",
    };
}
```

### Short-Circuit for Side Effects

```javascript
// Execute only if condition is true
isDebug && console.log("Debug info:", data);

// Set value if missing
cache[key] || (cache[key] = computeExpensiveValue(key));

// Modern equivalent
cache[key] ??= computeExpensiveValue(key);
```

---

## 🌍 Real-World Patterns

### HTTP Status Code Handling

```javascript
function handleResponse(status) {
    if (status >= 200 && status < 300) {
        return "success";
    } else if (status === 401 || status === 403) {
        return "unauthorized";
    } else if (status === 404) {
        return "not found";
    } else if (status >= 500) {
        return "server error";
    }
    return "unknown";
}
```

### Feature Flags

```javascript
const features = {
    darkMode: true,
    betaEditor: false,
    newDashboard: true,
};

if (features.darkMode) {
    document.body.classList.add("dark");
}

const Editor = features.betaEditor ? BetaEditor : ClassicEditor;
```

### Object-Based Dispatch (Alternative to Switch)

```javascript
// Instead of a large switch statement:
const handlers = {
    save: () => saveDocument(),
    load: () => loadDocument(),
    export: () => exportDocument(),
    print: () => printDocument(),
};

const action = "save";
const handler = handlers[action];
if (handler) {
    handler();
} else {
    console.warn(`Unknown action: ${action}`);
}
```

> [!tip] Object dispatch is often cleaner than `switch` for mapping values to actions. It's a pattern you'll see in Redux reducers, event handlers, and API routers.

---

## 🔗 Related Topics

- [[04 - Type Conversion and Coercion]] — How conditions are coerced to booleans
- [[05 - Operators]] — Comparison and logical operators
- [[06 - Expressions vs Statements]] — Ternary (expression) vs if/else (statement)
- [[03 - Loops]] — Combining conditions with iteration

---

**Next →** [[03 - Loops]]
