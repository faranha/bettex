import { DocFacts } from './DocFacts';
import { EntityMultisig } from './EntityMultisig';
import { EntityTeam } from './EntityTeam';
import { FundSecurityResponsibilities } from './FundSecurity';
import { BusinessPlan } from './BusinessPlan';
import { MarketOpportunity } from './MarketOpportunity';
import { defaultTopicOf, groupTopics, type TopicInfo } from './ReadingDisclosure';
import { GovernanceSchematic, AccountBoundariesSchematic } from './docs-diagrams/DocSchematics';
import type { ReactElement, ReactNode } from 'react';

const titles = new Map<unknown, TopicInfo>([
  [MarketOpportunity, 'bare'],
  [FundSecurityResponsibilities, 'bare'],
  [EntityTeam, 'bare'],
  [BusinessPlan, 'bare'],
]);
function topicOf(el: ReactElement<{ children?: ReactNode; className?: string; id?: string }>): TopicInfo {
  if (el.type === DocFacts) return 'bare';
  return titles.get(el.type) ?? defaultTopicOf(el);
}

export function EntityOrganisation() {
  return <>{groupTopics(Body().props.children, topicOf)}</>;
}

function Body() {
  return <>
    <div className="whitepaper__lead">
      <span>ORGANIZAÇÃO EMPRESARIAL · BASE DA ENTIDADE</span>
      <p>A BETTEX tem como base <strong>uma única empresa comercial privada, administrada pelo fundador</strong>. Essa entidade reúne o projeto, os direitos sobre o token, o aplicativo, a tesouraria e as obrigações do programa de resultados. A organização abaixo orienta sua constituição, seus contratos e sua operação.</p>
    </div>

    <DocFacts title="Identidade empresarial" facts={[
      { label: 'ESTRUTURA', value: 'Empresa privada', text: 'Uma pessoa jurídica comercial para o projeto.' },
      { label: 'ADMINISTRAÇÃO', value: 'Fundador', text: 'Liderança, orçamento e representação da empresa.' },
      { label: 'CAIXA OPERACIONAL', value: 'USDC', text: 'Receitas de serviços separadas da tesouraria.' },
    ]} />

    <MarketOpportunity />

    <h3 className="whitepaper__subhead">Empresa, sócios e titulares de BETTEX</h3>
    <div className="whitepaper__prose">
      <p>“Fundação BETTEX” é a denominação histórica da organização do projeto; não determina uma forma jurídica de fundação nem representa uma segunda empresa. O nome empresarial e a forma societária integram os atos de constituição na jurisdição escolhida.</p>
      <p>Os sócios têm os direitos registrados nos atos societários. O fundador é o administrador, sem pressupor que seja o único sócio. Os titulares de BETTEX possuem seus tokens e os direitos contratuais do programa, <strong>não ações, voto societário ou propriedade proporcional da tesouraria</strong>. A alocação de tokens não define participação no capital social.</p>
    </div>

    <h3 className="whitepaper__subhead">Funções e responsabilidades</h3>
    <div className="whitepaper__status-grid">
      <div><span>01 / ADMINISTRAÇÃO</span><strong>Fundador</strong><p>Conduz a entidade sem salário, aprova orçamento e políticas, formaliza contratos e representa a empresa conforme os poderes registrados. Decisões envolvendo seus interesses seguem os procedimentos societários aplicáveis.</p></div>
      <div><span>02 / FINANCEIRO E CONTABILIDADE</span><strong>Caixa e obrigações</strong><p>Organiza receitas, despesas, folha, tributos e financiamentos; concilia carteiras e contas e prepara os fechamentos. Mantém a distinção entre saldo, obrigações e dinheiro disponível.</p></div>
      <div><span>03 / TECNOLOGIA E OPERAÇÃO</span><strong>Aplicativo e sistemas</strong><p>Cuida do desenvolvimento, segurança, infraestrutura, suporte e registros. A titularidade ou licença de marca, código e sistemas deve estar documentada em favor da entidade.</p></div>
      <div><span>04 / TESOURARIA E CONTROLES</span><strong>Investimentos e apuração</strong><p>Opera as estratégias autorizadas, acompanha reservas e compromissos e apura os resultados conciliados. Sugestões da IA para alterar regras entram em fila e exigem aprovação da liderança antes da execução.</p></div>
    </div>
    <div className="whitepaper__prose">
      <p>Essas são frentes de responsabilidade, não quatro contratações adicionais. São distribuídas entre as posições da equipe básica abaixo, com aprovação, execução e conciliação identificadas. Funções profissionais e serviços especializados não constituem uma segunda empresa própria nem autorizam ultrapassar o teto de pessoas.</p>
    </div>    <GovernanceSchematic />


    <FundSecurityResponsibilities />
    <EntityTeam />
    <BusinessPlan />

    <h3 className="whitepaper__subhead">Separação do patrimônio e do caixa</h3>
    <div className="whitepaper__rule-pair">
      <div><span>OPERAÇÃO DA EMPRESA</span><strong>Carteira institucional de serviços</strong><p>Recebe as taxas em USDC e o financiamento operacional aprovado. Custeia desenvolvimento, administração, equipe, fornecedores e obrigações correspondentes, com provisões e comprovantes.</p></div>
      <div><span>PROGRAMA DE INVESTIMENTOS</span><strong>Tesouraria e créditos</strong><p>Mantém os recursos de investimentos, reservas e obrigações dos participantes. Créditos reconhecidos não viram caixa livre, e déficits operacionais não são transferidos automaticamente à tesouraria.</p></div>
    </div>
    <div className="whitepaper__prose">
      <p>Contas e carteiras institucionais pertencem à entidade e são distintas das carteiras pessoais. A separação é interna à mesma pessoa jurídica; ela organiza controles, mas não cria empresas distintas ou blindagem patrimonial automática.</p>
    </div>    <AccountBoundariesSchematic />


    <h3 className="whitepaper__subhead">Receitas de serviços e financiamento</h3>
    <div className="whitepaper__prose">
      <p>A política atual é de <strong>US$ 2,50 por compra primária de BETTEX, US$ 2,50 por saque de rendimentos em USDC e US$ 2,50 por envio autônomo de BETTEX para outra carteira pelo aplicativo</strong>. Todas as taxas são pagas em USDC, sem queima de BETTEX. A entrega integrante da compra não gera uma segunda tarifa de envio; exportação e transferências diretas fora do aplicativo não recebem taxa de serviço do aplicativo.</p>
      <p>A receita de serviços fica no caixa operacional, fora do split de investimentos de 50%/25%/25%. Dez mil saques representam US$ 25 mil de receita bruta, antes de custos e tributos. O orçamento deve considerar operações efetivas, não apenas usuários cadastrados.</p>
      <p>Dos aportes ligados à parcela dos investidores, <strong>50% financiam capital inicial e desenvolvimento e 50% vão à tesouraria</strong>. Já 100% dos recursos da venda pública primária de BETTEX vão à tesouraria. A tarifa de serviço tem registro e destino próprios, separados do preço dos tokens.</p>
      <p>Financiamento adicional da operação pode ser avaliado por aporte societário ou empréstimo documentado e aprovado. Capital, dívida e receita de serviços recebem registros distintos; devolução de principal não é dividendo.</p>
    </div>

    <h3 className="whitepaper__subhead">Remuneração, tributos e destinação do lucro</h3>
    <div className="whitepaper__prose">
      <p>O fundador não recebe salário neste plano, conforme decisão do criador; mantém sua alocação originária de tokens. Os quatro colaboradores têm remuneração proposta no orçamento, com valores, encargos, tributos, vencimentos e responsáveis registrados e modalidade validada. Taxas são a fonte recorrente pretendida; financiamento aprovado sustenta a fase inicial sem se tornar receita. Remuneração, concessões pessoais de tokens e dividendos são movimentos diferentes.</p>
      <p>A contabilidade registra receita bruta, custos, obrigações fiscais e resultado. A moeda USDC não dispensa essas etapas. Alíquotas, retenções e recolhimentos seguem o regime aplicável; a tarifa de US$ 2,50 não representa lucro líquido de US$ 2,50.</p>
      <p>Distribuição ou antecipação de lucro exige apuração contábil, procedimento societário permitido e caixa após obrigações e reservas. Receita futura projetada não autoriza retirada como dividendo. Os 50% retidos na tesouraria e os 25% destinados à recompra não são renda pessoal do fundador.</p>
    </div>

    <h3 className="whitepaper__subhead">Rotina administrativa</h3>
    <div className="whitepaper__flow" role="group" aria-label="Ciclo de administração da entidade">
      <span>PAGAMENTO E FECHAMENTO</span>
      <ol>
        <li>Identificar contrato, despesa, beneficiário e obrigação.</li>
        <li>Conferir orçamento, tributos e disponibilidade.</li>
        <li>Autorizar por multisig ou executar dentro de mandato válido, conforme os poderes registrados.</li>
        <li>Executar, comprovar e conciliar uma única vez.</li>
        <li>Fechar receitas, despesas, obrigações e caixa.</li>
      </ol>
    </div>

    <EntityMultisig />

    <h3 className="whitepaper__subhead">Documentos de formalização</h3>
    <div className="whitepaper__prose">
      <p><strong>Constituição:</strong> denominação, jurisdição, forma societária, objeto, sócios, capital, sede, administração, poderes, representação e teto permanente de cinco pessoas na equipe, no instrumento aplicável. A base empresarial precede a adaptação local; Panamá permanece referência de estudo, não escolha final.</p>
      <p><strong>Direitos e contratos:</strong> titularidade de marca e tecnologia, documentação de emissão e venda do token, termos do programa de resultados, contratos de prestadores e instrumentos de financiamento.</p>
      <p><strong>Políticas internas:</strong> tesouraria, reservas, IA, contabilidade, tributos, remuneração, conflitos, conciliação e controle de acesso. Constituição, registros e autorizações têm etapas próprias; esta área apresenta a organização preparatória, não uma empresa já registrada.</p>
    </div>
  </>;
}