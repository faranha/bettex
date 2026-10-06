# core::traits::Not
Source: https://docs.starknet.io/build/corelib/core-traits-Not



The unary logical negation operator `!`.

## Signature

```rust theme={null}
pub trait Not
```

## Examples

An implementation of `Not` for `Answer`, which enables the use of `!` to
invert its value.

```rust theme={null}
#[derive(Drop, PartialEq)]
enum Answer {
    Yes,
    No,
}

impl AnswerNot of Not {
    fn not(a: Answer) -> Answer {
        match a {
            Answer::Yes => Answer::No,
            Answer::No => Answer::Yes,
        }
    }
}

assert!(!Answer::Yes == Answer::No);
assert!(!Answer::No == Answer::Yes);
```

## Trait functions

### not

Performs the unary `!` operation.

#### Signature

```rust theme={null}
fn not(a: T) -> T
```

#### Examples

```rust theme={null}
assert!(!true == false);
assert!(!false == true);
```


