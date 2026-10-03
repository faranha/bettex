import { ReadingDisclosure, Topics } from './ReadingDisclosure';
import { DocFacts } from './DocFacts';
import team from '@/lib/entity-team.json';
import { TechnicalDetails } from './TechnicalDetails';
import { FounderIntro } from './GrowthStrategy';

export function EntityTeam() {
  return (
    <ReadingDisclosure id="documentacao-equipe" headingId="entidade-equipe-title" title={<>Equipe básica e operação full stack AI</>}><Topics>
      <FounderIntro />
      <DocFacts title="Organização enxuta" cols={3} facts={[
        { label: 'TETO DA EQUIPE', value: `Até ${team.maxPeople} pessoas`, text: 'Limite permanente previsto na ata ou instrumento de constituição/registro aplicável.' },
        { label: 'REMUNERAÇÃO', value: '4 posições pagas', text: 'Fundador sem salário; colaboradores com remuneração e encargos no orçamento.' },
        { label: 'INCENTIVOS', value: 'Tokens do fundador', text: 'Concessões individuais, distintas da remuneração e sem nova emissão.' },
      ]} />
      <div className="whitepaper__prose">
        <p><strong>Seis funções não exigem seis pessoas.</strong> {team.countingBasis} Essa distribuição inicial é uma proposta de acúmulo de funções para respeitar o teto, não informação de pessoas já contratadas. Acumular atribuições não cria uma sexta vaga nem altera a exigência de signatários independentes.</p>
      </div>
      <div className="whitepaper__status-grid whitepaper__team-grid">
        {team.positions.map((position, index) => (
          <div key={position.id}>
            <span>{String(index + 1).padStart(2, '0')} / POSIÇÃO NA EQUIPE</span>
            <strong>{position.title}</strong>
            <p>{position.responsibility}</p>
            <p><b>Apoio de IA:</b> {position.aiSupport}</p>
            <p><b>Salário mensal proposto:</b> {position.id === 'founder' ? 'US$ 0 — decisão do criador.' : `US$ ${position.proposedMonthlySalaryUsd.toLocaleString('pt-BR')} brutos — hipótese a negociar.`}</p>
            <TechnicalDetails title={`Entregas e outsourcing · ${position.title}`}>
              <p><b>Entregas:</b> {position.deliverables.join(' ')}</p>
              <p><b>Outsourcing:</b> {position.outsourcing}</p>
            </TechnicalDetails>
          </div>
        ))}
      </div>
      <div className="whitepaper__prose">
        <p><strong>O teto é de pessoas, não de nomes de cargos.</strong> A constituição deve registrar a regra no instrumento aplicável. Necessidades de funções profissionais e serviços especializados devem ser compatibilizadas com esse limite; não adicionar colaboradores ou usar terceirização recorrente como forma de contorná-lo.</p>
        <p><strong>O fundador não recebe salário; as quatro posições restantes são remuneradas.</strong> Sua alocação originária de 20% não representa renda mensal garantida. Os valores propostos são hipóteses para feedback, não contratos. Modalidade, encargos e vencimentos entram no orçamento; tributos, infraestrutura e demais obrigações têm cobertura identificada. As taxas são a fonte recorrente pretendida; enquanto insuficientes, remunerações exigem caixa operacional financiado e aprovado. Aportes não são receita, e insuficiência não autoriza usar capital de investimentos ou cancelar créditos dos titulares.</p>
        <p><strong>Concessões de BETTEX são individuais e saem da parcela pessoal do fundador.</strong> Não existe uma alocação adicional para a equipe, divisão igual obrigatória ou percentual automático por cargo. Cada concessão identifica beneficiário, quantidade, aceite, condições e entrega; transferir somente tokens liberados e disponíveis, respeitando o vesting de 36 meses. O fundador já possui sua parcela originária de 20%, não recebe outra por ocupar a administração. O que for entregue aos colaboradores reduz seu saldo pessoal, não a oferta total nem a parcela pública.</p>
        <p>Tokens não substituem obrigações de remuneração, não concedem ações ou voto societário e não exigem multisig empresarial para movimentar a carteira pessoal do fundador. Entregas confirmadas na carteira oficial do beneficiário seguem as mesmas regras de quantidade e tempo do staking, sem direito retroativo. Tributos e registros das concessões recebem tratamento próprio, sem inventar isenção.</p>
        <p><strong>Full stack AI é uma obrigação de ampliar a capacidade de trabalho de cada pessoa.</strong> A empresa oferece ferramentas, acesso a dados, treinamento e apoio técnico no orçamento. Cada função documenta seus fluxos assistidos, revê a qualidade das entregas e aprimora sua autonomia. A IA apoia execução e análise; responsabilidade, revisão profissional, signatários, limites e aprovação de mudanças continuam humanos. Não compartilhar chaves ou dados pessoais em ferramentas sem autorização e controles adequados.</p>
      </div>
    </Topics></ReadingDisclosure>
  );
}