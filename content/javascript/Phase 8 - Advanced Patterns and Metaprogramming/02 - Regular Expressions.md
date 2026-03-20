---
title: Regular Expressions
phase: 8
topic: Regular Expressions
tags: [javascript, regex, regexp, pattern-matching, flags, groups, lookahead, lookbehind]
created: 2025-01-15
---

# Regular Expressions

> [!info] **Big Picture**
> Regular expressions (regex) are patterns used to match, search, extract, and replace text. They're essential for form validation, data parsing, text processing, and string manipulation. JavaScript provides both literal syntax (`/pattern/flags`) and the `RegExp` constructor.

---

## Creating Regular Expressions

```js
// Literal syntax (preferred when pattern is known)
const regex = /hello/i;

// Constructor (when pattern is dynamic)
const regex = new RegExp("hello", "i");
const userInput = "search term";
const dynamic = new RegExp(userInput, "gi");

// ES2025: RegExp.escape() for safe dynamic patterns
const escaped = new RegExp(RegExp.escape("$10.00"), "g");
```

---

## Flags

| Flag | Name | Effect |
|------|------|--------|
| `g` | Global | Find ALL matches, not just the first |
| `i` | Case-insensitive | `A` matches `a` |
| `m` | Multiline | `^` / `$` match start/end of each line |
| `s` | DotAll (ES2018) | `.` matches newline characters too |
| `u` | Unicode | Correct Unicode handling, enables `\p{}` |
| `v` | UnicodeSets (ES2024) | Extends `u` with set operations in character classes |
| `y` | Sticky | Match only at `lastIndex` position |
| `d` | HasIndices (ES2022) | Include start/end indices for matches |

```js
// Combine flags
/pattern/gims

// Check flags on a regex
/hello/gi.flags; // "gi"
```

---

## Essential Methods

### String Methods with Regex

```js
const str = "Hello World Hello";

// .match() — returns matches
str.match(/hello/i);     // ["Hello"] (first match)
str.match(/hello/gi);    // ["Hello", "Hello"] (all matches)

// .matchAll() — returns iterator of detailed matches (ES2020)
for (const m of str.matchAll(/hello/gi)) {
  console.log(m[0], m.index); // "Hello" 0, "Hello" 12
}

// .search() — returns index of first match (-1 if none)
str.search(/world/i);    // 6

// .replace() — replace first match
str.replace(/hello/i, "Hi"); // "Hi World Hello"

// .replaceAll() — replace all matches (ES2021)
str.replaceAll(/hello/gi, "Hi"); // "Hi World Hi"

// .split() — split by regex
"one1two2three".split(/\d/); // ["one", "two", "three"]
```

### RegExp Methods

```js
const regex = /hello/i;

// .test() — returns boolean
regex.test("Hello World"); // true

// .exec() — returns detailed match (or null)
const result = /(\w+)\s(\w+)/.exec("Hello World");
result[0]; // "Hello World" (full match)
result[1]; // "Hello" (group 1)
result[2]; // "World" (group 2)
result.index; // 0

// With /g flag, .exec() iterates through matches
const re = /\d+/g;
re.exec("a1b2c3"); // ["1"], lastIndex = 2
re.exec("a1b2c3"); // ["2"], lastIndex = 4
re.exec("a1b2c3"); // ["3"], lastIndex = 6
re.exec("a1b2c3"); // null, lastIndex = 0
```

---

## Character Classes

| Pattern | Matches | Example |
|---------|---------|---------|
| `.` | Any character (except newline without `s` flag) | `/h.t/` → "hat", "hot" |
| `\d` | Digit `[0-9]` | `/\d+/` → "42" |
| `\D` | Non-digit `[^0-9]` | `/\D+/` → "abc" |
| `\w` | Word char `[A-Za-z0-9_]` | `/\w+/` → "hello_1" |
| `\W` | Non-word char | `/\W/` → "@" |
| `\s` | Whitespace (space, tab, newline) | `/\s+/` |
| `\S` | Non-whitespace | `/\S+/` |
| `\b` | Word boundary | `/\bcat\b/` → "cat" but not "catch" |
| `\B` | Non-word boundary | `/\Bcat/` → "catch" but not "cat" |

