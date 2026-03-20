---
title: Debugging and DevTools
phase: 1
topic: Debugging Techniques and Chrome DevTools
tags: [javascript, debugging, devtools, chrome, console, breakpoints, fundamentals]
created: 2026-03-05
---

# Debugging and DevTools

> [!info] **Big Picture**
> Debugging is the single most important **practical skill** for any developer. Knowing how to systematically find and fix bugs saves more time than any framework or library. Chrome DevTools gives you X-ray vision into your code, network requests, performance, and memory. Master it early — you'll use it every day.

---

## Console Methods Deep Dive

### Beyond `console.log()`

```js
// Basic output
console.log("Hello");                   // general output
console.info("Server started");         // informational (same as log in most browsers)
console.warn("Deprecated API used");    // ⚠️ yellow warning
console.error("Failed to fetch data");  // ❌ red error with stack trace

// Styled output
console.log(
  "%cSuccess!%c Data loaded",
  "color: green; font-weight: bold; font-size: 16px;",
  "color: inherit"
);
```

### `console.table()` — Visualize Data

```js
const users = [
  { name: "Alice", age: 30, role: "admin" },
  { name: "Bob", age: 25, role: "user" },
  { name: "Carol", age: 35, role: "admin" }
];

console.table(users);           // full table
console.table(users, ["name"]); // only show "name" column
```

### `console.dir()` — Inspect Objects

```js
// Shows object properties as an expandable tree (vs toString)
console.dir(document.body);  // DOM element as an object
console.dir({ a: 1, b: { c: 2 } });
```

### `console.group()` — Organize Output

```js
console.group("User Processing");
  console.log("Loading user data...");
  console.log("Validating...");
  console.group("Nested validation");
    console.log("Checking email...");
    console.log("Checking password...");
  console.groupEnd();
  console.log("Done");
console.groupEnd();

// Use console.groupCollapsed() for initially collapsed groups
```

### `console.time()` — Measure Execution

```js
console.time("fetch");
const response = await fetch("/api/data");
const data = await response.json();
console.timeEnd("fetch"); // fetch: 142.5ms

// Multiple timers can run simultaneously
console.time("total");
console.time("step1");
// ... step 1 ...
console.timeEnd("step1"); // step1: 50ms
console.time("step2");
// ... step 2 ...
console.timeEnd("step2"); // step2: 90ms
console.timeEnd("total"); // total: 140ms
```

### `console.assert()` — Conditional Logging

```js
const age = 15;
console.assert(age >= 18, "User is underage:", age);
// Only prints when assertion FAILS:
// Assertion failed: User is underage: 15
```

### `console.trace()` — Stack Trace

```js
function a() { b(); }
function b() { c(); }
function c() { console.trace("Trace from c"); }
a();
// Shows: c → b → a → (anonymous) with line numbers
```

### `console.count()` — Count Calls

```js
function handleClick(button) {
  console.count(button);   // tracks count per label
}
handleClick("save");   // save: 1
handleClick("save");   // save: 2
handleClick("cancel"); // cancel: 1
console.countReset("save"); // reset counter
```

### Quick Reference

| Method | Purpose |
|--------|---------|
| `.log()` | General output |
| `.warn()` | Yellow warning |
| `.error()` | Red error + stack trace |
| `.table()` | Tabular data display |
| `.dir()` | Object tree inspection |
| `.group()` / `.groupEnd()` | Nested grouping |
| `.time()` / `.timeEnd()` | Execution timing |
| `.assert()` | Conditional error |
| `.trace()` | Call stack trace |
| `.count()` / `.countReset()` | Invocation counter |
| `.clear()` | Clear the console |

---

## The `debugger` Statement

```js
function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    debugger; // ← Pauses here if DevTools is open
    total += item.price * item.quantity;
  }
  return total;
}
```

> [!tip] **When DevTools is closed, `debugger` is ignored** — no need to remove it for production builds (but linters will warn you).

---

## Chrome DevTools Panels

Open with: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)

### Elements Panel

