---
title: Events
phase: 6
topic: Events
tags: [javascript, dom, events, addEventListener, bubbling, capturing, delegation, custom-events]
created: 2025-01-15
---

# Events

> [!info] **Big Picture**
> Events are the backbone of interactive web applications. When a user clicks, types, scrolls, or submits a form, the browser fires an **event**. JavaScript listens for these events and runs handler functions in response. Understanding event propagation (bubbling and capturing), delegation, and the event object is essential for building efficient, maintainable UIs.

---

## Adding Event Listeners

### `addEventListener(type, handler, options)`

```js
const button = document.querySelector("#submit");

button.addEventListener("click", function (event) {
  console.log("Clicked!", event.target);
});

// Arrow function
button.addEventListener("click", (e) => {
  console.log("Clicked!");
});

// Named function (removable)
function handleClick(e) { console.log("Clicked!"); }
button.addEventListener("click", handleClick);
button.removeEventListener("click", handleClick); // must be same reference
```

### Options Object

```js
element.addEventListener("click", handler, {
  capture: false,   // fire during capture phase (default: false)
  once: true,       // auto-remove after first invocation
  passive: true,    // promise not to call preventDefault() (perf optimization)
  signal: controller.signal // AbortController for removal
});
```

### Removing Listeners

```js
// Method 1: removeEventListener (same function reference required)
element.removeEventListener("click", handleClick);

// Method 2: AbortController (modern, clean)
const controller = new AbortController();

element.addEventListener("click", handleClick, { signal: controller.signal });
element.addEventListener("keydown", handleKey, { signal: controller.signal });

// Remove all listeners at once
controller.abort();

// Method 3: { once: true } for single-use
element.addEventListener("click", handleClick, { once: true });
```

> [!tip] **Use `once: true` for one-time handlers**
> No need to manually remove — the browser does it automatically after the first invocation.

---

## The Event Object

Every handler receives an **event object** with metadata about the event.

```js
element.addEventListener("click", (event) => {
  // Identity
  event.type;           // "click"
  event.target;         // element that triggered the event (clicked element)
  event.currentTarget;  // element the handler is attached to

  // Position (mouse events)
  event.clientX;        // X relative to viewport
  event.clientY;        // Y relative to viewport
  event.pageX;          // X relative to document
  event.pageY;          // Y relative to document

  // Keyboard (keyboard events)
  event.key;            // "Enter", "a", "Shift"
  event.code;           // "Enter", "KeyA", "ShiftLeft" (physical key)
  event.altKey;         // true if Alt was held
  event.ctrlKey;        // true if Ctrl was held
  event.shiftKey;       // true if Shift was held
  event.metaKey;        // true if Cmd (Mac) / Win (Windows) was held

  // Control
  event.preventDefault();   // stop default browser behavior
  event.stopPropagation();  // stop event from bubbling/capturing
  event.stopImmediatePropagation(); // stop + prevent other handlers on same element

  // State
  event.defaultPrevented;  // true if preventDefault was called
  event.eventPhase;       // 1=capture, 2=target, 3=bubble
  event.isTrusted;        // true if fired by user, false if dispatched programmatically
  event.timeStamp;        // ms since page load
});
```

### `event.target` vs `event.currentTarget`

```html
<div id="parent">
  <button id="child">Click Me</button>
</div>
```

```js
document.getElementById("parent").addEventListener("click", (e) => {
  console.log(e.target);        // <button> — the clicked element
  console.log(e.currentTarget); // <div>    — the element with the listener
  console.log(this);            // <div>    — same as currentTarget (regular function)
});
```

---

## Event Propagation: Bubbling and Capturing

Events travel through the DOM in three phases:

```
         ┌─── CAPTURING PHASE (top → target) ───┐
         │                                        │
Window → Document → HTML → Body → Parent → Target
                                                  │
Window ← Document ← HTML ← Body ← Parent ← Target
         │                                        │
         └─── BUBBLING PHASE (target → top) ──────┘
```

### Bubbling (Default)

