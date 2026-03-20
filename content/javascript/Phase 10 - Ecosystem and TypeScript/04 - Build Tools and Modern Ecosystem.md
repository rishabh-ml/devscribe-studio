---
title: Build Tools and Modern Ecosystem
phase: 10
topic: Build Tools and Modern Ecosystem
tags: [javascript, vite, webpack, pnpm, npm, babel, swc, eslint, biome, bun, deno, bundler]
created: 2025-01-15
---

# Build Tools and Modern Ecosystem

> [!info] **Big Picture**
> The JavaScript ecosystem includes package managers (to install dependencies), bundlers (to package code for browsers), transpilers (to convert modern syntax to older JS), and linters/formatters (to enforce code quality). The 2025 landscape has consolidated around **Vite** for building, **pnpm** for package management, and **ESLint/Biome** for linting.

---

## Package Managers

### Comparison

| Feature | **pnpm** | **npm** | **Yarn Berry (v4)** | **Bun** |
|---------|----------|---------|---------------------|---------|
| Speed | ⚡ Fastest | Baseline | Fast | ⚡⚡ Fastest |
| Disk usage | Low (linked) | High (copied) | Medium | Low |
| Strictness | Strict | Loose | Strict (PnP) | Loose |
| Lockfile | `pnpm-lock.yaml` | `package-lock.json` | `yarn.lock` | `bun.lockb` |
| Recommendation | **2025 pick** | Default, always works | Feature-rich | All-in-one runtime |

### pnpm (Recommended)

```bash
# Install globally
npm install -g pnpm

# Common commands (same as npm)
pnpm install            # install all dependencies
pnpm add express        # add dependency
pnpm add -D vitest      # add dev dependency
pnpm remove lodash      # remove package
pnpm run build          # run script
pnpm dlx create-vite    # like npx
```

**Why pnpm?**
- **Content-addressable storage** — packages stored once globally, hard-linked into projects
- **Strict node_modules** — prevents accessing undeclared dependencies (catches bugs)
- **Faster** than npm, especially for monorepos

### npm (Default)

```bash
npm install             # install dependencies
npm ci                  # clean install from lockfile (CI/CD)
npm audit               # security audit
npm audit fix           # auto-fix vulnerabilities
npm run build           # run script
npx create-vite app     # run without installing
```

---

## Bundlers

### Vite (Dominant in 2025)

Uses **esbuild** for blazing-fast dev server, **Rollup** for production builds.

```bash
# Create a new project
npm create vite@latest my-app -- --template vanilla
npm create vite@latest my-app -- --template react-ts
npm create vite@latest my-app -- --template vue

cd my-app
npm install
npm run dev    # start dev server
npm run build  # produce production build
npm run preview # preview production build
```

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"]
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": "/src"
    }
  }
});
```

**Why Vite?**
- **Dev server** — No bundling in dev, uses native ESM → instant startup
- **HMR** — Hot Module Replacement in milliseconds
- **Production** — Optimized Rollup builds with tree shaking
- **Zero config** — Works with TS, JSX, CSS Modules, WASM out of the box

### Webpack (Legacy but Widespread)

```js
// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js"
  },
  module: {
    rules: [
      { test: /\.jsx?$/, use: "babel-loader", exclude: /node_modules/ },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      { test: /\.(png|jpg)$/, type: "asset/resource" }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./src/index.html" })
  ],
  devServer: {
    port: 3000,
    hot: true
  }
};
```

### Other Bundlers

| Bundler | Notes |
|---------|-------|
| **Rollup** | Used by Vite for production builds. Great for libraries |
| **esbuild** | Extremely fast (Go-based). Used by Vite for dev server |
| **Turbopack** | Rust-based, by Vercel. Built into Next.js |
| **Rspack** | Webpack-compatible Rust alternative. Growing enterprise adoption |

---

## Transpilers

Convert modern JavaScript/TypeScript to older versions for browser compatibility.

### Babel

```bash
npm install -D @babel/core @babel/preset-env @babel/cli
```

```json
// babel.config.json
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "> 0.25%, not dead",
      "useBuiltIns": "usage",
      "corejs": 3
    }]
  ]
}
```

```bash
npx babel src --out-dir dist
```

### SWC (Faster Alternative)

Rust-based transpiler — used by Next.js. **20x faster than Babel**.

```bash
npm install -D @swc/core @swc/cli
```

```json
// .swcrc
{
  "jsc": {
    "parser": { "syntax": "ecmascript", "jsx": true },
    "target": "es2020"
  }
}
```

### TypeScript Compiler (`tsc`)

```bash
npx tsc --init   # generate tsconfig.json
npx tsc          # compile TypeScript
npx tsc --noEmit # type-check only (no output)
```

---

## Linters and Formatters

### ESLint (Standard)

```bash
npm init @eslint/config@latest
```

```js
// eslint.config.js (flat config — the new default)
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
      "eqeqeq": "error",
      "prefer-const": "error"
    }
  },
  {
    ignores: ["dist/", "node_modules/"]
  }
];
```

```bash
npx eslint .           # lint all files
npx eslint --fix .     # auto-fix
```

### Biome (Emerging Alternative)

Rust-based. **25x faster than Prettier, 15x faster than ESLint.** Linter + formatter in one.

```bash
npx @biomejs/biome init
npx @biomejs/biome check .        # lint + format check
npx @biomejs/biome check --write . # auto-fix
```

```json
// biome.json
{
  "formatter": { "indentStyle": "space", "indentWidth": 2 },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  }
}
```

### Prettier (Formatting)

```bash
npm install -D prettier
npx prettier --write .
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Linting Stack Comparison

