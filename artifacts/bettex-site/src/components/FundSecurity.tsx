import { ReadingDisclosure, Topics } from './ReadingDisclosure';
export function FundSecurity() {
  return <ReadingDisclosure id="documentacao-seguranca-fundos" headingId="seguranca-fundos-title" title={<>Segurança dos fundos</>}><Topics>
    <div className="whitepaper__prose">
      <p>A BETTEX adotará proteção dos fundos em camadas: separação entre tesouraria, caixa operacional e carteiras dos titulares; preservação da autocustódia, sem recolher chaves privadas dos usuários; chaves institucionais independentes, armazenamento protegido e recuperação testada; e aprovação multisig 2/3 para os atos institucionais previstos na política. A execução automática permanecerá limitada a mandatos aprovados, permissões mínimas e limites de exposição, sem permitir que a IA altere seus próprios controles. Conciliação diária, registros auditáveis e monitoramento com alertas acompanharão movimentações e obrigações. Contratos e controles de custódia passarão por testes e auditoria independente antes do uso de recursos reais. Em incidentes, os responsáveis poderão interromper novas execuções afetadas, preservar créditos e registros e iniciar o procedimento de recuperação aprovado; qualquer retomada exigirá conciliação e autorização. <a href="#documentacao-responsabilidade-seguranca">A entidade define os responsáveis e o orçamento de segurança.</a></p>
    </div>
  </Topics></ReadingDisclosure>;
}

export function FundSecurityResponsibilities() {
  return <ReadingDisclosure id="documentacao-responsabilidade-seguranca" headingId="responsabilidade-seguranca-title" title={<>Responsabilidade pela segurança dos fundos</>}><Topics>
    <div className="whitepaper__prose">
      <p>Na estrutura proposta, o fundador responde pela política de segurança, orçamento e designação dos responsáveis; o dev conduz proteção de sistemas, acessos, armazenamento seguro e monitoramento, sem assumir automaticamente função de signatário; o generalist trader acompanha exposição, reservas e conciliação financeira; e legal acompanha permissões, contratos e registros de incidentes. Aprovação, execução e conferência têm responsáveis identificados, com conferência por pessoa distinta de quem executa. Auditorias independentes são serviços especializados, não uma nova posição permanente na equipe de até cinco pessoas. A IA auxilia a detecção e a análise, sem assumir responsabilidade humana ou receber chaves privadas dos titulares.</p>
      <p>Segurança, auditorias, monitoramento, recuperação e resposta a incidentes devem ter verbas discriminadas no orçamento operacional de referência de US$ 50 mil mensais, sem presumir seus custos ou somá-los duas vezes. Despesas institucionais saem do caixa operacional, sem uso automático da tesouraria ou dos créditos dos participantes. Custos efetivos das operações de investimento seguem sua apuração própria. <a href="#documentacao-seguranca-fundos">A política de proteção dos fundos está nos requisitos operacionais e de segurança.</a></p>
    </div>
  </Topics></ReadingDisclosure>;
}