---
title: ES6 Classes
phase: 4
topic: ES6 Classes
tags: [javascript, classes, inheritance, extends, super, private-fields, static, getters-setters, mixins]
created: 2025-01-15
---

# ES6+ Classes

> [!info] **Big Picture**
> Classes are **syntactic sugar over prototypes and constructor functions**. They don't introduce a new OOP model — they make the existing prototype-based model cleaner and safer. Classes enforce `new` (can't call without it), support `extends` and `super` natively, and since ES2022 include **truly private fields** (`#`), **static fields**, and **public class fields**. If you understand prototypes, classes are simply a nicer API for the same thing.

---

## Class Declarations and Expressions

```js
// Class declaration
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  greet() {
    return `Hi, I'm ${this.name}`;
  }
}

const alice = new User("Alice", "alice@example.com");
alice.greet(); // "Hi, I'm Alice"

// Class expression
const Animal = class {
  constructor(name) { this.name = name; }
};

// Named class expression (name only available inside class body)
const Vehicle = class Car {
  constructor() { console.log(Car.name); } // "Car"
};
```

> [!warning] **Classes are NOT hoisted** (like `let`/`const`, they're in the TDZ)
> ```js
> const u = new User(); // ❌ ReferenceError
> class User {}
> ```

---

## The `constructor` Method

Called automatically when `new` is used. Only one `constructor` per class.

```js
class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
}

// If you don't define a constructor, an empty one is provided:
class Empty {
  // implicit: constructor() {}
}
```

---

## Instance Methods

Methods defined in the class body are placed on the **prototype** (shared by all instances).

```js
class Calculator {
  add(a, b) { return a + b; }
  subtract(a, b) { return a - b; }
}

const calc = new Calculator();
calc.add(2, 3); // 5

// Proof: methods are on the prototype
calc.hasOwnProperty("add"); // false
Calculator.prototype.hasOwnProperty("add"); // true
```

---

## Public Class Fields (ES2022)

Declared outside the constructor. Cleaner syntax for instance properties.

```js
class Counter {
  count = 0;  // public field — each instance gets its own
  name = "default counter";

  increment() {
    this.count++;
  }
}

const c = new Counter();
c.count; // 0
c.increment();
c.count; // 1
```

> [!note] **Class fields are instance properties**
> `count = 0` is equivalent to writing `this.count = 0` inside the constructor. Each instance gets its own copy, and they're own properties (not on the prototype).

---

## Private Fields and Methods (`#`) — ES2022

Truly private — enforced by the engine, not just a convention.

```js
class BankAccount {
  #balance; // private field — cannot be accessed outside the class
  #owner;

  constructor(owner, initialBalance) {
    this.#owner = owner;
    this.#balance = initialBalance;
  }

  deposit(amount) {
    this.#validateAmount(amount); // private method
    this.#balance += amount;
    return this.#balance;
  }

  withdraw(amount) {
    this.#validateAmount(amount);
    if (amount > this.#balance) throw new Error("Insufficient funds");
    this.#balance -= amount;
    return this.#balance;
  }

  get balance() {
    return this.#balance;
  }

  // Private method
  #validateAmount(amount) {
    if (amount <= 0) throw new Error("Amount must be positive");
  }
}

const account = new BankAccount("Alice", 1000);
account.deposit(500);   // 1500
account.balance;         // 1500 (via getter)

account.#balance;        // ❌ SyntaxError: Private field
account.#validateAmount; // ❌ SyntaxError: Private field
```

> [!tip] **Private vs Convention**
> - `#field` = truly private, enforced by the engine at the syntax level
> - `_field` = just a naming convention, still publicly accessible
> - Always prefer `#` for real privacy in new code

---

## Getters and Setters

Computed properties that look like regular property access.

```js
class Circle {
  #radius;

  constructor(radius) {
    this.radius = radius; // triggers the setter
  }

  get radius() {
    return this.#radius;
  }

  set radius(value) {
    if (value < 0) throw new RangeError("Radius must be non-negative");
    this.#radius = value;
  }

  get area() {
    return Math.PI * this.#radius ** 2;
  }

  get circumference() {
    return 2 * Math.PI * this.#radius;
  }
}

const c = new Circle(5);
c.radius;        // 5 (getter)
c.area;          // 78.539...
c.circumference; // 31.415...
c.radius = 10;   // (setter) — validates!
c.radius = -1;   // ❌ RangeError
```

---

## Static Methods and Properties

Belong to the **class itself**, not instances.

```js
class MathUtils {
  static PI = 3.14159265358979;

  static square(x) {
    return x * x;
  }

  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
}

MathUtils.square(5);       // 25
MathUtils.clamp(15, 0, 10); // 10
MathUtils.PI;               // 3.14159265358979

const m = new MathUtils();
m.square(5);    // ❌ TypeError: m.square is not a function
m.PI;           // undefined — static, not on instances
```

### Static Factory Methods

```js
class User {
  constructor(name, email, role) {
    this.name = name;
    this.email = email;
    this.role = role;
  }

  static createAdmin(name, email) {
    return new User(name, email, "admin");
  }

  static createGuest() {
    return new User("Guest", "guest@example.com", "guest");
  }

  static fromJSON(json) {
    const data = JSON.parse(json);
    return new User(data.name, data.email, data.role);
  }
}

const admin = User.createAdmin("Alice", "alice@admin.com");
const guest = User.createGuest();
```

