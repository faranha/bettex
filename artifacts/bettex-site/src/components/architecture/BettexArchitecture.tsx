import { type ReactNode } from 'react';
import './BettexArchitecture.css';

type Surface = 'dark' | 'paper';
type Tone = 'blue' | 'gold' | 'teal' | 'plain';

interface Step { title: string; text: string; tone?: Tone; badge?: string; id?: string; extra?: ReactNode }

function Steps({ steps, label }: { steps: Step[]; label: string }) {
  return (
    <ol className="ba-steps" aria-label={label} style={{ ['--cols' as string]: steps.length }}>
      {steps.map((s, i) => (
        <li key={s.title} className={`ba-step ba-step--${s.tone ?? 'plain'}`} data-testid={s.id}>
          <span className="ba-step__n">{i + 1}</span>
          <div className="ba-step__body">
            <h5>{s.title}{s.badge && <em>{s.badge}</em>}</h5>
            <p>{s.text}</p>
            {s.extra}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Figure({ id, num, title, lead, children }: { id: string; num: string; title: string; lead: string; children: ReactNode }) {
  return (
    <section className="ba-fig" id={id} data-testid={id} aria-labelledby={`${id}-t`}>
      <header className="ba-fig__head">
        <span className="ba-fig__num">Desenho {num} de 5</span>
        <h4 id={`${id}-t`}>{title}</h4>
        <p>{lead}</p>
      </header>
      {children}
    </section>
  );
}

const fig1: Step[] = [
  { title: 'Carteira BETTEX', text: 'Gerada com a conta. Pertence ao titular, que pode exportar chaves e dados.', tone: 'blue', badge: 'Titular' },
  { title: 'Acesso ao aplicativo', text: 'Comprova o controle da carteira. Chaves privadas e frase de recuperação nunca vão ao servidor.' },
  { title: 'Compra de BETTEX', text: 'Troca USDC confirmado por BETTEX no app, com cotação, custos e quantidade informados antes de confirmar.', tone: 'gold', badge: 'Swap', id: 'node-bettex-swap',
    extra: <div className="ba-swap" aria-label="Troca de USDC por BETTEX"><span>USDC</span><span aria-hidden="true">→</span><span>BETTEX</span></div> },
  { title: 'BETTEX na carteira', text: 'A compra confirmada credita BETTEX. Todo BETTEX disponível na Carteira BETTEX participa automaticamente, ponderado pelo tempo.', tone: 'blue' },
];
const fig2: Step[] = [
  { title: 'Entrada em USDC', text: 'Escolha um dos dois caminhos.', tone: 'blue',
    extra: (
      <div className="ba-entry">
        <div><strong>Depósito direto</strong><p>Envio de USDC por uma carteira compatível.</p></div>
        <span className="ba-entry__or">ou</span>
        <div><strong>On-ramp externo</strong><p>O provedor converte fiat em USDC, com sua cotação e custos. Eventual KYC fica separado do acesso à BETTEX.</p></div>
      </div>
    ) },
  { title: 'Confirmação do recebimento', text: 'Só USDC efetivamente recebido e confirmado é creditado.' },
  { title: 'Saldo em USDC', text: 'Saldo financeiro, separado do token BETTEX. Sem conta fiduciária e sem off-ramp próprio.', tone: 'gold' },
];
const treasuryFlow: Step[] = [
  { title: 'Compra por swap', text: 'USDC → BETTEX: o token é creditado na Carteira BETTEX. O USDC pago na compra segue para a tesouraria após confirmação.', tone: 'blue', id: 'node-treasury-swap' },
  { title: 'Tesouraria BETTEX', text: 'Recebe 100% dos recursos das vendas para investimento, sem uso para despesas operacionais do projeto. Separada dos saldos pessoais.', tone: 'gold', id: 'node-bettex-treasury' },
  { title: 'Reservas da BETTEX', text: 'A tesouraria divide os recursos em duas parcelas.', tone: 'teal', id: 'node-bettex-reserves',
    extra: (
      <div className="ba-entry">
        <div><strong>50% · Reserva defensiva</strong><p>Mantida em stablecoins.</p></div>
        <div><strong>50% · Parcela investível</strong><p>Reservada às quatro estratégias de mercado, dentro dos limites e da aprovação de risco.</p></div>
      </div>
    ) },
];
const fig3: Step[] = [
  { title: 'Tesouraria BETTEX', text: 'Mantém as reservas e a parcela investível, separadas dos saldos pessoais.', tone: 'gold' },
  { title: 'Agente de IA BETTEX', text: 'Contrato inteligente que vincula a operação da IA às regras de movimentação da tesouraria.', tone: 'blue', badge: 'Smart contract', id: 'node-bettex-ai-contract' },
  { title: 'Regras e autorizações', text: 'O contrato controla o acesso ao capital conforme reservas, limites e permissões. Não libera movimentações fora dessas regras.', tone: 'teal' },
];
const fig4: Step[] = [
  { title: 'Capital da tesouraria', text: 'A operação utiliza a parcela investível autorizada pelo smart contract, respeitando a reserva de cada estratégia.', tone: 'gold' },
  { title: 'IA: análise e risco', text: 'Compara dados, probabilidades, liquidez e exposição. Nenhuma ordem sai sem aprovação independente de risco.', tone: 'blue', badge: 'Antes das ordens' },
  { title: 'Conectores autorizados', text: 'Executam as ordens aprovadas nos quatro mercados.',
    extra: (
      <>
        <ul className="ba-chips"><li>Previsões</li><li>Ações e cripto</li><li>Esportes</li><li>Cassinos</li></ul>
        <div className="ba-partner">
          <img className="ba-partner__logo" src={`${import.meta.env.BASE_URL}platforms/robinhood.svg`} alt="Robinhood" width={96} height={22} loading="lazy" decoding="async" />
          <span className="ba-badge ba-badge--gold">Possível</span>
        </div>
        <p>A API pública da Robinhood é só de cripto. Não há parceria ativa afirmada.</p>
      </>
    ) },
  { title: 'Retorno à tesouraria', text: 'Os resultados das operações voltam à tesouraria após liquidação e conciliação dos movimentos e custos.', tone: 'gold', id: 'node-bettex-treasury-return' },
];
const fig5: Step[] = [
  { title: 'Lucro da tesouraria', text: 'Lucro líquido realizado após custos e perdas anteriores, já conciliado em USDC.', tone: 'gold' },
  { title: 'Distribuição ao staking', text: '25% do lucro líquido realizado, só em dias positivos. Cada participante recebe pelo BETTEX-tempo, em UTC.', tone: 'blue' },
  { title: 'Crédito na carteira', text: 'A tesouraria distribui USDC aos participantes da piscina fechada de staking. O crédito entra no saldo pessoal em USDC.', tone: 'teal' },
  { title: 'Saque em USDC', text: 'Transferência para carteira compatível, com custos e valor líquido informados. Sem pagamento em moeda local.' },
];

export function BettexArchitecture({ surface = 'dark', heading = true }: { surface?: Surface; heading?: boolean }) {
  return (
    <figure className={`ba ba--${surface}`} data-testid="diagram-bettex-architecture" aria-labelledby="ba-caption">
      {heading && (
        <header className="ba__head">
           <p className="ba__eyebrow">Documentação v1 · arquitetura</p>
           <h3 className="ba__title">Cinco fluxos da operação BETTEX.</h3>
        </header>
      )}
       <figcaption id="ba-caption" className="ba__note">Modelo descrito na v1: compra de BETTEX, tesouraria e reservas, conexão com o agente de IA por smart contract, operação com retorno à tesouraria e distribuição ao staking.</figcaption>

      <div className="ba__figs">
        <Figure id="figure-bettex-wallet" num="1" title="Carteira, compra de BETTEX e participação" lead="Na Carteira BETTEX, a pessoa compra o token pelo swap USDC → BETTEX. Após confirmação, a participação é automática.">
          <Steps steps={fig1} label="Carteira BETTEX, acesso, compra por swap e participação automática" />
          <aside className="ba-side ba-side--apart" data-testid="node-arbitrum">
            <span className="ba-side__tag">Infraestrutura</span>
            <span className="ba-wordmark ba-wordmark--arbitrum">Arbitrum One</span>
            <p>A rede registra emissão e transferências do token. A compra confirma o débito de USDC e o crédito de BETTEX na carteira do titular, registrados juntos e uma única vez.</p>
          </aside>
          <p className="ba-fig__foot">A piscina é fechada e exige acesso ao aplicativo, mas não uma sessão aberta o tempo todo. Exportar a carteira não torna a piscina operável fora do app.</p>
        </Figure>

        <Figure id="figure-bettex-deposit" num="2" title="Entrada, swap e tesouraria BETTEX" lead="O depósito forma o saldo pessoal em USDC. O valor usado na compra de BETTEX abastece a tesouraria e suas reservas.">
          <p className="ba-flow__label">Entrada de USDC na carteira da pessoa</p>
          <Steps steps={fig2} label="Depósito ou on-ramp até o saldo confirmado" />
          <div className="ba-flow ba-flow--treasury">
            <p className="ba-flow__label">Destino do USDC utilizado no swap de compra</p>
            <Steps steps={treasuryFlow} label="USDC da compra por swap enviado à tesouraria BETTEX e dividido entre reservas" />
            <p className="ba-fig__foot">Cada estratégia — previsões, ações e cripto, esportes e cassinos — tem 25% da parcela investível, equivalente a 12,5% do total da tesouraria. Saldo não usado permanece reservado à estratégia, sem redistribuição automática.</p>
          </div>
          <p className="ba-fig__foot">Um depósito não vira recurso do projeto por si só: somente o USDC usado na compra de BETTEX segue esse fluxo. A tesouraria não é saldo pessoal disponível para saque.</p>
        </Figure>

        <Figure id="figure-bettex-ai-contract" num="3" title="Tesouraria conectada ao agente de IA BETTEX" lead="O smart contract do agente de IA BETTEX conecta a tesouraria às regras de operação e autorização do capital.">
          <Steps steps={fig3} label="Tesouraria BETTEX conectada ao agente de IA por contrato inteligente e suas autorizações" />
          <p className="ba-fig__foot">O smart contract formaliza as regras de acesso e movimentação da tesouraria. As análises, inferências e conexões com plataformas externas são fornecidas pelos serviços e conectores da operação, respeitando essas regras.</p>
        </Figure>

        <Figure id="figure-bettex-risk" num="4" title="Operação da IA e retorno à tesouraria" lead="Tesouraria → IA BETTEX → mercados → tesouraria. O ciclo só executa ordens aprovadas e retorna resultados conciliados.">
          <Steps steps={fig4} label="Capital autorizado da tesouraria, análise e risco, conectores de mercado e retorno à tesouraria" />
          <aside className="ba-side" data-testid="node-allora">
            <span className="ba-side__tag">Entrada opcional, só leitura</span>
            <span className="ba-wordmark ba-wordmark--allora">Allora</span>
            <p>Alimenta apenas a etapa 2, a análise. Sem custódia, sem login, sem execução e sem decidir o risco.</p>
          </aside>
        </Figure>

        <Figure id="figure-bettex-payout" num="5" title="Tesouraria distribui ganhos aos participantes do staking" lead="Do lucro realizado na tesouraria ao crédito em USDC de quem participa com BETTEX na carteira oficial.">
          <Steps steps={fig5} label="Lucro realizado da tesouraria, distribuição aos participantes do staking, crédito pessoal e saque em USDC" />
          <p className="ba-fig__foot">Todo BETTEX disponível na Carteira BETTEX participa automaticamente da piscina fechada. A distribuição considera o tempo de participação, sem exigir uma sessão continuamente aberta.</p>
          <aside className="ba-side ba-side--apart" data-testid="figure-bettex-estimate">
            <span className="ba-side__tag">Visão de valor, fora do fluxo</span>
            <p>A interface mostra um equivalente estimado do saldo na moeda local da pessoa, apenas para consulta. Não é uma etapa de conversão e não altera o saque, que segue em USDC.</p>
          </aside>
        </Figure>
      </div>
    </figure>
  );
}

export default BettexArchitecture;
