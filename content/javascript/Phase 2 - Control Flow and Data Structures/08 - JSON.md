---
title: JSON
phase: 2
topic: JSON
tags: [javascript, json, serialization, data-interchange, parse, stringify]
created: 2025-01-15
---

# JSON — JavaScript Object Notation

> [!info] **Big Picture**
> JSON is the universal data-interchange format of the web. Every API you talk to, every config file you read, every `localStorage` value you persist — they all speak JSON. Despite its name, JSON is language-independent, but JavaScript has built-in tools (`JSON.stringify()` and `JSON.parse()`) that make working with it seamless.

---

## What Is JSON?

JSON (JavaScript Object Notation) is a **lightweight, text-based data format** for representing structured data. It was derived from JavaScript object literal syntax but is used by virtually every programming language.

```json
{
  "name": "Alice",
  "age": 30,
  "isStudent": false,
  "courses": ["Math", "CS"],
  "address": {
    "city": "Portland",
    "zip": "97201"
  },
  "spouse": null
}
```

---

## JSON Format Rules

> [!warning] **Strict Syntax**
> JSON is **not** JavaScript. It has stricter rules than JS object literals.

| Rule | JSON | JS Object Literal |
|---|---|---|
| Keys | Must be **double-quoted** strings | Can be unquoted identifiers |
| Strings | **Double quotes** only | Single or double quotes |
| Trailing commas | **Not allowed** | Allowed in modern JS |
| Comments | **Not allowed** | Allowed (`//`, `/* */`) |
| Functions | **Not allowed** | Allowed |
| `undefined` | **Not allowed** | Allowed |
| `NaN`, `Infinity` | **Not allowed** | Allowed |
| `BigInt` | **Not allowed** | Allowed |

### Allowed Value Types

- **Strings** — `"hello"` (double quotes only)
- **Numbers** — `42`, `3.14`, `-7`, `2e10` (no `NaN`, `Infinity`, or hex)
- **Booleans** — `true`, `false`
- **null** — `null`
- **Objects** — `{ "key": "value" }`
- **Arrays** — `[1, 2, 3]`

> [!danger] **Not Valid JSON**
> ```json
> {
>   name: "Alice",         // ❌ unquoted key
>   'age': 30,             // ❌ single-quoted key
>   "fn": function() {},   // ❌ functions not allowed
>   "val": undefined,      // ❌ undefined not allowed
>   "big": 9007199254740993n, // ❌ BigInt not allowed
>   "inf": Infinity,       // ❌ Infinity not allowed
> }
> ```

---

## `JSON.stringify()` — Object to String

Converts a JavaScript value to a JSON string.

### Basic Usage

```js
const user = { name: "Alice", age: 30, isAdmin: false };

const jsonString = JSON.stringify(user);
// '{"name":"Alice","age":30,"isAdmin":false}'

console.log(typeof jsonString); // "string"
```

### What Gets Stringified — and What Gets Dropped

```js
const data = {
  name: "Alice",         // ✅ string
  age: 30,               // ✅ number
  active: true,          // ✅ boolean
  address: null,         // ✅ null
  scores: [90, 85],      // ✅ array
  nested: { x: 1 },     // ✅ nested object

  // ❌ These are SILENTLY DROPPED:
  greet: function() {},  // function
  id: Symbol("id"),      // Symbol
  secret: undefined,     // undefined
};

console.log(JSON.stringify(data));
// '{"name":"Alice","age":30,"active":true,"address":null,"scores":[90,85],"nested":{"x":1}}'
// Notice: greet, id, and secret are gone!
```

> [!warning] **Arrays Behave Differently**
> In arrays, `undefined`, functions, and Symbols become `null` (to preserve index positions):
> ```js
> JSON.stringify([1, undefined, function(){}, Symbol("x"), 3]);
> // '[1,null,null,null,3]'
> ```

### Special Values

```js
JSON.stringify(NaN);       // 'null'
JSON.stringify(Infinity);  // 'null'
JSON.stringify(-Infinity); // 'null'

// Date objects call .toISOString()
JSON.stringify(new Date("2025-01-15"));
// '"2025-01-15T00:00:00.000Z"'

// RegExp becomes empty object
JSON.stringify(/abc/gi);   // '{}'

// Map and Set become empty objects 
JSON.stringify(new Map([["a", 1]])); // '{}'
JSON.stringify(new Set([1, 2, 3]));  // '{}'
```

> [!danger] **Circular References Throw**
> ```js
> const obj = {};
> obj.self = obj; // circular reference
> JSON.stringify(obj); // ❌ TypeError: Converting circular structure to JSON
> ```

---

