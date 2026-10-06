---
name: Identidade de processos nos locks
description: Locks persistentes podem sobreviver ao runtime enquanto números de processos são reutilizados.
---

Um PID existente não comprova que o dono original de um lock ainda está vivo. Verificar identidade de inicialização e de boot, preservando locks de propriedade desconhecida.

**Why:** Após uma troca de runtime, um lock persistente do sincronizador apontou para um PID reutilizado por outro processo. O status indicava um serviço ativo que não existia e impedia sua inicialização.

**How to apply:** Ao investigar um workflow supostamente ativo sem processo correspondente, conferir a identidade do dono antes de atribuir a falha à rede ou autenticação. Recuperar somente locks comprovadamente antigos, sem roubar locks ativos.
