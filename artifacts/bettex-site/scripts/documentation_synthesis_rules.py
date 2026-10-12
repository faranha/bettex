"""Independent regression expectations for the reviewed financial prose.

These assertions are maintained from the original rules, not computed from the
editorial catalog. They supplement human review; they do not prove all semantics.
Each tuple names a source paragraph, its target, and required local expressions.
The first expression identifies the paragraph; every expression must occur there.
"""
import re


RULES = [
    ("Movimentar capital próprio", "site", {
        "pt": ["Movimentações próprias", "não criam lucro ou aporte", "ativos e direitos comprovados", "sem duplicar principal", "origem, trânsito e destino", "Custos e ajustes conciliados", "registro único", "incerteza não gera resultado fictício", "não comprova cobertura defensiva"],
        "en": ["Treasury movements create neither profit nor contributions", "neither profit nor contributions", "verified assets and rights", "without counting principal twice", "origin, in transit and at destination", "costs and adjustments are recorded once", "no fictitious profit or loss", "does not establish defensive coverage"],
        "es": ["Los movimientos propios", "no crean ganancias ni aportes", "activos y derechos comprobados", "sin duplicar capital", "origen, tránsito y destino", "Costos y ajustes conciliados", "una vez", "no genera resultados ficticios", "no demuestra cobertura defensiva"],
    }),
    ("A carteira só financia recompras", "site", {
        "pt": ["Carteira exclusiva para recompras", "não estratégias, distribuições, despesas ou reserva defensiva", "sem dupla contagem", "destinação, transferência, disponibilidade, compromisso, gasto e custos conciliados", "Comprometer não é gastar", "enviar não comprova recebimento", "incertos ficam comprometidos", "sem compra duplicada ou recuperação presumida"],
        "en": ["Wallet exclusively for BETTEX buybacks", "not strategies, distributions, expenses or defensive reserves", "never double-counted", "allocation, transfer, availability, commitment, spending and reconciled costs", "Committing is not spending", "sending does not prove receipt", "Uncertain funds remain committed", "without duplicate purchases or presumed recovery"],
        "es": ["Billetera exclusiva para recompras", "no estrategias, distribuciones, gastos ni reserva defensiva", "sin doble conteo", "asignación, transferencia, disponibilidad, compromiso, gasto y costos conciliados", "Comprometer no es gastar", "enviar no demuestra recepción", "inciertos permanecen comprometidos", "sin compras duplicadas ni recuperación presumida"],
    }),
    ("O fechamento diário elegível", "site", {
        "pt": ["Fechamento diário elegível", "50% do lucro líquido distribuível", "retenção/reinvestimento", "25% a stakers elegíveis", "25% à recompra exclusiva", "realizado, conciliado e disponível", "após custos e obrigações", "posições abertas", "Venda de tokens e transferências entre carteiras não criam lucro"],
        "en": ["Eligible daily closing", "50% of distributable net profit", "retention/reinvestment", "25% for eligible stakers", "25% for exclusive buybacks", "realized, reconciled and available", "after costs and obligations", "open positions", "Token sales and transfers between wallets create no profit"],
        "es": ["Cierre diario elegible", "50% de la ganancia neta distribuible", "retención/reinversión", "25% a stakers elegibles", "25% a recompra exclusiva", "realizado, conciliado y disponible", "tras costos y obligaciones", "posiciones abiertas", "Ventas de tokens y transferencias entre billeteras no crean ganancias"],
    }),
    ("Inclui o principal e o teto", "site", {
        "pt": ["Consumo inclui principal", "teto de custos operacionais autorizados", "mesmo com custo efetivo menor", "dia UTC da autorização e reserva indivisíveis", "antes do envio ao conector", "mesma base investível atualizada", "2% global", "0,5% por mercado"],
        "en": ["Consumption includes principal", "authorized operating-cost ceiling", "actual costs are lower", "UTC day of indivisible authorization and reservation", "before connector submission", "same updated investable base", "2% globally", "0.5% per market"],
        "es": ["El consumo incluye capital", "techo de costos operativos autorizados", "costo efectivo sea menor", "día UTC de autorización y reserva indivisibles", "antes del envío al conector", "misma base invertible actualizada", "2% global", "0,5% por mercado"],
    }),
    ("Em bancos e plataformas", "site", {
        "pt": ["Sem multisig on-chain", "pessoas distintas preparam e aprovam", "limites e trilha institucional", "não permitem saque irrestrito", "destinos verificados e autorização separada", "não substitui bloqueio técnico inexistente"],
        "en": ["Without on-chain multisig", "different people prepare and approve", "limits and institutional records", "no unrestricted withdrawals", "verified destinations and separate authorization", "cannot replace nonexistent technical controls"],
        "es": ["Sin multisig on-chain", "personas distintas preparan y aprueban", "límites y registro institucional", "no permiten retiros irrestrictos", "destinos verificados y autorización separada", "no sustituye controles técnicos inexistentes"],
    }),
    ("Reiniciar não inicia", "site", {
        "pt": ["Reinícios não mudam", "dia UTC", "não apagam consumo", "nem liberam reservas/posições", "virada real segue as regras vigentes", "Pausas persistem mesmo após ganhos", "Ordens enviadas ou desconhecidas", "identificadores e compromissos", "sem reenvio automático", "não duplica reservas, resultados, custos ou efeitos financeiros"],
        "en": ["Restarts neither change", "UTC day", "erase consumption nor release reserves/positions", "actual day change follows existing rules", "Pauses persist despite later gains", "Sent or unknown orders", "identifiers and commitments", "without automatic resubmission", "does not duplicate reserves, results, costs or financial effects"],
        "es": ["Los reinicios no cambian", "día UTC ni borran consumo ni liberan reservas/posiciones", "cambio real de día sigue las reglas vigentes", "pausas persisten incluso tras ganancias", "Órdenes enviadas o desconocidas", "identificadores y compromisos", "sin reenvío automático", "no duplica reservas, resultados, costos ni efectos financieros"],
    }),
    ("Ganhos, perdas e custos efetivos do encerramento", "site", {
        "pt": ["Ganhos, perdas e custos efetivos do encerramento", "apuração única e o resultado diário conciliado", "não zera perdas, não apaga o motivo nem antecipa o fim da pausa", "ganhos posteriores também não", "Principal recuperado não é lucro", "não autoriza reinvestir durante a pausa"],
        "en": ["Closing gains, losses and actual costs", "single calculation and reconciled daily result", "neither resets losses nor erases the reason for or shortens the pause", "subsequent gains do not end it either", "Recovered principal is not profit", "does not authorize reinvestment during the pause"],
        "es": ["Ganancias, pérdidas y costos efectivos del cierre", "cálculo único y el resultado diario conciliado", "no elimina pérdidas ni borra el motivo ni adelanta el fin de la pausa", "ganancias posteriores tampoco", "capital recuperado no es ganancia", "no autoriza reinversión durante la pausa"],
    }),
    ("Cada rodada paga ou não paga", "download", {
        "pt": ["Cada rodada paga ou não", "sem acumular, reabrir ou complementar", "Qualquer saída BETTEX, inclusive parcial", "zera o peso", "cancela apenas direitos ainda não pagos", "Frações não executáveis", "tesouraria, sem crédito futuro", "USDC recebido continua pessoal"],
        "en": ["Each round pays or does not", "without accumulation, reopening or later supplements", "Any BETTEX outflow, including partial", "resets weight", "cancels only still-unpaid rights", "Non-executable fractions", "treasury, without future credit", "Received USDC remains personal"],
        "es": ["Cada ronda paga o no", "sin acumular, reabrir ni complementar después", "Cualquier salida BETTEX, incluso parcial", "anula el peso", "cancela solo derechos aún no pagados", "Fracciones no ejecutables", "tesorería, sin crédito futuro", "USDC recibido sigue siendo personal"],
    }),
    ("A BETTEX adotará proteção dos fundos", "site", {
        "pt": ["Proteção prevista", "tesouraria, recursos operacionais e carteiras pessoais", "autocustódia sem recolher chaves", "chaves administrativas independentes, protegidas e recuperação testada", "multisig 2/3", "atos administrativos previstos", "mandatos aprovados, permissões mínimas e limites de exposição", "IA não altera controles próprios", "Conciliação diária, registros auditáveis e alertas", "movimentações e obrigações", "testes e auditoria independente antes de recursos reais", "responsáveis podem pausar novas execuções afetadas", "preservar registros e seguir recuperação aprovada", "retomada exige conciliação e autorização"],
        "en": ["Planned layered protection", "treasury, operating funds and personal wallets", "self-custody without collecting private keys", "independent, protected administrative keys and tested recovery", "2/3 multisig", "policy-defined administrative acts", "approved mandates, minimal permissions and exposure limits", "AI cannot change its own controls", "Daily reconciliation, auditable records and alert monitoring", "movements and obligations", "tests and independent audits before real funds", "responsible people may pause affected new executions", "preserve records and follow approved recovery", "resumption requires reconciliation and authorization"],
        "es": ["Protección prevista por capas", "tesorería, recursos operativos y billeteras personales", "autocustodia sin recoger claves privadas", "claves administrativas independientes, protegidas y recuperación probada", "multisig 2/3", "actos administrativos previstos", "mandatos aprobados, permisos mínimos y límites de exposición", "IA no cambia sus controles", "Conciliación diaria, registros auditables y monitoreo con alertas", "movimientos y obligaciones", "pruebas y auditoría independiente antes de fondos reales", "responsables pueden pausar nuevas ejecuciones afectadas", "preservar registros y seguir recuperación aprobada", "reanudar exige conciliación y autorización"],
    }),
    ("Patrimônio, reserva defensiva, base investível", "site", {
        "pt": ["Patrimônio, reserva defensiva, base investível", "caixa, obrigações, compromissos, exposições e perdas", "sem misturar saldos antigos", "posições/resultados atualizados", "dados, fontes, horários e referências de conciliação", "não precisam coincidir em horário", "critérios de validade", "leitura recente não substitui conciliação", "antes do envio", "recalcular dependências e revalidar controles", "sem duplicar reservas ou consumo diário", "conjunto não verificável bloqueiam envio", "sem desfazer operações executadas"],
        "en": ["Assets, defensive reserves, investable base", "cash, obligations, commitments, exposure and losses", "without mixing old balances", "updated positions/results", "data, sources, timestamps and reconciliation references", "need not share timestamps", "validity criteria", "recent readings do not replace reconciliation", "pre-submission changes", "recalculating dependencies and revalidating updated controls", "without duplicating reservations or daily consumption", "unverifiable state blocks submission", "without undoing executed operations"],
        "es": ["Patrimonio, reserva defensiva, base invertible", "efectivo, obligaciones, compromisos, exposición y pérdidas", "sin mezclar saldos antiguos", "posiciones/resultados actualizados", "datos, fuentes, horarios y referencias de conciliación", "no necesitan horarios iguales", "criterios de validez", "lectura reciente no sustituye conciliación", "antes del envío", "recalcular dependencias y revalidar controles actualizados", "sin duplicar reservas ni consumo diario", "estado no verificable bloquean envío", "sin deshacer operaciones ejecutadas"],
    }),
    ("O registro compartilhado vincula executor", "site", {
        "pt": ["Registro compartilhado", "executor, identificador da operação, revisão autorizada, reserva, horário e estado do envio", "partes coordenadas", "Só o executor registrado", "revalidar controles atuais", "uma única vez", "transição indivisível anterior à chamada externa", "Outras instâncias consultam e conciliam", "sem novo envio da mesma autorização", "nova revisão não autoriza reenviar partes enviadas ou incertas"],
        "en": ["Shared record", "executor, operation ID, authorized revision, reservation, timestamp, submission state and coordinated parts", "Only the registered executor", "revalidating current controls", "Each part starts once", "indivisible state transition before the external call", "Other instances query and reconcile", "without another submission under the same authorization", "issuing revisions does not authorize resubmitting sent or uncertain parts"],
        "es": ["Registro compartido", "ejecutor, identificador de operación, revisión autorizada, reserva, horario, estado de envío y partes coordinadas", "Solo el ejecutor registrado", "revalidar controles actuales", "Cada parte inicia una vez", "transición indivisible anterior a la llamada externa", "Otras instancias consultan y concilian", "sin otro envío de la misma autorización", "emitir revisiones no autoriza reenviar partes enviadas o inciertas"],
    }),
    ("O registro inclui rodada, ativo, rede", "site", {
        "pt": ["Registro: rodada, ativo, rede", "origem, destino, conector, valor e condições de custos", "mesmo beneficiário e mesma rodada ainda em execução", "destino, ativo e rede compatíveis", "revisão autorizada vigente antes do envio", "conteúdo divergente bloqueiam envio", "sem sobrescrever nem reservar novamente", "motivo, evidências e revalidação", "não liberam parcelas enviadas/incertas nem autorizam rodadas encerradas", "não duplica créditos, reservas ou efeitos patrimoniais"],
        "en": ["Record: round, asset, network", "origin, destination, connector, amount and cost conditions", "same beneficiary and still-executing round", "compatible destination/asset/network", "current authorized revision before submission", "different content blocks submission", "without overwriting or reserving again", "reasons, evidence and revalidation", "neither release sent/uncertain installments nor authorize closed rounds", "duplicates no credits, reservations or asset effects"],
        "es": ["Registro: ronda, activo, red", "origen, destino, conector, importe y condiciones de costos", "mismo beneficiario y ronda aún en ejecución", "destino/activo/red compatibles", "revisión autorizada vigente antes del envío", "contenido distinto bloquea envío", "sin sobrescribir ni reservar nuevamente", "motivo, evidencias y revalidación", "no liberan cuotas enviadas/inciertas ni autorizan rondas cerradas", "no duplica créditos, reservas ni efectos patrimoniales"],
    }),
]


def validate_paragraph(text, terms, context):
    normalized = " ".join(text.split()).casefold()
    for term in terms:
        assert term.casefold() in normalized, f"{context}: missing original condition: {term}"


def verify_rules(paragraphs, language, target):
    if language == "es":
        assert not re.search(r"\breinversão\b", "\n".join(paragraphs)), "Portuguese word in Spanish copy"
    for prefix, kind, translations in RULES:
        if kind != target:
            continue
        terms = translations[language]
        candidates = [p for p in paragraphs if terms[0].casefold() in p.casefold()]
        assert candidates, f"{language}/{target}: removed rule paragraph: {prefix}"
        assert len(candidates) == 1, f"{language}/{target}: ambiguous rule paragraph: {prefix}"
        validate_paragraph(candidates[0], terms, f"{language}/{target}/{prefix}")
