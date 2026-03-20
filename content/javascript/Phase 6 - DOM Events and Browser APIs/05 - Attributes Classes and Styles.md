---
title: Attributes Classes and Styles
phase: 6
topic: Attributes, Classes, and Styles
tags: [javascript, dom, attributes, classList, dataset, styles, getComputedStyle, geometry]
created: 2025-01-15
---

# Attributes, Classes, and Styles

> [!info] **Big Picture**
> Every HTML element has **attributes** (like `id`, `class`, `data-*`), **classes** for CSS styling, and **inline styles** for direct visual changes. JavaScript provides clean APIs for manipulating all three. You also need to read **computed styles** (the actual applied styles after CSS cascade) and **element geometry** (position, size, scroll).

---

## Attributes

### Reading and Writing

```js
const link = document.querySelector("a");

link.getAttribute("href");             // "/page" — raw attribute value
link.setAttribute("href", "/new-page");
link.removeAttribute("target");
link.hasAttribute("rel");              // true or false
```

### Attributes vs Properties

HTML attributes and DOM properties are **not the same thing**, though they often sync.

```js
// <input type="text" value="hello">
const input = document.querySelector("input");

// Attribute = initial HTML value (doesn't change)
input.getAttribute("value"); // "hello" — always the ORIGINAL value

// Property = current live value
input.value; // "hello" initially, changes as user types
input.value = "world"; // updates the visible value
input.getAttribute("value"); // still "hello"!
```

| Aspect | Attribute | Property |
|---|---|---|
| Source | HTML markup | DOM object |
| Access | `get/setAttribute` | Direct property |
| Updates | Rarely auto-syncs | Live value |
| Type | Always string | Typed (boolean, number, etc.) |

```js
// Boolean attributes
// <input type="checkbox" checked>
input.getAttribute("checked"); // "" (empty string)
input.checked;                 // true (boolean property)
input.checked = false;         // unchecks the box
```

---

## `data-*` Attributes and `dataset`

Custom data attributes for storing information on elements.

```html
<div id="user" data-user-id="42" data-role="admin" data-is-active="true">
  John Doe
</div>
```

```js
const el = document.getElementById("user");

// Read via dataset (camelCase conversion)
el.dataset.userId;     // "42" (always a string)
el.dataset.role;       // "admin"
el.dataset.isActive;   // "true"

// Write
el.dataset.score = "100"; // adds data-score="100" to the element

// Delete
delete el.dataset.role;   // removes data-role attribute

// Iterate
Object.entries(el.dataset);
// [["userId", "42"], ["isActive", "true"], ["score", "100"]]
```

> [!tip] **Naming Convention**
> `data-user-id` → `dataset.userId` (hyphens become camelCase)
> `dataset.firstName` → `data-first-name` (camelCase becomes hyphenated)

---

## Class Manipulation with `classList`

```js
const el = document.querySelector(".card");

// Add/Remove
el.classList.add("active");                 // add one class
el.classList.add("visible", "highlighted"); // add multiple
el.classList.remove("hidden");
el.classList.remove("a", "b", "c");        // remove multiple

// Toggle
el.classList.toggle("dark-mode");          // add if missing, remove if present
el.classList.toggle("dark-mode", isDark);  // force: true = add, false = remove

// Check
el.classList.contains("active");           // true or false

// Replace
el.classList.replace("old-class", "new-class"); // returns true if replaced

// Iterate
el.classList.forEach(cls => console.log(cls));

// Read all classes
console.log(el.className);      // "card active visible" (string)
console.log([...el.classList]);  // ["card", "active", "visible"] (array)
```

> [!tip] **Always use `classList` over `className`**
> `className` replaces ALL classes. `classList` lets you add/remove individual classes without affecting others.

---

## Inline Styles

### Setting Styles

```js
const box = document.querySelector(".box");

// Set individual properties (camelCase)
box.style.backgroundColor = "red";
box.style.fontSize = "16px";
box.style.marginTop = "10px";
box.style.zIndex = "100";

// Set multiple at once via cssText
box.style.cssText = "background: red; font-size: 16px; margin-top: 10px;";
// ⚠️ Replaces ALL inline styles

// Remove an inline style
box.style.backgroundColor = ""; // removes that property
box.style.removeProperty("background-color"); // kebab-case
```

### Reading Styles

