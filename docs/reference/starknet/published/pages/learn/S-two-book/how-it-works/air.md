> ## Documentation Index
> Fetch the complete documentation index at: https://docs.starknet.io/llms.txt
> Use this file to discover all available pages before exploring further.

# Introduction

> This section explores the conversion of an AIR to a composition polynomial, covering both the mathematical framework and implementation details. We examine how multiple components with their respective constraints are combined into a single polynomial.

This section is organized as follows:

* **[Technical Overview](/learn/S-two-book/how-it-works/air/overview)**: Provides a high-level explanation of how multiple components are combined into a composition polynomial.

* **[Components](/learn/S-two-book/how-it-works/air/components)**: Examines the implementation of the `Components` struct and key functions like `mask_points` and `eval_composition_polynomial_at_point`.

* **[Prover Components](/learn/S-two-book/how-it-works/air/prover_components)**: Details the `ComponentProvers` struct and its specialized functions for computing composition polynomials during the proving process, including the main `compute_composition_polynomial` function.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.