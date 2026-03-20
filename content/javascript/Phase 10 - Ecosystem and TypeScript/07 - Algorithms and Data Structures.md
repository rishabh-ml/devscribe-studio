---
title: Algorithms and Data Structures
phase: 10
topic: Algorithms and Data Structures
tags: [javascript, algorithms, data-structures, big-o, sorting, searching, interview]
created: 2026-03-05
---

# Algorithms and Data Structures

> [!info] **Big Picture**
> Algorithms and data structures aren't just academic — they're the foundation of efficient problem-solving. Understanding **Big O** tells you *why* code is slow. Knowing the right **data structure** turns an O(n²) nightmare into an O(n) breeze. JavaScript's built-in `Array`, `Object`, `Map`, and `Set` are data structures you already use — this note shows you what's happening underneath and how to build the classic structures yourself.

---

## Big O Notation

Big O describes how an algorithm's time or space grows **relative to input size** `n`.

### Time Complexity Reference

| Notation | Name | Example | Feel |
|----------|------|---------|------|
| **O(1)** | Constant | Array access by index, Map.get() | Instant |
| **O(log n)** | Logarithmic | Binary search | Very fast |
| **O(n)** | Linear | Loop through array | Fair |
| **O(n log n)** | Linearithmic | Merge sort, quicksort (avg) | Decent |
| **O(n²)** | Quadratic | Nested loops, bubble sort | Slow |
| **O(2ⁿ)** | Exponential | Recursive Fibonacci (naive) | Terrible |
| **O(n!)** | Factorial | Permutations | Unusable |

### How to Analyze

```js
// O(1) — constant
function getFirst(arr) {
  return arr[0]; // one operation regardless of array size
}

// O(n) — linear
function findMax(arr) {
  let max = arr[0];
  for (const num of arr) {  // loops n times
    if (num > max) max = num;
  }
  return max;
}

// O(n²) — quadratic
function hasDuplicate(arr) {
  for (let i = 0; i < arr.length; i++) {       // n times
    for (let j = i + 1; j < arr.length; j++) {  // n times
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}

// O(n) — using a Set (trade space for time)
function hasDuplicateFast(arr) {
  return new Set(arr).size !== arr.length; // Set is O(1) lookup
}
```

### Space Complexity

```js
// O(1) space — modifying in place
function reverseInPlace(arr) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  return arr;
}

// O(n) space — creating a new array
function reverseNew(arr) {
  return [...arr].reverse(); // new array = O(n) extra space
}
```

### Rules of Thumb

> [!tip] **Simplification Rules**
> 1. **Drop constants** — O(2n) → O(n)
> 2. **Drop lower-order terms** — O(n² + n) → O(n²)
> 3. **Different inputs, different variables** — two arrays `a`, `b` → O(a × b), not O(n²)
> 4. **Nested loops multiply**, sequential loops add — O(n) + O(n) = O(n), not O(n²)

---

## Linked Lists

Sequential data where each **node** points to the next. Unlike arrays, insertion/deletion at the head is O(1) — no shifting needed.

### Singly Linked List

```js
class ListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // O(1) — add to front
  prepend(value) {
    const node = new ListNode(value);
    node.next = this.head;
    this.head = node;
    this.size++;
  }

  // O(n) — add to end
  append(value) {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }
    this.size++;
  }

  // O(1) — remove from front
  removeFirst() {
    if (!this.head) return null;
    const value = this.head.value;
    this.head = this.head.next;
    this.size--;
    return value;
  }

  // O(n) — find by value
  find(value) {
    let current = this.head;
    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }
    return null;
  }

  // O(n) — delete by value
  delete(value) {
    if (!this.head) return false;
    if (this.head.value === value) {
      this.head = this.head.next;
      this.size--;
      return true;
    }
    let current = this.head;
    while (current.next) {
      if (current.next.value === value) {
        current.next = current.next.next;
        this.size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Make iterable
  *[Symbol.iterator]() {
    let current = this.head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }

  toArray() {
    return [...this];
  }
}

const list = new LinkedList();
list.append(1);
list.append(2);
list.append(3);
console.log(list.toArray()); // [1, 2, 3]
```

### Doubly Linked List

Each node has both `next` and `prev` pointers — enables O(1) removal from both ends.

```js
class DoublyNode {
  constructor(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  // O(1)
  append(value) {
    const node = new DoublyNode(value);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this.size++;
  }

  // O(1)
  prepend(value) {
    const node = new DoublyNode(value);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this.size++;
  }

  // O(1) — remove last
  removeLast() {
    if (!this.tail) return null;
    const value = this.tail.value;
    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else {
      this.tail = this.tail.prev;
      this.tail.next = null;
    }
    this.size--;
    return value;
  }
}
```