### The `replacer` Parameter

The second argument to `JSON.stringify()` controls which properties are included or how values are transformed.

#### Replacer as an Array (Whitelist)

```js
const user = { name: "Alice", age: 30, password: "secret123", role: "admin" };

// Only include these keys
const safe = JSON.stringify(user, ["name", "age", "role"]);
// '{"name":"Alice","age":30,"role":"admin"}'
// password is excluded!
```

#### Replacer as a Function

```js
const data = { name: "Alice", age: 30, password: "secret123" };

const safe = JSON.stringify(data, (key, value) => {
  // The first call has key="" and value=the whole object
  if (key === "password") return undefined; // drop this property
  if (typeof value === "number") return value * 2; // transform numbers
  return value; // keep everything else
});

console.log(safe);
// '{"name":"Alice","age":60}'
```

> [!tip] **Replacer Function Behavior**
> - Return `undefined` → property is **omitted**
> - Return any other value → that value is used
> - The first call receives `key = ""` and `value = the root object`

---

### The `space` Parameter (Pretty Printing)

The third argument controls indentation for readable output.

```js
const user = { name: "Alice", age: 30, hobbies: ["reading", "coding"] };

// Number = number of spaces per indent level
console.log(JSON.stringify(user, null, 2));
/*
{
  "name": "Alice",
  "age": 30,
  "hobbies": [
    "reading",
    "coding"
  ]
}
*/

// String = custom indent string
console.log(JSON.stringify(user, null, "\t"));
/*
{
	"name": "Alice",
	"age": 30,
	"hobbies": [
		"reading",
		"coding"
	]
}
*/
```

---

## `JSON.parse()` — String to Object

Converts a JSON string back into a JavaScript value.

### Basic Usage

```js
const jsonString = '{"name":"Alice","age":30,"isAdmin":false}';

const user = JSON.parse(jsonString);

console.log(user.name);    // "Alice"
console.log(user.age);     // 30
console.log(typeof user);  // "object"
```

### Common Pitfalls

```js
// ❌ Invalid JSON throws SyntaxError
JSON.parse("{ name: 'Alice' }");  // SyntaxError — unquoted key, single quotes
JSON.parse("undefined");          // SyntaxError — undefined is not valid JSON
JSON.parse("'hello'");            // SyntaxError — single quotes

// ✅ Valid
JSON.parse('"hello"');             // "hello"
JSON.parse("42");                  // 42
JSON.parse("true");                // true
JSON.parse("null");                // null
```

> [!tip] **Safe Parsing**
> Always wrap `JSON.parse()` in a `try...catch` when dealing with untrusted or user-provided input:
> ```js
> function safeParse(str) {
>   try {
>     return JSON.parse(str);
>   } catch (e) {
>     console.error("Invalid JSON:", e.message);
>     return null;
>   }
> }
> ```

---

### The `reviver` Parameter

The second argument to `JSON.parse()` transforms values during parsing. It's the inverse of `stringify`'s replacer.

```js
const json = '{"name":"Alice","birthDate":"2000-05-15T00:00:00.000Z","score":"42"}';

const parsed = JSON.parse(json, (key, value) => {
  // Convert ISO date strings back to Date objects
  if (key === "birthDate") return new Date(value);
  // Convert numeric strings to numbers
  if (key === "score") return Number(value);
  return value;
});

console.log(parsed.birthDate instanceof Date); // true
console.log(parsed.birthDate.getFullYear());   // 2000
console.log(typeof parsed.score);              // "number"
```

> [!note] **Reviver Traversal Order**
> The reviver walks the parsed object **bottom-up** (leaf values first, then their parents). The final call has `key = ""` and `value = the fully constructed root object`.

---

## The `toJSON()` Method — Custom Serialization

If an object has a `toJSON()` method, `JSON.stringify()` calls it and serializes the **returned value** instead of the object itself.

```js
class User {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  // Custom serialization — hide sensitive data
  toJSON() {
    return {
      name: this.name,
      email: this.email,
      // password intentionally omitted
    };
  }
}

const alice = new User("Alice", "alice@example.com", "secret123");

console.log(JSON.stringify(alice));
// '{"name":"Alice","email":"alice@example.com"}'
// Password is hidden by toJSON()!
```

### Built-in `toJSON()` Examples

```js
// Date has a built-in toJSON() that returns an ISO string
const d = new Date("2025-06-15");
console.log(d.toJSON()); // "2025-06-15T00:00:00.000Z"

// That's why dates auto-serialize nicely
JSON.stringify({ created: d }); // '{"created":"2025-06-15T00:00:00.000Z"}'
```

---

## Real-World Patterns

