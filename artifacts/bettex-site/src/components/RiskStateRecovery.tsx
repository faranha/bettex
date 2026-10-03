export function RiskStateRecovery() {
  return (
    <section id="documentacao-recuperacao-risco" aria-labelledby="recuperacao-risco-title">
      <h3 id="recuperacao-risco-title" className="whitepaper__subhead">Recuperação íntegra dos controles após reinício</h3>
      <div className="whitepaper__prose">
        <p><strong>Os registros de risco são duráveis e compartilhados pelos agentes, conectores e instâncias de execução.</strong> Reservas, posições, compromissos autorizados, acumulados diários, pausas e versões das regras não dependem apenas da memória de um processo. Preservam-se identificadores, valores, mercados, estados, evidências e horários, incluindo os dias UTC originais das autorizações e dos resultados realizados.</p>
        <p><strong>Antes de retomar envios após reinício, o núcleo recupera e confere o estado completo com os registros financeiros e as fontes externas pertinentes.</strong> Recuperação incompleta, divergente ou sem conciliação mantém o envio bloqueado, inclusive quando uma operação pretende reduzir risco. Não se substituem dados ausentes por saldo livre, acumulado zero ou ausência de pausa. Restaurar um backup, isoladamente, não comprova que eventos posteriores ou ordens enviadas estejam conciliados.</p>
        <p>Reiniciar não inicia outro dia UTC nem apaga o consumo diário; a mudança real do dia segue as regras existentes, sem liberar reservas ou posições anteriores. Pausas ainda vigentes são preservadas mesmo quando ganhos posteriores tenham reduzido a perda. Ordens enviadas ou desconhecidas mantêm seus identificadores e compromissos para consulta e conciliação, sem reenvio automático. Recuperar registros não duplica reservas, resultados, custos ou efeitos financeiros já lançados.</p>
        <p>A recuperação preserva também o <a href="#documentacao-envio-exclusivo">executor exclusivo e o estado do envio de cada autorização e parte</a>. Outra instância não assume o envio apenas porque houve reinício ou demora na resposta; registro incompleto ou envio sem resultado comprovado mantém o bloqueio e a conciliação.</p>
        <p>O registro da recuperação identifica os dados conferidos, divergências, conciliações e decisão de integridade. Estado recuperado não autoriza, por si só, uma nova ordem: cotações, base patrimonial, regras vigentes e demais controles continuam sendo revalidados. A recuperação também não substitui a autorização registrada de retomada exigida após incidentes. Mantêm-se percentuais e regras econômicas.</p>
      </div>
    </section>
  );
}