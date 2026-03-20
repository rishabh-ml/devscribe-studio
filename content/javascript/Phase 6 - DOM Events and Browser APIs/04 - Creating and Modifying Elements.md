---
title: Creating and Modifying Elements
phase: 6
topic: Creating and Modifying Elements
tags: [javascript, dom, createElement, appendChild, innerHTML, textContent, cloneNode]
created: 2025-01-15
---

# Creating and Modifying Elements

> [!info] **Big Picture**
> The DOM is not read-only — JavaScript can create new elements, insert them into the page, move them around, modify their content, and remove them. This is the core of dynamic web applications. Understanding the different insertion methods and the security implications of `innerHTML` vs `textContent` is essential.

---

## Creating Elements

### `document.createElement(tag)`

```js
const div = document.createElement("div");
div.id = "card";
div.className = "card active";
div.textContent = "Hello World";
// Element exists in memory but is NOT in the page yet
```

### `document.createTextNode(text)`

```js
const text = document.createTextNode("Some text");
div.appendChild(text);
```

### `document.createDocumentFragment()`

A lightweight container that doesn't appear in the DOM. Perfect for batching multiple insertions.

```js
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const li = document.createElement("li");
  li.textContent = `Item ${i}`;
  fragment.appendChild(li); // append to fragment (no reflows)
}

document.getElementById("list").appendChild(fragment);
// Only ONE reflow when the fragment is inserted
```

> [!tip] **Use fragments for batch insertions**
> Each DOM insertion triggers a reflow. Appending 1000 elements individually causes 1000 reflows. Using a fragment causes just 1.

---

## Inserting Elements

### Classic Methods

```js
parent.appendChild(child);           // add at end
parent.insertBefore(newNode, refNode); // add before reference node
parent.replaceChild(newNode, oldNode); // replace existing node
```

### Modern Methods (ES6+)

```js
// All accept multiple nodes AND strings
parent.append(el1, el2, "text");     // add at end
parent.prepend(el1, "text");         // add at start
element.after(el1, "text");          // add after element
element.before(el1, "text");         // add before element
element.replaceWith(newEl);          // replace element
```

### Comparison: Classic vs Modern

| Classic | Modern | Key Difference |
|---|---|---|
| `appendChild(node)` | `append(...nodes)` | `append` accepts multiple + strings |
| `insertBefore(new, ref)` | `before(new)` / `after(new)` | More intuitive API |
| `replaceChild(new, old)` | `replaceWith(new)` | Called on the element itself |
| Returns the appended node | Returns `undefined` | Classic allows chaining |

```js
// Modern methods in action
const list = document.querySelector("ul");

const li = document.createElement("li");
li.textContent = "New item";

list.append(li);                          // add at end
list.prepend(document.createElement("li")); // add at start
li.after(document.createElement("li"));     // add after li
li.before("Text node before li");           // string becomes text node
```

---

## `insertAdjacentHTML` / `insertAdjacentElement` / `insertAdjacentText`

Insert at specific positions relative to an element — very flexible.

```js
element.insertAdjacentHTML(position, htmlString);
```

```
<!-- beforebegin -->
<div id="target">
  <!-- afterbegin -->
  existing content
  <!-- beforeend -->
</div>
<!-- afterend -->
```

```js
const target = document.getElementById("target");

target.insertAdjacentHTML("beforebegin", "<p>Before</p>");
target.insertAdjacentHTML("afterbegin", "<p>First child</p>");
target.insertAdjacentHTML("beforeend", "<p>Last child</p>");
target.insertAdjacentHTML("afterend", "<p>After</p>");
```

> [!tip] **`insertAdjacentHTML` parses HTML without destroying existing content**
> Unlike setting `innerHTML`, it doesn't rebuild the entire element's content — existing event listeners and references are preserved.

---

## Removing Elements

```js
// Modern (recommended)
element.remove(); // removes itself from DOM

// Classic
parent.removeChild(child); // returns the removed node
```

```js
// Remove all children
while (parent.firstChild) {
  parent.removeChild(parent.firstChild);
}

// Or faster:
parent.innerHTML = ""; // destroys all children (but see security note below)

// Or use replaceChildren with no arguments:
parent.replaceChildren(); // removes all children cleanly
```

---

## Cloning Elements

