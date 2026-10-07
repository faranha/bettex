---
name: Extrato completo das carteiras
description: Escopo solicitado para histórico, exportações e referências em reais.
---

O Histórico deve reunir transações e operações relacionadas às carteiras do usuário, inclusive rendimento, com tags por tipo, filtros por carteira e tipo e uma área de download. A referência em BRL precisa ficar claramente associada ao valor principal; taxas ficam separadas.

**Why:** O criador pediu todos esses recursos e corrigiu a formatação do extrato, especialmente a posição do valor em reais.

**How to apply:** Exportar o arquivo histórico armazenado, não apenas as últimas movimentações exibidas. Preservar a origem dos registros e distinguir solicitações de créditos concluídos. Exemplos adicionais são ilustrativos, separados dos saldos e das exportações reais; a cotação simulada não é preço de mercado do token nativo nem preço histórico de execução.

A leitura do extrato salvo não deve depender da disponibilidade da sincronização ao vivo da blockchain.

**Why:** Os runtimes da blockchain podem ficar offline independentemente do banco do histórico; tratar falta de atualização como perda do arquivo provocou falhas recorrentes no extrato.

**How to apply:** Separar disponibilidade dos registros e atualização ao vivo. Exibir registros salvos com aviso de que atividades recentes podem faltar, sem inventar confirmações. Falhas reais de leitura ou de paginação continuam sendo erros e não podem gerar uma exportação parcial apresentada como completa.