### Custom Character Classes

```js
// [abc]  — matches a, b, or c
/[aeiou]/.test("hello"); // true (matches 'e')

// [a-z]  — range
/[a-zA-Z0-9]/ // alphanumeric

// [^abc] — negation (NOT a, b, or c)
/[^0-9]/ // non-digit

// Escaping inside [ ]
/[.\-()]/ // literal dot, hyphen, parens
```

### Unicode Property Escapes (ES2018, requires `u` or `v` flag)

```js
// Match Unicode categories
/\p{Letter}/u.test("ñ");       // true
/\p{Number}/u.test("①");       // true
/\p{Emoji}/u.test("🎉");       // true and also...
/\p{Script=Greek}/u.test("Ω"); // true

// Negate with \P
/\P{Letter}/u.test("5"); // true (not a letter)

// ES2024 v flag — set operations
/[\p{Emoji}--\p{ASCII}]/v // emoji minus ASCII
/[\p{Letter}&&\p{Script=Latin}]/v // Latin letters only
```

---

## Quantifiers

| Quantifier | Meaning |
|-----------|---------|
| `*` | 0 or more |
| `+` | 1 or more |
| `?` | 0 or 1 (optional) |
| `{n}` | Exactly n |
| `{n,}` | n or more |
| `{n,m}` | Between n and m |

```js
/colou?r/.test("color");  // true (u is optional)
/colou?r/.test("colour"); // true

/\d{3}-\d{4}/.test("555-1234"); // true

/a{2,4}/.exec("aaaaaa"); // ["aaaa"] (greedy: takes max)
```

### Greedy vs Lazy

```js
// Greedy (default) — matches as MUCH as possible
/<.+>/.exec("<b>bold</b>"); // ["<b>bold</b>"]

// Lazy (add ?) — matches as LITTLE as possible
/<.+?>/.exec("<b>bold</b>"); // ["<b>"]

// Lazy versions: *?, +?, ??, {n,m}?
```

---

## Anchors and Boundaries

| Anchor | Matches |
|--------|---------|
| `^` | Start of string (or line with `m` flag) |
| `$` | End of string (or line with `m` flag) |
| `\b` | Word boundary |
| `\B` | Non-word boundary |

```js
/^hello$/.test("hello"); // true (exact match)
/^hello$/.test("hello world"); // false

// Multiline
const text = "line 1\nline 2\nline 3";
text.match(/^line \d$/gm); // ["line 1", "line 2", "line 3"]
```

---

## Groups

### Capturing Groups `( )`

```js
const match = /(\d{4})-(\d{2})-(\d{2})/.exec("2024-03-15");
match[0]; // "2024-03-15" (full match)
match[1]; // "2024" (year)
match[2]; // "03"   (month)
match[3]; // "15"   (day)
```

### Named Capture Groups (ES2018) `(?<name> )`

```js
const match = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/.exec("2024-03-15");
match.groups.year;  // "2024"
match.groups.month; // "03"
match.groups.day;   // "15"

// In replace — use $<name>
"2024-03-15".replace(
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/,
  "$<month>/$<day>/$<year>"
); // "03/15/2024"
```

### ES2025: Duplicate Named Capture Groups

```js
// Same name across alternations
const dateRegex = /(?<year>\d{4})-(?<month>\d{2})|(?<month>\d{2})\/(?<year>\d{4})/;
"2024-03".match(dateRegex).groups;  // { year: "2024", month: "03" }
"03/2024".match(dateRegex).groups;  // { year: "2024", month: "03" }
```

### Non-Capturing Groups `(?: )`

Group without capturing — better performance when you don't need the group value.

```js
/(?:https?:\/\/)?www\.example\.com/
// Groups http:// or https:// but doesn't capture it
```

### Backreferences

Refer to a previously captured group within the same regex.

```js
// \1 refers to first captured group
/(\w+)\s\1/.test("hello hello"); // true (word repeated)
/(\w+)\s\1/.test("hello world"); // false

// Named backreference  \k<name>
/(?<word>\w+)\s\k<word>/.test("hello hello"); // true
```

---

## Alternation

