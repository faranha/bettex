---
name: Referência canônica BETTEX 1.0
description: Significado do pedido de restauração e distinção entre versão preservada e planejamento de simplificação.
---

O criador pediu salvar a versão atual inteira como **BETTEX 1.0**, antes de implementar a simplificação discutida. “Restaure a versão 1.0” deve apontar para a referência documentada em `docs/releases/BETTEX-1.0.md`, nunca para uma aproximação reconstruída a partir da conversa.

**Why:** O criador exige que o site e sistema possam voltar à aparência e ao estado preservados e pretende criar um checkpoint chamado 1.0 depois da preservação.

**How to apply:** Confirmar existência e integridade dos arquivos indicados no registro canônico. Não sobrescrever os backups da 1.0. Consultar as limitações de produção, Clerk, Secrets e serviços externos antes de prometer restauração integral. A direção de cripto, um ativo e retirada de Arbitrum continuava somente no planejamento no momento da solicitação.

Uma versão canônica exige preservar dados e arquivos fora do Git; a integridade de uma cópia enviada deve ser verificada relendo-a no armazenamento de destino, não apenas calculando o hash local.

**Why:** Checkpoints de código não incluem automaticamente banco de produção, identidades externas ou segredos; uma indicação de upload concluído não demonstra sozinha que o conteúdo pode ser recuperado.

**How to apply:** Manter matriz explícita de cobertura e pendências. Não declarar “tudo reversível” sem recuperação das camadas externas e ensaio apropriado.

Ao copiar objetos para backup no App Storage, não assumir que opções de cópia substituem a ACL customizada da origem. Aplicar e reler explicitamente a política privada no objeto de destino, preservando a ACL original apenas no recibo privado para futura restauração.

**Why:** A cópia pelo SDK manteve a ACL pública original apesar da intenção de sobrescrevê-la nas opções de cópia; foi necessário impor a política privada em uma operação de metadados posterior.

**How to apply:** Conferir a ACL efetiva de todos os destinos, não apenas o prefixo privado, o tamanho e o checksum. Nunca publicar arquivos de backup ou dados privados para facilitar recuperação.