Most events **bubble** — they fire on the target, then its parent, grandparent, all the way to `document`.

```js
// Click on button → fires on button, then div, then body, then document
document.querySelector("div").addEventListener("click", () => {
  console.log("div handler"); // fires AFTER the button handler
});

document.querySelector("button").addEventListener("click", () => {
  console.log("button handler"); // fires FIRST
});
```

### Capturing

Set `capture: true` to listen during the capture phase (top-down).

```js
document.querySelector("div").addEventListener("click", () => {
  console.log("div capture"); // fires BEFORE child elements
}, { capture: true });
// or: }, true);
```

### Stopping Propagation

```js
button.addEventListener("click", (e) => {
  e.stopPropagation(); // parent handlers won't fire
});
```

> [!warning] **Use `stopPropagation` sparingly**
> It breaks libraries and patterns that rely on event bubbling (including event delegation). Consider alternatives first.

---

## `preventDefault()`

Prevents the browser's default action — NOT propagation.

```js
// Prevent form submission
form.addEventListener("submit", (e) => {
  e.preventDefault(); // page won't reload
  // handle form data with JavaScript
});

// Prevent link navigation
link.addEventListener("click", (e) => {
  e.preventDefault(); // won't navigate to href
  customNavigation(link.href);
});

// Prevent context menu
element.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  showCustomMenu(e.clientX, e.clientY);
});
```

---

## Event Delegation

Attach a **single listener** to a parent element instead of individual listeners to many children. Uses bubbling + `event.target` to identify which child was clicked.

### Why?

```js
// ❌ Bad — 100 listeners for 100 items
document.querySelectorAll(".item").forEach(item => {
  item.addEventListener("click", handleClick); // 100 listeners
});
// Plus: new items added later won't have listeners!

// ✅ Good — 1 listener handles all items (present and future)
document.querySelector(".list").addEventListener("click", (e) => {
  const item = e.target.closest(".item");
  if (!item) return; // clicked outside an item

  handleClick(item);
});
```

### Full Delegation Pattern

```js
const list = document.querySelector("#todo-list");

list.addEventListener("click", (e) => {
  // Delete button clicked
  if (e.target.matches(".delete-btn")) {
    e.target.closest(".todo-item").remove();
    return;
  }

  // Edit button clicked
  if (e.target.matches(".edit-btn")) {
    const item = e.target.closest(".todo-item");
    editItem(item.dataset.id);
    return;
  }

  // Toggle complete on item click
  const item = e.target.closest(".todo-item");
  if (item) {
    item.classList.toggle("completed");
  }
});
```

> [!tip] **Event delegation is the professional approach**
> It handles dynamic content, uses less memory, and simplifies code. Use `closest()` + `matches()` for robust target identification.

---

## Common Event Types

### Mouse Events

| Event | Fires When |
|---|---|
| `click` | Left button click (or tap) |
| `dblclick` | Double click |
| `mousedown` / `mouseup` | Button pressed / released |
| `mousemove` | Mouse moves over element |
| `mouseenter` / `mouseleave` | Enter/leave element (**no bubble**) |
| `mouseover` / `mouseout` | Enter/leave element (**bubbles**) |
| `contextmenu` | Right-click |
| `wheel` | Mouse wheel scroll |

### Keyboard Events

| Event | Fires When |
|---|---|
| `keydown` | Key pressed (repeats while held) |
| `keyup` | Key released |

```js
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if (e.key === "s" && e.ctrlKey) {
    e.preventDefault();
    saveDocument();
  }
});
```

### Form Events

| Event | Fires When |
|---|---|
| `submit` | Form submitted |
| `input` | Value changes (real-time) |
| `change` | Value committed (on blur or selection) |
| `focus` / `blur` | Element gains/loses focus (**no bubble**) |
| `focusin` / `focusout` | Same but **bubbles** |
| `reset` | Form reset |

### Page Lifecycle Events

