# Decisão: demo visual e implementações operacionais separadas

**Estado:** adotada para a experiência pública atual.

## Contexto

O repositório contém experimentos operacionais, bancos, contratos e integrações
anteriores. A orientação atual exige uma demonstração visual, não operação
financeira, testnet ativa ou emulação persistida.

## Decisão

Montar dados fictícios localmente para `/app`; mostrar avisos nas ações.
Bloquear transporte operacional no cliente e, independentemente, na API.
Não importar roteadores ou inicializadores operacionais na API visual.
Preservar código e registros anteriores sem expô-los como funcionalidades atuais.

## Alternativas e razões

Usar uma testnet como origem do demo criaria dependências de funding, RPC,
assinatura, identidade e consistência. Apagar o backend perderia conhecimento e
evidência. A separação preserva ambos sem transformar a apresentação em operação.

## Consequências

Correlação e conciliação do demo são propriedades de fixtures, não prova
independente de execução. Testes históricos que exigem API operacional ou
runtime desativado precisam de perfil próprio e revisão explícita.
Uma futura ativação requer decisão, compatibilidade econômica e autorização separadas.
