# core::ops::range::RangeIterator
Source: https://docs.starknet.io/build/corelib/core-ops-range-RangeIterator



Represents an iterator located at `cur`, whose end is `end` (`cur < end`).

```rust theme={null}
struct RangeIterator<T> {
    cur: T,
    end: T,
}
```