### Array vs Linked List

| Operation | Array | Linked List |
|-----------|-------|-------------|
| Access by index | **O(1)** | O(n) |
| Insert at start | O(n) | **O(1)** |
| Insert at end | **O(1)** amortised | O(n) singly / **O(1)** doubly |
| Delete at start | O(n) | **O(1)** |
| Search | O(n) | O(n) |
| Memory | Contiguous | Extra pointer overhead |

---

## Stacks

**LIFO** — Last In, First Out. Think of a stack of plates.

```js
class Stack {
  #items = [];

  push(value) { this.#items.push(value); }   // O(1)
  pop() { return this.#items.pop(); }         // O(1)
  peek() { return this.#items.at(-1); }       // O(1)
  isEmpty() { return this.#items.length === 0; }
  get size() { return this.#items.length; }
}

// Real-world: undo/redo, call stack, bracket matching
function isBalanced(str) {
  const stack = new Stack();
  const pairs = { ")": "(", "]": "[", "}": "{" };

  for (const char of str) {
    if ("([{".includes(char)) {
      stack.push(char);
    } else if (")]}" .includes(char)) {
      if (stack.pop() !== pairs[char]) return false;
    }
  }
  return stack.isEmpty();
}

isBalanced("({[]})"); // true
isBalanced("([)]");   // false
```

---

## Queues

**FIFO** — First In, First Out. Think of a line at a checkout.

```js
class Queue {
  #items = [];

  enqueue(value) { this.#items.push(value); }       // O(1)
  dequeue() { return this.#items.shift(); }          // O(n) — shift is slow!
  front() { return this.#items[0]; }
  isEmpty() { return this.#items.length === 0; }
  get size() { return this.#items.length; }
}

// Real-world: task queues, BFS, print queue, event loop macrotask queue
```

### Optimised Queue (O(1) dequeue)

```js
class OptimisedQueue {
  #storage = {};
  #head = 0;
  #tail = 0;

  enqueue(value) {
    this.#storage[this.#tail] = value;
    this.#tail++;
  }

  dequeue() {
    if (this.isEmpty()) return undefined;
    const value = this.#storage[this.#head];
    delete this.#storage[this.#head];
    this.#head++;
    return value;
  }

  isEmpty() { return this.#tail === this.#head; }
  get size() { return this.#tail - this.#head; }
}
```

---

## Hash Tables

Key-value storage with **O(1)** average lookup. JavaScript's `Object` and `Map` are hash tables.

```js
// Simple hash table implementation
class HashTable {
  constructor(size = 53) {
    this.table = new Array(size);
    this.size = size;
  }

  // Hash function — converts key to array index
  #hash(key) {
    let total = 0;
    const PRIME = 31;
    for (let i = 0; i < Math.min(key.length, 100); i++) {
      total = (total * PRIME + key.charCodeAt(i)) % this.size;
    }
    return total;
  }

  set(key, value) {
    const index = this.#hash(key);
    if (!this.table[index]) this.table[index] = [];
    // Handle collision with chaining
    const existing = this.table[index].find(([k]) => k === key);
    if (existing) {
      existing[1] = value;
    } else {
      this.table[index].push([key, value]);
    }
  }

  get(key) {
    const index = this.#hash(key);
    const bucket = this.table[index];
    if (!bucket) return undefined;
    const pair = bucket.find(([k]) => k === key);
    return pair ? pair[1] : undefined;
  }

  has(key) {
    return this.get(key) !== undefined;
  }
}

const ht = new HashTable();
ht.set("name", "Alice");
ht.get("name"); // "Alice"
```

### When to Use What in JS

| Need | Use | Why |
|------|-----|-----|
| String keys, simple data | `Object` / `{}` | Native, fast, JSON-compatible |
| Any key type, ordered | `Map` | O(1) get/set, any key type, iterable |
| Unique values | `Set` | O(1) add/has/delete |
| Weak references to object keys | `WeakMap` | No memory leaks |

---

## Binary Trees

Each node has at most **two children** (left and right).

### Binary Search Tree (BST)

Left child < parent < right child — enables O(log n) search on average.

