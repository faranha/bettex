import { type ReactNode } from 'react';
import './BettexArchitecture.css';

type Surface = 'dark' | 'paper';
type Tone = 'blue' | 'gold' | 'teal' | 'plain';

function Badge({ tone = 'plain', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`ba-badge ba-badge--${tone}`}>{children}</span>;
}

function Node({ title, tag, tone = 'plain', badge, badgeTone, children, id }: { title: string; tag?: string; tone?: Tone; badge?: string; badgeTone?: Tone; children?: ReactNode; id?: string }) {
  return (
    <div className={`ba-node ba-node--${tone}`} data-testid={id}>
      <div className="ba-node__top">
        {tag && <span className="ba-node__tag">{tag}</span>}
        {badge && <Badge tone={badgeTone ?? tone}>{badge}</Badge>}
      </div>
      <h4>{title}</h4>
      {children}
    </div>
  );
}

const flows = [
  ['A', 'A carteira da pessoa é gerada com a conta. O acesso demonstra o controle dela, sem enviar chave privada ou frase de recuperação ao servidor.'],
  ['B', 'O saldo BETTEX disponível na carteira oficial do projeto participa automaticamente do pool fechado de staking, sem ativação nem depósito adicional.'],
  ['C', 'O backend registra contabilidade, conciliação e confirmações de pagamento. Essas funções são separadas da custódia e das chaves privadas da carteira pessoal.'],
  ['D', 'Provedores de pagamento independentes processam moedas fiduciárias. No Brasil, a referência é Pix; eventual KYC do provedor não integra o acesso à BETTEX.'],
  ['E', 'O motor comum de decisão e risco analisa os mercados e aciona conectores autorizados. Os sinais da Allora, se usados, entram apenas na análise.'],
  ['F', 'Os resultados dos mercados voltam à conciliação. Em dia de lucro, 25% do lucro líquido realizado é creditado em reais, ponderado pelo tempo em UTC.'],
] as const;

export function BettexArchitecture({ surface = 'dark', heading = true }: { surface?: Surface; heading?: boolean }) {
  return (
    <figure className={`ba ba--${surface}`} data-testid="diagram-bettex-architecture" aria-labelledby="ba-caption">
      {heading && (
        <header className="ba__head">
          <p className="ba__eyebrow">Arquitetura técnica prevista</p>
          <h3 className="ba__title">Da carteira da pessoa ao crédito em reais.</h3>
        </header>
      )}
      <div className="ba__board">
        <section className="ba-lane" aria-label="Titular e provedores de pagamento">
          <p className="ba-lane__label">01 / Titular</p>
          <Node tag="A" tone="blue" title="Carteira da pessoa" badge="Modelo">
            <p>Gerada na criação da conta, com dados básicos. Pertence ao titular; chaves e dados são exportáveis por iniciativa dele.</p>
          </Node>
          <Node tag="D" title="Provedores de pagamento" badge="Externo">
            <p>Moedas locais: BRL, RSD, EUR e USD. No Brasil, Pix. Eventual KYC do provedor é independente do acesso à BETTEX.</p>
          </Node>
        </section>

        <section className="ba-lane" aria-label="Rede e aplicativo">
          <p className="ba-lane__label">02 / Rede e aplicativo</p>
          <Node tag="Rede" tone="gold" title="BETTEX na Arbitrum One" badge="Modelo previsto" id="node-arbitrum">
            <span className="ba-wordmark ba-wordmark--arbitrum">Arbitrum One</span>
            <p>Rede prevista para o token. Não afirma contrato implantado.</p>
          </Node>
          <Node tag="B" tone="blue" title="Aplicativo oficial e piscina fechada de staking">
            <p>O saldo na carteira oficial participa automaticamente. O staking exige acessar o aplicativo, sem manter sessão aberta o tempo todo.</p>
          </Node>
          <Node tag="C" title="Backend: API, contabilidade e conciliação">
            <p>Confirma pagamentos e registra saldos. Separado de custódia e de chaves privadas.</p>
          </Node>
        </section>

        <section className="ba-lane" aria-label="Agente BETTEX">
          <p className="ba-lane__label">03 / Agente BETTEX</p>
          <Node tag="E" tone="blue" title="Motor comum de decisão e risco">
            <p>Cruza análises, liquidez e limites de risco antes de cada operação. É a autoridade de decisão.</p>
          </Node>
          <Node title="Conectores de mercado" badge="Autorizados">
            <ul className="ba-chips">
              <li>Previsões</li><li>Ações e cripto</li><li>Esportes</li><li>Cassinos</li>
            </ul>
            <div className="ba-partner">
              <img className="ba-partner__logo" src={`${import.meta.env.BASE_URL}platforms/robinhood.svg`} alt="Robinhood" width={96} height={22} loading="lazy" decoding="async" />
              <Badge tone="gold">Possível</Badge>
            </div>
            <p>Dados e execução autorizados, se disponíveis. Não afirma API pública de negociação de ações.</p>
          </Node>
          <Node tone="teal" title="Sinais de inferência e probabilidade" badge="Opcional" id="node-allora">
            <span className="ba-wordmark ba-wordmark--allora">Allora</span>
            <p>Entra só na análise. Sem custódia, sem execução de ordens, sem login e sem ser a única autoridade de risco.</p>
          </Node>
        </section>

        <section className="ba-lane ba-lane--result" aria-label="Resultado">
          <p className="ba-lane__label">04 / Resultado</p>
          <Node tone="gold" tag="F" title="Conciliação e crédito diário em reais">
            <p>Resultados dos mercados entram na conciliação. Dia de lucro: 25% do lucro líquido realizado, ponderado pelo tempo em UTC, creditado em reais.</p>
          </Node>
        </section>
      </div>
      <figcaption id="ba-caption" className="ba__flows">
        <p className="ba__flows-label">Fluxos principais</p>
        <ol>
          {flows.map(([k, text]) => <li key={k}><b>{k}</b><span>{text}</span></li>)}
        </ol>
      </figcaption>
    </figure>
  );
}

export default BettexArchitecture;
