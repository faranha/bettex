# Histórico técnico e razões das decisões

Este documento é um mapa das fases registradas, não uma afirmação de que toda
funcionalidade histórica está disponível hoje. Os detalhes e alternativas ficam
nos documentos vinculados e no histórico Git.

| Área | Trabalho preservado | Razão | Registro |
| --- | --- | --- | --- |
| Arquitetura | Contextos, portas, contratos e extração gradual | Isolar responsabilidades sem quebrar atomicidade financeira | [Decisões 1–4](decisions/README.md) |
| Pesquisa técnica | Catálogo e consulta de referências | Evitar implementar protocolos por suposição | [Documentação técnica](technical-documentation.md) |
| Contas e carteiras | Consentimento, identidade, vault e histórico próprio | Separar leitura, associação, custódia e autorização | [Contas](personal-test-accounts.md), decisões 6–9 |
| Contratos e rodadas | Biblioteca EVM, testes locais e settlement | Exercitar invariantes sem alegar deploy público | [Testnets](testnets/README.md), decisões 7–10 |
| Tesouraria | Reservas, governança e trilhas de auditoria | Manter controle, passivos e transparência sem dupla contagem | [Tesouraria](treasury-governance.md), decisão 11 |
| IA e mercados | Hierarquia, políticas, inferência e pesquisa | Separar previsão, oportunidade, risco e execução | [Agentes](agents.md), decisões 12–16 |
| Simulação | Cenários e dados isolados | Investigar falhas sem apresentar resultado simulado como lucro real | [Simulação](simulation.md) |
| Publicação de código | Guardas de sincronização, clone e CI | Evitar vazamento de segredos e envio automático incompleto | [GitHub](github-sync.md), decisão 14 |
| Produto comunitário | Seis capítulos, tokenomics e regras atuais | Preservar propósito e condições sem inventar entidade, receita ou garantias | [Estado atual](project-status.md) |
| Demo visual | Painel, grafo espacial, histórico e tesouraria correlacionados | Apresentar o produto sem ativar serviços financeiros | [Demo](demo/README.md), decisão 17 |
| Site e SEO | Traduções, downloads, HTML inicial e imagens sociais | Tornar leitura e compartilhamento consistentes com o produto atual | [Preparação GitHub](github-finalization.md) |

## O que não reescrever retrospectivamente

Manter os registros de experimentos e suas limitações. Uma mudança de direção
não invalida todo o trabalho anterior, mas altera o que pode ser apresentado
como regra vigente ou integração disponível. Não remover falhas de relatórios,
renomear evidência local como pública ou promover código de referência a serviço ativo.