---

## Inheritance with `extends` and `super`

```js
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // MUST call super() before using `this`
    this.breed = breed;
  }

  speak() {
    console.log(`${this.name} barks`); // overrides parent method
  }

  fetch(item) {
    console.log(`${this.name} fetches ${item}`);
  }
}

const rex = new Dog("Rex", "Shepherd");
rex.speak();        // "Rex barks" — overridden method
rex.fetch("ball");  // "Rex fetches ball" — own method

rex instanceof Dog;    // true
rex instanceof Animal; // true
```

### `super` — Calling Parent Methods

```js
class Dog extends Animal {
  speak() {
    super.speak(); // call parent's speak()
    console.log(`${this.name} also barks!`);
  }
}

const rex = new Dog("Rex", "Shepherd");
rex.speak();
// "Rex makes a sound"   ← from super.speak()
// "Rex also barks!"     ← from Dog.speak()
```

> [!danger] **`super()` Rules**
> 1. **Must call `super()` in child constructor before `this`** — otherwise ReferenceError
> 2. If child has no constructor, an implicit `constructor(...args) { super(...args); }` is used
> 3. `super.method()` calls parent's method on `this`

### Static Methods Are Inherited Too

```js
class Animal {
  static create(name) {
    return new this(name); // `this` is the class being called
  }
}

class Dog extends Animal {}

const rex = Dog.create("Rex"); // works!
rex instanceof Dog; // true — `this` in create is Dog
```

---

## Mixins — Simulating Multiple Inheritance

JavaScript only supports single inheritance. Mixins add behavior from multiple sources.

```js
const Serializable = (Base) => class extends Base {
  serialize() {
    return JSON.stringify(this);
  }

  static deserialize(json) {
    return Object.assign(new this(), JSON.parse(json));
  }
};

const Validatable = (Base) => class extends Base {
  validate() {
    for (const [key, value] of Object.entries(this)) {
      if (value == null) throw new Error(`${key} is required`);
    }
    return true;
  }
};

// Apply mixins
class User extends Serializable(Validatable(Object)) {
  constructor(name, email) {
    super();
    this.name = name;
    this.email = email;
  }
}

const alice = new User("Alice", "alice@example.com");
alice.validate();       // true
alice.serialize();      // '{"name":"Alice","email":"alice@example.com"}'
```

---

## Abstract Class Pattern

JavaScript doesn't have `abstract` keyword, but you can simulate it:

```js
class Shape {
  constructor() {
    if (new.target === Shape) {
      throw new Error("Shape is abstract — cannot be instantiated directly");
    }
  }

  // "Abstract" method — must be implemented by subclasses
  area() {
    throw new Error("area() must be implemented by subclass");
  }

  // Concrete method — shared by all subclasses
  describe() {
    return `This shape has an area of ${this.area().toFixed(2)}`;
  }
}

class Circle extends Shape {
  #radius;
  constructor(radius) {
    super();
    this.#radius = radius;
  }

  area() {
    return Math.PI * this.#radius ** 2;
  }
}

const c = new Circle(5);
c.describe(); // "This shape has an area of 78.54"

new Shape(); // ❌ Error: Shape is abstract
```

---

## `instanceof` and `Symbol.hasInstance`

```js
class EvenNumber {
  static [Symbol.hasInstance](value) {
    return typeof value === "number" && value % 2 === 0;
  }
}

4 instanceof EvenNumber;   // true
3 instanceof EvenNumber;   // false
"4" instanceof EvenNumber; // false
```

---

## Class Fields Summary Table

| Feature | Syntax | Where | Shared? |
|---|---|---|---|
| Instance method | `greet() {}` | Prototype | ✅ Yes |
| Public field | `name = "default"` | Instance | ❌ No (own) |
| Private field | `#secret = 42` | Instance | ❌ No (own) |
| Private method | `#validate() {}` | Instance/Prototype* | ❌ No |
| Static method | `static create() {}` | Class | N/A |
| Static field | `static count = 0` | Class | N/A |
| Getter/Setter | `get name() {}` | Prototype | ✅ Yes |

*Private methods are technically specification-level constructs

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`this` in extracted methods** — `const fn = obj.method; fn()` loses `this`. Use arrow fields or `.bind()`.
> 2. **No `super()` before `this`** — In a child constructor, `this` is not available until `super()` is called.
> 3. **Classes are NOT hoisted** — Unlike function declarations, you can't use a class before its definition.
> 4. **Private fields are per-class** — Parent can't access child's `#fields` and vice versa, even with inheritance.
> 5. **Arrow function fields** — `method = () => {}` creates per-instance functions (more memory, but preserves `this`).
> 6. **`typeof` a class** — Returns `"function"`, because classes ARE functions under the hood.

---

## Related Topics

- [[04 - Constructor Functions]] — What classes compile to
- [[03 - Prototypes and the Prototype Chain]] — The engine behind class inheritance
- [[02 - The this Keyword]] — `this` in class methods and arrow field methods
- [[06 - OOP Principles in JavaScript]] — Design principles for class-based code

---

**Navigation:**
← [[04 - Constructor Functions]] | [[01 - Phase 4 - Overview]] | [[06 - OOP Principles in JavaScript]] →