```js
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  // O(log n) average, O(n) worst (unbalanced)
  insert(value) {
    const node = new TreeNode(value);
    if (!this.root) { this.root = node; return; }

    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) { current.left = node; return; }
        current = current.left;
      } else if (value > current.value) {
        if (!current.right) { current.right = node; return; }
        current = current.right;
      } else {
        return; // duplicate — ignore
      }
    }
  }

  // O(log n) average
  find(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) return current;
      current = value < current.value ? current.left : current.right;
    }
    return null;
  }

  // Tree traversals
  // In-order: Left → Root → Right (gives sorted order for BST)
  inOrder(node = this.root, result = []) {
    if (node) {
      this.inOrder(node.left, result);
      result.push(node.value);
      this.inOrder(node.right, result);
    }
    return result;
  }

  // Pre-order: Root → Left → Right (useful for copying/serializing)
  preOrder(node = this.root, result = []) {
    if (node) {
      result.push(node.value);
      this.preOrder(node.left, result);
      this.preOrder(node.right, result);
    }
    return result;
  }

  // Post-order: Left → Right → Root (useful for deletion)
  postOrder(node = this.root, result = []) {
    if (node) {
      this.postOrder(node.left, result);
      this.postOrder(node.right, result);
      result.push(node.value);
    }
    return result;
  }

  // Level-order (BFS)
  levelOrder() {
    if (!this.root) return [];
    const result = [];
    const queue = [this.root];
    while (queue.length) {
      const node = queue.shift();
      result.push(node.value);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    return result;
  }
}

const bst = new BinarySearchTree();
[10, 5, 15, 3, 7, 12, 18].forEach(v => bst.insert(v));
bst.inOrder();    // [3, 5, 7, 10, 12, 15, 18] — sorted!
bst.levelOrder(); // [10, 5, 15, 3, 7, 12, 18] — level by level
```

### Traversal Summary

```
        10
       /  \
      5    15
     / \   / \
    3   7 12  18

In-order:    3, 5, 7, 10, 12, 15, 18  (sorted)
Pre-order:   10, 5, 3, 7, 15, 12, 18  (root first)
Post-order:  3, 7, 5, 12, 18, 15, 10  (root last)
Level-order: 10, 5, 15, 3, 7, 12, 18  (breadth-first)
```

---

## Graphs

Nodes (vertices) connected by edges. Used for social networks, routing, dependency resolution.

### Adjacency List

```js
class Graph {
  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(v1, v2) {
    this.adjacencyList.get(v1)?.push(v2);
    this.adjacencyList.get(v2)?.push(v1); // remove for directed graph
  }

  // BFS — explore neighbours first (shortest path in unweighted graphs)
  bfs(start) {
    const visited = new Set();
    const queue = [start];
    const result = [];
    visited.add(start);

    while (queue.length) {
      const vertex = queue.shift();
      result.push(vertex);
      for (const neighbour of this.adjacencyList.get(vertex)) {
        if (!visited.has(neighbour)) {
          visited.add(neighbour);
          queue.push(neighbour);
        }
      }
    }
    return result;
  }

  // DFS — explore as deep as possible first
  dfs(start) {
    const visited = new Set();
    const result = [];

    const traverse = (vertex) => {
      visited.add(vertex);
      result.push(vertex);
      for (const neighbour of this.adjacencyList.get(vertex)) {
        if (!visited.has(neighbour)) traverse(neighbour);
      }
    };

    traverse(start);
    return result;
  }
}

const g = new Graph();
["A", "B", "C", "D", "E"].forEach(v => g.addVertex(v));
g.addEdge("A", "B");
g.addEdge("A", "C");
g.addEdge("B", "D");
g.addEdge("C", "E");

g.bfs("A"); // ["A", "B", "C", "D", "E"]
g.dfs("A"); // ["A", "B", "D", "C", "E"]
```

### BFS vs DFS

| | BFS | DFS |
|---|---|---|
| Data structure | Queue | Stack (call stack / explicit) |
| Explores | Level by level | Branch by branch |
| Shortest path | ✅ (unweighted) | ❌ |
| Memory | O(width) | O(depth) |
| Use case | Shortest path, level-order | Cycle detection, topological sort, maze solving |

---

## Sorting Algorithms

### Comparison

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| **Bubble Sort** | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| **Merge Sort** | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |
| **Quick Sort** | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ |
| JS `Array.sort` | — | O(n log n) | O(n log n) | — | ✅ (Timsort) |

### Bubble Sort (Educational Only)

```js
function bubbleSort(arr) {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    let swapped = false;
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // optimisation: already sorted
  }
  return a;
}
```

### Merge Sort

Divide-and-conquer. Always O(n log n) — **predictable and stable**.

```js
function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  return [...result, ...left.slice(i), ...right.slice(j)];
}

mergeSort([38, 27, 43, 3, 9, 82, 10]); // [3, 9, 10, 27, 38, 43, 82]
```

### Quick Sort

Divide-and-conquer with a **pivot**. Fastest in practice on average.

