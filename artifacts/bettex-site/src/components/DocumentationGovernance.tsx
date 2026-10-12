import { EntityMultisig } from './EntityMultisig';
import { FundSecurityResponsibilities } from './FundSecurity';
import { BuybackPolicy } from './BuybackPolicy';
import { DocImage, DocTerms, Dot } from './DocImage';

export function DocumentationGovernance() {
  return <>
    <h3 className="whitepaper__subhead" id="documentacao-patrimonio">Separação do patrimônio e do caixa</h3>
    <div className="whitepaper__prose"><p>Tesouraria, caixa operacional e carteira exclusiva de recompra são contas distintas do projeto, com endereços, registros e mandatos próprios. Essa separação segue as finalidades e os controles do protocolo DeFi. Carteiras pessoais pertencem aos titulares.</p><p>A tesouraria reúne o preço integral em USDC dos tokens da comunidade já liberados e os recursos que lhe forem alocados. O mint inicial financia o projeto, com origem, aplicação e custos documentados. Reservas, posições, ordens e obrigações não são caixa livre. O custeio operacional permanece em aberto, sem cobrança definida. Um déficit operacional não autoriza retirada automática da tesouraria.</p><p><a href="#documentacao-financiamento-fundacao">Financiamento: origem e destino dos recursos</a></p></div>
    <DocImage wide src="app/resultados-soft.webp" alt="Balança, livro-razão e calculadora sobre fundo verde." caption="Registros separados e conciliados para tesouraria, caixa operacional e recompra." />
    <DocTerms id="schematic-boundaries" label="Fronteiras entre contas" items={[
      ['Comunidade em vesting', <Dot items={['Preço dos tokens', 'Em USDC', 'Tesouraria', '100% do preço']} />],
      ['Rede', <Dot items={['Custos externos de rede', 'Conforme a operação', 'Sem contribuição de serviço definida']} />],
      ['Resultados', <Dot items={['Parcela do staking', 'Em USDC', 'Carteira USDC do titular', 'Após conciliação']} />],
      ['Recompra e queima', <Dot items={['25% do resultado elegível', 'Em USDC', 'Carteira exclusiva', 'Compra autorizada de BETTEX', 'Burn permanente', 'Destruição irreversível dos tokens adquiridos']} />],
    ]} />
    <h3 className="whitepaper__subhead" id="documentacao-politicas">Administração, custódia e execução</h3>
    <div className="whitepaper__steps">
      <div><span>01</span><p><strong>Administração.</strong> O fundador coordena o projeto e aprova orçamento, políticas e contratos dentro dos poderes documentados. O objetivo futuro é transferir as funções do fundador e do time a agentes de IA até alcançar autonomia operacional. A IA propõe e documenta, sem ampliar os próprios poderes.</p></div>
      <div><span>02</span><p><strong>Custódia.</strong> O multisig aplica quórum e poderes registrados. Signatários independentes são formalizados, não presumidos como funcionários ou cargos internos.</p></div>
      <div><span>03</span><p><strong>Execução.</strong> Agentes e executores operam dentro de mandatos válidos, sujeitos a risco, liquidez, destinos e orçamento. Fora do mandato, a proposta retorna à aprovação competente.</p></div>
    </div>
    <span id="schematic-governance" />
    <h3 className="whitepaper__subhead" id="documentacao-evolucao-bots">Evolução das políticas e dos bots</h3>
    <div className="whitepaper__prose"><p>A governança evolui progressivamente por versões. Cada alteração identifica regra anterior, proposta, motivação, competências, limites, testes, aprovação, publicação e momento de vigência. Enquanto a nova versão não entra em vigor, os agentes usam a regra anterior. Alterações não reabrem rodadas encerradas nem modificam o vesting predefinido.</p><p>O agente de governança acompanha desvios e conflitos, organiza o histórico e propõe ajustes. A administração aprova a política; mudanças de custódia e poderes passam pelo multisig e pela espera aplicável. Monitoramento identifica incidentes, pausa os fluxos afetados e exige conciliação e autorização para retomar. Reversão de código ou política é uma nova mudança registrada; não desfaz automaticamente transações irreversíveis.</p></div>
    <details className="whitepaper__technical" id="documentacao-versao-politica">
      <summary>Registro de uma alteração de política</summary>
      <div className="whitepaper__technical-body"><p>Uma proposta de reduzir exposição registra a versão atual, parâmetros sugeridos, testes com dados de referência e impacto nas ordens existentes. A aprovação define o escopo; alterações sensíveis aguardam ao menos 24 horas. A versão entra em vigor somente após execução conferida. Falha mantém os bloqueios pertinentes e o histórico; a IA não aprova a própria mudança.</p></div>
    </details>
    <EntityMultisig />
    <FundSecurityResponsibilities />
    <BuybackPolicy />
    <h3 className="whitepaper__subhead" id="documentacao-formalizacao">Autonomia e rotina do protocolo</h3>
    <div className="whitepaper__prose"><p>A rotina identifica contrato, despesa, beneficiário e fonte; confere orçamento e disponibilidade; autoriza dentro dos poderes; executa e concilia uma única vez. Recursos comunitários, compromissos e patrimônio pessoal dos titulares permanecem separados. A participação da comunidade nas decisões não equivale a um voto automático por token.</p></div>
  </>;
}