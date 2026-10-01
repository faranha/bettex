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
        <span className="ba-fig__num">Desenho {num} de 4</span>
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
const fig3: Step[] = [
  { title: 'Análise de mercado', text: 'O motor comum cruza mercados, liquidez e limites.', tone: 'blue' },
  { title: 'Aprovação de risco independente', text: 'Nenhuma ordem sai sem aprovação.', tone: 'gold', badge: 'Antes das ordens' },
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
];
const fig4: Step[] = [
  { title: 'Lucro líquido realizado', text: 'Após custos e perdas anteriores, já conciliado.', tone: 'blue' },
  { title: 'Distribuição de 25%', text: 'Parcela global do lucro, só em dias positivos. Participação individual pelo BETTEX-tempo, em UTC.', tone: 'gold' },
  { title: 'Crédito em USDC', text: 'Entra no saldo em USDC da pessoa.' },
  { title: 'Saque em USDC', text: 'Transferência para carteira compatível, com custos e valor líquido informados. Sem pagamento em moeda local.' },
];

export function BettexArchitecture({ surface = 'dark', heading = true }: { surface?: Surface; heading?: boolean }) {
  return (
    <figure className={`ba ba--${surface}`} data-testid="diagram-bettex-architecture" aria-labelledby="ba-caption">
      {heading && (
        <header className="ba__head">
           <p className="ba__eyebrow">Documentação v1 · arquitetura</p>
           <h3 className="ba__title">Quatro fluxos da operação BETTEX.</h3>
        </header>
      )}
       <figcaption id="ba-caption" className="ba__note">Modelo descrito na v1: carteira e compra de BETTEX, entrada de recursos, operação dos mercados e distribuição dos resultados.</figcaption>

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

        <Figure id="figure-bettex-deposit" num="2" title="Entrada de valor e saldo confirmado" lead="Duas portas de entrada, um só saldo: USDC confirmado.">
          <Steps steps={fig2} label="Depósito ou on-ramp até o saldo confirmado" />
        </Figure>

        <Figure id="figure-bettex-risk" num="3" title="Análise, risco e execução" lead="O risco aprova antes de qualquer ordem chegar ao conector.">
          <Steps steps={fig3} label="Análise, aprovação de risco e conectores" />
          <aside className="ba-side" data-testid="node-allora">
            <span className="ba-side__tag">Entrada opcional, só leitura</span>
            <span className="ba-wordmark ba-wordmark--allora">Allora</span>
            <p>Alimenta apenas a etapa 1, a análise. Sem custódia, sem login, sem execução e sem decidir o risco.</p>
          </aside>
        </Figure>

        <Figure id="figure-bettex-payout" num="4" title="Lucro distribuído e saque" lead="O dinheiro se move sempre em USDC.">
          <Steps steps={fig4} label="Distribuição do lucro e saque em USDC" />
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
