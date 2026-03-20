---
title: Prototypes and the Prototype Chain
phase: 4
topic: Prototypes and the Prototype Chain
tags: [javascript, prototypes, prototype-chain, inheritance, object-create, instanceof, interview]
created: 2025-01-15
---

# Prototypes and the Prototype Chain

> [!info] **Big Picture**
> JavaScript's inheritance model is **prototypal**, not class-based. Every object has a hidden link (`[[Prototype]]`) to another object. When you access a property, JavaScript walks **up this chain** until it finds the property or reaches `null`. This is how methods like `.toString()` and `.hasOwnProperty()` work on every object — they're inherited from `Object.prototype`. Classes in JavaScript are syntactic sugar over this prototype system.

---

## The `[[Prototype]]` Link

Every JavaScript object has an internal `[[Prototype]]` property that references another object (or `null`).

```js
const animal = {
  eats: true,
  walk() {
    console.log("Walking...");
  },
};

const rabbit = {
  jumps: true,
  __proto__: animal, // set prototype (legacy syntax — see below for modern)
};

rabbit.jumps; // true — own property
rabbit.eats;  // true — found on animal via prototype chain
rabbit.walk(); // "Walking..." — found on animal

console.log(rabbit.toString()); // "[object Object]" — found on Object.prototype!
```

### Accessing the Prototype

```js
const obj = { name: "Alice" };

// ✅ Modern — recommended
Object.getPrototypeOf(obj);   // Object.prototype

// ✅ Modern — set prototype
Object.setPrototypeOf(obj, someOtherProto); // avoid in perf-critical code

// ❌ Legacy — works but deprecated
obj.__proto__;  // Object.prototype
```

> [!warning] **Avoid `__proto__`**
> `__proto__` is deprecated. Use `Object.getPrototypeOf()` and `Object.setPrototypeOf()` instead. Or use `Object.create()` to set the prototype at object creation time.

---

## The Prototype Chain

When you access a property, JavaScript searches through the chain:

```
rabbit → animal → Object.prototype → null
```

```js
rabbit.eats      // Step 1: Not on rabbit. Step 2: Found on animal → true
rabbit.toString  // Step 1: Not on rabbit. Step 2: Not on animal.
                 // Step 3: Found on Object.prototype → function
rabbit.fly       // Steps 1-3: Not found. Step 4: Chain ends at null → undefined
```

### Visualizing the Chain

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────────┐
│   rabbit    │     │    animal    │     │  Object.prototype    │
│             │────→│              │────→│                      │────→ null
│ jumps: true │     │ eats: true   │     │ toString()           │
│             │     │ walk()       │     │ hasOwnProperty()     │
└─────────────┘     └──────────────┘     │ valueOf()            │
                                         │ constructor: Object  │
                                         └──────────────────────┘
```

---

## `Object.create()` — Creating Objects with a Specific Prototype

The cleanest way to set up prototypal inheritance:

```js
const animal = {
  eats: true,
  walk() {
    console.log("Walking...");
  },
};

// Create a new object with animal as its prototype
const rabbit = Object.create(animal);
rabbit.jumps = true;

rabbit.jumps; // true (own property)
rabbit.eats;  // true (inherited from animal)
rabbit.walk(); // "Walking..." (inherited from animal)

Object.getPrototypeOf(rabbit) === animal; // true
```

### Creating an Object with No Prototype

```js
const bare = Object.create(null);
// This object has NO prototype — no toString, no hasOwnProperty, nothing

bare.toString; // undefined — truly bare
// Useful for dictionaries/hash maps without prototype pollution risk

bare.key = "value";
console.log("key" in bare); // true — works
console.log(bare.hasOwnProperty); // undefined — doesn't exist!
```

---

## Constructor Functions and `.prototype`

Every function has a `.prototype` property. When the function is used as a constructor with `new`, the created object's `[[Prototype]]` is set to the constructor's `.prototype`.

```js
function Dog(name) {
  this.name = name; // own property on each instance
}

// Methods on the prototype — shared by ALL instances
Dog.prototype.bark = function() {
  console.log(`${this.name} says: Woof!`);
};

Dog.prototype.species = "Canis lupus familiaris";

const rex = new Dog("Rex");
const buddy = new Dog("Buddy");

