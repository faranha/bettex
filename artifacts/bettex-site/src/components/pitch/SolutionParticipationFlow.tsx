import type { ReactNode } from 'react';
import { Coins, Landmark, Cpu, Scale, Wallet, Eye, LineChart, Trophy, Dices, TrendingUp } from 'lucide-react';
import { t, useLocale } from '@/lib/i18n';
import './SolutionParticipationFlow.css';

const fronts = [
  { Icon: LineChart, label: 'Previsões' },
  { Icon: TrendingUp, label: 'Ações e cripto' },
  { Icon: Trophy, label: 'Esportes (surebet)' },
  { Icon: Dices, label: 'iGaming (bônus)' },
] as const;

function Conn({ label, kind = 'money', out = false }: { label: string; kind?: 'money' | 'weight'; out?: boolean }) {
  return <span className={`spf__conn spf__conn--${kind}${out ? ' spf__conn--out' : ''}`} aria-hidden="true"><span className="spf__lt">{t(label)}</span><i className="spf__line" /></span>;
}
function Head({ n, Icon, children }: { n?: string; Icon: typeof Coins; children?: ReactNode }) {
  return <div className="spf__top"><span className="spf__n">{n ?? ''}</span>{children}<Icon size={20} aria-hidden="true" /></div>;
}

export function SolutionParticipationFlow() {
  useLocale();
  return <figure className="spf" data-testid="solution-participation-flow">
    <figcaption className="spf__cap">
      <span className="mono">{t('Como a participação se liga à operação')}</span>
      <p>{t('A aquisição de BETTEX conecta a operação à participação do usuário. O preço da venda pública primária financia a tesouraria; o saldo elegível define o peso no rateio. Os resultados da IA e o peso de cada usuário se encontram na distribuição em USDC, quando a rodada pode pagar.')}</p>
    </figcaption>
    <div className="spf__grid" role="group" aria-label={t('Etapas de participação do usuário')}>
      <article className="spf__node spf__node--light spf__acq">
        <Head n="01" Icon={Coins} />
        <h3 className="display">{t('Aquisição de BETTEX')}</h3>
        <p>{t('O usuário adquire o token. Somente o preço da venda pública primária vai integralmente à tesouraria; compras em mercado secundário não financiam a tesouraria. A tarifa de serviço é separada.')}</p>
      </article>

      <div className="spf__lanes">
        <section className="spf__lane spf__lane--cap" aria-labelledby="spf-cap">
          <h4 id="spf-cap" className="spf__tag mono">{t('Trilha do capital')}</h4>
          <ol className="spf__steps">
            <li className="spf__step spf__step--tre">
              <Conn label="preço da venda primária" />
              <div className="spf__node spf__node--treasury">
                <Head Icon={Landmark} />
                <h3 className="display">{t('Tesouraria')}</h3>
                <p>{t('Capital formado pelo preço da venda pública primária.')}</p>
              </div>
            </li>
            <li className="spf__step spf__step--ops">
              <Conn label="capital operado pela IA" />
              <div className="spf__node spf__node--dark">
                <Head n="03" Icon={Cpu} />
                <h3 className="display">{t('IA opera quatro frentes')}</h3>
                <p>{t('A IA opera com o capital da tesouraria, nunca com os tokens em staking. Operar gera resultado, que pode ser negativo.')}</p>
                <ul className="spf__fronts" aria-label={t('Frentes de atuação')}>
                  {fronts.map(({ Icon, label }) => <li key={label}><Icon size={18} aria-hidden="true" /><span>{t(label)}</span></li>)}
                </ul>
                <div className="spf__watch"><Eye size={18} aria-hidden="true" /><p><b>{t('O usuário acompanha:')}</b> {t('resultados, custos, alocações e registros de conciliação.')}</p></div>
              </div>
            </li>
          </ol>
          <Conn label="lucro líquido realizado, se houver, segue ao passo 04" out />
        </section>

        <section className="spf__lane spf__lane--wt" aria-labelledby="spf-wt">
          <h4 id="spf-wt" className="spf__tag spf__tag--wt mono">{t('Trilha da participação, em paralelo')}</h4>
          <ol className="spf__steps">
            <li className="spf__step spf__step--stk">
              <Conn label="saldo de BETTEX adquirido" kind="weight" />
              <div className="spf__node spf__node--gold">
                <Head n="02" Icon={Wallet} />
                <h3 className="display">{t('Participação pelo staking')}</h3>
                <p>{t('O saldo de BETTEX e o tempo elegível no aplicativo oficial definem o peso de cada usuário no rateio. Os tokens em staking não financiam as operações.')}</p>
              </div>
            </li>
          </ol>
          <Conn label="peso elegível segue ao passo 04" kind="weight" out />
        </section>
      </div>

      <article className="spf__node spf__node--light spf__dst">
        <Head n="04" Icon={Scale} />
        <h3 className="display">{t('Distribuição em USDC')}</h3>
        <p>{t('Quando a rodada diária atende às condições de lucro, reserva e liquidez, o usuário recebe a parcela correspondente ao peso elegível no pool dos stakers.')}</p>
        <p className="spf__fine">{t('Sem rodada elegível, não há pagamento e ele não é acumulado. Nenhum retorno é garantido.')}</p>
      </article>
    </div>
    <p className="spf__next">{t('Lucro líquido, reservas, liquidez e peso elegível: condições para a distribuição.')}</p>
  </figure>;
}
export default SolutionParticipationFlow;
