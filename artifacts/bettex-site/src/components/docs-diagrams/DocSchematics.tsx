import { type ReactNode } from 'react';
import './doc-schematics.css';

type Tone = 'blue' | 'gold' | 'teal' | 'plain';
interface Nd { t: string; s?: string; tone?: Tone; tag?: string }

function Arrow() {
  return <svg className="ds-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Node({ n }: { n: Nd }) {
  return <div className={`ds-node ds-node--${n.tone ?? 'blue'}`}>
    {n.tag && <em>{n.tag}</em>}
    <strong>{n.t}</strong>
    {n.s && <p>{n.s}</p>}
  </div>;
}

function Flow({ nodes, label }: { nodes: Nd[]; label?: string }) {
  return <ol className="ds-flow" aria-label={label} style={{ ['--n' as string]: nodes.length }}>
    {nodes.map((n, i) => <li key={n.t}><Node n={n} />{i < nodes.length - 1 && <Arrow />}</li>)}
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
  return <figure className="ds" id={id} data-testid={id} aria-labelledby={`${id}-t`}>
    <figcaption className="ds__cap"><span>Esquema</span><b id={`${id}-t`}>{title}</b></figcaption>
    {children}
  </figure>;
}

export function InvestmentCycleSchematic() {
  return <Schematic id="schematic-cycle" title="Ciclo do investimento">
    <Flow label="Ciclo do investimento" nodes={[
      { t: 'Carteira USDC', s: 'Compra BETTEX com USDC', tone: 'blue' },
      { t: 'BETTEX na carteira', s: 'Participa automaticamente', tone: 'gold' },
      { t: 'Tesouraria e agentes', s: 'Investem nos quatro mercados', tone: 'blue' },
      { t: 'Lucro da própria rodada', s: 'Paga ou fica na tesouraria, sem acumular', tone: 'teal' },
      { t: 'Crédito em USDC', s: 'Rateio entre participantes', tone: 'teal' },
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
      { t: 'Rodada diária UTC', s: 'Quantidade × tempo elegível', tone: 'gold' },
      { t: 'Crédito em USDC', s: 'Lucro liberado à Carteira USDC, nunca em BETTEX', tone: 'teal' },
    ]} />
    <Fork from={{ t: 'Entradas e saídas', s: 'Alteram o BETTEX disponível', tone: 'blue' }} to={[
      { t: 'Saída', s: 'Cancela todos os créditos anteriores ainda não pagos do ciclo e zera o peso acumulado, mesmo quando parcial', tone: 'plain' },
      { t: 'Entrada', s: 'Conta após a confirmação do saldo, sem lucros anteriores', tone: 'teal' },
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
  </Schematic>;
}

export function TokenAllocationSchematic() {
  return <Schematic id="schematic-allocation" title="Alocação e destino dos recursos">
    <Fork from={{ t: '1 bilhão de BETTEX', s: 'Emissão total', tone: 'blue' }} to={[
      { t: 'Venda pública · 65%', s: 'Preço em USDC: 100% para a tesouraria', tone: 'gold' },
      { t: 'Fundador · 20%', s: 'Livre destinação após cada liberação', tone: 'blue' },
      { t: 'Investidores · 15%', s: 'Aportes: 50% tesouraria, 50% capital inicial e desenvolvimento', tone: 'teal' },
    ]} />
    <div className="ds-vest" role="img" aria-label="Vesting de 36 meses com liberação mensal">
      <span>Vesting · liberação mensal</span>
      <i aria-hidden="true">{Array.from({ length: 36 }, (_, k) => <b key={k} />)}</i>
      <span>36 meses</span>
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
      { t: 'Liderança aprova', s: 'Mudanças de política, não investimentos individuais', tone: 'gold' },
      { t: 'Execução registrada', s: 'A regra anterior vale até lá, sem efeito retroativo', tone: 'teal' },
      { t: 'Agentes operam no mandato', s: 'Sob controles independentes de risco', tone: 'blue' },
    ]} />
  </Schematic>;
}
