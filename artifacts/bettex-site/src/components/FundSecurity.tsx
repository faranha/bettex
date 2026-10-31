import { DocumentationRulesTable } from './DocumentationRulesTable';

import { ReadingDisclosure, Topics } from './ReadingDisclosure';
export function FundSecurity() {
  return <ReadingDisclosure id="documentacao-seguranca-fundos" headingId="seguranca-fundos-title" title={<>Segurança dos fundos</>}><Topics>
    <div className="whitepaper__prose">
      <p>A governança e a segurança multisig descritas são uma proposta inicial, aberta à discussão com investidores e com a comunidade. A composição, o quórum e os poderes do multisig podem ser revistos por um processo documentado de aprovação, testes e implantação. Até uma revisão entrar em vigor, permanecem os controles da versão vigente; discutir o modelo não autoriza ignorá-los.</p>
      <p>A BETTEX adotará proteção dos fundos em camadas: separação entre tesouraria, recursos operacionais e carteiras dos titulares; preservação da autocustódia, sem recolher chaves privadas dos usuários; chaves administrativas independentes, armazenamento protegido e recuperação testada; e aprovação multisig 2/3 para os atos administrativos previstos na política. A execução automática permanecerá limitada a mandatos aprovados, permissões mínimas e limites de exposição, sem permitir que a IA altere seus próprios controles. Conciliação diária, registros auditáveis e monitoramento com alertas acompanharão movimentações e obrigações. Contratos e controles de custódia passarão por testes e auditoria independente antes do uso de recursos reais. Em incidentes, os responsáveis poderão interromper novas execuções afetadas, preservar registros e iniciar o procedimento de recuperação aprovado; qualquer retomada exigirá conciliação e autorização. <a href="#documentacao-responsabilidade-seguranca">Responsáveis e planejamento da segurança do protocolo.</a></p>
    </div>
  </Topics></ReadingDisclosure>;
}

export function FundSecurityResponsibilities() {
  return <ReadingDisclosure id="documentacao-responsabilidade-seguranca" headingId="responsabilidade-seguranca-title" title={<>Responsabilidade pela segurança dos fundos</>}><Topics>
    <DocumentationRulesTable>
      <p>Inicialmente, ainda não há alternativa operacional à atuação do fundador em certas decisões necessárias ao projeto. Essa responsabilidade não é uma estrutura definitiva: a visão é que a inteligência artificial assuma progressivamente essas decisões e substitua as funções de administração e o próprio papel do fundador, até alcançar autonomia operacional. A transição pode ser discutida com investidores e com a comunidade e depende de validação, responsabilidades e controles documentados. Essa visão futura não equivale a uma autonomia já implementada.</p>
      <p>O fundador administra a política de segurança, orçamento e contratação pontual de serviços externos especializados. Aprovação, execução e conferência têm responsabilidades identificadas, com independência nos controles de custódia. Auditorias e avaliações externas não constituem cargos internos. A IA auxilia detecção e análise, sem assumir responsabilidade jurídica ou receber chaves privadas dos titulares.</p>
      <p>Segurança, auditoria, monitoramento e recuperação têm custos discriminados por necessidade, sem orçamento mensal presumido. A fonte de custeio permanece em aberto; essas despesas exigem planejamento e aprovação, sem retirada automática da tesouraria ou dos créditos dos titulares. Custos efetivos de investimentos seguem a apuração própria. <a href="#documentacao-seguranca-fundos">Proteção dos fundos</a> · <a href="#documentacao-entidade-multisig">Mandatos e custódia</a>.</p>
    </DocumentationRulesTable>
  </Topics></ReadingDisclosure>;
}