### Deep Clone (Simple Objects)

```js
// Quick deep copy for JSON-safe objects
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const original = { a: 1, b: { c: 2 } };
const copy = deepClone(original);
copy.b.c = 99;

console.log(original.b.c); // 2 — not affected!
```

> [!warning] **Limitations of JSON Deep Clone**
> Loses: functions, `undefined`, Symbols, `Date` objects (become strings), `Map`, `Set`, `RegExp`, circular references throw.
> **Prefer `structuredClone()`** for a proper deep clone (handles Dates, Maps, Sets, circular refs, etc.).

### localStorage Persistence

```js
// Save
const settings = { theme: "dark", fontSize: 16, sidebar: true };
localStorage.setItem("settings", JSON.stringify(settings));

// Load
const loaded = JSON.parse(localStorage.getItem("settings"));
console.log(loaded.theme); // "dark"

// Safe load with defaults
function loadSettings() {
  try {
    const raw = localStorage.getItem("settings");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
```

### API Communication

```js
// Sending JSON in a fetch request
async function createUser(userData) {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData), // Object → JSON string
  });

  const result = await response.json(); // JSON string → Object
  return result;
}

// Usage
const newUser = await createUser({ name: "Alice", email: "alice@example.com" });
```

### Config File Pattern (Node.js)

```js
import { readFileSync, writeFileSync } from "fs";

// Read config
function loadConfig(path) {
  try {
    const raw = readFileSync(path, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load config:", e.message);
    return {};
  }
}

// Write config (pretty-printed for readability)
function saveConfig(path, config) {
  writeFileSync(path, JSON.stringify(config, null, 2), "utf-8");
}
```

### Handling Dates Round-Trip

```js
// Problem: Dates become strings after JSON round-trip
const event = { name: "Launch", date: new Date("2025-06-15") };
const json = JSON.stringify(event);
const parsed = JSON.parse(json);

console.log(typeof parsed.date); // "string" — not a Date object!

// Solution: Use a reviver to restore Dates
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

function dateReviver(key, value) {
  if (typeof value === "string" && ISO_DATE_REGEX.test(value)) {
    return new Date(value);
  }
  return value;
}

const restored = JSON.parse(json, dateReviver);
console.log(restored.date instanceof Date); // true ✅
```

### Sanitizing Objects for Logging

```js
function sanitize(obj, sensitiveKeys = ["password", "token", "secret", "ssn"]) {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (sensitiveKeys.includes(key)) return "[REDACTED]";
    return value;
  }));
}

const request = {
  user: "alice",
  password: "secret123",
  token: "abc-xyz-123",
  data: { amount: 100 },
};

console.log(sanitize(request));
// { user: "alice", password: "[REDACTED]", token: "[REDACTED]", data: { amount: 100 } }
```

---

## Quick Reference Table

| Method | Purpose | Returns | Throws on |
|---|---|---|---|
| `JSON.stringify(value)` | Value → JSON string | `string` | Circular references |
| `JSON.stringify(value, replacer)` | With filtering/transform | `string` | Circular references |
| `JSON.stringify(value, replacer, space)` | Pretty-printed | `string` | Circular references |
| `JSON.parse(text)` | JSON string → value | any | Invalid JSON (`SyntaxError`) |
| `JSON.parse(text, reviver)` | With value transformation | any | Invalid JSON (`SyntaxError`) |

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`undefined` is dropped** — Properties with `undefined` values vanish after stringify
> 2. **Functions are dropped** — Methods on objects are lost
> 3. **Date round-trip** — Dates become strings; use a reviver to restore them
> 4. **Map/Set become `{}`** — They are NOT JSON-serializable (convert to arrays first)
> 5. **`NaN` → `null`** — `NaN` becomes `null` during stringify
> 6. **Prototype is lost** — Class instances become plain objects after a round-trip
> 7. **No comments** — JSON doesn't support comments (use JSONC or JSON5 if you need them)
> 8. **Order not guaranteed** — JSON object key order is not guaranteed by the spec (though V8 preserves insertion order)

---

## Related Topics

- [[07 - Objects Foundations]] — Objects are what JSON serializes/deserializes
- [[04 - Strings Deep Dive]] — JSON is always a string in transit
- [[05 - Arrays Foundations]] — Arrays are a core JSON data type
- [[04 - Type Conversion and Coercion]] — JSON.parse/stringify involve type transformations
- [[03 - Data Types in Depth]] — Understanding which types survive JSON round-trips

---

**Navigation:**
← [[07 - Objects Foundations]] | [[01 - Phase 2 - Overview]] | Phase 3 → [[01 - Phase 3 - Overview]]