```js
// pipe | means OR
/cat|dog/.test("I have a cat"); // true
/cat|dog/.test("I have a dog"); // true

// Group to limit scope
/I have a (cat|dog|bird)/
```

---

## Lookahead and Lookbehind

Zero-width assertions — they check without consuming characters.

| Syntax | Name | Meaning |
|--------|------|---------|
| `(?=...)` | Positive lookahead | Followed by ... |
| `(?!...)` | Negative lookahead | NOT followed by ... |
| `(?<=...)` | Positive lookbehind (ES2018) | Preceded by ... |
| `(?<!...)` | Negative lookbehind (ES2018) | NOT preceded by ... |

```js
// Passwords: at least one digit followed by the rest
/(?=.*\d)(?=.*[A-Z]).{8,}/.test("Hello123"); // true

// Match price but not the $ sign
"$100".match(/(?<=\$)\d+/); // ["100"]

// Match digits NOT preceded by $
"100 $200".match(/(?<!\$)\b\d+/g); // ["100"]

// Match word NOT followed by specific word
/foo(?!bar)/.test("foobaz"); // true
/foo(?!bar)/.test("foobar"); // false
```

---

## ES2022: Match Indices (`d` flag)

```js
const match = /(?<year>\d{4})-(?<month>\d{2})/.exec("Date: 2024-03");
// Without /d:  match.indices is undefined

const match2 = /(?<year>\d{4})-(?<month>\d{2})/d.exec("Date: 2024-03");
match2.indices[0];            // [6, 13] (full match position)
match2.indices[1];            // [6, 10] (year group)
match2.indices.groups.year;   // [6, 10]
match2.indices.groups.month;  // [11, 13]
```

---

## ES2025: Pattern Modifiers (Inline Flags)

```js
// Enable/disable flags for part of the regex
/(?i:hello) world/;
// "hello" is case-insensitive, "world" is case-sensitive

/(?i:hello)(?-i: WORLD)/;
// Explicitly toggle flags on and off
```

---

## Replace Patterns

### Special Replacement Patterns

```js
const str = "John Smith";

// $1, $2 — captured groups
str.replace(/(\w+) (\w+)/, "$2, $1"); // "Smith, John"

// $& — full match
"hello".replace(/\w+/, "[$&]"); // "[hello]"

// $` — text before match
// $' — text after match
// $$ — literal $

// Function replacement
"hello world".replace(/\w+/g, word =>
  word[0].toUpperCase() + word.slice(1)
); // "Hello World"

