# core::starknet::storage::StoragePointer
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-StoragePointer



A pointer to an address in storage, can be used to read and write values, if the generic type
supports it (e.g. basic types like `felt252`).

## Signature

```rust theme={null}
pub struct StoragePointer {
    pub __storage_pointer_address__: StorageBaseAddress,
    pub __storage_pointer_offset__: u8,
}
```

## Members

### **storage\_pointer\_address**

#### Signature

```rust theme={null}
pub __storage_pointer_address__: StorageBaseAddress
```

### **storage\_pointer\_offset**

#### Signature

```rust theme={null}
pub __storage_pointer_offset__: u8
```