| Approach | Tools | Speed | Config |
|----------|-------|-------|--------|
| **Traditional** | ESLint + Prettier | Moderate | 2 configs |
| **Modern** | Biome (all-in-one) | ⚡ Very fast | 1 config |
| **Minimal** | ESLint only (with style rules) | Moderate | 1 config |

---

## Alternative Runtimes

### Bun

All-in-one: runtime + package manager + bundler + test runner.

```bash
# Install
curl -fsSL https://bun.sh/install | bash

# Run
bun run app.ts        # native TS support
bun install           # package manager (fastest)
bun test              # test runner
bun build ./app.ts    # bundler
```

### Deno 2

Security-first runtime. Native TypeScript, npm-compatible (since Deno 2).

```bash
# Install
curl -fsSL https://deno.land/install.sh | sh

# Run (no package.json needed)
deno run app.ts

# Permissions model
deno run --allow-net --allow-read app.ts

# Import from URL
import { serve } from "https://deno.land/std/http/server.ts";
```

---

## Browserslist

Define target browsers for build tools:

```
# .browserslistrc
> 0.5%
last 2 versions
not dead
not op_mini all
```

```json
// Or in package.json
{
  "browserslist": ["> 0.5%", "last 2 versions", "not dead"]
}
```

Used by: Babel, PostCSS, Autoprefixer, ESLint, Lightning CSS.

---

## Typical Project Setup (2025)

```bash
# Create project
npm create vite@latest my-app -- --template react-ts
cd my-app

# Use pnpm
pnpm install

# Add linting
pnpm add -D eslint @eslint/js
# or Biome
pnpm add -D --save-exact @biomejs/biome

# Add testing
pnpm add -D vitest @testing-library/react

# Project structure
my-app/
├── src/
│   ├── components/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js    # or biome.json
└── vitest.config.ts
```

---

## Common Gotchas

> [!danger] **Watch Out**
> 1. **Don't commit `node_modules`** — Always `.gitignore` it. Commit lockfiles instead.
> 2. **`"type": "module"`** — Required in `package.json` for ESM. Without it, `.js` files are treated as CommonJS.
> 3. **Vite dev ≠ Vite build** — Dev uses native ESM (no bundling), build uses Rollup. Test the production build.
> 4. **Babel is often unnecessary** — If targeting modern browsers (ES2020+), you likely don't need Babel. SWC or esbuild handle rare needs.
> 5. **`npm audit` false positives** — Many audit warnings are for dev dependencies or don't apply to your usage. Use `npm audit --production` for relevant results.

---

## Related Topics

- [[02 - ES Modules]] — Import/export syntax
- [[03 - Node.js Fundamentals]] — npm, package.json
- [[02 - TypeScript Fundamentals]] — TS compilation and config
- [[05 - Memory Management and Performance]] — Tree shaking, code splitting

---

**Navigation:**
← [[03 - Node.js Fundamentals]] | [[05 - Security]] →
