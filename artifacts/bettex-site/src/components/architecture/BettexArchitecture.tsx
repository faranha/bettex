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
        <span className="ba-fig__num">Desenho {num} de 6</span>
        <h4 id={`${id}-t`}>{title}</h4>
        <p>{lead}</p>
      </header>
      {children}
    </section>
  );
}

const fig1: Step[] = [
  { title: 'Cria a conta', text: 'Cadastro no aplicativo com dados básicos.', tone: 'blue' },
  { title: 'Cria as carteiras', text: 'Duas carteiras do titular, com chaves e dados exportáveis.', tone: 'blue',
    extra: (
      <div className="ba-entry" data-testid="node-personal-wallets">
        <div><strong>Carteira USDC</strong></div>
        <div><strong>Carteira BETTEX</strong></div>
      </div>
    ) },
  { title: 'Compra BETTEX', text: 'Usa USDC da Carteira USDC. A compra confirmada entrega os tokens na Carteira BETTEX.', tone: 'gold', badge: 'Swap', id: 'node-bettex-swap',
    extra: <div className="ba-swap" aria-label="Troca de USDC por BETTEX"><span>USDC</span><span aria-hidden="true">→</span><span>BETTEX</span></div> },
];
const fig2: Step[] = [
  { title: 'Carteira USDC', text: 'A pessoa usa o USDC disponível e confirmado para pagar a compra de BETTEX.', tone: 'blue' },
  { title: 'Confirma o swap', text: 'Confere o preço em USDC, a quantidade de BETTEX, os custos e o valor líquido antes de confirmar a compra.', tone: 'gold', id: 'node-treasury-swap',
    extra: <div className="ba-swap" aria-label="Compra de BETTEX com USDC"><span>USDC</span><span aria-hidden="true">→</span><span>BETTEX</span></div> },
  { title: 'Compra liquidada', text: 'Após confirmação, o débito de USDC e o crédito de BETTEX são registrados juntos e uma única vez.', tone: 'teal',
    extra: (
      <div className="ba-entry">
        <div><strong>BETTEX → Carteira BETTEX</strong><p>Recebe os tokens comprados.</p></div>
        <div data-testid="node-bettex-treasury"><strong>USDC → Tesouraria BETTEX</strong><p>Recebe o USDC usado na compra.</p></div>
      </div>
    ) },
];
const fig3: Step[] = [
  { title: 'Carteira BETTEX', text: 'Todo BETTEX disponível na carteira oficial do projeto conta a partir da confirmação do saldo.', tone: 'blue' },
  { title: 'Auto staking', text: 'A participação na piscina fechada é automática. Sem ativação manual nem depósito adicional de tokens.', tone: 'gold', id: 'node-bettex-auto-staking' },
  { title: 'Próxima rodada de ganhos', text: 'BETTEX em staking participa da próxima rodada. Precisa permanecer em staking até o pagamento, que é creditado na Carteira USDC.', tone: 'teal' },
];
const fig4: Step[] = [
  { title: 'Tesouraria BETTEX', text: 'Mantém as reservas e a parcela investível, separadas dos saldos pessoais.', tone: 'gold' },
  { title: 'Agente de IA BETTEX', text: 'Contrato inteligente que vincula a operação da IA às regras de movimentação da tesouraria.', tone: 'blue', badge: 'Smart contract', id: 'node-bettex-ai-contract' },
  { title: 'Regras e autorizações', text: 'O contrato controla o acesso ao capital conforme reservas, limites e permissões. Não libera movimentações fora dessas regras.', tone: 'teal' },
];
const fig5: Step[] = [
  { title: 'Capital da tesouraria', text: 'A operação utiliza a parcela investível autorizada pelo smart contract, com alocação dinâmica e respeito à reserva defensiva.', tone: 'gold' },
  { title: 'IA: análise e risco', text: 'Analisa oportunidades para distribuir os investimentos. Nenhuma ordem sai sem aprovação independente de risco.', tone: 'blue', badge: 'Antes das ordens' },
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
const fig6: Step[] = [
  { title: 'Lucro da tesouraria', text: 'Lucro líquido realizado após custos e perdas anteriores, já conciliado em USDC.', tone: 'gold' },
  { title: 'Distribuição ao staking', text: '25% do lucro líquido realizado, só em dias positivos. Participam os saldos BETTEX que permanecem em staking até o pagamento da rodada.', tone: 'blue' },
  { title: 'Crédito na Carteira USDC', text: 'A tesouraria distribui USDC aos participantes da piscina fechada de staking. O crédito entra na Carteira USDC, não na Carteira BETTEX.', tone: 'teal' },
  { title: 'Saque em USDC', text: 'Transferência para carteira compatível, com custos e valor líquido informados. Sem pagamento em moeda local.' },
];

export function BettexArchitecture({ surface = 'dark', heading = true }: { surface?: Surface; heading?: boolean }) {
  return (
    <figure className={`ba ba--${surface}`} data-testid="diagram-bettex-architecture" aria-labelledby="ba-caption">
      {heading && (
        <header className="ba__head">
           <p className="ba__eyebrow">Documentação v1 · arquitetura</p>
           <h3 className="ba__title">Seis fluxos da operação BETTEX.</h3>
        </header>
      )}
       <figcaption id="ba-caption" className="ba__note">Modelo descrito na v1: conta e carteiras, compra de BETTEX, auto staking, conexão da tesouraria com a IA, operação dos mercados e distribuição dos ganhos.</figcaption>

      <div className="ba__figs">
        <Figure id="figure-bettex-wallet" num="1" title="Conta, carteiras e compra de BETTEX" lead="Cria a conta, recebe as duas carteiras e compra BETTEX por swap.">
          <Steps steps={fig1} label="Criação da conta, criação das carteiras USDC e BETTEX e compra por swap" />
        </Figure>

        <Figure id="figure-bettex-deposit" num="2" title="Como comprar BETTEX usando USDC" lead="O swap usa a Carteira USDC: BETTEX vai para a Carteira BETTEX e o USDC da compra vai para a tesouraria.">
          <Steps steps={fig2} label="USDC disponível, cotação e confirmação do swap, entrega de BETTEX e envio de USDC à tesouraria" />
          <div className="ba-flow ba-flow--treasury">
            <p className="ba-flow__label">Tesouraria BETTEX · reservas do valor recebido</p>
            <div className="ba-entry ba-reserves" data-testid="node-bettex-reserves">
              <div><strong>50% · Reserva defensiva</strong><p>Aplicada em estratégias de baixo risco para gerar yield mensal.</p></div>
              <div><strong>50% · Parcela investível</strong><p>Alocada dinamicamente pelo algoritmo conforme as oportunidades e os limites de risco.</p></div>
            </div>
            <p className="ba-fig__foot">O algoritmo analisa oportunidades em previsões, ações e cripto, esportes e cassinos e distribui a parcela investível conforme as melhores oportunidades identificadas. A alocação é ajustada segundo as análises, sem percentuais fixos por mercado, preservando a reserva defensiva e a aprovação independente de risco.</p>
          </div>
          <p className="ba-fig__foot">100% dos recursos recebidos nas vendas vão à tesouraria de investimentos, sem uso para despesas operacionais do projeto. O USDC pessoal não usado na compra continua separado da tesouraria.</p>
        </Figure>

        <Figure id="figure-bettex-staking" num="3" title="Auto staking na Carteira BETTEX" lead="BETTEX disponível na carteira participa automaticamente. USDC não entra no cálculo do staking.">
          <Steps steps={fig3} label="BETTEX disponível na carteira, auto staking e próxima rodada paga na Carteira USDC" />
          <p className="ba-fig__foot">Se o BETTEX for retirado antes do pagamento, não recebe essa rodada. Se entrar depois, participa da próxima, sem receber rodadas anteriores. Os ganhos são pagos sempre na Carteira USDC, nunca na Carteira BETTEX de staking.</p>
          <p className="ba-fig__foot">A piscina exige acesso ao aplicativo, mas não uma sessão continuamente aberta.</p>
        </Figure>

        <Figure id="figure-bettex-ai-contract" num="4" title="Tesouraria conectada ao agente de IA BETTEX" lead="O smart contract do agente de IA BETTEX conecta a tesouraria às regras de operação e autorização do capital.">
          <Steps steps={fig4} label="Tesouraria BETTEX conectada ao agente de IA por contrato inteligente e suas autorizações" />
          <p className="ba-fig__foot">O smart contract formaliza as regras de acesso e movimentação da tesouraria. As análises, inferências e conexões com plataformas externas são fornecidas pelos serviços e conectores da operação, respeitando essas regras.</p>
        </Figure>

        <Figure id="figure-bettex-risk" num="5" title="Operação da IA e retorno à tesouraria" lead="Tesouraria → IA BETTEX → mercados → tesouraria. O ciclo só executa ordens aprovadas e retorna resultados conciliados.">
          <Steps steps={fig5} label="Capital autorizado da tesouraria, análise e risco, conectores de mercado e retorno à tesouraria" />
          <aside className="ba-side" data-testid="node-allora">
            <span className="ba-side__tag">Entrada opcional, só leitura</span>
            <span className="ba-wordmark ba-wordmark--allora">Allora</span>
            <p>Alimenta apenas a etapa 2, a análise. Sem custódia, sem login, sem execução e sem decidir o risco.</p>
          </aside>
        </Figure>

        <Figure id="figure-bettex-payout" num="6" title="Tesouraria distribui ganhos aos participantes do staking" lead="Do lucro realizado na tesouraria ao crédito em USDC de quem participa com BETTEX na carteira oficial.">
          <Steps steps={fig6} label="Lucro realizado da tesouraria, distribuição aos participantes do staking, crédito pessoal e saque em USDC" />
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
