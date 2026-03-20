---
title: Constructor Functions
phase: 4
topic: Constructor Functions
tags: [javascript, constructors, new-keyword, prototype, hasOwnProperty]
created: 2025-01-15
---

# Constructor Functions

> [!info] **Big Picture**
> Before ES6 classes, constructor functions + `new` were the primary way to create objects with shared behavior in JavaScript. Understanding constructors is essential because classes are **syntactic sugar over this exact mechanism**. When you write `class Dog {}`, JavaScript is doing constructor function + prototype setup behind the scenes.

---

## What Is a Constructor Function?

A constructor is just a regular function called with `new`. By convention, constructors start with a **capital letter**.

```js
function User(name, age) {
  this.name = name;
  this.age = age;
}

const alice = new User("Alice", 30);
console.log(alice.name); // "Alice"
console.log(alice.age);  // 30
console.log(alice instanceof User); // true
```

---

## The 5 Steps of `new`

When you call `new User("Alice", 30)`, the engine does exactly this:

```js
// Step 1: Create a new empty object
const obj = {};

// Step 2: Set its [[Prototype]] to the constructor's .prototype
Object.setPrototypeOf(obj, User.prototype);

// Step 3: Bind `this` to the new object and execute the constructor
const result = User.call(obj, "Alice", 30);
// Inside User, `this` = obj, so:
// obj.name = "Alice";
// obj.age = 30;

// Step 4: If the constructor returns an object, use that instead
// Step 5: Otherwise, return the new object
const alice = (typeof result === "object" && result !== null) ? result : obj;
```

### Step 4 Detail: Explicit Return

```js
// If you return an OBJECT, it replaces the auto-created one
function Weird() {
  this.a = 1;
  return { b: 2 }; // this object replaces `this`
}
const w = new Weird();
console.log(w.a); // undefined — original object was replaced
console.log(w.b); // 2

// If you return a PRIMITIVE, it's ignored — `this` is returned
function Normal() {
  this.a = 1;
  return 42; // ignored!
}
const n = new Normal();
console.log(n.a); // 1 — normal behavior
```

> [!warning] **Don't return objects from constructors** unless you have a very specific reason (like implementing the factory pattern). It confuses expectations.

---

## Adding Methods via `.prototype`

```js
function Dog(name, breed) {
  this.name = name;
  this.breed = breed;
}

// Methods on prototype — shared by ALL instances
Dog.prototype.bark = function() {
  console.log(`${this.name}: Woof!`);
};

Dog.prototype.toString = function() {
  return `${this.name} (${this.breed})`;
};

const rex = new Dog("Rex", "German Shepherd");
const buddy = new Dog("Buddy", "Golden Retriever");

rex.bark();   // "Rex: Woof!"
buddy.bark(); // "Buddy: Woof!"

// Shared — efficient memory usage
rex.bark === buddy.bark; // true
```

### Why Not Put Methods in the Constructor?

```js
// ❌ Wasteful — creates a NEW function for EACH instance
function Dog(name) {
  this.name = name;
  this.bark = function() {
    console.log(`${this.name}: Woof!`);
  };
}

const a = new Dog("Rex");
const b = new Dog("Buddy");
a.bark === b.bark; // false — two separate functions in memory!

// ✅ Efficient — all instances share ONE function
function Dog(name) {
  this.name = name;
}
Dog.prototype.bark = function() {
  console.log(`${this.name}: Woof!`);
};
```

---

## The `constructor` Property

Every function's `.prototype` object has a `constructor` property pointing back to the function itself.

```js
function Dog(name) { this.name = name; }

Dog.prototype.constructor === Dog; // true

const rex = new Dog("Rex");
rex.constructor === Dog; // true (inherited from Dog.prototype)

// Useful for creating a new instance from an existing one
const buddy = new rex.constructor("Buddy");
buddy instanceof Dog; // true
```

> [!warning] **Don't Overwrite `.prototype` Without Restoring `constructor`**
> ```js
> function Dog(name) { this.name = name; }
> 
> // ❌ Replaces prototype — constructor property is lost
> Dog.prototype = {
>   bark() { console.log("Woof!"); },
> };
> 
> new Dog("Rex").constructor === Dog; // false! It's Object now.
> 
> // ✅ Fix: manually restore constructor
> Dog.prototype = {
>   constructor: Dog,
>   bark() { console.log("Woof!"); },
> };
> ```

