---
name: Ações contextualizadas da carteira
description: Organização exigida pelo criador para entradas, saídas e conversões de USDC e BETTEX.
---

The earnings wallet is separate from the dollar wallet. It accepts earnings only and has exactly one financial action: transfer USDC to the dollar wallet. It cannot withdraw externally, accept deposits, or convert directly to BETTEX.

**Why:** The creator clarified: “withdrawal of earnings is made to the USD wallet never outside it so the transfer to the usdc wallet alone is enough here.”

**How to apply:** Offer only the internal transfer on earnings, without an external-address field. Reject external earnings withdrawals server-side. External withdrawals remain available from the dollar wallet.

The transaction fee is **2.50 USDC per transaction**, except depositing BETTEX and USDC.

**Why:** The creator requested “2,50 per transaction” and confirmed “2.50 USDC per transaction,” not BRL.

**How to apply:** Display fees before confirmation on transaction pages and enforce them server-side; earnings transfers pay their fee from earnings. Keep historical fees intact and network gas separate.

The earnings wallet must use the full width, show past-round earnings and the current-round projection, provide a history button, and use fire icons with an exciting presentation. Fee copy belongs only on the transactional screen, not this wallet card.

**Why:** The creator requested these presentation details and explicitly said “only show it on the transactional screen.”

**How to apply:** Preserve the distinction between paid historical earnings and non-guaranteed estimates. The history shortcut must open the earnings-filtered statement; keep the single internal-transfer action.

Cada carteira, inclusive a de rendimentos, deve ter seu próprio botão de histórico com ícone para abrir a área de histórico da conta.

**Why:** O criador pediu “dentro de cada carteira inclusive da nova de earnings” um ícone e uma opção de histórico.

**How to apply:** Abrir o histórico filtrado pela carteira correspondente. Histórico é navegação, não uma nova movimentação financeira.

As ações devem ficar visualmente relacionadas ao saldo correspondente, não numa barra genérica separada. USDC: adicionar crédito, sacar dólares para uma carteira cripto e converter em BETTEX. BETTEX: adicionar tokens, transferir para uma carteira e converter em USDC. A conversão precisa estar disponível nos dois sentidos.

As carteiras BETTEX e USDC precisam ter identidades visuais distintas, com cores, fundos e ícones próprios de cada ativo.

**Why:** O criador pediu explicitamente diferenciação de cor, fundo e ícone tanto na carteira BETTEX quanto na USDC.

**How to apply:** Preservar a distinção nos cartões pessoais sem mudar suas ações, valores ou a marca original da BETTEX.

Adicionar crédito deve mostrar o endereço de depósito, QR code e opção de copiar diretamente no formulário; não depender de um botão separado de gerenciar carteiras.

**Why:** O criador pediu um endereço para depósito direto, “even if mock”, e QR code, e rejeitou o atalho de gerenciamento que não abria.

**How to apply:** Usar o endereço da própria carteira da conta. Se a recepção ainda não atualizar saldos, informar essa limitação sem afirmar confirmação on-chain nem substituir chaves existentes.

**Why:** O criador afirmou que “adicionar o crédito tem que ficar relacionado ao valor do dólar ali na carteira” e que adicionar BETTEX e sacar precisam fazer sentido visualmente. Explicitou que quer converter seu BETTEX em dólar.

**How to apply:** Preservar o contexto da moeda de origem ao abrir cada formulário. Não voltar a tratar toda entrada como USDC, toda conversão como compra de BETTEX ou todo saque como resgate limitado ao rendimento.

Pix não está disponível no app e não deve ser oferecido como método ativo de adicionar crédito. A entrada atual deve usar USDC, com a quantidade informada em USDC; equivalências em reais continuam informativas.

**Why:** O criador disse: “PIX is not live yet remove it”.

**How to apply:** Não restaurar a opção Pix, campo de pagamento em reais ou conversão de entrada BRL → USDC sem uma solicitação posterior para ativar esse meio. Preservar registros históricos e conteúdo institucional fora desse fluxo.

Os atalhos de adicionar, sacar, transferir e converter devem usar ícones, sem o nome da ação escrito permanentemente nos botões. Isso não remove os nomes das páginas do menu, especialmente “Minha conta” e “Tesouraria”.

**Why:** O criador rejeitou os botões por extenso (“adicionar crédito”, “sacar dólar”), dizendo que prejudicavam o layout, e exigiu ícones.

**How to apply:** Não reintroduzir os botões de texto nos cartões de saldo. Manter nomes acessíveis e explicações ao focar ou passar o mouse, área de toque suficiente no celular e as ações relacionadas à moeda correta. Os formulários continuam com seus títulos e campos identificados.

O app deve mostrar as equivalências de uma unidade: dólar em real e BETTEX em dólar e em real, no cabeçalho disponível junto da navegação, incluindo o celular.

**Why:** O criador pediu “1=?” para dólar/real e as duas conversões de uma unidade BETTEX, marcando o espaço à direita da navegação.

**How to apply:** As cotações visíveis e a avaliação dos saldos devem usar a mesma referência. Não apresentar parâmetros simulados como preços reais de mercado nem inventar números quando a referência estiver indisponível.