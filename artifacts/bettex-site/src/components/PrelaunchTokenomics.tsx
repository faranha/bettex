import { useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { quotePresalePurchase } from '@/lib/presaleQuote';
import { formatTokenCount, tokenomics } from '@/lib/tokenomics';
import './PrelaunchTokenomics.css';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const launchAllocation = tokenomics.publicSaleAllocation - tokenomics.presaleAllocation;

export function PrelaunchTokenomics() {
  const [rawQuantity, setRawQuantity] = useState('1');
  const [status, setStatus] = useState('');
  const [showError, setShowError] = useState(false);
  const quote = quotePresalePurchase(rawQuantity);

  const handlePurchase = () => {
    if (!quote) {
      setShowError(true);
      setStatus(`Informe uma quantidade inteira entre 1 e ${formatTokenCount(tokenomics.presaleAllocation)} tokens.`);
      return;
    }
    setShowError(false);
    setStatus('Em breve. Esta é apenas uma simulação de valor: nenhuma compra ou reserva foi realizada.');
  };

  return (
    <section id="pre-venda" className="prelaunch" aria-labelledby="prelaunch-title">
      <div className="page-wrap prelaunch__wrap">
        <div className="prelaunch__eyebrow">BETTEX / Acesso ao token</div>
        <div className="prelaunch__intro">
          <h2 id="prelaunch-title" className="prelaunch__title">Compre na<br /><span>pré-venda.</span></h2>
          <p className="prelaunch__lede">Entenda a distribuição planejada e simule o valor da pré-venda. A compra ainda não está disponível nesta página.</p>
        </div>

        <div className="prelaunch__rail" aria-label="Resumo da emissão e das ofertas">
          <div className="prelaunch__rail-item">
            <span className="prelaunch__micro">Emissão total</span>
            <p className="prelaunch__rail-number" data-testid="text-emissao-total">{formatTokenCount(tokenomics.totalSupply)}</p>
            <p className="prelaunch__rail-caption">tokens BETTEX planejados</p>
          </div>
          <div className="prelaunch__rail-item">
            <span className="prelaunch__micro">Pré-venda · {formatTokenCount(tokenomics.presaleAllocation)} tokens</span>
            <p className="prelaunch__rail-number" data-testid="text-preco-pre-venda">{money.format(tokenomics.presalePriceBRL)}</p>
            <p className="prelaunch__rail-caption">por token na pré-venda</p>
          </div>
          <div className="prelaunch__rail-item">
            <span className="prelaunch__micro">Oferta de lançamento · {formatTokenCount(launchAllocation)} tokens</span>
            <p className="prelaunch__rail-number" data-testid="text-preco-lancamento">{money.format(tokenomics.priceBRL)}</p>
            <p className="prelaunch__rail-caption">por token no lançamento; referência da demonstração do investidor</p>
          </div>
        </div>

        <div className="prelaunch__body">
          <div>
            <div className="prelaunch__section-head">
              <h3 className="prelaunch__section-title">Como os tokens se dividem</h3>
              <span className="prelaunch__section-index">01—04</span>
            </div>
            <div className="prelaunch__accordion">
              <details className="prelaunch__details" open>
                <summary data-testid="button-tokenomics-publico">
                  <span className="prelaunch__details-number">01</span>
                  <span className="prelaunch__details-name">Venda pública</span>
                  <span className="prelaunch__details-total">50% · {formatTokenCount(tokenomics.publicSaleAllocation)}</span>
                  <span className="prelaunch__details-icon" aria-hidden="true"><Plus size={15} /></span>
                </summary>
                <div className="prelaunch__details-content">
                  <p>Metade da emissão total é destinada ao público. A pré-venda e a oferta de lançamento são duas partes dessa mesma alocação, não emissões adicionais.</p>
                  <div className="prelaunch__split">
                    <div className="prelaunch__split-cell"><span className="prelaunch__micro">Pré-venda</span><strong>{formatTokenCount(tokenomics.presaleAllocation)}</strong><span>{money.format(tokenomics.presalePriceBRL)} por token</span></div>
                    <div className="prelaunch__split-cell"><span className="prelaunch__micro">Lançamento</span><strong>{formatTokenCount(launchAllocation)}</strong><span>{money.format(tokenomics.priceBRL)} por token</span></div>
                  </div>
                </div>
              </details>
              <details className="prelaunch__details">
                <summary data-testid="button-tokenomics-equipe">
                  <span className="prelaunch__details-number">02</span>
                  <span className="prelaunch__details-name">Fundador e equipe</span>
                  <span className="prelaunch__details-total">25% · {formatTokenCount(tokenomics.founderTeamAllocation)}</span>
                  <span className="prelaunch__details-icon" aria-hidden="true"><Plus size={15} /></span>
                </summary>
                <div className="prelaunch__details-content"><p>{formatTokenCount(tokenomics.founderTeamAllocation)} tokens são reservados para o fundador e a equipe. Essa reserva faz parte da emissão total e não da parcela destinada à venda pública.</p></div>
              </details>
              <details className="prelaunch__details">
                <summary data-testid="button-tokenomics-investidores">
                  <span className="prelaunch__details-number">03</span>
                  <span className="prelaunch__details-name">Investidores externos</span>
                  <span className="prelaunch__details-total">25% · {formatTokenCount(tokenomics.externalInvestorAllocation)}</span>
                  <span className="prelaunch__details-icon" aria-hidden="true"><Plus size={15} /></span>
                </summary>
                <div className="prelaunch__details-content"><p>{formatTokenCount(tokenomics.externalInvestorAllocation)} tokens são reservados para investidores externos, rodadas de investimento e capitalização do fundo. Também não integram os {formatTokenCount(tokenomics.publicSaleAllocation)} tokens da venda pública.</p></div>
              </details>
              <details className="prelaunch__details">
                <summary data-testid="button-tokenomics-periodo">
                  <span className="prelaunch__details-number">04</span>
                  <span className="prelaunch__details-name">Período e negociação</span>
                  <span className="prelaunch__details-total">{tokenomics.salePeriodMonths} meses</span>
                  <span className="prelaunch__details-icon" aria-hidden="true"><Plus size={15} /></span>
                </summary>
                <div className="prelaunch__details-content">
                  <p>O período de venda previsto é de {tokenomics.salePeriodMonths} meses, com vesting progressivo. Esta página não informa um calendário detalhado de liberação nem a data de início.</p>
                  <p>A negociação ativa só começa depois que <strong>a pré-venda de {formatTokenCount(tokenomics.presaleAllocation)} tokens e a oferta de lançamento de {formatTokenCount(launchAllocation)} tokens estiverem ambas 100% vendidas.</strong> Não há negociação ativa ou liquidez disponível anunciada nesta página.</p>
                </div>
              </details>
            </div>
          </div>

          <aside className="prelaunch__calculator" aria-labelledby="prelaunch-calculator-title">
            <div className="prelaunch__calculator-top">
              <span className="prelaunch__micro" style={{ color: '#a4eacb' }}>Simulador / pré-venda</span>
              <h3 id="prelaunch-calculator-title" className="prelaunch__calculator-title">Simule o valor<br />da sua compra.</h3>
              <p className="prelaunch__calculator-description">Escolha uma quantidade inteira de tokens para calcular o valor ao preço de pré-venda de {money.format(tokenomics.presalePriceBRL)} cada.</p>
            </div>
            <div className="prelaunch__calculator-main">
              <label className="prelaunch__field-label" htmlFor="prelaunch-quantity">Quantidade de tokens</label>
              <div className="prelaunch__field-row">
                <input
                  id="prelaunch-quantity"
                  data-testid="input-quantidade-pre-venda"
                  className="prelaunch__input number-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  value={rawQuantity}
                  aria-invalid={showError && !quote}
                  aria-describedby="prelaunch-quantity-help"
                  onChange={(event) => { setRawQuantity(event.target.value); setStatus(''); setShowError(false); }}
                />
                <span className="prelaunch__field-unit">tokens</span>
              </div>
              <p id="prelaunch-quantity-help" className={`prelaunch__field-help ${showError && !quote ? 'prelaunch__field-help--error' : ''}`}>
                {showError && !quote ? `Use um número inteiro entre 1 e ${formatTokenCount(tokenomics.presaleAllocation)}.` : `De 1 a ${formatTokenCount(tokenomics.presaleAllocation)} tokens. Isto não indica disponibilidade.`}
              </p>
              <div className="prelaunch__total">
                <span className="prelaunch__micro" style={{ color: '#bdd6c7' }}>Total estimado</span>
                <strong data-testid="text-total-pre-venda" aria-live="polite">{quote ? money.format(quote.totalCents / 100) : '—'}</strong>
              </div>
              <button type="button" data-testid="button-comprar-pre-venda" className="prelaunch__button" onClick={handlePurchase}>Comprar na pré-venda <ArrowUpRight size={19} aria-hidden="true" /></button>
              <p data-testid="status-compra-pre-venda" className="prelaunch__status" role="status" aria-live="polite">{status}</p>
              <p className="prelaunch__fineprint">Prévia informativa. Sem pagamento, reserva de tokens, envio de pedido ou coleta de dados pessoais.</p>
            </div>
          </aside>
        </div>

        <div className="prelaunch__closing">
          <span className="prelaunch__micro">Antes de participar</span>
          <div>
            <p>O preço de <strong>{money.format(tokenomics.presalePriceBRL)}</strong> pertence somente à pré-venda. O preço de <strong>{money.format(tokenomics.priceBRL)}</strong> é o da oferta de lançamento e a referência utilizada na demonstração do investidor acima. <strong>Simular não é comprar.</strong></p>
            <p>A negociação ativa depende de a pré-venda e a oferta de lançamento serem ambas 100% vendidas. Investimentos em mercados de risco podem gerar perdas; preço futuro e liquidez não são garantidos.</p>
          </div>
        </div>
      </div>
    </section>
  );
}