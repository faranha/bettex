// HISTORICAL, UNMOUNTED SCENARIO: its operator fees are not current BETTEX policy.
// Do not reintroduce this component without reconciling it with replit.md.
import { useMemo, useState } from 'react';
import { getFormatLocale, t, useLocale } from '@/lib/i18n';
import { DEFAULT_LAUNCH_ASSUMPTIONS as D, ILLUSTRATIVE_TOKEN_PRICE_USD, PUBLIC_TOKEN_ALLOCATION, SERVICE_FEE_USD, SETTLEMENT_UNITS_PER_USD, simulateLaunch, type LaunchAssumptions, type LaunchDay } from './launchSimulation';
import './LaunchSimulation.css';
import { LaunchTokenEvolution } from './LaunchTokenEvolution';

type Draft = { m1: string; m2: string; m3: string; ticket: string; price: string; rate: string; rate2: string; rate3: string; cost: string; gross: string; cadence: string };
const DEFAULTS: Draft = {
  m1: String(D.monthlyNewUsers[0]), m2: String(D.monthlyNewUsers[1]), m3: String(D.monthlyNewUsers[2]),
  ticket: String(D.initialPurchaseUsd), rate: String(D.monthlyNetResultPercent), cost: String(D.monthlyOperatorCostUsd),
  gross: String(D.withdrawalGrossUsd), cadence: String(D.withdrawalEveryDays),
  price: String(ILLUSTRATIVE_TOKEN_PRICE_USD), rate2: '-0.5', rate3: '1.5',
};
const num = (s: string) => (/^\s*-?\d+([.,]\d+)?\s*$/.test(s) ? Number(s.trim().replace(',', '.')) : NaN);
const int = (s: string) => (/^\s*\d+\s*$/.test(s) ? Number(s) : NaN);
const CPS = [7, 30, 90] as const;

function validate(d: Draft) {
  const e: Partial<Record<keyof Draft, string>> = {};
  (['m1', 'm2', 'm3'] as const).forEach(k => {
    const v = int(d[k]);
    if (!(v >= 0 && v <= 2000)) e[k] = t('Digite um número inteiro de 0 a 2000.');
  });
  const tk = num(d.ticket);
  if (!(tk >= 0 && tk <= 10000)) e.ticket = t('Digite um valor de 0 a 10000.');
  (['rate', 'rate2', 'rate3'] as const).forEach(k => {
    const r = num(d[k]);
    if (!(r >= -100 && r <= 100)) e[k] = t('Digite um percentual de -100 a 100.');
  });
  const price = num(d.price);
  if (!(price > 0 && price <= 10000)) e.price = t('Digite um preço maior que zero e até 10000 USDC.');
  const projectedTokens = (int(d.m1) + int(d.m2) + int(d.m3)) * tk / price;
  if (!e.price && projectedTokens > PUBLIC_TOKEN_ALLOCATION) e.price = t('Este cenário excede os 550 milhões de tokens da comunidade. Aumente o preço ou reduza as compras.');
  const c = num(d.cost);
  if (!(c >= 0 && c <= 100000)) e.cost = t('Digite um valor de 0 a 100000.');
  const g = num(d.gross);
  if (!(g > SERVICE_FEE_USD)) e.gross = t('Digite um valor maior que a taxa de 2,50 USD.');
  if (!['1', '7', '30'].includes(d.cadence)) e.cadence = t('Escolha 1, 7 ou 30 dias.');
  return e;
}