```js
// DOM ready (HTML parsed, no images/CSS yet)
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready");
});

// Everything loaded (images, stylesheets, iframes)
window.addEventListener("load", () => {
  console.log("Page fully loaded");
});

// User leaving the page
window.addEventListener("beforeunload", (e) => {
  e.preventDefault(); // shows "Are you sure?" dialog  
});
```

### Other Events

| Event | Fires When |
|---|---|
| `scroll` | Element is scrolled |
| `resize` | Window is resized |
| `copy` / `cut` / `paste` | Clipboard operations |
| `dragstart` / `drag` / `drop` / `dragend` | Drag and drop |
| `touchstart` / `touchmove` / `touchend` | Touch devices |
| `pointerdown` / `pointermove` / `pointerup` | Unified mouse/touch/stylus |

---

## Custom Events

Create and dispatch your own events for component communication.

```js
// Create
const event = new CustomEvent("userLogin", {
  detail: { userId: 42, username: "john" },
  bubbles: true,    // allow to bubble up
  cancelable: true  // allow preventDefault
});

// Dispatch
element.dispatchEvent(event);

// Listen
element.addEventListener("userLogin", (e) => {
  console.log("User logged in:", e.detail.username);
});
```

### Pub/Sub with Custom Events

```js
// Use document as a global event bus
function emit(eventName, data) {
  document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
}

function on(eventName, handler) {
  document.addEventListener(eventName, (e) => handler(e.detail));
}

// Usage
on("cart:updated", (items) => updateCartBadge(items.length));
emit("cart:updated", [{ id: 1, name: "Widget" }]);
```

---

## Passive Listeners

Telling the browser the handler won't call `preventDefault()` — enables performance optimizations for scroll/touch.

```js
// Scroll and touch handlers should be passive
window.addEventListener("scroll", handleScroll, { passive: true });
element.addEventListener("touchstart", handleTouch, { passive: true });

// Chrome makes these passive by default on document/window
// But explicitly setting it is a best practice
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Anonymous functions can't be removed** — `removeEventListener` requires the same function reference.
> 2. **`this` in arrow handlers** — Arrow functions don't bind `this` to the element. Use `event.currentTarget` instead.
> 3. **Events that don't bubble** — `focus`, `blur`, `mouseenter`, `mouseleave`, `load`, `unload`, `scroll` (on non-document). Use `focusin`/`focusout` for delegation.
> 4. **Multiple handlers** — `addEventListener` can attach multiple handlers to the same event. They all fire. Use `removeEventListener` or `AbortController` to manage them.
> 5. **`stopPropagation` breaks delegation** — If a child stops propagation, parent delegation handlers won't fire.
> 6. **Memory leaks** — Forgetting to remove listeners on elements that are removed from DOM. Use `{ once: true }`, `AbortController`, or `WeakRef`.

---

## 🎯 Practice Exercises

1. **Event Delegation** — Create a `<ul>` with 50 `<li>` items. Use a SINGLE event listener on the `<ul>` to handle clicks on any `<li>`. Dynamically add new items and verify they work without new listeners.
2. **Custom Event System** — Build `new CustomEvent('user:login', { detail: { username } })`, dispatch it on `document`, and listen for it elsewhere. Pass data through `detail`.
3. **Keyboard Shortcuts** — Create a keyboard shortcut handler: Ctrl+S saves, Ctrl+Z undoes, Escape closes a modal. Prevent default browser behavior for each.
4. **Drag and Drop** — Implement a basic drag-and-drop using `mousedown`, `mousemove`, `mouseup` (no Drag API). Track position and move an element.
5. **Debounced Search** — Create an input field that fires a search after the user stops typing for 300ms. Use a closure-based debounce function with event listeners.

---

## Related Topics

- [[03 - Selecting Elements]] — Finding elements to attach listeners to
- [[07 - DOM Observers]] — MutationObserver, IntersectionObserver, ResizeObserver
- [[06 - Timers and Scheduling]] — Debouncing/throttling event handlers
- [[02 - The Event Loop]] — How event callbacks are processed

---

**Navigation:**
← [[05 - Attributes Classes and Styles]] | [[07 - DOM Observers]] →
