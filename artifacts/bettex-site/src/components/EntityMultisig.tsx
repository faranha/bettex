import { DocFacts } from './DocFacts';

export function EntityMultisig() {
  return (
    <section id="documentacao-entidade-multisig" aria-labelledby="entidade-multisig-title">
      <h3 id="entidade-multisig-title" className="whitepaper__subhead">Multisig e liberdade operacional</h3>
      <div className="whitepaper__prose">
        <p><strong>A administração aprova a política; o multisig autoriza a custódia; o executor atua dentro do mandato.</strong> A rotina não exige reunir assinaturas a cada ordem ou pagamento já coberto por uma autorização válida. Fora do mandato, a movimentação volta à aprovação colegiada. Esta é a política-base para formalização da empresa.</p>
      </div>
      <DocFacts title="Política-base de movimentação" cols={3} facts={[
        { label: 'CUSTÓDIA INSTITUCIONAL', value: '2 de 3', text: 'Duas pessoas distintas assinam; uma ausência não paralisa o quórum.' },
        { label: 'ROTINA AUTORIZADA', value: 'Por mandato', text: 'Execução limitada por finalidade, destinos, orçamento e validade.' },
        { label: 'MUDANÇAS SENSÍVEIS', value: '24 horas', text: 'Espera mínima após agendamento aprovado, sem atraso adicional para a rotina.' },
      ]} />

      <h4 className="whitepaper__subhead">Signatários e responsabilidades</h4>
      <div className="whitepaper__prose">
        <p>As carteiras institucionais de custódia adotam <strong>quórum 2 de 3</strong>. A formalização identifica três signatários independentes e suas responsabilidades, sem presumir nomes, vínculo empregatício ou posições internas. As chaves são independentes; duas chaves da mesma pessoa não equivalem a dois controles. A IA e seus executores não são signatários de custódia.</p>
        <p>O fundador conserva a administração, o orçamento e as políticas; assinar não cria cargo societário nem exige sua presença na rotina. Quem recebe um pagamento não é seu aprovador independente. Pagamentos a partes relacionadas têm aprovação separada por beneficiário, pelos dois não conflitados. Depois da aprovação, o executor liquida dentro do mandato, sem nova assinatura por parcela. Sem dois aprovadores independentes, o item aguarda o procedimento societário e de contingência válido.</p>
      </div>

      <h4 className="whitepaper__subhead">Matriz de autorização</h4>
      <div className="whitepaper__vesting-scroll" role="region" aria-label="Regras de autorização multisig, com rolagem horizontal" tabIndex={0}>
        <table className="whitepaper__vesting-table whitepaper__multisig-table">
          <caption>Quórum, alçada e liberdade de execução</caption>
          <thead><tr><th scope="col">Movimentação</th><th scope="col">Autorização</th><th scope="col">Execução permitida</th></tr></thead>
          <tbody>
            <tr><th scope="row">Tributos e serviços externos no orçamento</th><td>Mandato ou lote aprovado por 2/3.</td><td>Executor paga documentos conferidos, dentro dos destinos, valores e vencimentos aprovados, sem nova assinatura por item.</td></tr>
            <tr><th scope="row">Investimentos e distribuição de resultados</th><td>Mandato 2/3, subordinado às regras vigentes da tesouraria.</td><td>Operações passam pelo risco independente; pagamentos usam obrigações e beneficiários conciliados. Não há aprovação humana por ordem ou crédito.</td></tr>
            <tr><th scope="row">Saída direta sem mandato, reforço de caixa ou despesa extraordinária</th><td>2/3 sobre a transação exata e fundamento aprovado.</td><td>Revalidação do saldo livre e da fonte. Reforço não renova automaticamente limites nem usa reservas ou créditos como caixa livre.</td></tr>
            <tr><th scope="row">Novos poderes, destinos de estratégia ou alterações de controles</th><td>Aprovação administrativa registrada + 2/3 + espera mínima de 24h.</td><td>Inclui signatários, quórum, módulos, permissões a terceiros, atualizações de contratos, limites e novos mandatos estratégicos. Vigência somente após execução e conferência.</td></tr>
            <tr><th scope="row">Dividendos e partes relacionadas</th><td>Procedimento societário aplicável + dois aprovadores não conflitados.</td><td>Usa somente caixa e resultado próprios, com documentação; não autoriza retirada pessoal da tesouraria de investimentos.</td></tr>
            <tr><th scope="row">Incidente de segurança</th><td>Pausa restrita por responsável habilitado; ações protetivas de custódia por 2/3.</td><td>Suspende novas saídas afetadas. Contenção segue o procedimento abaixo, sem reduzir quórum ou cancelar direitos.</td></tr>
          </tbody>
        </table>
      </div>

      <h4 className="whitepaper__subhead">Mandato limitado, sem cheque em branco</h4>
      <div className="whitepaper__prose">
        <p>Cada mandato identifica <strong>carteira de origem, finalidade, executor, ativos e redes, contratos e funções permitidos, destinos, teto por operação, teto acumulado diário UTC, orçamento total e validade máxima de 30 dias</strong>. Nenhum campo obrigatório fica implícito. A soma do executado e comprometido por todos os executores consome o mesmo orçamento; fracionar pagamentos não contorna a alçada.</p>
        <p>A renovação sem ampliar poderes ou orçamento exige 2/3 e nova conferência, sem espera adicional. Ampliar o escopo ou os limites exige o procedimento sensível de 24h. Esgotamento, vencimento, suspensão ou divergência bloqueiam novas execuções; não liberam compromissos incertos nem autorizam reenvio. Um lote aprova seu conteúdo exato, não transferências futuras arbitrárias.</p>
        <p>Fornecedores usam destinos cadastrados e verificados. Distribuições usam os beneficiários e parcelas das obrigações conciliadas, sem exigir cadastro manual de cada titular pelo multisig. O executor não pode trocar o favorecido, atualizar o contrato, criar outro executor, elevar limites, conceder autorização ilimitada de tokens ou alterar os signatários.</p>
        <p>O caixa operacional e a tesouraria têm carteiras, rubricas e mandatos separados. Na tesouraria continuam valendo reservas conforme política aprovada, capital comprometido, limites de risco, elegibilidade e split 50%/25%/25%. O multisig não muda emissão, vesting, pesos ou créditos dos participantes. Carteiras pessoais e exportação de chaves não entram no multisig da empresa.</p>
      </div>

      <h4 className="whitepaper__subhead">Controles técnicos e contas externas</h4>
      <div className="whitepaper__prose">
        <p><strong>O quórum nativo não aplica sozinho orçamento, espera ou aprovação do administrador.</strong> Em contas como Safe, módulos podem executar sem a verificação normal das assinaturas. A política exige controles técnicos validados para cada caminho: transações diretas, módulos, lotes e permissões a terceiros. Mudanças sensíveis devem ficar sujeitas a um bloqueio temporal verificável, inclusive mudanças no próprio bloqueio. Sem essa cobertura, manter o executor desabilitado e não apresentar as restrições como proteção on-chain existente.</p>
        <p>Antes de assinar, conferir rede, endereço e código do contrato, ativo, destinatário, valor, chamada decodificada, permissões e resultado da simulação quando disponível, usando uma fonte independente da tela que propôs a operação. Cada signatário usa carteira de hardware ou solução institucional equivalente, com dispositivo próprio e cópia de recuperação protegida separadamente; nunca compartilhar sementes ou assinar conteúdo ilegível.</p>
        <p>Em bancos e plataformas que não suportam multisig on-chain, aplicar preparação e aprovação por pessoas diferentes, limites e trilha institucional conforme os recursos disponíveis. Credenciais de negociação não incluem saque irrestrito; saídas usam destinos verificados e autorização separada. Um registro interno não substitui um bloqueio técnico inexistente.</p>
      </div>

      <h4 className="whitepaper__subhead">Emergência e continuidade</h4>
      <div className="whitepaper__prose">
        <p>O responsável habilitado pode <strong>pausar novas execuções afetadas e cancelar propostas ainda não executadas</strong>, sem poder transferir recursos por essa permissão. Retomar exige 2/3, causa registrada e controles novamente verificados. A pausa não cancela obrigações nem bloqueia por si só carteiras pessoais; tentativas enviadas ou incertas continuam em conciliação.</p>
        <p>A exceção sem espera de 24h é exclusivamente protetiva e mantém 2/3: revogar permissões comprometidas, substituir a chave afetada por signatário previamente habilitado para contingência ou mover ativos para carteira institucional de recuperação previamente cadastrada, sob controle independente equivalente. Não admite novos beneficiários, aumento de orçamento, redução do quórum ou pagamentos ao fundador. O incidente tem registro imediato e relatório em até 24h.</p>
        <p>Ausência de um signatário é absorvida pelo 2/3; perda ou comprometimento exige o procedimento de substituição, sem compartilhar a chave anterior. Sem quórum válido, não existe chave mestra para contornar a política. Recuperação e retorno à operação preservam obrigações, trilhas e os controles da tesouraria.</p>
      </div>

      <h4 className="whitepaper__subhead">Prestação de contas</h4>
      <div className="whitepaper__prose">
        <p>Registrar proponente, aprovadores, mandato e versão, conteúdo autorizado, consumo dos limites, referência da transação, estado e conciliação. A conferência de movimentações é diária; a revisão de orçamento, mandatos, permissões e acessos é mensal. Mantém-se o registro público das transações previsto no projeto, sem expor chaves, credenciais ou dados pessoais.</p>
        <p><strong>Referências técnicas:</strong> <a href="https://docs.safe.global/advanced/smart-account-concepts" target="_blank" rel="noopener noreferrer">Safe — quórum, módulos e controles</a> e <a href="https://docs.openzeppelin.com/contracts/5.x/access-control" target="_blank" rel="noopener noreferrer">OpenZeppelin — menor privilégio e espera de execução</a>. O 2/3, as 24h e a validade máxima de 30 dias são parâmetros desta política-base, não exigências universais dessas referências.</p>
      </div>
    </section>
  );
}