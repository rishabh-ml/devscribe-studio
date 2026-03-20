---
title: Selecting Elements
phase: 6
topic: Selecting Elements
tags: [javascript, dom, querySelector, getElementById, selectors]
created: 2025-01-15
---

# Selecting Elements

> [!info] **Big Picture**
> Before you can modify, animate, or read data from the page, you need to **select** the elements you want to work with. JavaScript provides several methods — from ID-based lookup to full CSS selector support. `querySelector` and `querySelectorAll` are the most flexible and widely used.

---

## Selection Methods

### `document.getElementById(id)`

Returns the single element with the given `id`, or `null`.

```js
const header = document.getElementById("main-header");
// Fastest method — direct ID lookup
```

### `document.querySelector(selector)`

Returns the **first** element matching a CSS selector, or `null`.

```js
const firstBtn = document.querySelector("button");
const active = document.querySelector(".nav-item.active");
const emailInput = document.querySelector('input[type="email"]');
const nested = document.querySelector("#sidebar > .widget:first-child");
```

### `document.querySelectorAll(selector)`

Returns a **static** `NodeList` of all matching elements.

```js
const allButtons = document.querySelectorAll("button");
const items = document.querySelectorAll(".list-item");

// Supports forEach directly
items.forEach(item => item.classList.add("processed"));

// Convert to array for full array methods
const arr = [...items];
const visible = arr.filter(el => !el.hidden);
```

### `getElementsByClassName(name)` — Live Collection

```js
const active = document.getElementsByClassName("active");
// Returns live HTMLCollection — updates when DOM changes
// Cannot use forEach directly — convert to array first
```

### `getElementsByTagName(tag)` — Live Collection

```js
const allDivs = document.getElementsByTagName("div");
const allElements = document.getElementsByTagName("*"); // everything
```

### Comparison

| Method | Returns | Live? | CSS Selectors? | Speed |
|---|---|---|---|---|
| `getElementById` | Element or null | N/A | No (ID only) | Fastest |
| `querySelector` | Element or null | No | Yes | Fast |
| `querySelectorAll` | NodeList | Static | Yes | Fast |
| `getElementsByClassName` | HTMLCollection | **Live** | No | Fast |
| `getElementsByTagName` | HTMLCollection | **Live** | No | Fast |

> [!tip] **Default to `querySelector` / `querySelectorAll`**
> They support any CSS selector and return predictable static results. Use `getElementById` only when you need the speed for a known ID.

---

## Scoped Selection

All selection methods (except `getElementById`) work on **any element**, not just `document`.

```js
const sidebar = document.getElementById("sidebar");

// Only search WITHIN the sidebar
const sidebarLinks = sidebar.querySelectorAll("a");
const sidebarBtn = sidebar.querySelector(".close-btn");
```

---

## `element.closest(selector)`

Walks **up** the DOM tree from the current element to find the nearest ancestor (or itself) matching the selector. Returns `null` if no match found.

```js
// HTML: <div class="card"><button class="delete">X</button></div>

button.addEventListener("click", (e) => {
  const card = e.target.closest(".card"); // finds parent .card
  card.remove();
});
```

**Use case:** Event delegation — finding the relevant container from a deeply nested click target.

---

## `element.matches(selector)`

Returns `true` if the element matches the given CSS selector.

```js
const el = document.querySelector(".nav-item");
el.matches(".nav-item");        // true
el.matches(".nav-item.active"); // depends on classes
el.matches("div");              // depends on tag
```

**Use case:** Filtering in event delegation:

```js
document.querySelector(".list").addEventListener("click", (e) => {
  if (e.target.matches(".delete-btn")) {
    e.target.closest(".list-item").remove();
  }
  if (e.target.matches(".edit-btn")) {
    editItem(e.target.closest(".list-item"));
  }
});
```

---

## `getElementsByName(name)`

Selects elements by their `name` attribute. Returns a live `NodeList`. Mainly useful for form elements.

```js
const radios = document.getElementsByName("color");
radios.forEach(radio => {
  if (radio.checked) console.log(radio.value);
});
```

---

## Special Document Collections

```js
document.forms;          // HTMLCollection of all <form> elements
document.images;         // HTMLCollection of all <img> elements
document.links;          // HTMLCollection of all <a> with href
document.scripts;        // HTMLCollection of all <script> elements

// Access by index or name/id
document.forms[0];
document.forms.loginForm; // <form name="loginForm">
```

---

## Real-World Patterns

### Select or Throw

```js
function $(selector, parent = document) {
  const el = parent.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

// Usage
const header = $("#main-header");
const items = $$(".list-item");
items.forEach(item => item.style.color = "blue");
```

### Checking if Element Exists

```js
const modal = document.querySelector("#modal");
if (modal) {
  modal.classList.add("visible");
}

// Or with optional chaining
document.querySelector("#modal")?.classList.add("visible");
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Live vs static** — `getElementsByClassName` returns a live collection. Adding/removing classes during iteration can cause skipped elements or infinite loops.
> 2. **`querySelector` returns first match only** — Use `querySelectorAll` if you need all matches.
> 3. **`null` if not found** — Always check for `null` before accessing properties: `el?.textContent`.
> 4. **ID must be unique** — `getElementById` returns only one element. Duplicate IDs are invalid HTML and cause unpredictable behavior.
> 5. **Selector syntax** — `querySelector("#my-id .class")` uses CSS rules. Escape special characters: `querySelector("[data-id='123']")`.

---

## Related Topics

- [[02 - DOM Tree and Traversal]] — Understanding the DOM tree structure
- [[04 - Creating and Modifying Elements]] — What you do after selecting elements
- [[06 - Events]] — Attaching behavior to selected elements
- [[05 - Attributes Classes and Styles]] — Reading/modifying element properties

---

**Navigation:**
← [[02 - DOM Tree and Traversal]] | [[04 - Creating and Modifying Elements]] →