- **Inspect DOM** — Click any element to see its HTML, styles, computed layout
- **Edit HTML live** — Double-click to edit tags, attributes, text content
- **Edit CSS live** — Modify styles in the Styles pane, see changes instantly
- **Box model** — Visual display of margin, border, padding, content dimensions
- **Accessibility** — Check ARIA roles, contrast ratios, tab order
- **Event Listeners** — See all event listeners attached to the selected element

### Console Panel

- Execute JavaScript expressions live
- Access the currently selected element as `$0`
- Access previous selections as `$1`, `$2`, etc.
- `$()` is shorthand for `document.querySelector()`
- `$$()` is shorthand for `document.querySelectorAll()` (returns real Array)
- `copy()` copies any value to clipboard: `copy($0.outerHTML)`
- `monitor(fn)` logs every call to `fn` with arguments
- `monitorEvents(element, 'click')` logs specific events on an element

```js
// Console tricks
$0                            // currently selected element
$("header")                   // querySelector shorthand
$$(".card")                   // querySelectorAll (returns Array)
copy(JSON.stringify(data, null, 2)) // copy formatted JSON to clipboard
monitor(myFunction)           // log every call to myFunction
getEventListeners($0)         // list all event listeners on element
```

### Sources Panel

Where you **debug code** with breakpoints.

#### Breakpoint Types

| Type | How to Set | Use Case |
|------|-----------|----------|
| **Line** | Click line number in Sources | Pause at specific line |
| **Conditional** | Right-click line → "Add conditional breakpoint" | Pause only when condition is true |
| **Logpoint** | Right-click line → "Add logpoint" | Log without pausing (no `console.log` needed) |
| **DOM** | Elements → right-click node → "Break on..." | Pause when DOM node is modified |
| **XHR/Fetch** | Sources → XHR Breakpoints → Add URL pattern | Pause on network requests matching pattern |
| **Event Listener** | Sources → Event Listener Breakpoints | Pause on specific event types (click, keydown, etc.) |
| **Exception** | ⏸ button in Sources → check "Pause on exceptions" | Pause when any error is thrown |

#### Step Controls

| Button | Name | Shortcut | Action |
|--------|------|----------|--------|
| ▶ | Resume | `F8` | Continue execution |
| ⤵ | Step Over | `F10` | Execute next line, skip function internals |
| ⤓ | Step Into | `F11` | Enter function call |
| ⤴ | Step Out | `Shift+F11` | Run to end of current function, return to caller |

#### Scope Inspection

When paused at a breakpoint:
- **Scope pane** — Shows Local, Closure, and Global variables with current values
- **Call Stack pane** — Shows the chain of function calls that led here
- **Watch pane** — Add expressions to monitor (e.g., `arr.length`, `user.name`)

```js
// Conditional breakpoint example — only pause when i === 50
for (let i = 0; i < 100; i++) {
  processItem(items[i]); // right-click → conditional breakpoint → i === 50
}
```

### Network Panel

- **Waterfall view** — See all requests, timing, and dependencies
- **Filter by type** — JS, CSS, XHR/Fetch, Img, Media, WS, etc.
- **Throttling** — Simulate slow connections (Slow 3G, Fast 3G, Offline)
- **Request details** — Headers, Payload, Preview, Response, Timing
- **Copy as cURL** — Right-click any request → Copy → Copy as cURL
- **Block requests** — Right-click → Block request URL (test error handling)

### Performance Panel

- **Record** → interact → **Stop** — Generates a flame chart
- **Flame chart** — Shows function calls over time (width = duration)
- **Summary** — Breakdown: Scripting, Rendering, Painting, Idle
- **Bottom-Up / Call Tree** — Find which functions take the most time
- **Long Tasks** — Red markers for tasks > 50ms (blocking the main thread)

### Memory Panel

- **Heap Snapshot** — Capture all objects in memory at a point in time
- **Allocation Timeline** — Track allocations over time
- **Comparison** — Take two snapshots and compare to find memory leaks

> [!tip] **Memory Leak Detection Workflow**
> 1. Take a heap snapshot (baseline)
> 2. Perform the action you suspect leaks memory
> 3. Force garbage collection (🗑️ button)
> 4. Take another heap snapshot
> 5. Compare — objects retained between snapshots may be leaks

