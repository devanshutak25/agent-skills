# Decorators

Stage 3 (TC39) decorators in TypeScript 5.0+. Requires no experimental flags.

## Class Decorators

```typescript
type ClassDecorator = <T extends new (...args: any[]) => any>(
  target: T,
  context: ClassDecoratorContext
) => T | void;

function sealed(target: Function, context: ClassDecoratorContext) {
  Object.seal(target);
  Object.seal(target.prototype);
}

function logged(target: new (...args: any[]) => any, context: ClassDecoratorContext) {
  console.log(`Class ${context.name} defined`);
}

@sealed
@logged
class UserService {
  // ...
}
```

## Method Decorators

```typescript
type MethodDecorator = <T extends (...args: any[]) => any>(
  target: T,
  context: ClassMethodDecoratorContext
) => T | void;

function log(target: Function, context: ClassMethodDecoratorContext) {
  const name = String(context.name);
  return function (this: any, ...args: any[]) {
    console.log(`Calling ${name}`, args);
    const result = target.apply(this, args);
    console.log(`${name} returned`, result);
    return result;
  };
}

class Calculator {
  @log
  add(a: number, b: number) { return a + b; }
}
```

## Accessor Decorators

```typescript
function clamp(min: number, max: number) {
  return function (target: ClassAccessorDecoratorTarget<any, number>, context: ClassAccessorDecoratorContext) {
    return {
      set(value: number) {
        target.set.call(this, Math.min(max, Math.max(min, value)));
      },
      get() {
        return target.get.call(this);
      },
    } satisfies ClassAccessorDecoratorResult<any, number>;
  };
}

class Slider {
  @clamp(0, 100)
  accessor value = 50;
}
```

## Field Decorators

```typescript
function defaultValue<T>(value: T) {
  return function (_target: undefined, context: ClassFieldDecoratorContext) {
    return function (initialValue: T) {
      return initialValue ?? value;
    };
  };
}

class Settings {
  @defaultValue("en")
  language!: string;

  @defaultValue(10)
  pageSize!: number;
}
```

## Decorator Metadata (TS 5.2+)

```typescript
const VALIDATORS = Symbol("validators");

function validate(fn: (value: any) => boolean) {
  return function (_target: any, context: ClassFieldDecoratorContext) {
    context.metadata[VALIDATORS] ??= {};
    (context.metadata[VALIDATORS] as any)[context.name] = fn;
  };
}

class FormData {
  @validate((v) => typeof v === "string" && v.length > 0)
  name: string = "";

  @validate((v) => typeof v === "number" && v > 0)
  age: number = 0;
}

// Access metadata
const validators = FormData[Symbol.metadata]?.[VALIDATORS];
```

## Decorator Factories

```typescript
// Parameterized decorator
function retry(attempts: number, delay: number) {
  return function (target: Function, context: ClassMethodDecoratorContext) {
    return async function (this: any, ...args: any[]) {
      for (let i = 0; i < attempts; i++) {
        try { return await target.apply(this, args); }
        catch (e) {
          if (i === attempts - 1) throw e;
          await new Promise(r => setTimeout(r, delay));
        }
      }
    };
  };
}

class ApiClient {
  @retry(3, 1000)
  async fetchData(url: string) { /* ... */ }
}
```

## Composition

```typescript
// Decorators apply bottom-up (innermost first)
class Service {
  @log       // Applied second (wraps retry)
  @retry(3, 1000)  // Applied first
  async fetch(url: string) { /* ... */ }
}
```

## Legacy vs Stage 3

| Feature | Legacy (`experimentalDecorators`) | Stage 3 (TS 5.0+) |
|---------|-----------------------------------|--------------------|
| Flag needed | `experimentalDecorators: true` | None |
| Parameter decorators | Yes | No |
| Metadata | `reflect-metadata` | Built-in `Symbol.metadata` |
| Accessor keyword | No | `accessor` keyword |
| Context object | No | Yes |
| Recommendation | Legacy projects only | **Use for new code** |