rex.bark();    // "Rex says: Woof!"
buddy.bark();  // "Buddy says: Woof!"

// Both share the SAME bark function
rex.bark === buddy.bark; // true — one function, not duplicated

// Own vs inherited
rex.hasOwnProperty("name");    // true — own
rex.hasOwnProperty("bark");    // false — inherited from Dog.prototype
rex.hasOwnProperty("species"); // false — inherited
```

### The Constructor Chain

```
rex → Dog.prototype → Object.prototype → null
         ↑
    bark: function
    species: string
    constructor: Dog
```

---

## `instanceof`

Checks if an object's **prototype chain** contains a constructor's `.prototype`.

```js
function Dog(name) { this.name = name; }
const rex = new Dog("Rex");

rex instanceof Dog;     // true — Dog.prototype is in rex's chain
rex instanceof Object;  // true — Object.prototype is in every chain

// How it works internally:
// Object.getPrototypeOf(rex) === Dog.prototype → true

// Arrays and their chain
const arr = [1, 2, 3];
arr instanceof Array;   // true
arr instanceof Object;  // true — Array.prototype → Object.prototype
```

> [!note] **`instanceof` Limitation**
> `instanceof` checks the prototype chain, not the constructor that created the object. If you change an object's prototype after creation, `instanceof` results change too.

---

## Property Lookup vs Property Assignment

### Reading (Lookup) — Walks the chain

```js
rabbit.eats; // walks up: rabbit → animal → found!
```

### Writing (Assignment) — Always sets on the object itself

```js
const animal = { eats: true };
const rabbit = Object.create(animal);

rabbit.eats = false; // creates a NEW property on rabbit (shadow)

rabbit.eats;  // false — own property (shadows inherited)
animal.eats;  // true — unchanged!

// The inherited property is "shadowed", not modified
```

> [!warning] **Shadowing**
> Assigning a property that exists on the prototype creates a **shadow** (own property that hides the inherited one). The prototype property is NOT modified.

---

## Own Properties vs Inherited Properties

```js
const parent = { inherited: true };
const child = Object.create(parent);
child.own = true;

// Check own properties
child.hasOwnProperty("own");       // true
child.hasOwnProperty("inherited"); // false

// ES2022 — preferred
Object.hasOwn(child, "own");       // true
Object.hasOwn(child, "inherited"); // false

// Enumerating
Object.keys(child);      // ["own"] — own enumerable only
Object.values(child);    // [true]

// for...in includes inherited enumerable properties
for (const key in child) {
  console.log(key); // "own", "inherited"
}

// Filter with hasOwn
for (const key in child) {
  if (Object.hasOwn(child, key)) {
    console.log(key); // "own" only
  }
}
```

---

## Prototypal Inheritance Patterns

### Object Linking (OLOO — Objects Linked to Other Objects)

```js
const Animal = {
  init(name, sound) {
    this.name = name;
    this.sound = sound;
    return this;
  },
  speak() {
    console.log(`${this.name} says ${this.sound}`);
  },
};

const Dog = Object.create(Animal);
Dog.fetch = function(item) {
  console.log(`${this.name} fetches the ${item}`);
};

const rex = Object.create(Dog).init("Rex", "Woof");
rex.speak();        // "Rex says Woof"
rex.fetch("ball");  // "Rex fetches the ball"

// Chain: rex → Dog → Animal → Object.prototype → null
```

### Prototype Chain for Built-in Types

```
[1, 2, 3] → Array.prototype → Object.prototype → null
"hello"   → String.prototype → Object.prototype → null
42        → Number.prototype → Object.prototype → null
/regex/   → RegExp.prototype → Object.prototype → null
function(){} → Function.prototype → Object.prototype → null
```

```js
// That's why all arrays have .map, .filter, etc.
Array.prototype.map;        // function
Array.prototype.filter;     // function

