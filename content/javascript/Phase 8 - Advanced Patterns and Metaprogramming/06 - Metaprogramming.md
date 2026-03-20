---
title: Metaprogramming
phase: 8
topic: Metaprogramming
tags: [javascript, metaprogramming, symbols, tagged-templates, eval, well-known-symbols, DSL]
created: 2025-01-15
---

# Metaprogramming

> [!info] **Big Picture**
> Metaprogramming is code that manipulates code — programs that can inspect, modify, or generate other programs. In JavaScript, this includes **Symbols as protocol hooks** (customizing how built-in operations treat your objects), **tagged templates** (building DSLs), **`eval()`/`new Function()`** (dynamic code), and **Proxy/Reflect** (covered in [[04 - Proxy and Reflect]]). This note ties these concepts together.

---

## Symbols as Protocol Hooks

Well-known Symbols let you customize how JavaScript's built-in operations interact with your objects. See [[04 - Symbols]] for full details.

### Key Protocol Hooks

```js
// Symbol.iterator — Make objects iterable
const range = {
  [Symbol.iterator]() {
    let i = 0;
    return { next: () => ({ value: i++, done: i > 5 }) };
  }
};
[...range]; // [0, 1, 2, 3, 4]

// Symbol.toPrimitive — Control type conversion
const money = {
  amount: 42,
  currency: "USD",
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.amount;
    if (hint === "string") return `${this.amount} ${this.currency}`;
    return this.amount; // default
  }
};
+money;            // 42
`${money}`;        // "42 USD"
money + 10;        // 52

// Symbol.hasInstance — Customize instanceof
class Even {
  static [Symbol.hasInstance](num) {
    return typeof num === "number" && num % 2 === 0;
  }
}
4 instanceof Even; // true
5 instanceof Even; // false

// Symbol.toStringTag — Customize Object.prototype.toString
class Validator {
  get [Symbol.toStringTag]() { return "Validator"; }
}
Object.prototype.toString.call(new Validator()); // "[object Validator]"

// Symbol.species — Control which constructor derived methods use
class SpecialArray extends Array {
  static get [Symbol.species]() { return Array; }
}
const special = new SpecialArray(1, 2, 3);
const mapped = special.map(x => x * 2);
mapped instanceof SpecialArray; // false
mapped instanceof Array;        // true
```

### All Well-Known Symbols Summary

| Symbol | Controls |
|--------|----------|
| `Symbol.iterator` | `for...of`, spread, destructuring |
| `Symbol.asyncIterator` | `for await...of` |
| `Symbol.toPrimitive` | Type conversion |
| `Symbol.hasInstance` | `instanceof` |
| `Symbol.toStringTag` | `Object.prototype.toString()` |
| `Symbol.species` | Constructor for derived objects |
| `Symbol.isConcatSpreadable` | `Array.prototype.concat()` behavior |
| `Symbol.match/replace/search/split` | How regex methods use the object |
| `Symbol.dispose` / `Symbol.asyncDispose` | `using` / `await using` (ES2025) |

---

## Tagged Templates

Tagged templates let you process template literal strings with a function, enabling DSLs (Domain-Specific Languages).

### How They Work

```js
function tag(strings, ...values) {
  // strings: array of string literals
  // values: interpolated expressions
  console.log(strings); // ["Hello ", "! You are ", " years old."]
  console.log(values);  // ["Alice", 30]
  return strings.reduce((result, str, i) =>
    result + str + (values[i] ?? ""), ""
  );
}

const name = "Alice";
const age = 30;
tag`Hello ${name}! You are ${age} years old.`;
```

### HTML Sanitization

```js
function html(strings, ...values) {
  const escape = s => String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return strings.reduce((result, str, i) =>
    result + str + (i < values.length ? escape(values[i]) : ""), ""
  );
}

const userInput = '<script>alert("xss")</script>';
html`<div>${userInput}</div>`;
// "<div>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>"
```

### SQL Query Builder

```js
function sql(strings, ...values) {
  const query = strings.join("?");
  return {
    text: query,
    params: values,
    execute(db) {
      return db.query(this.text, this.params);
    }
  };
}

const userId = 42;
const query = sql`SELECT * FROM users WHERE id = ${userId} AND active = ${true}`;
// { text: "SELECT * FROM users WHERE id = ? AND active = ?", params: [42, true] }
```

### CSS-in-JS (Styled Components Pattern)

```js
function css(strings, ...values) {
  const style = strings.reduce((result, str, i) =>
    result + str + (values[i] ?? ""), ""
  );

  const className = `css-${hash(style)}`;
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `.${className} { ${style} }`;
  document.head.appendChild(styleSheet);

  return className;
}

const color = "blue";
const className = css`
  color: ${color};
  font-size: 16px;
  font-weight: bold;
`;
// Creates a <style> element and returns the class name
```

### `String.raw` — Built-In Tag