```js
function quickSort(arr) {
  if (arr.length <= 1) return arr;

  const pivot = arr[arr.length - 1];
  const left = [], right = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
}

quickSort([38, 27, 43, 3, 9, 82, 10]); // [3, 9, 10, 27, 38, 43, 82]
```

> [!tip] **In Practice**
> Use `Array.prototype.sort()` or `toSorted()` — JavaScript engines use optimised Timsort (hybrid of merge sort and insertion sort). Implement sorting algorithms to **understand them**, not to use in production.

---

## Binary Search

Requires a **sorted** array. O(log n) — halves the search space each step.

```js
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1; // not found
}

const sorted = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
binarySearch(sorted, 23); // 5 (index)
binarySearch(sorted, 50); // -1 (not found)
```

### Recursive Version

```js
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
  if (left > right) return -1;

  const mid = Math.floor((left + right) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) return binarySearchRecursive(arr, target, mid + 1, right);
  return binarySearchRecursive(arr, target, left, mid - 1);
}
```

---

## Data Structure Decision Guide

```
Need fast lookup by key?
├── Yes → Map or Object (hash table, O(1))
│
Need ordered data?
├── Sorted → Array + binary search (O(log n) search)
├── Insertion order → Array or Map
│
Need fast insert/delete at both ends?
├── Yes → Doubly Linked List or Deque
│
Need LIFO (undo, parsing)?
├── Yes → Stack
│
Need FIFO (task queue, BFS)?
├── Yes → Queue
│
Need hierarchical data?
├── Yes → Tree
│
Need relationships between entities?
├── Yes → Graph
│
Need unique values?
├── Yes → Set (O(1) lookup)
```

---

## 💼 Common Interview Questions

**Q1: How would you find if two strings are anagrams?**
```js
function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const count = {};
  for (const ch of a) count[ch] = (count[ch] || 0) + 1;
  for (const ch of b) {
    if (!count[ch]) return false;
    count[ch]--;
  }
  return true;
}
// Time: O(n), Space: O(n) — uses hash table (frequency map)
```

**Q2: Find the first non-repeating character in a string**
```js
function firstUnique(str) {
  const freq = new Map();
  for (const ch of str) freq.set(ch, (freq.get(ch) || 0) + 1);
  for (const ch of str) if (freq.get(ch) === 1) return ch;
  return null;
}
// Map preserves insertion order — O(n)
```

**Q3: Reverse a linked list**
```js
function reverseList(head) {
  let prev = null, current = head;
  while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  return prev; // new head
}
// O(n) time, O(1) space
```

**Q4: What's the time complexity of `Array.shift()` vs `Array.pop()`?**
> `pop()` is O(1) — removes the last element. `shift()` is O(n) — removes the first element and shifts all others. Use a linked list or object-based queue if you need O(1) dequeue.

---

## 🎯 Practice Exercises

1. **Two Sum** — Given an array and a target sum, return indices of two numbers that add up to the target. (Hint: use a Map for O(n) solution)
2. **Valid Parentheses** — Check if a string of brackets `()[]{}` is balanced using a Stack
3. **Merge Two Sorted Arrays** — Without using `.sort()`, merge two sorted arrays into one sorted array
4. **Max Depth of Binary Tree** — Write a recursive function to find the maximum depth of a BST
5. **Detect Cycle in Linked List** — Using Floyd's tortoise and hare algorithm (two pointers at different speeds)
6. **Implement a LRU Cache** — Combine a Map (for O(1) lookup) with a doubly linked list (for O(1) eviction) to build a Least Recently Used cache with `get()` and `put()` methods

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **JS `sort()` is lexicographic by default** — `[10, 2, 1].sort()` gives `[1, 10, 2]`. Always pass a comparator: `.sort((a, b) => a - b)`.
> 2. **`Array.shift()` is O(n)** — Don't use it in a loop for queue operations. Use an object-based queue instead.
> 3. **Recursive DFS can stack-overflow** — For very deep trees/graphs, use an iterative approach with an explicit stack.
> 4. **BST worst case is O(n)** — If you insert sorted data, you get a linked list. Self-balancing trees (AVL, Red-Black) fix this, but they're rarely implemented from scratch in JS.

---

## Related Topics

- [[06 - Array Iteration Methods]] — High-level array operations built on these foundations
- [[08 - Recursion]] — Recursive patterns used in trees, sorting, and DFS
- [[03 - Maps Sets and WeakVariants]] — JavaScript's built-in hash-based data structures
- [[05 - Memory Management and Performance]] — Space complexity and GC implications

---

**Navigation:**
← [[06 - Web Components and Web Workers]] | 🎓 **End of Roadmap**
