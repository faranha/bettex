import { ServiceFeeTaxes } from '@/components/ServiceFeeTaxes';

export function ServiceFees() {
  return <section id="documentacao-taxas" aria-labelledby="taxas-title">
    <span id="documentacao-burning" aria-hidden="true" />
    <h3 id="taxas-title" className="whitepaper__subhead">Sustentabilidade operacional</h3>
    <div className="whitepaper__prose">
      <p>O mint inicial financia o projeto, enquanto a captação de investidores apoia produto, tecnologia e marketing. A operação precisa de recursos próprios, separados da tesouraria e dos saldos dos usuários.</p>
      <p>Uma contribuição por serviços é apenas uma alternativa possível para sustentar as operações. Não há cobrança definida, valor fixado ou adoção confirmada. Sua viabilidade depende de avaliação jurídica, custos, experiência do usuário e transparência antes de qualquer implementação.</p>
      <p>Se essa alternativa for adotada, condições e valores deverão ser informados previamente. A receita operacional ficará separada do preço dos tokens, do lucro das estratégias e da distribuição aos participantes. Custos externos de rede e de terceiros também deverão ser discriminados.</p>
      <p>Essa possibilidade não altera as quatro destinações do token, o vesting de 24 meses nem os direitos de staking. O demo é apenas visual e não efetua cobranças.</p>
      <p><a href="#documentacao-entidade">Ver a organização da entidade</a> · <a href="#documentacao-financiamento-fundacao">Financiamento: origem e destino dos recursos</a></p>
      <p><a href={`${import.meta.env.BASE_URL}downloads/bettex-taxas-fundacao.xlsx`} download>Planilha de sustentabilidade e vesting</a></p>
    </div>
    <ServiceFeeTaxes />
  </section>;
}
