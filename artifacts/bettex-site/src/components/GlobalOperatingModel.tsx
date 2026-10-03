import { ReadingDisclosure, Topics } from './ReadingDisclosure';
import { businessAssumptions as a, businessCount as count, businessMonths, supportCapacity } from '@/lib/business-plan';
import { TechnicalDetails } from './TechnicalDetails';
import { BusinessPlanTable } from './BusinessPlanTable';

export function GlobalOperatingModel() {
  const last = businessMonths[businessMonths.length - 1];
  const support = supportCapacity(last.monthlyActiveUsers);
  const minutesPerUser = a.support.ticketsPerMonthlyActiveUser * (1 - a.support.automatedResolutionShare) * a.support.humanMinutesPerTicket;
  const capacityUsers = minutesPerUser > 0 ? Math.floor(a.support.humanHoursBudget * 60 / minutesPerUser) : null;
  return <ReadingDisclosure id="documentacao-operacao-global" headingId="operacao-global-title" title={<>Operação global com IA e fornecedores</>}><Topics>
    <div className="whitepaper__prose">
      <p><strong>Global não significa cinco pessoas trabalhando 24 horas.</strong> A proposta combina autoatendimento e monitoramento contínuos, atendimento humano em horários publicados e plantões de incidentes definidos antes da operação financeira. Português e inglês são a primeira onda de localização; novos idiomas e territórios entram após validação de demanda, capacidade e permissões. O idioma escolhido deve permanecer consistente em interface, mensagens e suporte.</p>
    </div>
    <TechnicalDetails title="Atendimento e social media: cobertura, escalonamento e capacidade">
      <BusinessPlanTable caption="Uma fila de atendimento, com responsáveis e limites" headers={['Nível', 'Como funciona', 'Responsável e limite']} rows={[
        ['Autoatendimento', 'Base de conhecimento e assistente multilíngue no app; captura de e-mail e mídias sociais em helpdesk único, com identificador, idioma, categoria, prioridade e estado.', 'Conteúdo/comunidade mantém respostas aprovadas e revisa amostras. O bot traduz, busca e orienta; não recebe segredos nem movimenta fundos.'],
        ['Atendimento humano', 'Casos ambíguos, reclamações, moderação e revisão de traduções. Proposta de resposta comum até o próximo dia útil, em horários publicados, não SLA já contratado.', 'Conteúdo/comunidade faz triagem e acompanha resolução. Informar que é atendimento automatizado; não inventar confirmação de crédito ou prazo de saque.'],
        ['Especialistas internos', 'Dev: bugs, acesso e segurança técnica. Trader: crédito, conciliação e estados financeiros. Legal: contratos, direitos, privacidade e restrições.', 'Casos financeiros usam acesso autorizado e seguem os controles existentes; atendimento não altera saldos nem contorna assinaturas.'],
        ['Incidentes críticos', 'Alertas de segurança, custódia, divergência ou indisponibilidade acionam o responsável de plantão e, quando contratado, fornecedor especializado.', 'Pausas e recuperação seguem a política. Definir cobertura e escalonamento antes de operar recursos reais; cinco pessoas não garantem plantão humano mundial contínuo.'],
      ]} />
      <div className="whitepaper__prose">
        <p><strong>Capacidade ilustrativa parcial:</strong> {count(last.monthlyActiveUsers)} usuários mensais únicos, a {count(a.support.ticketsPerMonthlyActiveUser * 100)} chamados por 100 usuários, geram {count(support.tickets)} chamados/mês. Se {count(a.support.automatedResolutionShare * 100)}% forem resolvidos corretamente pelo autoatendimento, sobram {count(support.humanTickets)} casos humanos. A {count(a.support.humanMinutesPerTicket)} minutos/caso, são {count(support.humanHours)} horas mensais. O plano reserva {count(a.support.humanHoursBudget)} horas da posição para esses casos; conteúdo, moderação, revisão e gestão exigem disponibilidade adicional. Medir reabertura e qualidade: a taxa de automação não está comprovada.</p>
        <p>{capacityUsers !== null ? `Somente para os casos escalados desta hipótese, ${count(capacityUsers)} usuários mensais consomem ${count(a.support.humanHoursBudget)} horas humanas.` : 'Capacidade não estimável com carga humana nula; rever as premissas.'} Este é um cálculo parcial, não o limite global comprovado: não quantifica interessados sem conta, revisão de respostas automáticas, reaberturas, picos, ausências nem atendimento especializado. Zero MAU na preparação não significa zero atendimento. Medir e adicionar essas cargas, inclusive a disponibilidade de dev, trader e jurídico, antes de validar cobertura. Ao exceder capacidade, fila ou qualidade, reduzir expansão ou contratar cobertura delimitada e recalcular o orçamento.</p>
        <p><strong>Social media global:</strong> calendário por canal, idioma e fuso; rascunhos, legendas e adaptações assistidos por IA; revisão humana de campanhas e alegações financeiras; agendamento e moderação assistida. Primeiro concentrar canais, medir origem dos usuários e custo de aquisição; não abrir todos os idiomas e redes simultaneamente. Criativos, vídeos e revisão por falante local podem ser contratados por campanha.</p>
      </div>
    </TechnicalDetails>
    <TechnicalDetails title="Desenvolvimento com IA, outsourcing e governança de fornecedores">
      <div className="whitepaper__prose">
        <p><strong>Dev interno como responsável técnico, não equipe inteira sozinho.</strong> Entregas pequenas e priorizadas; ambientes de desenvolvimento, teste e operação separados; revisão de código, testes de regressão, validação das integrações e restauração testada. Assistentes geram código e testes, mas não autorizam sozinhos implantação financeira. Especialistas externos podem implementar partes delimitadas; contratos e custódia exigem avaliação independente de quem construiu.</p>
        <p><strong>O que terceirizar:</strong> auditoria inicial, testes de segurança, QA e especialistas em contratos; contabilidade e pareceres locais; peças, traduções e cobertura temporária de atendimento. Preferir entregáveis, horas limitadas ou contratos de serviço com responsabilidades e aceite, não pessoas adicionais escondidas no núcleo de cinco.</p>
        <p><strong>Como contratar:</strong> escopo, prazo, orçamento, confidencialidade, propriedade intelectual, proteção de dados, acesso mínimo, revisão, documentação e transferência do conhecimento. Empresa especializada não recebe chaves dos titulares nem poder de administrar a tesouraria. Acesso temporário deve ser revogado ao concluir; evitar dependência de um fornecedor para restaurar o sistema.</p>
        <p>Serviços recorrentes devem ser compatíveis com o teto da equipe e com a verba real. Se uma necessidade equivaler a mais uma posição permanente, apresentar a mudança ao fundador antes de contratar. IA, outsourcing e equipe própria têm custos e responsabilidades diferentes; nenhum substitui automaticamente o outro.</p>
      </div>
    </TechnicalDetails>
  </Topics></ReadingDisclosure>;
}