export function LaunchSimulation() {
  useLocale();
  const loc = getFormatLocale();
  const [d, setD] = useState<Draft>(DEFAULTS);
  const [cp, setCp] = useState<7 | 30 | 90>(90);
  const errors = useMemo(() => validate(d), [d, loc]);
  const valid = Object.keys(errors).length === 0;

  const days: LaunchDay[] | null = useMemo(() => {
    if (!valid) return null;
    const a: LaunchAssumptions = {
      monthlyNewUsers: [int(d.m1), int(d.m2), int(d.m3)],
      initialPurchaseUsd: num(d.ticket), monthlyNetResultPercent: num(d.rate), monthlyOperatorCostUsd: num(d.cost),
      withdrawalEveryDays: Number(d.cadence) as 1 | 7 | 30, withdrawalGrossUsd: num(d.gross),
      tokenPriceUsd: num(d.price), monthlyNetResultPercents: [num(d.rate), num(d.rate2), num(d.rate3)],
    };
    return simulateLaunch(a);
  }, [d, valid]);

  const n = (v: number, max = 0) => new Intl.NumberFormat(loc, { maximumFractionDigits: max }).format(v);
  const usd = (v: number, max = 2) => new Intl.NumberFormat(loc, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: max }).format(v);
  const set = (k: keyof Draft) => (v: string) => setD(p => ({ ...p, [k]: v }));

  const field = (k: keyof Draft, label: string, step: string, hint?: string) => (
    <div className="ls__field" key={k}>
      <label htmlFor={`ls-${k}`}>{label}</label>
      <input id={`ls-${k}`} data-testid={`input-launch-${k}`} type="text" inputMode="decimal" value={d[k]}
        aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `ls-${k}-err` : undefined}
        onChange={ev => set(k)(ev.target.value)} data-step={step} />
      {hint && !errors[k] && <small>{hint}</small>}
      {errors[k] && <em id={`ls-${k}-err`} role="alert" data-testid={`error-launch-${k}`}>{errors[k]}</em>}
    </div>
  );

  const row = days ? days[cp - 1] : null;
  const first = days ? days[0] : null;
  const ticket = num(d.ticket);
  const price = num(d.price);
  const rate = num(d.rate);
  const months = [int(d.m1), int(d.m2), int(d.m3)];
  let acc = 0;
  const stages = months.map(v => { acc += v; return { v, cum: acc, sales: acc * ticket }; });

  const metrics: { label: string; get: (x: LaunchDay) => string; strong?: boolean }[] = days ? [
    { label: t('Usuários acumulados'), get: x => n(x.users) },
    { label: t('Usuários-dia de exposição'), get: x => n(x.userDays) },
    { label: t('Vendas de tokens'), get: x => usd(x.purchasesUsd) },
    { label: t('BETTEX vendidos (quantidade)'), get: x => n(x.tokensSold, 6) },
    { label: t('BETTEX em auto staking'), get: x => n(x.tokensInStaking, 6) },
    { label: t('Desembolso dos compradores (tokens + tarifas)'), get: x => usd(x.purchasesUsd + x.purchaseFeesUsd) },
    { label: t('Movimentação dos usuários'), get: x => usd(x.userMovementUsd) },
    { label: t('Taxas de compra'), get: x => usd(x.purchaseFeesUsd) },
    { label: t('Saques desejados (tentativas)'), get: x => n(x.requestedWithdrawals) },
    { label: t('Saques viáveis concluídos'), get: x => n(x.completedWithdrawals) },
    { label: t('Taxas de saque efetivas'), get: x => usd(x.withdrawalFeesUsd) },
    { label: t('Custo do operador'), get: x => usd(x.operatorCostUsd) },
    { label: t('Resultado operacional estimado'), get: x => usd(x.operatorResultBeforeTaxUsd), strong: true },
    { label: t('Caixa adicional necessário para a operadora'), get: x => usd(x.operatorFundingGapUsd) },
    { label: t('Resultado líquido da estratégia'), get: x => usd(x.treasuryProfitUsd), strong: true },
    { label: t('Ganhos das rodadas positivas'), get: x => usd(x.treasuryGainsUsd) },
    { label: t('Perdas das rodadas negativas'), get: x => usd(x.treasuryLossesUsd) },
    { label: t('Pagamento por BETTEX na última rodada (USDC)'), get: x => n(x.perTokenPaidTodayUsd, 10) },
    { label: t('Pool nominal dos stakers (25%)'), get: x => usd(x.nominalStakerPoolUsd, 4) },
    { label: t('Créditos efetivamente liquidados'), get: x => usd(x.stakerPaidUsd) },
    { label: t('Frações devolvidas à tesouraria'), get: x => usd(x.fractionsReturnedUsd, 4) },
    { label: t('Reserva de recompra (25%)'), get: x => usd(x.buybackReserveUsd) },
    { label: t('USDC já liquidado nas carteiras dos usuários'), get: x => usd(x.userWalletsUsd, 4) },
    { label: t('Saques brutos concluídos'), get: x => usd(x.withdrawalsGrossUsd) },
    { label: t('USDC recebido líquido nos saques'), get: x => usd(x.withdrawalsNetUsd) },
    { label: t('Saldo final de trading da tesouraria'), get: x => usd(x.treasuryTradingBalanceUsd), strong: true },
  ] : [];

  const lastDelta = days && row ? row.nominalStakerPoolUsd - (cp > 1 ? days[cp - 2].nominalStakerPoolUsd : 0) : 0;
  const perPersonLast = row && row.users > 0 ? lastDelta / row.users : 0;
  const gross = num(d.gross);
  const dailyDay1 = first ? first.treasuryProfitUsd : 0;
  const pool1 = Math.max(0, dailyDay1) * 0.25;
  const per1 = first && first.users > 0 ? pool1 / first.users : 0;
  const noPay = row ? row.completedWithdrawals === 0 : false;

  return (
    <section id="simulacao-lancamento" data-testid="launch-simulation" className="ls">
      <header className="ls__head">
        <span className="ls__kicker">{t('Simulação de lançamento · sem aporte anjo')}</span>
        <h3>{t('Go to market em 90 dias: quanto entra, quanto sobra e quanto é pago')}</h3>
        <p>{t('Ponto de partida: 200 / 400 / 400 novos usuários, compra de 50 USDC e preço ilustrativo de 0,10 USDC por BETTEX. Resultados mensais hipotéticos: +1%, −0,5% e +1,5%; custo operacional de US$ 300/mês.')}</p>
        <p>{t('Não é desempenho observado nem retorno prometido. A tarifa de serviço é US$ 2,50; o resultado da estratégia e o custo operacional são hipóteses.')}</p>
      </header>

      <details className="ls__controls" data-testid="launch-controls">
        <summary>{t('Editar as premissas da simulação')}</summary>
        <fieldset>
          <legend>{t('Premissas')}</legend>
          <div className="ls__grid">
            {field('m1', t('Novos usuários no mês 1'), '1')}
            {field('m2', t('Novos usuários no mês 2'), '1')}
            {field('m3', t('Novos usuários no mês 3'), '1')}
            {field('ticket', t('Primeira compra por pessoa (USD)'), '1')}
            {field('price', t('Preço ilustrativo por BETTEX (USDC)'), '0.01', t('Preço fixo ilustrativo, não uma cotação de mercado.'))}
            {field('rate', t('Resultado líquido no mês 1 (%)'), '0.5', t('Já depois dos custos da estratégia.'))}
            {field('rate2', t('Resultado líquido no mês 2 (%)'), '0.5')}
            {field('rate3', t('Resultado líquido no mês 3 (%)'), '0.5')}
            {field('cost', t('Custo mensal do operador (USD)'), '1')}
            {field('gross', t('Saque bruto desejado (USD)'), '0.5', t('Precisa ser maior que a taxa de 2,50 USD.'))}
            <div className="ls__field">
              <label htmlFor="ls-cadence">{t('Frequência das tentativas de saque')}</label>
              <select id="ls-cadence" data-testid="select-launch-cadence" value={d.cadence} onChange={ev => set('cadence')(ev.target.value)}>
                <option value="1">{t('A cada 1 dia')}</option>
                <option value="7">{t('A cada 7 dias')}</option>
                <option value="30">{t('A cada 30 dias')}</option>
              </select>
            </div>
          </div>
        </fieldset>
        <button type="button" className="ls__reset" data-testid="button-launch-reset" onClick={() => setD(DEFAULTS)}>{t('Restaurar padrão')}</button>
      </details>

      {!valid && (
        <div className="ls__invalid" role="alert" data-testid="launch-invalid">
          <b>{t('Há campos inválidos.')}</b> {t('Corrija os valores marcados para ver os resultados. Nada foi ajustado automaticamente.')}
        </div>
      )}

      {days && row && first && (
        <>
          <div className="ls__block">
            <h4>{t('Estágios de crescimento')}</h4>
            <div className="ls__scroll" role="region" aria-label={t('Estágios de crescimento')} tabIndex={0}>
              <table data-testid="table-launch-stages">
                <thead><tr><th>{t('Mês')}</th><th>{t('Novos compradores')}</th><th>{t('Compradores acumulados')}</th><th>{t('Vendas acumuladas')}</th></tr></thead>
                <tbody>
                  {stages.map((s, i) => (
                    <tr key={i}><th>{t('Mês')} {i + 1}</th><td>{n(s.v)}</td><td>{n(s.cum)}</td><td>{usd(s.sales)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ls__block">
            <div className="ls__cphead">
              <h4>{t('Resultado acumulado até o dia')}</h4>
              <div className="ls__cps" role="group" aria-label={t('Ponto de verificação acumulado')}>
                {CPS.map(c => (
                  <button key={c} type="button" aria-pressed={cp === c} data-testid={`button-launch-day-${c}`} onClick={() => setCp(c)}>{c}</button>
                ))}
              </div>
            </div>
            <dl className="ls__keys" data-testid="launch-key-numbers">
              <div><dt>{t('Usuários ativos')}</dt><dd>{n(row.users)}</dd></div>
              <div><dt>{t('Vendas de tokens')}</dt><dd>{usd(row.purchasesUsd)}</dd></div>
              <div><dt>{t('Receita de taxas')}</dt><dd>{usd(row.operatorRevenueUsd)}</dd></div>
              <div className="ls__gold"><dt>{t('Resultado operacional estimado')}</dt><dd>{usd(row.operatorResultBeforeTaxUsd)}</dd></div>
              <div className="ls__blue"><dt>{t('Resultado líquido da estratégia (tesouraria)')}</dt><dd>{usd(row.treasuryProfitUsd)}</dd></div>
            </dl>
            <p className="ls__sep">{t('Os dois resultados são separados e não devem ser somados: o do operador vem de taxas, o da tesouraria vem da estratégia.')}</p>
            {row.operatorFundingGapUsd > 0 && <p className="ls__gap" role="status">{t('As tarifas não cobrem os custos neste cenário. Caixa operacional adicional necessário:')}{' '}<strong>{usd(row.operatorFundingGapUsd)}</strong>. {t('Esse dinheiro não foi incluído como aporte nem retirado da tesouraria.')}</p>}
          </div>

          <LaunchTokenEvolution days={days} checkpoint={cp} tokenPriceUsd={price} purchaseUsd={ticket} />

          <div className="ls__block ls__honest" data-testid="launch-honesty">
            <h4>{t('Desejo de saque não é saque viável')}</h4>
            <p>
              {t('Tentativas de saque')}: <b>{n(row.requestedWithdrawals)}</b> · {t('Saques viáveis concluídos')}: <b>{n(row.completedWithdrawals)}</b> · {t('Taxas de saque efetivas')}: <b>{usd(row.withdrawalFeesUsd)}</b>
            </p>
            {noPay ? (
              <p>{t('Nenhuma carteira atingiu o saldo necessário para o saque desejado neste período. Ser ativo e tentar sacar não cria dinheiro disponível: não há saque concluído nem tarifa de saque a faturar.')}</p>
            ) : (
              <p>{t('Parte dos usuários tem USDC já liquidado suficiente para sacar. Só os saques efetivamente concluídos geram tarifa.')}</p>
            )}
            <p className="ls__mono">
              {first.users > 0 ? <>{usd(pool1, 6)} ÷ {n(first.users)} = {usd(per1, 6)} → {usd(Math.floor(per1 * SETTLEMENT_UNITS_PER_USD + 1e-10) / SETTLEMENT_UNITS_PER_USD, 6)}</> : t('Sem compradores no primeiro dia: não há rateio.')}
            </p>
            <small>{t('Exemplo do dia 1: pagamento ajustado para baixo na unidade de 0,000001 USDC assumida pelo modelo; a fração não executável volta à tesouraria.')}</small>
          </div>

          <div className="ls__block ls__math" data-testid="launch-math">
            <h4>{t('A matemática do cenário')}</h4>
            <ol>
              <li><span>{t('Vendas de tokens = usuários × valor da compra')}</span><code>{n(row.users)} × {usd(ticket)} = {usd(row.purchasesUsd)}</code></li>
              <li><span>{t('BETTEX vendidos = USDC das compras ÷ preço por token')}</span><code data-i18n="raw">{n(row.purchasesUsd, 2)} ÷ {n(price, 6)} = {n(row.tokensSold, 6)} BETTEX</code></li>
              <li><span>{t('Auto staking: todos os tokens vendidos permanecem elegíveis neste exemplo')}</span><code data-i18n="raw">{n(row.tokensInStaking, 6)} BETTEX</code></li>
              <li><span>{t('Taxas de compra = usuários × taxa de serviço')}</span><code>{n(row.users)} × {usd(SERVICE_FEE_USD)} = {usd(row.purchaseFeesUsd)}</code></li>
              <li><span>{t('Taxas de saque = saques viáveis × taxa de serviço')}</span><code>{n(row.completedWithdrawals)} × {usd(SERVICE_FEE_USD)} = {usd(row.withdrawalFeesUsd)}</code></li>
              <li><span>{t('Resultado do operador = receita de taxas − custo do operador')}</span><code>{usd(row.operatorRevenueUsd)} − {usd(row.operatorCostUsd)} = {usd(row.operatorResultBeforeTaxUsd)}</code></li>
              <li><span>{t('Resultado diário da estratégia = capital no início do dia × % líquido mensal ÷ 30 (exemplo: dia 1)')}</span><code>{usd(first.newUsers * ticket)} × {n(rate, 2)}% ÷ 30 = {usd(dailyDay1, 4)}</code></li>
              <li><span>{t('Resultado acumulado da tesouraria = ganhos das rodadas positivas − perdas das rodadas negativas')}</span><code>{usd(row.treasuryGainsUsd)} − {usd(row.treasuryLossesUsd)} = {usd(row.treasuryProfitUsd)}</code></li>
              <li><span>{t('Split do lucro positivo: 50% tesouraria / 25% stakers / 25% recompra')}</span><code>{usd(row.treasuryRetainedUsd)} / {usd(row.nominalStakerPoolUsd)} / {usd(row.buybackReserveUsd)}</code></li>
              <li><span>{t('Exposição total = soma dos usuários ativos de cada dia')}</span><code>{n(row.userDays)} {t('usuários-dia')}</code></li>
              <li><span>{t('Pool diário dos stakers por pessoa no último dia do ponto')}</span><code>{row.users > 0 ? <>{usd(lastDelta, 6)} ÷ {n(row.users)} = {usd(perPersonLast, 6)}</> : t('Sem usuários elegíveis: não há rateio.')}</code></li>
              <li><span>{t('Pagamento efetivo por BETTEX = USDC liquidado na rodada ÷ tokens elegíveis')}</span><code data-i18n="raw">{row.tokensInStaking > 0 ? <>{n(row.dailyStakerPaidUsd, 6)} ÷ {n(row.tokensInStaking, 6)} = {n(row.perTokenPaidTodayUsd, 10)} USDC/BETTEX</> : t('Sem usuários elegíveis: não há rateio.')}</code></li>
              <li><span>{t('Tentativas de saque × valor desejado = dinheiro necessário, não movimentação realizada')}</span><code>{n(row.requestedWithdrawals)} × {usd(gross)} = {usd(row.requestedWithdrawals * gross)}</code></li>
              <li><span>{t('Saque desejado por tentativa')}</span><code>{usd(gross)} − {usd(SERVICE_FEE_USD)} = {usd(gross - SERVICE_FEE_USD)}</code></li>
            </ol>
          </div>

          <div className="ls__block">
            <h4>{t('Comparação 7 / 30 / 90 dias (acumulado)')}</h4>
            <div className="ls__scroll" role="region" aria-label={t('Comparação acumulada da simulação')} tabIndex={0}>
              <table data-testid="table-launch-compare">
                <thead><tr><th>{t('Métrica')}</th>{CPS.map(c => <th key={c}>{c} {t('dias')}</th>)}</tr></thead>
                <tbody>
                  {metrics.map(m => (
                    <tr key={m.label} className={m.strong ? 'is-strong' : undefined}>
                      <th>{m.label}</th>{CPS.map(c => <td key={c}>{m.get(days[c - 1])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <details className="ls__block ls__method" data-testid="launch-methodology">
        <summary>{t('Metodologia e limites')}</summary>
        <ul>
          <li>{t('Pontos acumulados em 7, 30 e 90 dias, com meses de 30 dias.')}</li>
          <li>{t('Entradas inteiras distribuídas de forma uniforme nos dias do mês; o dinheiro da entrada fica disponível no início do dia.')}</li>
          <li>{t('Todos os usuários ficam ativos, sem saída, bloqueio ou restrição de reserva neste exemplo simplificado.')}</li>
          <li>{t('Preço do token estável, compras iguais, uma por usuário; apenas esses compradores têm peso elegível.')}</li>
          <li>{t('Todos os BETTEX vendidos permanecem disponíveis em auto staking. Cada token tem o mesmo tempo elegível dentro da rodada diária, com entradas no início do dia. Estoque não vendido e tokens de outros titulares não participam desta simulação.')}</li>
          <li>{t('As rodadas positivas pressupõem reservas atendidas; o exemplo não modela bloqueios, recomposição de reservas nem operações reais. Os tokens vendidos são assumidos disponíveis conforme o vesting, sem antecipar liberações.')}</li>
          <li>{t('O preço por BETTEX é apenas uma hipótese de conversão entre compras e quantidade de tokens. Alterá-lo recalcula quantidades e pagamentos por token, sem simular valorização ou lucro de revenda.')}</li>
          <li>{t('Outros detentores elegíveis diluiriam o pool e não são modelados.')}</li>
          <li>{t('Unidade executável assumida: 0,000001 USDC. Confirmar a precisão do ativo e do conector antes de qualquer operação real. Frações não executáveis voltam à tesouraria na mesma rodada, sem acumulação entre rodadas.')}</li>
          <li>{t('Saldo em USDC na carteira é dinheiro já liquidado e pode ser guardado para saque; lucro não pago não é crédito a receber.')}</li>
          <li>{t('A taxa líquida da estratégia já desconta os custos da estratégia. Custos operacionais são separados e acumulam por dia.')}</li>
          <li>{t('Resultado negativo reduz o capital de forma permanente e não financia distribuição nem recompra.')}</li>
          <li>{t('Os outros 25% do lucro ficam reservados para recompra, ainda não executada; não simulamos valorização nem queima.')}</li>
          <li>{t('Sem compras recorrentes extras, transferências ou dinheiro externo.')}</li>
          <li>{t('Sem financiamento anjo não significa sem custos de operação.')}</li>
          <li>{t('A movimentação soma compras primárias e saques brutos concluídos, sem contar tarifas duas vezes. As compras de tokens são capital da tesouraria, não receita da operadora.')}</li>
          <li>{t('O resultado operacional ilustrativo desconta apenas o custo informado. No ALFA, a previsão pública contempla apenas taxas de rede; o demo não cobra.')}</li>
          <li>{t('A taxa mensal é nominal, dividida por 30 e aplicada ao saldo disponível de cada dia. A retenção reinvestida altera esse saldo; perdas reduzem a base dos dias seguintes.')}</li>
          <li>{t('Hipóteses simplificadas de resultados e custos; não representam liquidez real nem autorização regulatória.')}</li>
        </ul>
      </details>
    </section>
  );
}

export default LaunchSimulation;