```js
// Only reads INLINE styles — not CSS file styles
box.style.backgroundColor; // "" if set via CSS, not inline
```

---

## Computed Styles

Read the **actual applied style** after CSS cascade, inheritance, and specificity.

```js
const computed = getComputedStyle(element);

computed.fontSize;        // "16px"
computed.color;           // "rgb(0, 0, 0)"
computed.display;         // "flex"
computed.marginTop;       // "10px"

// Pseudo-elements
const before = getComputedStyle(element, "::before");
before.content;           // '"Hello"'
```

> [!warning] **Computed styles are read-only**
> You cannot set styles via `getComputedStyle`. Use `element.style` or CSS classes instead.

---

## Element Geometry

### Size Properties

```js
const el = document.querySelector(".box");

// Content + Padding (no border, no scrollbar)
el.clientWidth;
el.clientHeight;

// Content + Padding + Border + Scrollbar
el.offsetWidth;
el.offsetHeight;

// Full scrollable content size
el.scrollWidth;
el.scrollHeight;
```

```
┌──────────────────────────────────────┐
│                margin                 │
│  ┌────────────────────────────────┐  │
│  │           border               │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │        padding           │  │  │
│  │  │  ┌──────────────────┐   │  │  │
│  │  │  │     content      │   │  │  │
│  │  │  │                  │   │  │  │
│  │  │  └──────────────────┘   │  │  │
│  │  │  clientWidth/Height     │  │  │
│  │  └──────────────────────────┘  │  │
│  │  offsetWidth/Height            │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Position: `getBoundingClientRect()`

Returns position relative to the **viewport** (not the document).

```js
const rect = el.getBoundingClientRect();

rect.top;      // distance from viewport top
rect.right;    // distance from viewport left to element's right edge
rect.bottom;   // distance from viewport top to element's bottom edge
rect.left;     // distance from viewport left
rect.width;    // element width (same as offsetWidth)
rect.height;   // element height (same as offsetHeight)
rect.x;        // same as left
rect.y;        // same as top
```

### Offset Position

```js
el.offsetTop;    // distance from offsetParent's top
el.offsetLeft;   // distance from offsetParent's left
el.offsetParent; // nearest positioned ancestor (or body)
```

### Scroll Position

```js
el.scrollTop;   // pixels scrolled from the top
el.scrollLeft;  // pixels scrolled from the left

// Scroll the element
el.scrollTop = 100;
el.scrollTo({ top: 100, behavior: "smooth" });
el.scrollIntoView({ behavior: "smooth", block: "center" });

// Page scroll
window.scrollY;  // pixels scrolled vertically
window.scrollX;  // pixels scrolled horizontally
window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to top
```

---

## Real-World Patterns

### Toggle Dark Mode

```js
const toggle = document.querySelector("#theme-toggle");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Apply saved theme on load
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}
```

### Dynamic Style Injection

```js
function addGlobalStyle(css) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}

addGlobalStyle(`
  .highlight { background: yellow; }
  .fade-in { animation: fadeIn 0.3s ease-in; }
`);
```

### Checking if Element Is Visible in Viewport

```js
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  );
}
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`getAttribute` returns strings** — Even for boolean attributes. Use properties for typed values: `el.checked` (boolean), not `el.getAttribute("checked")` (string).
> 2. **`dataset` values are always strings** — `el.dataset.count` returns `"5"`, not `5`. Parse: `Number(el.dataset.count)`.
> 3. **`className` replaces everything** — `el.className = "new"` removes all existing classes. Use `classList` instead.
> 4. **Reading dimensions causes reflow** — Accessing `offsetWidth`, `getBoundingClientRect()`, etc. forces the browser to recalculate layout. Batch reads together, then batch writes.
> 5. **CSS property names** — Use camelCase in JS (`backgroundColor`), kebab-case in CSS (`background-color`). `style.removeProperty()` uses kebab-case.

---

## Related Topics

- [[02 - DOM Tree and Traversal]] — Navigating to elements
- [[03 - Selecting Elements]] — Finding elements to modify
- [[04 - Creating and Modifying Elements]] — Adding new elements
- [[06 - Events]] — Responding to user interaction
- [[08 - Browser Data Storage]] — Persisting preferences like theme

---

**Navigation:**
← [[04 - Creating and Modifying Elements]] | [[06 - Events]] →
