# Observação dos contratos de teste no aplicativo existente

**Status:** desenvolvimento; implantação pública ainda depende de aprovação e abastecimento.

O anexo de emissão também exige banco e painel. A observação pertence a `reconciliation`, não ao ledger demonstrativo. O transporte usa a identidade Clerk já verificada no aplicativo; nenhum login, carteira ou serviço financeiro paralelo será criado. O cadastro nativo anterior permanece isolado e não será migrado ou apagado sem decisão do criador.

O usuário autenticado pode vincular um endereço público de contrato de teste à sua própria conta. A leitura é exclusivamente Arbitrum Sepolia no RPC oficial, valida bytecode contra esta versão dos contratos e consulta estado em bloco identificado. Registro de um endereço não concede administração, custódia ou autorização de compra.

O banco guarda configuração e evidências observadas (rede, endereço, versão, bloco/hash, transação/log), com chaves idempotentes. Estado apresentado é lido da blockchain; não reaproveitar saldos da demonstração. Eventos são provisórios e precisam de reconciliação, não prova de finalização L1 ou ledger financeiro.

Sem contrato configurado, apresentar ausência de implantação, não zeros simulados. Blockchain indisponível bloqueia resultado; não retornar snapshot antigo como confirmação nova. Não emitir, implantar, autorizar pagadores ou movimentar fundos automaticamente. O contrato já suporta compra assinada pelo titular com duas carteiras, mas a execução pública depende de implantação, autorização e funding gratuitos ainda ausentes.