```js
// Returns the raw string without processing escapes
String.raw`Hello\nWorld`;  // "Hello\\nWorld" (literal backslash-n)
String.raw`C:\Users\file`; // "C:\\Users\\file"

// Useful for regex patterns
const pattern = String.raw`\d+\.\d+`;  // "\\d+\\.\\d+"
```

---

## `eval()` and `new Function()`

> [!danger] **Security Warning**
> Both `eval()` and `new Function()` execute arbitrary code. **Never use them with user input.** They prevent JavaScript engine optimizations, are blocked by Content Security Policy, and are a major security risk.

### `eval()`

Executes a string as code in the current scope.

```js
// Basic usage (demonstrates concept — AVOID in production)
const x = 10;
eval("x + 5"); // 15 — has access to local scope

// eval can modify local variables
eval("var y = 42");
console.log(y); // 42 (in non-strict mode)
```

### Indirect `eval`

```js
// Direct eval: runs in local scope
eval("x"); // accesses local x

// Indirect eval: runs in global scope
const indirectEval = eval;
indirectEval("x"); // accesses global x (or throws ReferenceError)

// Also indirect:
(0, eval)("x");
window.eval("x");
```

### `new Function()`

Creates a function from a string. Always runs in global scope (no access to local variables).

```js
// Slightly safer than eval — no local scope access
const add = new Function("a", "b", "return a + b");
add(2, 3); // 5

// Dynamic property access (rare legitimate use case)
const getter = new Function("obj", `return obj.${propName}`);
```

### When Are They Acceptable?

| Use Case | Tool | Notes |
|----------|------|-------|
| JSON parsing | `JSON.parse()` | NEVER use `eval()` for JSON |
| Template engines (server-side) | `new Function()` | Used by some template libraries |
| Math expression evaluator | Parser library | Write a proper parser instead |
| Dynamic configuration | `new Function()` | Only with trusted input |
| Code playgrounds/REPLs | Sandboxed `eval` | Use iframes or workers for isolation |

---

## Property Descriptor Metaprogramming

Control how properties behave at the engine level.

```js
// Non-enumerable utility methods
function addUtilities(obj) {
  Object.defineProperties(obj, {
    toJSON: {
      value() { return { ...this }; },
      enumerable: false,     // hidden from for...in
      configurable: true
    },
    clone: {
      value() { return structuredClone(this); },
      enumerable: false,
      configurable: true
    }
  });
}

// Object-level immutability
const CONSTANTS = Object.freeze({
  PI: 3.14159,
  E: 2.71828,
  GOLDEN_RATIO: 1.61803
});
```

See [[03 - Property Descriptors and Object Configuration]] for full coverage.

---

## `with` Statement (Deprecated)

> [!danger] **Never Use `with`** — It's forbidden in strict mode and causes scope ambiguity.

```js
// DON'T use this — shown only for understanding legacy code
with (Math) {
  console.log(PI);       // 3.14159...
  console.log(sqrt(16)); // 4
}
// Problem: Is 'x' from the 'with' object or outer scope? Ambiguous!
```

---

## Metaprogramming Best Practices

> [!tip] **Guidelines**
> 1. **Use Symbols for protocols** — `Symbol.iterator`, `Symbol.toPrimitive`, etc. are the "right way" to customize built-in behavior.
> 2. **Use Proxy for interception** — When you need to intercept arbitrary operations on objects.
> 3. **Use tagged templates for DSLs** — Safe, composable, and powerful for building miny languages.
> 4. **Avoid `eval()` and `new Function()`** — Almost always a better alternative exists.
> 5. **Property descriptors for library APIs** — Make utility methods non-enumerable, constants non-writable.
> 6. **Don't over-meta** — Metaprogramming makes code harder to understand. Use it when the abstraction clearly simplifies the consumer's code.

---

## Metaprogramming Layers Summary

```
Level 1: Normal Code
  obj.x = 5; for (const k in obj) {}

Level 2: Property Descriptors
  Object.defineProperty(obj, 'x', { writable: false })

Level 3: Symbols (Protocol Hooks)
  obj[Symbol.iterator] = function*() { ... }

Level 4: Proxy / Reflect
  new Proxy(obj, { get(t, p) { ... } })

Level 5: Code Generation (avoid)
  eval(), new Function()
```

Each level adds power but also complexity. Start from Level 1 and only escalate when the simpler approach doesn't work.

---

## Related Topics

- [[04 - Symbols]] — All well-known symbols detailed
- [[04 - Proxy and Reflect]] — Interception API
- [[03 - Property Descriptors and Object Configuration]] — Descriptor-level control
- [[05 - Iterators and Generators]] — `Symbol.iterator` protocol
- [[05 - ES6 Classes]] — `Symbol.species` in class hierarchies

---

**Navigation:**
← [[05 - WeakRef and FinalizationRegistry]] | [[01 - Phase 9 - Overview]] →
