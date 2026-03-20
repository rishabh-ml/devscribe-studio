---
title: ES Modules
phase: 7
topic: ES Modules
tags: [javascript, modules, esm, import, export, dynamic-import, commonjs]
created: 2025-01-15
---

# ES Modules (ESM)

> [!info] **Big Picture**
> ES Modules are JavaScript's **native** module system — standardized in ES2015 and now supported everywhere (browsers and Node.js). They let you split code into separate files with explicit `import`/`export` declarations. Unlike CommonJS (`require`), ESM is **statically analyzable**, enabling tree shaking (dead code elimination) and other optimizations. Every modern JavaScript project uses modules.

---

## Named Exports and Imports

### Exporting

```js
// math.js — multiple named exports

export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }
export const PI = 3.14159;

// Alternative: export at the end
function multiply(a, b) { return a * b; }
function divide(a, b) { return a / b; }
export { multiply, divide };
```

### Importing

```js
// Import specific names
import { add, subtract, PI } from "./math.js";

// Rename on import
import { add as sum, subtract as minus } from "./math.js";

// Import everything as a namespace
import * as math from "./math.js";
math.add(1, 2); // 3
math.PI;         // 3.14159
```

---

## Default Exports

One default export per module — imported without braces.

```js
// User.js
export default class User {
  constructor(name) { this.name = name; }
}

// Import (name can be anything)
import User from "./User.js";
import MyUser from "./User.js"; // same thing, different name
```

### Combining Default and Named

```js
// api.js
export default class ApiClient { ... }
export function createUrl(path) { ... }
export const BASE_URL = "https://api.example.com";

// Import both
import ApiClient, { createUrl, BASE_URL } from "./api.js";
```

> [!tip] **Prefer named exports**
> Named exports enforce consistent naming across files and are easier to refactor with IDE tools. Default exports are most common for single-class or single-component files.

---

## Re-exporting

Aggregate exports from multiple modules into one entry point.

```js
// utils/index.js — barrel file
export { add, subtract } from "./math.js";
export { formatDate } from "./date.js";
export { default as Logger } from "./Logger.js";
export * from "./helpers.js"; // re-export all named exports

// Consumer only needs one import
import { add, formatDate, Logger } from "./utils/index.js";
```

> [!warning] **Barrel files can hurt performance**
> `export *` pulls in everything. Bundlers may struggle to tree-shake barrel files. Be intentional about what you re-export.

---

## Dynamic Imports

Load modules at runtime (on demand). Returns a Promise.

```js
// Lazy load a heavy module
const { default: Chart } = await import("./Chart.js");
const chart = new Chart(data);

// Conditional loading
if (user.isAdmin) {
  const { AdminPanel } = await import("./AdminPanel.js");
  renderPanel(new AdminPanel());
}

// Code splitting (bundlers create separate chunks)
button.addEventListener("click", async () => {
  const { openModal } = await import("./modal.js");
  openModal();
});
```

**Use cases:** code splitting, route-based loading in SPAs, conditional feature loading.

---

## `import.meta`

Module-specific metadata.

```js
import.meta.url;  // full URL of the current module
// "file:///home/user/project/src/main.js"
// "https://example.com/js/app.js"

// Construct relative URLs
const imageUrl = new URL("../assets/logo.png", import.meta.url);

// Vite-specific
import.meta.env.MODE;        // "development" or "production"
import.meta.env.VITE_API_URL; // environment variable
```

---

## ES2025: Import Attributes

```js
// Import JSON as a module
import data from "./config.json" with { type: "json" };

// Dynamic import with attributes
const config = await import("./config.json", { with: { type: "json" } });

// CSS modules (proposal)
import styles from "./app.css" with { type: "css" };
document.adoptedStyleSheets.push(styles);
```

---

## Module Characteristics

```js
// 1. Always strict mode
// "use strict" is implicit — no need to declare it

// 2. Module scope — top-level variables are NOT global
const secret = "hidden"; // only accessible within this module

// 3. Evaluated once (singleton)
// Importing the same module multiple times → same instance
import { counter } from "./counter.js"; // returns same object every time

// 4. Top-level `this` is undefined
console.log(this); // undefined (not `window`)

// 5. Top-level await (ES2022)
const config = await fetch("/config.json").then(r => r.json());
export { config };
```

---

## CommonJS (Node.js Legacy)

```js
// Exporting (CommonJS)
module.exports = { add, subtract };
// or
exports.add = function(a, b) { return a + b; };

// Importing (CommonJS)
const { add, subtract } = require("./math");
const math = require("./math");
```

### ESM vs CommonJS

| Feature | ESM | CommonJS |
|---|---|---|
| Syntax | `import`/`export` | `require`/`module.exports` |
| Loading | Static (compile time) | Dynamic (runtime) |
| Async | Supports top-level `await` | Synchronous only |
| Tree shaking | ✅ Yes | ❌ No |
| Browser support | ✅ Native | ❌ Needs bundler |
| Node.js | `.mjs` or `"type": "module"` | `.cjs` or default |
| `this` at top level | `undefined` | `module.exports` |

> [!tip] **Use ESM for all new projects**
> Set `"type": "module"` in `package.json`. Modern Node.js (v22+) fully supports ESM and even runs TypeScript natively.

---

## Module Patterns

### Singleton Service

```js
// db.js — module is evaluated once, so this is a singleton
class Database {
  constructor() {
    this.connection = createConnection();
  }
  query(sql) { ... }
}

export const db = new Database();

// Every file that imports `db` gets the SAME instance
```

### Lazy Initialization

```js
// heavy-module.js
let instance = null;

export function getHeavyThing() {
  if (!instance) {
    instance = createExpensiveThing(); // only runs once
  }
  return instance;
}
```

### Feature Flags

```js
// features.js
export const features = {
  darkMode: true,
  betaSearch: false,
  newDashboard: process.env.NODE_ENV === "development"
};

// consumer.js
import { features } from "./features.js";
if (features.darkMode) { enableDarkMode(); }
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **File extensions required** — In browsers and Node.js ESM, you must include `.js`: `import { add } from "./math.js"` (bundlers may not require it).
> 2. **Circular imports** — ESM handles them, but you may get `undefined` if you access an export before the module finishes evaluating. Restructure to avoid cycles.
> 3. **`import` is hoisted** — All imports are evaluated before any module code runs, regardless of where the `import` statement appears.
> 4. **Imports are read-only live bindings** — You cannot reassign an imported binding: `import { x } from './m'; x = 5; // TypeError`.
> 5. **CORS for modules** — `<script type="module">` uses CORS. Serving from `file://` will fail. Use a local dev server.
> 6. **`require` in ESM** — You cannot use `require()` in ESM modules. Use `import` or `createRequire` from `node:module`.

---

## Related Topics

- [[11 - Script Loading]] — `defer`, `async`, and module loading in the browser
- [[06 - Modern ES Features]] — Import attributes, top-level await
- [[05 - Iterators and Generators]] — Dynamic `import()` returns a Promise

---

**Navigation:**
← [[01 - Phase 7 - Overview]] | [[03 - Maps Sets and WeakVariants]] →
