import { DocumentationRulesTable } from './DocumentationRulesTable';

import { ReadingDisclosure, Topics } from './ReadingDisclosure';
export function FundSecurity() {
  return <ReadingDisclosure id="documentacao-seguranca-fundos" headingId="seguranca-fundos-title" title={<>Segurança dos fundos</>}><Topics>
    <div className="whitepaper__prose">
      <p>A BETTEX adotará proteção dos fundos em camadas: separação entre tesouraria, recursos operacionais e carteiras dos titulares; preservação da autocustódia, sem recolher chaves privadas dos usuários; chaves administrativas independentes, armazenamento protegido e recuperação testada; e aprovação multisig 2/3 para os atos administrativos previstos na política. A execução automática permanecerá limitada a mandatos aprovados, permissões mínimas e limites de exposição, sem permitir que a IA altere seus próprios controles. Conciliação diária, registros auditáveis e monitoramento com alertas acompanharão movimentações e obrigações. Contratos e controles de custódia passarão por testes e auditoria independente antes do uso de recursos reais. Em incidentes, os responsáveis poderão interromper novas execuções afetadas, preservar registros e iniciar o procedimento de recuperação aprovado; qualquer retomada exigirá conciliação e autorização. <a href="#documentacao-responsabilidade-seguranca">Responsáveis e planejamento da segurança do protocolo.</a></p>
    </div>
  </Topics></ReadingDisclosure>;
}

export function FundSecurityResponsibilities() {
  return <ReadingDisclosure id="documentacao-responsabilidade-seguranca" headingId="responsabilidade-seguranca-title" title={<>Responsabilidade pela segurança dos fundos</>}><Topics>
    <DocumentationRulesTable>
      <p>O fundador administra a política de segurança, orçamento e contratação pontual de serviços externos especializados. Aprovação, execução e conferência têm responsabilidades identificadas, com independência nos controles de custódia. Auditorias e avaliações externas não constituem cargos internos. A IA auxilia detecção e análise, sem assumir responsabilidade jurídica ou receber chaves privadas dos titulares.</p>
      <p>Segurança, auditoria, monitoramento e recuperação têm custos discriminados por necessidade, sem orçamento mensal presumido. A fonte de custeio permanece em aberto; essas despesas exigem planejamento e aprovação, sem retirada automática da tesouraria ou dos créditos dos titulares. Custos efetivos de investimentos seguem a apuração própria. <a href="#documentacao-seguranca-fundos">Proteção dos fundos</a> · <a href="#documentacao-entidade-multisig">Mandatos e custódia</a>.</p>
    </DocumentationRulesTable>
  </Topics></ReadingDisclosure>;
}