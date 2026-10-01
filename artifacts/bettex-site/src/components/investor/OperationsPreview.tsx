import './OperationsPreview.css';

const base = import.meta.env.BASE_URL;

const legs = [
  { o: 'Flamengo vence', h: 'BX Bet', odd: '2,50', s: 'R$ 400,00' },
  { o: 'Empate', h: 'NX Bet', odd: '4,00', s: 'R$ 250,00' },
  { o: 'Athletico-PR vence', h: 'BX Exchange', odd: '3,20', s: 'R$ 312,50' },
];

export function OperationsPreview() {
  return (
    <div className="ops">
      <div className="ops__tags"><span>Operações de exemplo</span><span>Plataformas fictícias</span></div>
      <details className="ops__card ops__card--main">
        <summary>
          <span className="ops__top"><b>Surebet</b><em data-s="on">Ativa</em></span>
          <span className="ops__match">
            <img src={`${base}teams/flamengo-enviado.png`} alt="Escudo do Flamengo" width="28" height="28" />
            <b>Flamengo x Athletico-PR</b>
            <img src={`${base}teams/athletico-pr-enviado.png`} alt="Escudo do Athletico Paranaense" width="28" height="28" />
          </span>
          <span className="ops__sum">3 resultados cobertos em BX Bet, NX Bet e BX Exchange · total R$ 962,50</span>
          <span className="ops__more">Ver apostas</span>
        </summary>
        <div className="ops__det">
          {legs.map((l) => <p key={l.o}><span>{l.o}<br />{l.h} · odd {l.odd}</span><b>{l.s}</b></p>)}
          <p><span>Retorno bruto projetado em cada resultado</span><b>R$ 1.000,00</b></p>
          <small>Retorno bruto projetado antes dos custos da operação.</small>
        </div>
      </details>
      <details className="ops__card">
        <summary>
          <span className="ops__top"><b>Mineração de bônus</b><em data-s="ok">Concluída</em></span>
          <span className="ops__sum">BX Game · bônus de R$ 100,00 liberado</span>
          <span className="ops__more">Ver detalhes</span>
        </summary>
        <div className="ops__det">
          <p><span>Análise da oferta</span><b>Regras lidas</b></p>
          <p><span>Condições</span><b>Cumpridas</b></p>
          <p><span>Bônus liberado</span><b>R$ 100,00</b></p>
          <small>Bônus liberado após cumprir as condições da oferta.</small>
        </div>
      </details>
      <details className="ops__card">
        <summary>
          <span className="ops__top"><b>Meme alavancada</b><em data-s="open">Aberta</em></span>
          <span className="ops__sum">BX Exchange · MEME/BRL compra 2x · capital R$ 250,00</span>
          <span className="ops__more">Ver posição</span>
        </summary>
        <div className="ops__det">
          <p><span>Entrada</span><b>R$ 0,50</b></p>
          <p><span>Valor da posição</span><b>R$ 500,00</b></p>
          <p><span>Quantidade</span><b>1.000 MEME</b></p>
          <small>Aguardando o fechamento da posição.</small>
        </div>
      </details>
      <details className="ops__card">
        <summary>
          <span className="ops__top"><b>Previsão</b><em data-s="open">Em aberto</em></span>
          <span className="ops__sum">BX Markets · Juros cairão no próximo anúncio?</span>
          <span className="ops__sum">100 contratos SIM · compra de R$ 60,00</span>
          <span className="ops__more">Ver compra</span>
        </summary>
        <div className="ops__det">
          <p><span>Compra de SIM</span><b>100 contratos</b></p>
          <p><span>Preço por contrato</span><b>R$ 0,60</b></p>
          <p><span>Total investido</span><b>R$ 60,00</b></p>
          <small>Aguardando o resultado do mercado.</small>
        </div>
      </details>
    </div>
  );
}
