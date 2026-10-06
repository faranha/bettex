# core::ops::range::RangeInclusiveIterator
Source: https://docs.starknet.io/build/corelib/core-ops-range-RangeInclusiveIterator



## Signature

```rust theme={null}

#[derive(Clone, Drop)]
pub struct RangeInclusiveIterator {
    pub(crate) cur: T,
    pub(crate) end: T,
    pub(crate) exhausted: bool,
}
```