```js
const original = document.querySelector(".card");

// Shallow clone — element only, no children
const shallow = original.cloneNode(false);

// Deep clone — element AND all descendants  
const deep = original.cloneNode(true);

// Cloned elements are NOT in the DOM — insert them
document.body.appendChild(deep);
```

> [!warning] **Cloning doesn't copy event listeners**
> Event listeners added with `addEventListener` are NOT cloned. Only inline `onclick` attributes are copied. Use event delegation instead.

---

## `innerHTML` vs `textContent` vs `innerText`

### `textContent`

Returns/sets raw text. **No HTML parsing.** Safe for user input.

```js
element.textContent = "<b>Bold?</b>";
// Displays literally: <b>Bold?</b>  (NOT bold text)
// ✅ Safe — user input cannot inject scripts
```

### `innerHTML`

Returns/sets HTML string. **Parses HTML.** XSS risk with user input.

```js
element.innerHTML = "<b>Bold!</b>";
// Displays: Bold!  (rendered as bold)

// ❌ DANGEROUS with user input
element.innerHTML = userInput; // If userInput contains <script> or event handlers...
```

### `innerText`

Similar to `textContent` but CSS-aware (respects `display: none`, triggers reflow).

```js
// <div>Hello <span style="display:none">Hidden</span> World</div>

element.textContent; // "Hello Hidden World" — all text
element.innerText;   // "Hello World" — only visible text (slower)
```

### Comparison

| Property | HTML parsing? | CSS-aware? | XSS safe? | Performance |
|---|---|---|---|---|
| `textContent` | No | No | ✅ Yes | Fast |
| `innerHTML` | Yes | No | ❌ No | Medium |
| `innerText` | No | Yes | ✅ Yes | Slow (triggers reflow) |

> [!danger] **Never use `innerHTML` with user input**
> ```js
> // ❌ XSS vulnerability
> element.innerHTML = `<div>${userComment}</div>`;
> 
> // ✅ Safe alternative
> const div = document.createElement("div");
> div.textContent = userComment;
> element.appendChild(div);
> ```

---

## `outerHTML`

Replaces the element itself, including its tag.

```js
// <div id="old">Content</div>
document.getElementById("old").outerHTML = "<section>New</section>";
// The <div> is GONE, replaced by <section>New</section>
// ⚠️ The old element reference is now detached from the DOM
```

---

## Real-World Patterns

### Building a Card Component

```js
function createCard(title, body, imageUrl) {
  const card = document.createElement("article");
  card.className = "card";

  card.innerHTML = `
    <img src="${encodeURI(imageUrl)}" alt="${title}" class="card-img">
    <h2 class="card-title"></h2>
    <p class="card-body"></p>
  `;

  // Set text content safely (not via innerHTML)
  card.querySelector(".card-title").textContent = title;
  card.querySelector(".card-body").textContent = body;

  return card;
}

const container = document.getElementById("cards");
container.append(
  createCard("Hello", "World", "/img/hello.jpg"),
  createCard("Foo", "Bar", "/img/foo.jpg")
);
```

### Rendering a List from Data

```js
function renderList(items, container) {
  const fragment = document.createDocumentFragment();

  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.name;
    li.dataset.id = item.id;
    fragment.appendChild(li);
  });

  container.replaceChildren(fragment); // clear + insert in one step
}
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`innerHTML` destroys event listeners** — Setting `innerHTML` rebuilds the entire content, removing all listeners on child elements.
> 2. **Elements can only be in one place** — `appendChild` moves an element if it's already in the DOM. Clone it if you need copies.
> 3. **`outerHTML` detaches the reference** — After setting `outerHTML`, your variable still points to the old (now detached) element.
> 4. **Batch DOM operations** — Each modification triggers layout recalculation. Use fragments or `requestAnimationFrame` to batch changes.
> 5. **`innerHTML` XSS** — Never insert unsanitized user input via `innerHTML`. Use `textContent` or sanitize with DOMPurify.

---

## Related Topics

- [[02 - DOM Tree and Traversal]] — Understanding the tree you're modifying
- [[03 - Selecting Elements]] — Finding elements before modifying them
- [[05 - Attributes Classes and Styles]] — Changing attributes and styles
- [[06 - Events]] — Adding interactivity to created elements

---

**Navigation:**
← [[03 - Selecting Elements]] | [[05 - Attributes Classes and Styles]] →