---

## Debugging Strategies

### 1. Read the Error Message

```
TypeError: Cannot read properties of undefined (reading 'name')
    at getUser (app.js:15:25)
    at processData (app.js:42:10)
    at main (app.js:58:3)
```

- **Error type**: `TypeError` — wrong type operation
- **Message**: Tried to access `.name` on `undefined`
- **Location**: `app.js`, line 15, column 25 in `getUser`
- **Call chain**: `main` → `processData` → `getUser` (read bottom-to-top)

### 2. Binary Search Debugging

When you don't know where the bug is:
1. Place a `console.log` or breakpoint in the **middle** of the suspect code
2. Check if the data is correct at that point
3. If correct → bug is in the second half. If wrong → bug is in the first half
4. Repeat, narrowing down each time

### 3. Rubber Duck Debugging

Explain the code line-by-line to someone (or a rubber duck). The act of verbalizing forces you to examine assumptions you've been skipping.

### 4. Common Bug Patterns

| Symptom | Likely Cause |
|---------|-------------|
| "`undefined` is not a function" | Calling a method on wrong type, typo in method name |
| "`Cannot read properties of null`" | DOM element not found (script runs before HTML loads) |
| Function runs but nothing happens | Missing `return` statement, or event listener on wrong element |
| Value is always the last iteration | Closure over `var` in a loop (use `let`) |
| Infinite loop | Missing increment/break condition, off-by-one error |
| Stale data in React/UI | Mutating state instead of creating new copy |
| API works in Postman, fails in browser | CORS issue — check Network tab |

---

## Node.js Debugging

### `--inspect` Flag

```bash
# Start with inspector
node --inspect app.js

# Break on first line
node --inspect-brk app.js
```

Then open `chrome://inspect` in Chrome and attach to the Node process.

### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current File",
      "program": "${file}",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

- Set breakpoints by clicking the gutter (left of line numbers)
- Press `F5` to start debugging
- Use the Debug toolbar to step through code
- Watch panel and hover-to-inspect work the same as Chrome

---

## Quick Debugging Cheat Sheet

```js
// 1. Quick variable inspection
console.log({ variable });  // shows name AND value: { variable: "value" }

// 2. Check if code reaches a point
console.log(">>> REACHED HERE");

// 3. Inspect object shape
console.log(Object.keys(obj));
console.log(JSON.stringify(obj, null, 2));

// 4. Trace function calls
console.trace("Called from here");

// 5. Time an operation
console.time("op"); /* ...code... */ console.timeEnd("op");

// 6. Conditional debugging
if (suspiciousValue > 100) debugger;

// 7. Monitor DOM changes
const observer = new MutationObserver((mutations) => {
  console.log("DOM changed:", mutations);
});
observer.observe(document.body, { childList: true, subtree: true });
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`console.log` shows live object references** — If you log an object and then mutate it, expanding the log shows the *mutated* value. Use `console.log(JSON.parse(JSON.stringify(obj)))` or `structuredClone(obj)` for a snapshot.
> 2. **Minified code is unreadable** — Click `{}` (Pretty Print) in the Sources panel to format it. Source maps (`.map` files) restore original code — make sure they're enabled in production builds.
> 3. **`debugger` in production** — Linters flag it, but it won't crash anything. Still, don't ship it — add an ESLint rule: `"no-debugger": "error"`.
> 4. **Network tab clears on navigation** — Check "Preserve log" to keep requests across page loads.
> 5. **Console context** — The Console runs in the *top frame* by default. Select a different iframe or Worker from the dropdown at the top of the Console.

---

## Related Topics

- [[08 - Basic IO]] — Console methods introduction
- [[05 - Error Handling]] — Error types and stack traces
- [[05 - Memory Management and Performance]] — Memory profiling and DevTools Memory tab
- [[02 - The Event Loop]] — Understanding async execution flow for debugging

---

**Navigation:**
← [[08 - Basic IO]] | [[01 - Phase 2 - Overview]] →