// And why all objects have .toString
Object.prototype.toString;  // function
```

---

## Performance Considerations

> [!tip] **Prototype Lookup Cost**
> - Property lookup walks the prototype chain — longer chains are slightly slower
> - **Own properties** are fastest to access
> - Methods on the prototype are **shared** (memory efficient — one copy for all instances)
> - Methods defined in constructors (`this.method = function(){}`) are **duplicated** per instance
> 
> ```js
> // ✅ Efficient — one bark function shared by all instances
> Dog.prototype.bark = function() { };
> 
> // ❌ Wasteful — creates a new bark function for EACH instance
> function Dog(name) {
>   this.name = name;
>   this.bark = function() { }; // separate copy per dog!
> }
> ```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Replacing `.prototype` breaks `instanceof`** — If you replace `Fn.prototype` after creating instances, old instances lose `instanceof Fn`
> 2. **`for...in` includes inherited** — Use `Object.keys()` or `for...of Object.keys()` to skip inherited
> 3. **Mutating shared prototype properties** — If a prototype has object/array properties, all children share the SAME reference. Mutating it affects everyone.
>    ```js
>    const Base = { items: [] };
>    const a = Object.create(Base);
>    const b = Object.create(Base);
>    a.items.push("x");  // mutates Base.items!
>    b.items;             // ["x"] — shared reference!
>    ```
> 4. **`__proto__` is a getter/setter** — Not a real property. Can cause issues with `Object.create(null)` objects.
> 5. **`Object.setPrototypeOf` is slow** — Changing an existing object's prototype ruins engine optimizations. Set it at creation time with `Object.create()`.

---

## 💼 Common Interview Questions

**Q1: How does prototypal inheritance work in JavaScript?**
> Every object has an internal `[[Prototype]]` link to another object. When a property is accessed, the engine searches the object first, then follows the prototype chain upward until it finds the property or reaches `null`. This is how objects "inherit" methods.

**Q2: What’s the difference between `__proto__` and `.prototype`?**
> - `__proto__` (or `Object.getPrototypeOf(obj)`) is the **actual prototype link** on an instance
> - `.prototype` is a property on **constructor functions/classes** — it becomes the `__proto__` of instances created with `new`
> ```js
> function Dog() {}
> const d = new Dog();
> d.__proto__ === Dog.prototype; // true
> ```

**Q3: How would you create an object with no prototype?**
> `Object.create(null)` creates a "pure dictionary" object with no prototype chain. It has no `.toString()`, `.hasOwnProperty()`, etc. Useful for safe key-value maps.

**Q4: What will this output?**
```js
function Animal() {}
Animal.prototype.speak = function() { return "..."; };
function Dog() {}
Dog.prototype = Object.create(Animal.prototype);
const d = new Dog();
console.log(d.speak());
console.log(d.constructor === Dog);
```
> **Answer:** `"..."` (inherited via chain), then `false` — replacing `Dog.prototype` lost the `constructor` reference. Fix: `Dog.prototype.constructor = Dog;`

**Q5: `instanceof` vs `Object.getPrototypeOf()` — which is better?**
> `instanceof` walks the prototype chain: `d instanceof Animal` is true if `Animal.prototype` appears anywhere in `d`'s chain. `Object.getPrototypeOf()` returns the direct parent. Use `instanceof` for type checks, `getPrototypeOf()` for inspecting the chain.

---

## 🎯 Practice Exercises

1. **Prototype Chain Visualizer** — Write a function `getPrototypeChain(obj)` that returns an array of all prototypes from `obj` up to `null`.
2. **Manual Inheritance** — Create `Animal` and `Dog` constructor functions. Set up proper prototype inheritance WITHOUT classes. Add methods to each level and test with `instanceof`.
3. **Property Shadowing** — Create an object that inherits a property from its prototype. Shadow it on the instance and prove both values coexist using `hasOwnProperty()`.
4. **Mixin Pattern** — Implement `Object.assign()` to mix behaviors from multiple sources into a prototype. Test that an object gains methods from all mixins.
5. **Safe Dictionary** — Create an object with `Object.create(null)`. Demonstrate that it has no inherited methods. Build a small wrapper with `get`, `set`, `has` methods.

---

## Related Topics

- [[04 - Constructor Functions]] — How `new` sets up the prototype link
- [[05 - ES6 Classes]] — Syntactic sugar over prototypes
- [[02 - The this Keyword]] — `this` in prototype methods
- [[07 - Objects Foundations]] — Object fundamentals and property access

---

**Navigation:**
← [[02 - The this Keyword]] | [[01 - Phase 4 - Overview]] | [[04 - Constructor Functions]] →
