import { ArrowDown, ArrowRight, Bot, Coins, Landmark, Layers, Repeat2, Wallet } from 'lucide-react';
import './HomeParticipationLogic.css';

const steps = [
  { n: '01', icon: Wallet, title: 'Carteira USDC', text: 'Recebe depósitos cripto e é usada para comprar BETTEX.' },
  { n: '02', icon: Coins, title: 'Carteira BETTEX', text: 'Guarda os seus tokens. Cada token na carteira oficial participa automaticamente, sem ativação.' },
  { n: '03', icon: Bot, title: 'Agente cripto', text: 'Um único agente, financiado pela tesouraria, opera contra a manipulação do mercado.' },
  { n: '04', icon: Layers, title: 'Lucro líquido distribuível', text: 'Após custos e obrigações, o lucro efetivo é repartido entre três destinos.' },
  { n: '05', icon: Wallet, title: 'Crédito em USDC', text: 'A parte dos participantes é creditada na Carteira USDC, sem vender BETTEX.' },
  { n: '06', icon: Repeat2, title: 'Saque ou reconversão', text: 'O USDC pode ser sacado ou convertido de volta em BETTEX.' },
];

const split = [
  { pct: '50%', label: 'Tesouraria', text: 'Retenção e reinvestimento.' },
  { pct: '25%', label: 'Participantes', text: 'Rateio pelos participantes elegíveis.', hot: true },
  { pct: '25%', label: 'Recompra', text: 'Carteira exclusiva de recompra; todo BETTEX adquirido é queimado.' },
];

export function HomeParticipationLogic() {
  return (
    <div className="hpl" data-testid="diagram-participation-logic">
      <div className="hpl-intro">
        <h3 className="hpl-h">Como a participação funciona</h3>
        <p>O saldo de BETTEX é a sua elegibilidade para participar do lucro global. Você não escolhe operações nem financia trades: quem opera é o agente, com o capital da tesouraria.</p>
      </div>
      <ol className="hpl-path" aria-label="Caminho da participação, da Carteira USDC ao saque ou reconversão">
        {steps.map((s, i) => (
          <li key={s.n} className="hpl-node">
            <span className="hpl-node__n">{s.n}</span>
            <span className="hpl-node__ic" aria-hidden="true"><s.icon size={22} strokeWidth={1.7} /></span>
            <h4>{s.title}</h4>
            <p>{s.text}</p>
            {i < steps.length - 1 && <span className="hpl-node__arrow" aria-hidden="true"><ArrowRight size={18} className="hpl-r" /><ArrowDown size={18} className="hpl-d" /></span>}
          </li>
        ))}
      </ol>

      <div className="hpl-split" role="group" aria-label="Divisão do lucro líquido distribuível: 50% tesouraria, 25% participantes, 25% recompra">
        <div className="hpl-split__src"><Landmark size={20} aria-hidden="true" /><span>Lucro líquido distribuível</span></div>
        <div className="hpl-split__blocks">
          {split.map((b) => (
            <div key={b.label} className={b.hot ? 'hpl-block hpl-block--hot' : 'hpl-block'}>
              <strong>{b.pct}</strong><span>{b.label}</span><small>{b.text}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="hpl-two">
        <div className="hpl-card">
          <h4>Fluxo de participação</h4>
          <p>O saldo de BETTEX define apenas a elegibilidade. Ele não é capital transferido para o motor de operações e não dá direito de resgate sobre a tesouraria nem liquidez de venda garantida.</p>
        </div>
        <div className="hpl-card hpl-card--alt">
          <h4>Fluxo do capital de operação</h4>
          <p>O agente opera com recursos da tesouraria. Nenhum participante financia individualmente as operações escolhidas.</p>
        </div>
        <div className="hpl-card">
          <h4>Token e USDC têm funções diferentes</h4>
          <p>A Carteira BETTEX guarda os tokens que dão participação. A Carteira USDC recebe depósitos, serve para compras e recebe os créditos de lucro. Receber lucro não consome nem vende seus tokens.</p>
        </div>
        <div className="hpl-card hpl-card--alt">
          <h4>Rodadas diárias independentes</h4>
          <p>Cada rodada dura 24 horas e é independente. Quem entra durante uma rodada espera a próxima.</p>
        </div>
      </div>

      <details className="hpl-details">
        <summary>Regras de elegibilidade</summary>
        <ul>
          <li>Qualquer saída de BETTEX, mesmo parcial, cancela os créditos ainda não pagos.</li>
          <li>Rodadas encerradas sem pagamento não acumulam lucros para o futuro.</li>
          <li>Sem lucro elegível, não há distribuição, e os resultados não são garantidos.</li>
          <li>O USDC já recebido continua sendo seu.</li>
        </ul>
        <a href="#participacao" className="hpl-link">Ver o passo a passo da participação</a>
      </details>
    </div>
  );
}
