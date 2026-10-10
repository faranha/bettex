import { type ReactNode } from 'react';
import './doc-schematics.css';

type Tone = 'blue' | 'gold' | 'teal' | 'plain';
interface Nd { t: string; s?: string; tone?: Tone; tag?: string }

function Arrow() {
  return <svg className="ds-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Node({ n, number }: { n: Nd; number?: number }) {
  return <div className={`ds-node ds-node--${n.tone ?? 'blue'}`}>
    {number !== undefined && <span className="ds-node__n" aria-hidden="true">{number}</span>}
    {n.tag && <em>{n.tag}</em>}
    <strong>{n.t}</strong>
    {n.s && <p>{n.s}</p>}
  </div>;
}

function Flow({ nodes, label }: { nodes: Nd[]; label?: string }) {
  return <ol className="ds-flow" aria-label={label} style={{ ['--n' as string]: nodes.length }}>
    {nodes.map((n, i) => <li key={n.t}><Node n={n} number={i + 1} />{i < nodes.length - 1 && <Arrow />}</li>)}
  </ol>;
}

function Fork({ from, to }: { from: Nd; to: Nd[] }) {
  return <div className="ds-fork">
    <div className="ds-fork__src"><Node n={from} /></div>
    <ul className="ds-fork__out">{to.map((n) => <li key={n.t}><Node n={n} /></li>)}</ul>
  </div>;
}

function Lane({ label, children }: { label: string; children: ReactNode }) {
  return <div className="ds-lane"><p className="ds-lane__label">{label}</p>{children}</div>;
}

