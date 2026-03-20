---
title: DOM Tree and Traversal
phase: 6
topic: DOM Tree and Traversal
tags: [javascript, dom, traversal, nodes, parentNode, children, siblings]
created: 2025-01-15
---

# DOM Tree and Traversal

> [!info] **Big Picture**
> The **Document Object Model (DOM)** is a tree-shaped representation of an HTML document where every element, text, and comment becomes a **node**. JavaScript interacts with the page through this tree — traversing nodes, reading content, and modifying structure. Understanding the DOM tree is the foundation for all browser-side JavaScript.

---

## Node Types

Every item in the DOM tree is a node with a `nodeType` property.

| Constant | Value | Description | Example |
|---|---|---|---|
| `Node.ELEMENT_NODE` | 1 | HTML element | `<div>`, `<p>`, `<span>` |
| `Node.TEXT_NODE` | 3 | Text content | `"Hello World"` |
| `Node.COMMENT_NODE` | 8 | HTML comment | `<!-- comment -->` |
| `Node.DOCUMENT_NODE` | 9 | The document itself | `document` |
| `Node.DOCUMENT_FRAGMENT_NODE` | 11 | Document fragment | `document.createDocumentFragment()` |

```html
<div id="container">
  Hello
  <span>World</span>
  <!-- a comment -->
</div>
```

```
document
 └── html (Element)
      ├── head (Element)
      └── body (Element)
           └── div#container (Element)
                ├── "Hello" (Text)
                ├── span (Element)
                │    └── "World" (Text)
                └── <!-- a comment --> (Comment)
```

> [!note] **Whitespace creates text nodes**
> Line breaks and spaces between tags create text nodes. That's why `childNodes` often has more items than you expect.

---

## Traversal Properties

### All Nodes (includes text and comment nodes)

```js
const div = document.getElementById("container");

div.parentNode;         // body element
div.childNodes;         // NodeList [text, span, text, comment, text]
div.firstChild;         // "\n  Hello\n  " (Text node)
div.lastChild;          // "\n" (Text node — whitespace after comment)
div.nextSibling;        // next node (may be text)
div.previousSibling;    // previous node (may be text)
```

### Element-Only Navigation (usually what you want)

```js
div.parentElement;           // body element (same as parentNode for elements)
div.children;                // HTMLCollection [span] — elements only
div.firstElementChild;       // <span>World</span>
div.lastElementChild;        // <span>World</span>
div.nextElementSibling;      // next element (skips text/comments)
div.previousElementSibling;  // previous element
div.childElementCount;       // 1
```

> [!tip] **Use Element-Only Properties**
> Unless you specifically need text nodes, always use `children`, `firstElementChild`, etc. They skip whitespace text nodes and comments.

---

## `NodeList` vs `HTMLCollection`

| Feature | `NodeList` | `HTMLCollection` |
|---|---|---|
| Returned by | `querySelectorAll`, `childNodes` | `getElementsByClassName`, `children` |
| Contains | Any node type | Elements only |
| Live/Static | `childNodes` = live; `querySelectorAll` = static | Always **live** |
| `forEach` | Yes | No (convert first) |
| Indexed | Yes (`[0]`, `.item(0)`) | Yes (`[0]`, `.item(0)`, `.namedItem()`) |

```js
// Live collection — updates automatically when DOM changes
const divs = document.getElementsByTagName("div");
console.log(divs.length); // 3

document.body.appendChild(document.createElement("div"));
console.log(divs.length); // 4 ← automatically updated!

// Static collection — snapshot at query time
const spans = document.querySelectorAll("span");
// Adding new spans won't affect this NodeList
```

### Converting to Array

```js
const children = element.children; // HTMLCollection

// Convert to use array methods
const arr1 = Array.from(children);
const arr2 = [...children];

arr1.forEach(child => console.log(child.tagName));
arr2.filter(child => child.classList.contains("active"));
```

---

## Walking the DOM Tree

### Recursive Tree Walk

```js
function walkDOM(node, callback) {
  callback(node);
  node = node.firstElementChild;
  while (node) {
    walkDOM(node, callback);
    node = node.nextElementSibling;
  }
}

// Log every element's tag name
walkDOM(document.body, (node) => {
  console.log(node.tagName);
});
```

### Using `TreeWalker`

```js
const walker = document.createTreeWalker(
  document.body,
  NodeFilter.SHOW_ELEMENT, // only elements
  {
    acceptNode(node) {
      return node.classList.contains("highlight")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    }
  }
);

let node;
while (node = walker.nextNode()) {
  console.log(node.textContent);
}
```

---

## `document` and `document.documentElement`

```js
document.documentElement; // <html> — root element
document.head;            // <head>
document.body;            // <body> (null if script runs before <body>)
document.title;           // page title (read/write)
```

---

## Checking Node Information

```js
const el = document.getElementById("box");

el.nodeName;     // "DIV" (uppercase for elements)
el.tagName;      // "DIV" (only for elements)
el.nodeType;     // 1 (ELEMENT_NODE)
el.nodeValue;    // null for elements, text content for text nodes
el.textContent;  // all text content (including children)
el.innerHTML;    // HTML string of contents
el.outerHTML;    // HTML string including the element itself

// Check if node contains another
document.body.contains(el); // true if el is inside body
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`childNodes` includes text nodes** — Whitespace between elements creates text nodes. Use `children` for elements only.
> 2. **`document.body` can be `null`** — If your script runs in `<head>` before `<body>` is parsed. Use `defer` or `DOMContentLoaded`.
> 3. **Live vs static collections** — Modifying the DOM while iterating a live `HTMLCollection` can cause infinite loops or skipped items. Convert to array first.
> 4. **`parentNode` vs `parentElement`** — For the `<html>` element, `parentNode` is the `document`, but `parentElement` is `null` (document is not an element).

---

## Related Topics

- [[03 - Selecting Elements]] — Finding specific elements in the DOM
- [[04 - Creating and Modifying Elements]] — Adding/removing nodes
- [[06 - Events]] — Responding to user interaction with DOM elements

---

**Navigation:**
← [[01 - Phase 6 - Overview]] | [[03 - Selecting Elements]] →