---

## Own vs Inherited Properties

```js
function Car(make, model) {
  this.make = make;   // own property
  this.model = model; // own property
}

Car.prototype.drive = function() { // inherited
  console.log(`Driving ${this.make} ${this.model}`);
};

const car = new Car("Toyota", "Camry");

// hasOwnProperty (legacy)
car.hasOwnProperty("make");   // true — own
car.hasOwnProperty("drive");  // false — inherited

// Object.hasOwn (ES2022, preferred)
Object.hasOwn(car, "make");   // true
Object.hasOwn(car, "drive");  // false

// All own property names
Object.keys(car);             // ["make", "model"]
Object.getOwnPropertyNames(car); // ["make", "model"]
```

---

## Inheritance with Constructors

### Setting Up Prototype Inheritance (Pre-ES6)

```js
// Parent constructor
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  console.log(`${this.name} makes a sound`);
};

// Child constructor
function Dog(name, breed) {
  Animal.call(this, name); // Step 1: Call parent constructor with child's `this`
  this.breed = breed;       // child's own property
}

// Step 2: Set up prototype chain
Dog.prototype = Object.create(Animal.prototype);

// Step 3: Restore constructor reference
Dog.prototype.constructor = Dog;

// Step 4: Add child methods
Dog.prototype.bark = function() {
  console.log(`${this.name}: Woof!`);
};

// Usage
const rex = new Dog("Rex", "Shepherd");
rex.speak(); // "Rex makes a sound" — inherited from Animal
rex.bark();  // "Rex: Woof!" — own method

rex instanceof Dog;    // true
rex instanceof Animal; // true
```

### The Chain After Setup

```
rex → Dog.prototype → Animal.prototype → Object.prototype → null
         ↑                   ↑
     bark()              speak()
     constructor: Dog    constructor: Animal
```

> [!note] **This is exactly what ES6 `class extends` does under the hood.**
> The `class` syntax (see [[05 - ES6 Classes]]) automates all of these manual steps and adds safety checks.

---

## Calling Without `new` (Guard Pattern)

```js
function User(name) {
  // Guard: if called without new, redirect
  if (!(this instanceof User)) {
    return new User(name);
  }
  this.name = name;
}

// Both work:
const a = new User("Alice"); // normal
const b = User("Bob");       // also works — guard catches it

// Modern alternative: new.target
function User(name) {
  if (!new.target) {
    throw new Error("User must be called with new");
  }
  this.name = name;
}
```

---

## Constructor vs Factory vs Class

| Pattern | Syntax | `new` Required? | `instanceof`? | Use Case |
|---|---|---|---|---|
| Constructor | `function User() { this.x = 1 }` | Yes | Yes | Pre-ES6 OOP |
| Factory | `function createUser() { return { x: 1 } }` | No | No | No `this` needed |
| Class | `class User { constructor() { this.x = 1 } }` | Yes (enforced) | Yes | Modern OOP |

```js
// Factory — simpler, no `this` or `new` issues
function createUser(name) {
  return {
    name,
    greet() { return `Hi, I'm ${name}`; }, // closure, not `this`
  };
}
```

> [!tip] **When to Use What**
> - **Classes** for OOP: inheritance hierarchies, polymorphism, shared methods
> - **Factory functions** for simplicity: no `this`, no `new`, closures for privacy
> - **Constructor functions** for legacy code compatibility

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Forgetting `new`** — Without `new`, `this` is `globalThis` (non-strict) or `undefined` (strict). Properties leak to global or throw.
> 2. **Returning objects from constructors** — Replaces the auto-created instances. Surprising behavior.
> 3. **Overwriting `.prototype`** — Loses the `constructor` property. Always restore it.
> 4. **Methods in constructor body** — Creates duplicates per instance. Put methods on `.prototype`.
> 5. **`.prototype` property** — Only functions have it. Instances don't. `rex.prototype` is `undefined`.

---

## Related Topics

- [[03 - Prototypes and the Prototype Chain]] — What `new` connects
- [[05 - ES6 Classes]] — Modern syntax for the same mechanism
- [[02 - The this Keyword]] — `new` binding rule
- [[02 - Function Forms]] — Constructors are regular functions

---

**Navigation:**
← [[03 - Prototypes and the Prototype Chain]] | [[01 - Phase 4 - Overview]] | [[05 - ES6 Classes]] →