function Schematic({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const descriptions: Record<string, string> = {
    'schematic-cycle': 'Da compra à participação e ao recebimento líquido confirmado.',
    'schematic-asset-roles': 'USDC movimenta valor financeiro; BETTEX define a participação.',
    'schematic-wallet-access': 'Controle pessoal das chaves e acesso ao aplicativo são camadas distintas.',
    'schematic-staking': 'Quantidade e tempo definem o peso da própria rodada; saídas cancelam direitos.',
    'schematic-boundaries': 'Destinos separados para preço público, serviços, staking e recompra com burn.',
    'schematic-orchestration': 'Dados e inferências entram na análise; risco e mandato precedem ordens.',
    'schematic-mandate': 'Rotina autorizada segue risco independente; mudança de poderes exige nova aprovação.',
    'schematic-governance': 'Proposta, teste, aprovação, espera e versão vigente delimitam a execução.',
    'schematic-buyback': 'Parcela do resultado financia compras autorizadas; tokens recebidos são queimados.',
    'schematic-vesting': 'A liberação mensal não representa automaticamente venda ou circulação.',
    'schematic-allocation': 'Quatro destinações: mint inicial separado da comunidade, fundador/equipe e investidores.',
    'schematic-risk-authorization': 'Mandato, avaliação, reserva e liquidez precisam passar antes do envio.',
    'schematic-fees': 'Cada serviço tem fato gerador e pagamento separado do preço dos tokens.',
    'schematic-allora': 'Inferência é insumo de análise, não permissão para movimentar carteira.',
  };
  return <figure className="ds" id={id} data-testid={id} aria-labelledby={`${id}-t`}>
    <figcaption className="ds__cap"><span>Esquema</span><b id={`${id}-t`}>{title}</b><p>{descriptions[id] ?? title}</p></figcaption>
    {children}
  </figure>;
}

export function InvestmentCycleSchematic() {
  return <Schematic id="schematic-cycle" title="Ciclo do investimento">
    <Flow label="Ciclo do investimento" nodes={[
      { t: 'Carteira USDC', s: 'Compra BETTEX com USDC', tone: 'blue' },
      { t: 'BETTEX na carteira', s: 'Participa automaticamente', tone: 'gold' },
      { t: 'Tesouraria e agentes', s: 'Investem nos quatro mercados', tone: 'blue' },
      { t: 'Lucro da própria rodada', s: 'Após custos e tributos resolvidos, sujeito aos controles', tone: 'teal' },
      { t: 'Crédito em USDC', s: 'Líquido após retenções aplicáveis; recebimento confirmado', tone: 'teal' },
    ]} />
    <p className="ds-loop">Agentes e apuração seguem as rodadas diárias UTC</p>
  </Schematic>;
}

export function AssetRolesSchematic() {
  return <Schematic id="schematic-asset-roles" title="Papéis dos ativos">
    <Fork from={{ t: 'USDC', s: 'Ativo financeiro', tone: 'blue' }} to={[
      { t: 'Saldos e compras', tone: 'blue' },
      { t: 'Distribuições e saques', tone: 'teal' },
      { t: 'Taxas de serviço pagas em USDC', tone: 'gold' },
    ]} />
    <Fork from={{ t: 'BETTEX', s: 'Token de participação', tone: 'gold' }} to={[
      { t: 'Participação automática no staking', tone: 'gold' },
      { t: 'Não paga taxas nem é capital das estratégias', tone: 'plain' },
    ]} />
  </Schematic>;
}

export function WalletAccessSchematic() {
  return <Schematic id="schematic-wallet-access" title="Carteira, chaves e acesso">
    <Fork from={{ t: 'Conta e duas carteiras', s: 'Pertencem ao titular, não à tesouraria', tone: 'blue' }} to={[
      { t: 'Autocustódia', s: 'Chaves e dados exportáveis por iniciativa do titular', tone: 'teal' },
      { t: 'Acesso ao aplicativo', s: 'Comprova o controle da carteira, sem enviar a chave privada', tone: 'blue' },
      { t: 'Piscina de staking', s: 'Fechada: exige acesso ao aplicativo', tone: 'gold' },
    ]} />
  </Schematic>;
}

export function StakingSchematic() {
  return <Schematic id="schematic-staking" title="Staking automático">
    <Flow label="Staking automático" nodes={[
      { t: 'BETTEX disponível', s: 'Na carteira oficial', tone: 'blue' },
      { t: 'Participação automática', s: 'Sem ativação nem depósito', tone: 'gold' },
      { t: 'Rodada diária UTC', s: 'Saldo elegível na abertura × rodada integral', tone: 'gold' },
      { t: 'Crédito em USDC', s: 'Líquido após retenções, confirmado na Carteira USDC', tone: 'teal' },
    ]} />
    <Fork from={{ t: 'Entradas e saídas', s: 'Alteram o BETTEX disponível', tone: 'blue' }} to={[
      { t: 'Saída', s: 'Cancela todos os créditos anteriores ainda não pagos do ciclo e zera o peso acumulado, mesmo quando parcial', tone: 'plain' },
      { t: 'Entrada', s: 'Durante a rodada: zero lucro; aguarda a próxima', tone: 'teal' },
    ]} />
    <Flow label="Destino das frações não executáveis" nodes={[
      { t: 'Frações não executáveis', s: 'Não geram crédito pendente', tone: 'plain' },
      { t: 'Tesouraria', s: 'Recebe as frações não pagas', tone: 'gold' },
    ]} />
  </Schematic>;
}

export function AccountBoundariesSchematic() {
  return <Schematic id="schematic-boundaries" title="Fronteiras entre contas">
    <Lane label="Venda pública">
      <Flow nodes={[{ t: 'Preço dos tokens', s: 'Em USDC', tone: 'blue' }, { t: 'Tesouraria', s: '100% do preço', tone: 'gold' }]} />
    </Lane>
    <Lane label="Serviços">
      <Flow nodes={[{ t: 'Taxas de serviço', s: 'Em USDC', tone: 'blue' }, { t: 'Carteira operacional da entidade', s: 'Fora da tesouraria e do split', tone: 'teal' }]} />
    </Lane>
    <Lane label="Resultados">
      <Flow nodes={[{ t: 'Parcela do staking', s: 'Em USDC', tone: 'blue' }, { t: 'Carteira USDC do titular', s: 'Após conciliação', tone: 'teal' }]} />
    </Lane>
    <Lane label="Recompra e queima">
      <Flow nodes={[{ t: '25% do resultado elegível', s: 'Em USDC', tone: 'blue' }, { t: 'Carteira exclusiva', s: 'Compra autorizada de BETTEX', tone: 'gold' }, { t: 'Burn permanente', s: 'Destruição irreversível dos tokens adquiridos', tone: 'teal' }]} />
    </Lane>
  </Schematic>;
}

export function TokenAllocationSchematic() {
  return <Schematic id="schematic-allocation" title="Alocação e destino dos recursos">
    <Fork from={{ t: '1 bilhão de BETTEX', s: 'Emissão total', tone: 'blue' }} to={[
      { t: 'Mint inicial · 10%', s: 'Preço fixo; financia o projeto', tone: 'gold' },
      { t: 'Comunidade · 55%', s: '550 milhões no vesting', tone: 'gold' },
      { t: 'Fundador e equipe · 20%', s: 'Livre destinação após cada liberação', tone: 'blue' },
      { t: 'Investidores · 15%', s: 'Aportes-anjo: produto, tecnologia e marketing', tone: 'teal' },
    ]} />
    <div className="ds-vest" role="img" aria-label="Vesting de 24 meses com liberação mensal">
      <span>Vesting · liberação mensal</span>
      <i aria-hidden="true">{Array.from({ length: 24 }, (_, k) => <b key={k} />)}</i>
      <span>24 meses</span>
    </div>
  </Schematic>;
}

export function RiskAuthorizationSchematic() {
  return <Schematic id="schematic-risk-authorization" title="Autorização de cada ordem">
    <Flow label="Autorização de cada ordem" nodes={[
      { t: 'Estratégia ou conector', s: 'Propõe a operação', tone: 'blue' },
      { t: 'Núcleo de risco', s: 'Verifica limites, reserva e caixa livre', tone: 'gold' },
      { t: 'Reserva de capital', s: 'Registrada de forma indivisível', tone: 'gold' },
      { t: 'Execução automática', s: 'Somente após validação automática do risco', tone: 'teal' },
      { t: 'Conciliação', s: 'Resultado e estado registrados', tone: 'teal' },
    ]} />
    <Fork from={{ t: 'Limite ou reserva não atendidos', tone: 'plain' }} to={[{ t: 'Ordem não enviada', tone: 'plain' }]} />
  </Schematic>;
}

export function GovernanceSchematic() {
  return <Schematic id="schematic-governance" title="Governança das regras">
    <Flow label="Governança das regras" nodes={[
      { t: 'IA sugere a mudança', s: 'Fila de ajustes de regras e limites', tone: 'blue' },
      { t: 'Administração aprova', s: 'Testes e versão registrados; custódia por multisig', tone: 'gold' },
      { t: 'Espera aplicável', s: 'Mudanças sensíveis: ao menos 24h', tone: 'gold' },
      { t: 'Execução registrada', s: 'A regra anterior vale até lá, sem efeito retroativo', tone: 'teal' },
      { t: 'Agentes operam no mandato', s: 'Sob controles independentes de risco', tone: 'blue' },
    ]} />
  </Schematic>;
}

export function BuybackSchematic() {
  return <Schematic id="schematic-buyback" title="Recompras: financiamento obrigatório e execução discricionária">
    <Lane label="A · Financiamento obrigatório, no fechamento diário elegível">
      <Fork from={{ t: 'Lucro distribuível', s: 'Líquido, realizado e conciliado, com reserva e liquidez atendidas após todas as saídas projetadas', tone: 'blue' }} to={[
        { t: '50% · Tesouraria', s: 'Retenção e reinvestimento', tone: 'gold' },
        { t: '25% · Staking', s: 'Créditos da rodada; nunca acumulam entre rodadas fechadas', tone: 'teal' },
        { t: '25% · Carteira de recompras', s: 'USDC diário; acumula entre dias', tone: 'blue', tag: 'Acumulável' },
      ]} />
      <Fork from={{ t: 'Reserva ou liquidez insuficiente, ou peso elegível zero', tone: 'plain' }} to={[{ t: '100% retido na tesouraria; nenhuma alocação ao staking nem às recompras', tone: 'plain' }]} />
    </Lane>
    <Lane label="B · Execução discricionária, sem compra automática diária">
      <Flow label="Autorização da recompra" nodes={[
        { t: 'Carteira exclusiva', s: 'Saldo disponível segregado', tone: 'blue' },
        { t: 'IA', s: 'Apenas propõe', tone: 'blue', tag: 'Proposta' },
        { t: 'Verificações', s: 'Preço, liquidez e segurança', tone: 'gold' },
        { t: 'Administração autoriza', s: 'Multisig preservado; define o momento', tone: 'gold', tag: 'Autorização' },
        { t: 'Compra de BETTEX', s: 'Somente após autorização', tone: 'teal' },
        { t: 'Burn permanente', s: 'Todo BETTEX adquirido é destruído irreversivelmente', tone: 'gold' },
      ]} />
    </Lane>
    <Fork from={{ t: 'Carteira de recompras', s: 'Segregada da tesouraria', tone: 'blue' }} to={[
      { t: 'Não financia trading, distribuições nem despesas da empresa', tone: 'plain' },
      { t: 'Não conta como reserva defensiva nem capital de estratégia', tone: 'plain' },
      { t: 'Tokens queimados não retornam à circulação nem ao staking', tone: 'plain' },
    ]} />
  </Schematic>;
}
