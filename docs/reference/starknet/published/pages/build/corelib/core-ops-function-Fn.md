# core::ops::function::Fn
Source: https://docs.starknet.io/build/corelib/core-ops-function-Fn



The version of the call operator that takes a by-snapshot receiver.
Instances of `Fn` can be called repeatedly.
`Fn` is implemented automatically by closures whose captured variables are all `Copy`.
Additionally, for any type `F` that implements `Fn`, `@F` implements `Fn`, too.
Since [`FnOnce`](./core-ops-function-FnOnce) is implemented for all implementers  of `Fn`, any instance of `Fn` can be used
as a parameter where a [`FnOnce`](./core-ops-function-FnOnce) is expected.
Use `Fn` as a bound when you want to accept a parameter of function-like type and need to call
it repeatedly. If you do not need such strict requirements, use [`FnOnce`](./core-ops-function-FnOnce) as bounds.

## Signature

```rust theme={null}
pub trait Fn
```

## Examples

## Calling a closure

```rust theme={null}
let square = |x| x * x;
assert_eq!(square(5), 25);
```

## Using a `Fn` parameter

```rust theme={null}
fn call_with_one, +core::ops::Fn[Output: usize]>(func: F) -> usize {
   func(1)
}

let double = |x| x * 2;
assert_eq!(call_with_one(double), 2);
```

## Trait functions

### call

Performs the call operation.

#### Signature

```rust theme={null}
fn call(self: @T, args: Args) -> FnOutput
```

## Trait types

### Output

The returned type after the call operator is used.

#### Signature

```rust theme={null}
type Output;
```


