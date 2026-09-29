import "./HeroNetwork.css";

const agents = [
  { name: "PREDIX", number: "01", image: "predix", status: "Em operação", position: "predix", pending: false },
  { name: "TRADIX", number: "02", image: "tradix", status: "Em operação", position: "tradix", pending: false },
  { name: "SPORTIX", number: "03", image: "sportix", status: "Em desenvolvimento", position: "sportix", pending: true },
  { name: "BETTIX", number: "04", image: "bettix", status: "Em desenvolvimento", position: "bettix", pending: true },
] as const;

const connections = [
  { path: "M 320 325 L 430 405", start: [320, 325], end: [430, 405], pending: false },
  { path: "M 680 325 L 570 405", start: [680, 325], end: [570, 405], pending: false },
  { path: "M 430 595 L 320 675", start: [430, 595], end: [320, 675], pending: true },
  { path: "M 570 595 L 680 675", start: [570, 595], end: [680, 675], pending: true },
] as const;

export function HeroNetwork() {
  return (
    <figure
      className="hero-network"
      aria-label="BETTEX, IA orquestradora conectada aos agentes PREDIX e TRADIX em operação, SPORTIX e BETTIX em desenvolvimento"
      data-testid="diagram-bettex-agent-network"
    >
      <div className="hero-network__orbit" aria-hidden="true" />

      <svg
        className="hero-network__wires"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {connections.map((connection, index) => (
          <g key={index}>
            <path className="hero-network__wire-back" d={connection.path} />
            <path
              className={`hero-network__wire${connection.pending ? " hero-network__wire--pending" : ""}`}
              d={connection.path}
            />
            {[connection.start, connection.end].map(([x, y], portIndex) => (
              <g key={portIndex}>
                <circle
                  className={`hero-network__port-outer${connection.pending ? " hero-network__port-outer--pending" : ""}`}
                  cx={x}
                  cy={y}
                  r="9"
                />
                <circle
                  className={`hero-network__port-inner${connection.pending ? " hero-network__port-inner--pending" : ""}`}
                  cx={x}
                  cy={y}
                  r="3"
                />
              </g>
            ))}
          </g>
        ))}
      </svg>

      {agents.map((agent) => (
        <div
          className={`hero-network__agent hero-network__agent--${agent.position}${agent.pending ? " hero-network__agent--pending" : ""}`}
          key={agent.name}
          data-testid={`card-agent-${agent.image}`}
        >
          <img
            className="hero-network__agent-image"
            src={`${import.meta.env.BASE_URL}agents/${agent.image}.webp`}
            alt=""
            loading="eager"
            decoding="async"
          />
          <span className="hero-network__agent-top">AGENTE {agent.number}</span>
          <div className="hero-network__agent-info">
            <strong className="hero-network__agent-name">{agent.name}</strong>
            <span className="hero-network__status" data-testid={`status-agent-${agent.image}`}>
              {agent.status}
            </span>
          </div>
        </div>
      ))}

      <div className="hero-network__core" data-testid="card-bettex-orchestrator">
        <div className="hero-network__core-mark" aria-hidden="true"><span /><span /><span /></div>
        <strong className="hero-network__core-name">BETTEX<span>.</span></strong>
        <span className="hero-network__core-role">IA orquestradora</span>
      </div>
    </figure>
  );
}

export default HeroNetwork;