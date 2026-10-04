import { CircleDollarSign, Flame, ArrowRight } from 'lucide-react';
import './TokenValueMechanisms.css';

export function TokenValueMechanisms() {
  return <section id="real-yield-recompra" className="tvm" aria-labelledby="tvm-title">
    <span className="mono tvm__kicker">Dois mecanismos para o titular</span>
    <h3 id="tvm-title" className="display">Real yield e recompra com queima.</h3>
    <div className="tvm__mechanisms">
      <article>
        <CircleDollarSign className="tvm__icon tvm__icon--yield" aria-hidden="true" />
        <span className="mono tvm__share">25% para os stakers</span>
        <h4 className="display">Lucro real, distribuído em USDC.</h4>
        <p>25% do lucro elegível compõem o pool global dos stakers, rateado pelo peso elegível de cada participante. É participação nos resultados das estratégias, não rendimento criado pela emissão de novos tokens.</p>
      </article>
      <article className="tvm__burn">
        <Flame className="tvm__icon tvm__icon--burn" aria-hidden="true" />
        <span className="mono tvm__share">25% para recompra e queima</span>
        <h4 className="display">Recomprar. Queimar. Reduzir a oferta.</h4>
        <p>Outros 25% do lucro elegível vão à carteira exclusiva de recompra. A administração autoriza a compra de BETTEX no mercado; todos os tokens adquiridos são queimados permanentemente, reduzindo a oferta existente.</p>
        <div className="tvm__steps">
          <span>USDC da recompra</span><ArrowRight aria-hidden="true" /><span>Compra de BETTEX</span><ArrowRight aria-hidden="true" /><span className="tvm__step-burn"><Flame aria-hidden="true" />Queima permanente</span>
        </div>
        <p>Recompras geram demanda pelo token; a queima reduz sua oferta. Esse mecanismo busca favorecer a valorização para os holders, mas não garante aumento de preço: demanda e liquidez também influenciam o mercado.</p>
      </article>
    </div>
    <p className="tvm__conditions">Os outros 50% permanecem na tesouraria. O split depende de lucro elegível, peso elegível, reserva e liquidez; não é uma taxa de retorno individual. O saldo de recompra não utilizado acumula para futuras compras autorizadas, sem reabrir rodadas de distribuição.</p>
  </section>;
}