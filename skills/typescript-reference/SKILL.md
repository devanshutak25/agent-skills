---
name: typescript-reference
description: Comprehensive TypeScript 5.4–5.9 reference — type system, configuration, ecosystem libraries, patterns, runtimes, templates. Auto-triggers when working on TypeScript code.
trigger: When the user is working with TypeScript, tsconfig, or TypeScript-heavy projects
---

# TypeScript Reference Skill

Comprehensive, up-to-date TypeScript development reference covering the type system, compiler configuration, ecosystem libraries, design patterns, and runtime environments. Split into focused files for targeted loading.

## File Index

### Core (`core/`)
| File | Contents |
|------|----------|
| [utility-types.md](core/utility-types.md) | Built-in utility types: Partial, Pick, Omit, Record, Awaited, NoInfer, etc. |
| [conditional-mapped-types.md](core/conditional-mapped-types.md) | Conditional types, infer, mapped types, key remapping, template literals |
| [generics.md](core/generics.md) | Generic functions/classes, constraints, const type params, defaults |
| [type-guards-narrowing.md](core/type-guards-narrowing.md) | Type predicates, narrowing, discriminated unions, exhaustiveness, TS 5.5 inferred predicates |
| [decorators.md](core/decorators.md) | Stage 3 decorators: class, method, accessor, field, metadata |
| [satisfies-const.md](core/satisfies-const.md) | satisfies operator, as const, as const satisfies |
| [using-disposable.md](core/using-disposable.md) | using/await using, Disposable, AsyncDisposable, DisposableStack |
| [module-system.md](core/module-system.md) | ESM/CJS interop, verbatimModuleSyntax, declaration merging, module augmentation |
| [enums-unions.md](core/enums-unions.md) | Enums vs union types, const enums, when to use which |
| [declaration-files.md](core/declaration-files.md) | .d.ts authoring, declare module, @types/*, triple-slash directives |

### Config (`config/`)
| File | Contents |
|------|----------|
| [tsconfig.md](config/tsconfig.md) | All critical compiler options, @tsconfig/bases presets |
| [project-setup.md](config/project-setup.md) | Setup recipes: library, app, monorepo, dual CJS/ESM, JS-to-TS migration |

### Libraries (`libraries/`)
| File | Contents |
|------|----------|
| [validation.md](libraries/validation.md) | Zod, Valibot, ArkType, TypeBox, Standard Schema — decision matrix |
| [orms-database.md](libraries/orms-database.md) | Prisma, Drizzle, Kysely — type-safe queries, decision matrix |
| [api-frameworks.md](libraries/api-frameworks.md) | tRPC, Hono, Elysia — end-to-end type safety |
| [testing.md](libraries/testing.md) | Vitest, Jest — typed mocks, expectTypeOf, @ts-expect-error |
| [build-tools.md](libraries/build-tools.md) | tsup, tsx, esbuild, SWC, tsc — decision matrix |
| [monorepo-tools.md](libraries/monorepo-tools.md) | Turborepo, Nx — project references, shared types |
| [type-utilities.md](libraries/type-utilities.md) | ts-pattern, type-fest, ts-reset |

### Patterns (`patterns/`)
| File | Contents |
|------|----------|
| [branded-types.md](patterns/branded-types.md) | Branded/nominal types, opaque types, type-safe IDs |
| [result-pattern.md](patterns/result-pattern.md) | Result/Either, neverthrow, type-safe error handling |
| [builder-pattern.md](patterns/builder-pattern.md) | Type-safe builder with progressive type narrowing |
| [advanced-types.md](patterns/advanced-types.md) | Recursive types, deep paths, variadic tuples, HKTs |
| [type-safe-events.md](patterns/type-safe-events.md) | Typed EventEmitter, pub/sub, typed messages |
| [inference-patterns.md](patterns/inference-patterns.md) | Maximizing inference: satisfies, const generics, NoInfer, overloads |

### Runtimes (`runtimes/`)
| File | Contents |
|------|----------|
| [runtimes.md](runtimes/runtimes.md) | Node.js native TS, Deno, Bun, tsx — feature matrix |

### Templates (`templates/`)
| File | Contents |
|------|----------|
| [starter-configs.md](templates/starter-configs.md) | tsconfig presets for library/app/monorepo/migration + @tsconfig/bases |

## Usage

When assisting with TypeScript development:
1. Load relevant file(s) based on the task domain
2. Follow patterns and conventions documented here
3. Recommend libraries from the ecosystem files when applicable
4. Reference specific type signatures from core files
5. For React-specific TypeScript patterns, see [react-reference](../react-reference/SKILL.md)
6. For Next.js-specific TypeScript patterns, see [nextjs-reference](../nextjs-reference/SKILL.md)

## Version Info
- TypeScript: 5.4–5.9
- Last updated: 2026-03