// Function with groups
"2024-03-15".replace(
  /(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})/,
  (match, y, m, d, offset, string, groups) => {
    return `${groups.m}/${groups.d}/${groups.y}`;
  }
); // "03/15/2024"
```

---

## Practical Recipes

### Email Validation (Basic)

```js
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
emailRegex.test("user@example.com"); // true
```

### URL Parsing

```js
const urlRegex = /^(?<protocol>https?):\/\/(?<host>[^\/\s]+)(?<path>\/[^\s]*)?$/;
const match = urlRegex.exec("https://example.com/path/page");
match.groups.protocol; // "https"
match.groups.host;     // "example.com"
match.groups.path;     // "/path/page"
```

### Phone Number (US)

```js
const phoneRegex = /^(?:\+?1[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/;
phoneRegex.test("(555) 123-4567"); // true
phoneRegex.test("+1-555-123-4567"); // true
phoneRegex.test("5551234567");       // true
```

### Password Strength

```js
// At least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
strongPassword.test("Hello123!"); // true
```

### Extract All Numbers

```js
"Price: $12.50, Qty: 3, Total: $37.50".match(/\d+\.?\d*/g);
// ["12.50", "3", "37.50"]
```

### HTML Tag Stripping

```js
const html = "<p>Hello <b>World</b></p>";
html.replace(/<[^>]+>/g, ""); // "Hello World"
```

### Slug Generator

```js
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")     // remove non-word chars
    .replace(/\s+/g, "-")         // spaces to hyphens
    .replace(/-+/g, "-")          // collapse multiple hyphens
    .replace(/^-|-$/g, "");       // trim hyphens
}

slugify("Hello World! How's it going?"); // "hello-world-hows-it-going"
```

### CSV Line Parser (Simple)

```js
const csvLine = '"John","Doe",30,"New York"';
const fields = csvLine.match(/("(?:[^"]|"")*"|[^,]*)/g);
// ['"John"', '"Doe"', '30', '"New York"']
```

### Balanced Matching / Nested Patterns (Limitation)

> [!warning] **JavaScript regex cannot match arbitrarily nested structures** like balanced parentheses. For complex parsing (HTML, JSON, code), use a proper parser instead of regex.

---

## Performance Tips

> [!tip] **Regex Performance**
> 1. **Cache regex objects** — Don't create `new RegExp()` inside loops.
> 2. **Be specific** — `/\d{3}/` is faster than `/\d+/` when you know the length.
> 3. **Avoid catastrophic backtracking** — Nested quantifiers like `(a+)+` on non-matching input can freeze execution.
> 4. **Use atomic groups (via possessive quantifiers)** — Not natively supported in JS; be cautious with greedy patterns on long strings.
> 5. **Use non-capturing groups** when you don't need the capture.

### Catastrophic Backtracking Example

```js
// DANGEROUS — exponential backtracking on non-match
const bad = /^(a+)+$/;
bad.test("aaaaaaaaaaaaaaaaaaaaaaaab"); // Takes VERY long!

// SAFE — rewrite with a single quantifier
const good = /^a+$/;
good.test("aaaaaaaaaaaaaaaaaaaaaaaab"); // Instant: false
```

---

## Quick Reference Card

```
/pattern/flags

[abc]  — character class       [^abc] — negated class
\d \w \s — digit/word/space    \D \W \S — negated
.     — any character          \.  — literal dot
^     — start of string        $   — end of string
\b    — word boundary          \B  — non-word boundary

*     — 0+    +  — 1+    ?  — 0 or 1
{n}   — exactly n   {n,m} — between n and m
*? +? ?? — lazy quantifiers

(...)  — capture group         (?:...) — non-capture
(?<name>...) — named group     \1  — backreference
(?=...)  — lookahead            (?!...) — negative lookahead
(?<=...) — lookbehind           (?<!...) — negative lookbehind

|   — alternation (OR)
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **`/g` flag with `.test()` has state** — The regex updates `lastIndex` between calls. Create a new regex or reset `lastIndex = 0`.
> 2. **Forgetting to escape special chars** — `.`, `*`, `+`, `?`, `(`, `)`, `[`, `{`, `\`, `^`, `$`, `|` need escaping with `\`.
> 3. **`.match()` with `/g` loses groups** — Use `.matchAll()` to get groups with global matches.
> 4. **`\b` doesn't work with Unicode** — Word boundaries only work with ASCII word characters.
> 5. **Don't validate everything with regex** — For HTML, JSON, email (RFC-compliant), use proper parsers.

```js
// Gotcha #1: /g flag and .test()
const re = /a/g;
re.test("abc"); // true, lastIndex = 1
re.test("abc"); // false! lastIndex carried over
re.lastIndex = 0; // reset
re.test("abc"); // true again
```

---

## 🎯 Practice Exercises

1. **Email Validator** — Write a regex that validates email addresses (basic: `user@domain.tld`). Test with valid and invalid cases. Then improve it to handle subdomains and `+` aliases.
2. **Password Strength** — Create a regex that requires: 8+ chars, at least one uppercase, one lowercase, one digit, one special char. Use lookaheads.
3. **Parse Log File** — Given log lines like `[2024-01-15 10:30:45] ERROR: Connection refused`, use named capture groups to extract date, time, level, and message.
4. **Find and Replace** — Write a function that converts `camelCase` to `snake_case` using regex: `"firstName"` → `"first_name"`.
5. **URL Parser** — Write a regex that extracts protocol, domain, port, path, and query string from a URL using named groups.

---

## Related Topics

- [[04 - Strings Deep Dive]] — String methods that work with regex
- [[06 - Modern ES Features]] — `matchAll`, `replaceAll`, `v` flag
- [[06 - Metaprogramming]] — Tagged templates for DSLs

---

**Navigation:**
← [[01 - Phase 8 - Overview]] | [[03 - Property Descriptors and Object Configuration]] →
