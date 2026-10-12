---
name: Lottery entry economics
description: Free numbers for staked wallets, purchased additional entries, and burning all entry payments.
---

No Pitch, Burn Lottery e Double 2X devem ser apresentados como recursos adicionais: o primeiro para queima de BETTEX e o segundo para movimentação de rendimentos já recebidos, sem transformar a plataforma em cassino. Explicitar o esquema de queima.

**Why:** O criador pediu esse posicionamento ao mostrar os dois cartões do Pitch e destacou que é importante mencionar o esquema de queima.

**How to apply:** Manter esses recursos separados do núcleo de inteligência central, agentes e staking. Distinguir a queima direta dos pagamentos da loteria da recompra e queima com lucro elegível. Preservar as regras reais e riscos, sem ocultar a possibilidade de perder o valor jogado no Double 2X.

Each wallet with staked BETTEX gets one free lottery number. Additional numbers or entries can be purchased, and are generated once bought. All money paid in the lottery is burned.

Extra entries are paid in BETTEX, not USDC. Burn all BETTEX paid directly, without an AMM purchase. “There is no limit of numbers”: quantity starts at 1 with no per-order or per-draw business cap. Never display a capped counter such as “0/1000”.

**Why:** The creator corrected the payment rule: “this is in BETTEX, people pay in BETTEX and all sold is burnt, and it is 1 to infinite”, and repeated “there is no limit of numbers” when showing the old capped counter.

Lottery payments keep the existing BETTEX exit rule: reduce the BETTEX wallet balance and cancel all current-round unpaid staking earnings/weight, including the remaining balance's prior weight. Already received USDC is not clawed back.

**Why:** The creator chose “Keep the existing exit rule” after being told the effects of burning from the staking-linked BETTEX wallet.

**How to apply:** Warn before confirmation; do not claim purchases preserve staking entitlements. No arbitrary order/draw caps; large ticket quantities must not require allocating an object per number.

Use “Burn Lottery”, not “Daily draw”, as the lottery-card heading.

**Why:** The creator requested this name.

**How to apply:** Distinguish the free staking entry from purchased additional entries. Generate purchased numbers only after successful payment, show them to the user, and account for all entry payments as burning rather than operating revenue or additional prize funding.

Keep the lottery card compact; detailed personal numbers belong in an overlay opened by “Your numbers”, not a permanently expanded section.

**Why:** The creator said the numbers section was cluttering the screen and increasing the interface height.

**How to apply:** Preserve access to free numbers, purchased numbers, receipts and extra-number purchases without expanding the main card.
