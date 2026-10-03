"""Editable operating-cash planning model; unknowns are never assumed zero."""
from pathlib import Path
import math
import json
import zipfile
import xml.etree.ElementTree as ET
import xlsxwriter

ROOT = Path(__file__).resolve().parent
APP = ROOT.parent / "artifacts/bettex-site"
POLICY = json.loads((APP / "src/lib/service-fee-proposal.json").read_text())
SCENARIOS = json.loads((APP / "src/lib/fee-projection-scenarios.json").read_text())["scenarios"]
TEAM = json.loads((APP / "src/lib/entity-team.json").read_text())
TARGETS = json.loads((APP / "src/lib/operating-targets.json").read_text())
BUSINESS = json.loads((APP / "src/lib/business-plan.json").read_text())
assert len(TEAM["positions"]) == TEAM["maxPeople"] == 5
assert TEAM["positions"][0]["id"] == "founder"
assert sum(len(position["functions"]) for position in TEAM["positions"]) == 6
assert POLICY["paymentAsset"] == "USDC"
assert [fee["amountUsd"] for fee in POLICY["fees"]] == [2.5, 2.5, 2.5], "Atualizar cenários ao alterar tarifas aprovadas."
DEST = ROOT / "bettex-caixa-operacional.xlsx"
wb = xlsxwriter.Workbook(DEST)
wb.set_calc_mode("auto")
wb.set_properties({"title": "BETTEX — caixa operacional e financiamento",
                   "subject": "Empresa privada administrada pelo fundador",
                   "comments": "Planejamento ilustrativo, não autorização financeira."})
fmt = {
    "title": wb.add_format({"bold": True, "font_size": 16, "font_color": "#122C45"}),
    "head": wb.add_format({"bold": True, "bg_color": "#122C45", "font_color": "white",
                          "text_wrap": True, "border": 1}),
    "text": wb.add_format({"text_wrap": True, "valign": "top"}),
    "money": wb.add_format({"num_format": '"US$ "#,##0.00;[Red]-"US$ "#,##0.00',
                           "font_color": "#122C45"}),
    "input": wb.add_format({"bg_color": "#FFF2CC", "num_format": '"US$ "#,##0.00',
                           "font_color": "#164691"}),
    "integer": wb.add_format({"bg_color": "#FFF2CC", "num_format": "#,##0",
                             "font_color": "#164691"}),
    "result": wb.add_format({"num_format": "#,##0", "font_color": "#122C45"}),
    "tokens": wb.add_format({"num_format": "#,##0.###############", "bg_color": "#FFF2CC", "font_color": "#164691"}),
    "percent": wb.add_format({"bg_color": "#FFF2CC", "num_format": "0%",
                             "font_color": "#164691"}),
    "ratio": wb.add_format({"bg_color": "#FFF2CC", "num_format": "0.00",
                            "font_color": "#164691"}),
    "warning": wb.add_format({"bg_color": "#FDE9E7", "font_color": "#9B231E",
                             "text_wrap": True}),
}


def sheet(name, widths):
    ws = wb.add_worksheet(name)
    ws.hide_gridlines(2)
    ws.freeze_panes(4, 1)
    for col, width in widths.items():
        ws.set_column(col, width)
    ws.set_landscape()
    ws.fit_to_pages(1, 0)
    ws.set_margins(0.4, 0.4, 0.5, 0.5)
    ws.set_footer("&CBETTEX — planejamento &P/&N")
    return ws


def number_input(ws, cell, integer=False):
    ws.write_blank(cell, None, fmt["integer" if integer else "input"])
    ws.data_validation(cell, {
        "validate": "integer" if integer else "decimal",
        "criteria": ">=", "value": 0, "ignore_blank": True,
        "error_type": "stop", "error_title": "Valor inválido",
        "error_message": "Informe valor não negativo; contagens devem ser inteiras.",
    })


def formula(ws, cell, expression, cached="PREENCHER PREMISSAS", integer=False):
    ws.write_formula(cell, expression, fmt["result" if integer else "money"], cached)


read = sheet("Leitura", {"A:A": 30, "B:B": 105})
read.write("A1", "BETTEX — caixa operacional", fmt["title"])
guidance = [
    ("Decisões", "Empresa privada; administrador é o fundador. Compra, saque USDC e envio BETTEX: US$2,50 cada, pagos em USDC; sem queima."),
    ("Escopo", "Somente caixa operacional. Recursos da venda pública à tesouraria e créditos dos participantes não são caixa para salários."),
    ("Premissas", "Tarifas confirmadas; reserva de 3 meses e 10 mil usuários nos cenários são hipóteses editáveis, não decisões ou previsão de demanda."),
    ("Amarelo", "Campos editáveis. Preencha desconhecidos com informação validada; zero só quando conhecido/não aplicável. Exemplos textuais usam valores-base; após editar, consultar as fórmulas, não extrapolar textos fixos."),
    ("Cenários", "Receita bruta em dólar por operações, não lucro. Compras primárias tarifadas; não inclui revenda entre titulares."),
    ("Orçamento", "10 categorias de despesas recorrentes. Fundador sem salário e quatro remunerações propostas em Equipe AI; não duplicar contratos ou concessões."),
    ("Plano-base e Lançamento 12m", "Proposta para feedback: salários, fixos, variáveis, provisões, implantação, rampa, atendimento e financiamento. Hipóteses não são cotações nem contratos."),
    ("Equilíbrio mensal", "Mesmo modelo de variáveis/provisão do Plano-base. US$50 mil incluem US$42 mil fixos no piso; US$75 mil é comparação normalizada, não orçamento aprovado. Sensibilidades mantêm fixos e somam apenas encargos adicionais."),
    ("Equipe", "Seis funções em cinco posições propostas, incluindo o fundador e acumulando social media/community manager. Não são contratações confirmadas."),
    ("Concessões", "Tokens pessoais do fundador, sem quarta alocação. Preencher quantidades e disponibilidade liberada; validação numérica não autoriza transferência."),
    ("Plano 12 meses", "Informe três volumes mensais, tributos provisionados, financiamentos, amortizações e retiradas planejadas. Nenhuma contagem é presumida."),
    ("Implantação", "Valor total de implantação lançado no primeiro mês por simplificação; não repeti-lo nos custos mensais. Ajustar calendário no plano real."),
    ("Tributos", "Valores mensais devem vir do perfil fiscal local; nenhuma alíquota, isenção ou retenção universal é presumida. Não duplicar tributos da folha já no orçamento."),
    ("Resultado", "Caixa livre projetado após separar provisões, não extrato bancário ou lucro distribuível. Recolher tributo já reservado baixa obrigação/reserva sem descontá-lo novamente do livre. Conciliar diferenças, datas e saldo bruto."),
    ("Retiradas de sócios", "Campo de simulação; não constitui autorização de dividendo/antecipação. Exige lucro apurado, rito societário, obrigações e liquidez."),
    ("Financiamento", "Entradas aprovadas precisam distinguir capital e empréstimos em registro próprio. Devolução do principal não é dividendo."),
    ("USDC", "US$ é unidade de projeção. Liquidação em USDC; cotações, risco de paridade, conversão, rede e custos reais devem ser considerados."),
    ("Status", "Campos faltantes impedem cálculo líquido. Folga simulada não autoriza pagamentos reais nem comprova sustentabilidade."),
]
for row, (label, text) in enumerate(guidance, 3):
    read.write(row, 0, label, fmt["head"])
    read.write(row, 1, text, fmt["text"])
    read.set_row(row, 48)

p = sheet("Premissas", {"A:A": 47, "B:B": 20, "C:C": 75})
p.write("A1", "Tarifas e hipóteses", fmt["title"])
for cell, label, value, description in [
    ("B4", "Compra primária BETTEX", 2.5, "Confirmada; paga em USDC."),
    ("B5", "Saque dos rendimentos USDC", 2.5, "Confirmada; paga em USDC."),
    ("B6", "Envio autônomo BETTEX no app", 2.5, "Confirmada; paga em USDC, sem queima nem segunda tarifa da entrega da compra."),
    ("B8", "Meses de reserva operacional", 3, "Hipótese de planejamento; não é a reserva defensiva da tesouraria."),
    ("B10", "Usuários ativos nos cenários", 10000, "Hipótese do criador para análise, não base atual comprovada."),
]:
    row = int(cell[1:]) - 1
    p.write(row, 0, label)
    p.write_number(cell, value, fmt["integer"] if cell in ("B8", "B10") else fmt["input"])
    p.write(row, 2, description, fmt["text"])
    p.set_row(row, 35)
    p.data_validation(cell, {"validate": "integer" if cell in ("B8", "B10") else "decimal",
                             "criteria": ">" if cell in ("B4", "B5", "B6") else ">=", "value": 0, "error_type": "stop"})

c = sheet("Cenários", {"A:A": 43, "B:E": 18, "F:F": 22})
c.write("A1", "Operações e receita bruta — hipóteses", fmt["title"])
c.write_row("A3", ["Cenário", "Compras", "Saques USDC", "Envios BETTEX",
                   "Operações", "Receita bruta"], fmt["head"])
cases = [
    ("Dez mil saques", 0, 10000, 0),
    ("Dez mil compras + dez mil saques", 10000, 10000, 0),
    ("Combinação US$30 mil", 5000, 5000, 2000),
    ("Combinação US$40 mil", 6000, 8000, 2000),
    ("Atividade menor", 1000, 2000, 500),
]
for row, (name, buys, draws, transfers) in enumerate(cases, 4):
    c.write(f"A{row}", name)
    for col, value in zip("BCD", (buys, draws, transfers)):
        c.write_number(f"{col}{row}", value, fmt["integer"])
        c.data_validation(f"{col}{row}", {"validate": "integer", "criteria": ">=",
                                         "value": 0, "error_type": "stop"})
    valid_counts = f'AND(COUNT(B{row}:D{row})=3,MIN(B{row}:D{row})>=0,MOD(B{row},1)=0,MOD(C{row},1)=0,MOD(D{row},1)=0)'
    formula(c, f"E{row}", f'=IFERROR(IF({valid_counts},SUM(B{row}:D{row}),"VALIDAR VOLUMES"),"VALIDAR VOLUMES")', buys+draws+transfers, True)
    formula(c, f"F{row}", f'=IF(AND(ISNUMBER(E{row}),COUNT(Premissas!B4:B6)=3,MIN(Premissas!B4:B6)>0),B{row}*Premissas!$B$4+C{row}*Premissas!$B$5+D{row}*Premissas!$B$6,"VALIDAR VOLUMES/TARIFAS")',
            2.5*(buys+draws+transfers))
c.write_row("A11", ["Saques frequentes", "Adesão diária", "Dias de saque",
                    "Usuários sacadores", "Saques/mês", "Receita bruta"], fmt["head"])
for row, share, days in [(12, .01, 20), (13, .10, 20), (14, .50, 20)]:
    c.write(f"A{row}", "Hipótese, não previsão")
    c.write_number(f"B{row}", share, fmt["percent"])
    c.write_number(f"C{row}", days, fmt["integer"])
    c.data_validation(f"B{row}", {"validate": "decimal", "criteria": "between",
                                  "minimum": 0, "maximum": 1, "error_type": "stop"})
    c.data_validation(f"C{row}", {"validate": "integer", "criteria": "between",
                                  "minimum": 0, "maximum": 31, "error_type": "stop"})
    users = round(10000*share)
    valid_activity = f'AND(COUNT(Premissas!B10,B{row}:C{row})=3,Premissas!B10>=0,MOD(Premissas!B10,1)=0,B{row}>=0,B{row}<=1,C{row}>=0,C{row}<=31,MOD(C{row},1)=0)'
    formula(c, f"D{row}", f'=IFERROR(IF({valid_activity},ROUND(Premissas!$B$10*B{row},0),"VALIDAR ATIVIDADE"),"VALIDAR ATIVIDADE")', users, True)
    formula(c, f"E{row}", f'=IF(ISNUMBER(D{row}),D{row}*C{row},"VALIDAR ATIVIDADE")', users*days, True)
    formula(c, f"F{row}", f'=IF(AND(COUNT(E{row},Premissas!B5)=2,Premissas!B5>0),E{row}*Premissas!$B$5,"VALIDAR ATIVIDADE/TARIFA")', users*days*2.5)
c.merge_range("A17:F18", "A receita exige saldo/rendimento, adesão e operações efetivas. Não multiplique usuários por 30 saques sem hipótese e capacidade financeira.", fmt["warning"])

o = sheet("Orçamento", {"A:A": 47, "B:B": 22, "C:C": 82})
o.write("A1", "Custos operacionais — preencher valores reais", fmt["title"])
o.write_row("A3", ["Rubrica mensal", "Valor US$", "Observação"], fmt["head"])
categories = [
    "Remuneração bruta do administrador", "Salários brutos da equipe",
    "Encargos da entidade sobre remunerações", "Prestadores de serviços",
    "Hospedagem, IA, dados e treinamento", "Obrigações institucionais e contabilidade",
    "Segurança e auditorias recorrentes", "Comercial aprovado",
    "Custos financeiros fixos", "Outros custos fixos",
]
for row, name in enumerate(categories, 4):
    o.write(f"A{row}", name)
    if row == 4:
        formula(o, f"B{row}", '=IF(AND(ISNUMBER(\'Equipe AI\'!C4),\'Equipe AI\'!C4=0),0,"FUNDADOR SEM SALÁRIO")', 0)
    elif row == 5:
        formula(o, f"B{row}", '=IF(AND(COUNT(\'Equipe AI\'!C5:C8)=4,MIN(\'Equipe AI\'!C5:C8)>0),SUM(\'Equipe AI\'!C5:C8),"INFORMAR REMUNERAÇÕES")', sum(p["proposedMonthlySalaryUsd"] for p in TEAM["positions"]))
    else:
        number_input(o, f"B{row}")
    note = "Preencher; zero somente se conhecido. Não duplicar contratos/encargos."
    if row in (4, 5):
        note = "Calculado a partir de Equipe AI. Não lançar novamente nas rubricas de prestadores ou jurídico."
    elif row in (7, 9):
        note = "Somente despesas não incluídas nas quatro remunerações; fundador sem salário. Compatibilizar serviços e teto de pessoas."
    o.write(f"C{row}", note, fmt["text"])
o.write("A15", "Total mensal de despesas fixas", fmt["head"])
formula(o, "B15", '=IF(AND(COUNT(B4:B13)=10,MIN(B4:B13)>=0),SUM(B4:B13),"ORÇAMENTO INCOMPLETO/INVÁLIDO")', "ORÇAMENTO INCOMPLETO/INVÁLIDO")
for row, label, note in [
    (17, "Custo variável médio por operação", "Estimativa simplificada; não cobre tributos. Validar diferença entre os três serviços."),
    (18, "Implantação total (primeiro mês)", "Não somar novamente despesa já incluída nas categorias recorrentes."),
    (19, "Caixa operacional inicial", "Só caixa da entidade disponível; não incluir tesouraria, provisões ou créditos de participantes."),
]:
    o.write(f"A{row}", label)
    number_input(o, f"B{row}")
    o.write(f"C{row}", note, fmt["text"])
    o.set_row(row-1, 42)

plan = sheet("Plano 12 meses", {"A:A": 46, "B:M": 24})
plan.write("A1", "Planejamento mensal — caixa operacional", fmt["title"])
plan.merge_range("A2:M2", "Valores projetados; campos amarelos exigem preenchimento. Não autoriza dividendos/antecipação.", fmt["warning"])
plan.write("A4", "Item", fmt["head"])
labels = {
    5: "Compras primárias tarifadas", 6: "Saques USDC tarifados", 7: "Envios BETTEX tarifados",
    8: "Total de operações", 9: "Receita bruta projetada", 10: "Despesas fixas projetadas",
    11: "Custos variáveis projetados", 12: "Tributos adicionais provisionados",
    13: "Variação livre após provisões", 14: "Financiamentos/aportes aprovados",
    15: "Amortização de principal", 16: "Retiradas societárias — simulação",
    17: "Implantação", 18: "Caixa livre inicial do mês", 19: "Caixa livre final projetado",
    20: "Reserva operacional de referência", 21: "Folga/déficit ante referência", 22: "Status",
}
for row, label in labels.items():
    plan.write(f"A{row}", label, fmt["head"] if row in (9, 13, 19, 22) else None)
for month in range(1, 13):
    col = xlsxwriter.utility.xl_col_to_name(month)
    previous = xlsxwriter.utility.xl_col_to_name(month-1)
    plan.write(f"{col}4", f"Mês {month}", fmt["head"])
    for row in (5, 6, 7, 12, 14, 15, 16):
        number_input(plan, f"{col}{row}", integer=row in (5, 6, 7))
    formulas = {
        8: f'=IFERROR(IF(AND(COUNT({col}5:{col}7)=3,MIN({col}5:{col}7)>=0,MOD({col}5,1)=0,MOD({col}6,1)=0,MOD({col}7,1)=0),SUM({col}5:{col}7),"VALIDAR VOLUMES"),"VALIDAR VOLUMES")',
        9: f'=IF(AND(ISNUMBER({col}8),COUNT(Premissas!B4:B6)=3,MIN(Premissas!B4:B6)>0),{col}5*Premissas!$B$4+{col}6*Premissas!$B$5+{col}7*Premissas!$B$6,"VALIDAR VOLUMES/TARIFAS")',
        10: '=IF(ISNUMBER(\'Orçamento\'!$B$15),\'Orçamento\'!$B$15,"ORÇAMENTO INCOMPLETO")',
        11: f'=IF(AND(ISNUMBER({col}8),ISNUMBER(\'Orçamento\'!$B$17),\'Orçamento\'!$B$17>=0),{col}8*\'Orçamento\'!$B$17,"VALIDAR CUSTO VARIÁVEL")',
        13: f'=IF(AND(COUNT({col}9:{col}12)=4,MIN({col}10:{col}12)>=0),{col}9-SUM({col}10:{col}12),"VALIDAR CUSTOS/TRIBUTOS")',
        17: '=IF(AND(ISNUMBER(\'Orçamento\'!$B$18),\'Orçamento\'!$B$18>=0),\'Orçamento\'!$B$18,"VALIDAR IMPLANTAÇÃO")' if month == 1 else "=0",
        18: '=IF(AND(ISNUMBER(\'Orçamento\'!$B$19),\'Orçamento\'!$B$19>=0),\'Orçamento\'!$B$19,"VALIDAR CAIXA INICIAL")' if month == 1
            else f'=IF(ISNUMBER({previous}19),{previous}19,"PLANO ANTERIOR INCOMPLETO")',
        19: f'=IF(AND(COUNT({col}13:{col}18)=6,MIN({col}14:{col}17)>=0),{col}18+{col}13+{col}14-{col}15-{col}16-{col}17,"PLANO INCOMPLETO/INVÁLIDO")',
        20: f'=IFERROR(IF(AND(COUNT({col}10,Premissas!B8)=2,Premissas!B8>=0,MOD(Premissas!B8,1)=0),{col}10*Premissas!$B$8,"VALIDAR RESERVA"),"VALIDAR RESERVA")',
        21: f'=IF(COUNT({col}19:{col}20)=2,{col}19-{col}20,"PLANO INCOMPLETO")',
        22: f'=IF(AND(ISNUMBER({col}21),ISNUMBER({col}13)),IF({col}13<0,"DÉFICIT NAS TAXAS; FINANCIAMENTO NÃO É RECEITA",IF({col}21<0,"REVER RESERVA OPERACIONAL","FOLGA SIMULADA; VALIDAR OBRIGAÇÕES")),"PREENCHER PLANO")',
    }
    for row, expression in formulas.items():
        formula(plan, f"{col}{row}", expression, 0 if row == 17 and month > 1 else "PREENCHER PREMISSAS", row == 8)
    plan.conditional_format(f"{col}21", {"type": "cell", "criteria": "<", "value": 0, "format": fmt["warning"]})
plan.set_row(21, 55)
plan.autofilter("A4:M22")

meta = sheet("Metas ano 1", {"A:A": 58, "B:C": 30})
meta.write("A1", "Metas do ano 1 — mesmas premissas do site", fmt["title"])
meta.merge_range("A2:C2", "Tarifas brutas, crescimento linear e coorte estável são hipóteses. USDC/dólar 1:1 ilustrativo; não é lucro líquido.", fmt["warning"])
fields = [
    (4, "projectedUsers", "Projeção ampla de usuários"),
    (5, "initialHolders", "Holders iniciais"),
    (6, "targetHolders", "Meta final de holders"),
    (7, "initialDailyActiveUsers", "Ativos diários iniciais"),
    (8, "targetDailyActiveUsers", "Ativos diários finais"),
    (9, "poolBuyerShare", "Parcela de novos holders compradores primários"),
    (10, "firstPurchase", "Preço dos tokens na primeira compra — USDC"),
    (11, "repeatBuyerShare", "Parcela dos ativos que compra novamente"),
    (12, "monthlyRepeatPurchase", "Valor total de compras adicionais/pessoa/mês — USDC"),
    (13, "repeatPurchasesPerBuyerPerMonth", "Operações adicionais/comprador/mês"),
    (14, "withdrawerShare", "Parcela dos ativos que saca"),
    (15, "dailyWithdrawal", "Valor solicitado por saque — USDC"),
    (16, "withdrawalDays", "Dias de saque/pessoa/mês"),
    (17, "transferOperationsPerActiveUser", "Envios BETTEX/ativo/mês — zero ilustrativo"),
]
computed_labels = {
    18: "Média de ativos diários",
    19: "Primeiras compras primárias/ano",
    20: "Primeiras compras médias/mês",
    21: "Compras adicionais médias/mês",
    22: "Saques médios/mês",
    23: "Envios BETTEX médios/mês",
    24: "Receita bruta de primeiras compras/ano — USD",
    25: "Receita bruta de compras adicionais/ano — USD",
    26: "Receita bruta de saques/ano — USD",
    27: "Receita bruta de envios/ano — USD",
    28: "Receita bruta total/ano — USD",
    29: "Receita bruta média/mês — USD",
    30: "Recorrência após atingir a meta final — USD/mês",
    31: "Líquido por saque antes de outros encargos — USDC",
    32: "Volume solicitado de saques/mês — USDC",
    33: "Piso elegível/mês sem créditos anteriores — USDC",
}
for row, _, label in fields:
    meta.write(f"A{row}", label)
for row, label in computed_labels.items():
    meta.write(f"A{row}", label, fmt["head"] if row in (28, 29) else None)
for index, s in enumerate(SCENARIOS, 1):
    col = xlsxwriter.utility.xl_col_to_name(index)
    meta.write(f"{col}3", s["name"], fmt["head"])
    for row, key, _ in fields:
        cell = f"{col}{row}"
        meta.write_number(cell, s[key], fmt["percent"] if row in (9, 11, 14) else fmt["integer"] if row in (4, 5, 6, 7, 8, 13, 16) else fmt["input"])
        meta.data_validation(cell, {"validate": "decimal", "criteria": "between",
                                   "minimum": 0, "maximum": 1 if row in (9, 11, 14) else 31 if row == 16 else 1e12, "error_type": "stop"})
    avg = (s["initialDailyActiveUsers"]+s["targetDailyActiveUsers"])/2
    acq = (s["targetHolders"]-s["initialHolders"])*s["poolBuyerShare"]
    repeat = avg*s["repeatBuyerShare"]*s["repeatPurchasesPerBuyerPerMonth"]
    draws = avg*s["withdrawerShare"]*s["withdrawalDays"]
    transfers = avg*s["transferOperationsPerActiveUser"]
    cash = {18: avg, 19: acq, 20: acq/12, 21: repeat, 22: draws, 23: transfers,
            24: acq*2.5, 25: repeat*2.5*12, 26: draws*2.5*12,
            27: transfers*2.5*12, 31: s["dailyWithdrawal"]-2.5,
            32: draws*s["dailyWithdrawal"], 33: draws*s["dailyWithdrawal"]/.25}
    cash[28] = sum(cash[r] for r in (24, 25, 26, 27))
    cash[29] = cash[28]/12
    cash[30] = s["targetDailyActiveUsers"]*(s["repeatBuyerShare"]*s["repeatPurchasesPerBuyerPerMonth"]*2.5+s["withdrawerShare"]*s["withdrawalDays"]*2.5+s["transferOperationsPerActiveUser"]*2.5)
    expressions = {
        18: f"=AVERAGE({col}7:{col}8)",
        19: f'=IF(AND(COUNT({col}5:{col}6)=2,{col}6>={col}5),({col}6-{col}5)*{col}9,"METAS INCOMPATÍVEIS")',
        20: f'=IF(ISNUMBER({col}19),{col}19/12,"REVER METAS")',
        21: f"={col}18*{col}11*{col}13",
        22: f'=IF(OR({col}14*{col}16=0,{col}15>Premissas!$B$5),{col}18*{col}14*{col}16,"SAQUE SEM LÍQUIDO POSITIVO")',
        23: f"={col}18*{col}17",
        24: f'=IF(ISNUMBER({col}19),{col}19*Premissas!$B$4,"REVER METAS")',
        25: f"={col}21*Premissas!$B$4*12",
        26: f'=IF(ISNUMBER({col}22),{col}22*Premissas!$B$5*12,"REVER SAQUES")',
        27: f"={col}23*Premissas!$B$6*12",
        28: f'=IF(COUNT({col}24:{col}27)=4,SUM({col}24:{col}27),"CENÁRIO INCOMPLETO")',
        29: f'=IF(ISNUMBER({col}28),{col}28/12,"CENÁRIO INCOMPLETO")',
        30: f'=IF(ISNUMBER({col}22),{col}8*({col}11*{col}13*Premissas!$B$4+{col}14*{col}16*Premissas!$B$5+{col}17*Premissas!$B$6),"REVER SAQUES")',
        31: f'=IF({col}15>Premissas!$B$5,{col}15-Premissas!$B$5,"SAQUE SEM LÍQUIDO POSITIVO")',
        32: f'=IF(ISNUMBER({col}22),{col}22*{col}15,"REVER SAQUES")',
        33: f'=IF(ISNUMBER({col}32),{col}32/0.25,"REVER SAQUES")',
    }
    for row, expression in expressions.items():
        # Every result requires the full set of explicit assumptions.
        valid_meta = f'AND(COUNT({col}4:{col}17)=14,MIN({col}4:{col}17)>=0,{col}6>={col}5,{col}9<=1,{col}11<=1,{col}14<=1,{col}16<=31,COUNT(Premissas!B4:B6)=3,MIN(Premissas!B4:B6)>0)'
        guarded = f'=IFERROR(IF({valid_meta},{expression[1:]},"VALIDAR PREMISSAS"),"VALIDAR PREMISSAS")'
        formula(meta, f"{col}{row}", guarded, cash[row], row < 24)
meta.merge_range("A35:C37", "Saques incluem a tarifa. Piso agregado = solicitado /25%, supondo 100% do rateio disponível aos sacadores, sem retenções/créditos anteriores. Com fração q do peso elegível, requisito = solicitado /(25% × q), sujeito a reservas/liquidação/saldo individual. Usuários não determinam q. Não somar a tarifa novamente.", fmt["text"])

people = sheet("Equipe AI", {"A:A": 37, "B:B": 35, "C:D": 25, "E:E": 88})
people.write("A1", "Equipe básica — cinco posições, seis funções", fmt["title"])
people.merge_range("A2:E2", "Fundador sem salário: decisão do criador. Quatro remunerações preenchidas são propostas editáveis, não contratações. Taxas são fonte recorrente; financiamento aprovado cobre a fase inicial.", fmt["warning"])
people.write_row("A3", ["Função", "Pessoa / contrato", "Remuneração bruta mensal US$", "BETTEX concedidos", "Apoio de IA / observação"], fmt["head"])
people.set_row(1, 42)
people.set_row(2, 42)
for row, position in enumerate(TEAM["positions"], 4):
    people.write(f"A{row}", position["title"], fmt["text"])
    people.write_blank(f"B{row}", None, fmt["text"])
    people.write_number(f"C{row}", position["proposedMonthlySalaryUsd"], fmt["input"])
    people.data_validation(f"C{row}", {"validate": "decimal", "criteria": "=" if position["id"] == "founder" else ">", "value": 0, "error_type": "stop",
                                    "error_message": "Fundador sem salário; colaboradores com remuneração positiva."})
    people.write(f"E{row}", position["aiSupport"] + " " + position["tokenBasis"], fmt["text"])
    if position["id"] == "founder":
        people.write(f"D{row}", "Parcela originária de 20%; não é nova concessão.", fmt["text"])
    else:
        people.write_blank(f"D{row}", None, fmt["tokens"])
        people.data_validation(f"D{row}", {"validate": "decimal", "criteria": ">", "value": 0, "error_type": "stop"})
    people.set_row(row - 1, 75)
people.write("A10", "Total de remuneração mensal", fmt["head"])
formula(people, "C10", '=IF(AND(COUNT(C4:C8)=5,C4=0,MIN(C5:C8)>0),SUM(C5:C8),"VALIDAR FUNDADOR ZERO E QUATRO REMUNERAÇÕES")',
        sum(p["proposedMonthlySalaryUsd"] for p in TEAM["positions"]))
people.write("A11", "Total de concessões aos colaboradores", fmt["head"])
people.write_formula("D11", '=IF(AND(COUNT(D5:D8)=4,MIN(D5:D8)>0),SUM(D5:D8),"INFORMAR CONCESSÕES")', fmt["tokens"], "INFORMAR CONCESSÕES")
people.write("A13", "BETTEX liberados e disponíveis do fundador para concessão", fmt["text"])
people.write_blank("D13", None, fmt["tokens"])
people.data_validation("D13", {"validate": "decimal", "criteria": "between", "minimum": 0, "maximum": 200_000_000, "error_type": "stop"})
people.write("A14", "Conferência quantitativa", fmt["head"])
people.set_row(12, 45)
people.set_row(13, 45)
formula(people, "D14", '=IF(COUNT(D11,D13)=2,IF(OR(D13<0,D13>200000000),"DISPONIBILIDADE INVÁLIDA",IF(D11>D13,"CONCESSÕES EXCEDEM DISPONIBILIDADE","QUANTIDADE COMPATÍVEL; VALIDAR CONTRATOS/VESTING")),"INFORMAR QUANTIDADES")', integer=True)
people.merge_range("A16:E17", "Salários preenchidos são propostas; fundador zero é decisão. Remunerações alimentam Orçamento e Plano-base sem duplicação. BETTEX concedidos continuam sem quantidades presumidas e não são receita de taxas ou salário. Validar vínculos, encargos, tributos e moeda legal; ferramentas entram em IA/tecnologia.", fmt["text"])

target = sheet("Equilíbrio mensal", {"A:A": 56, "B:C": 25, "D:F": 27})
target.write("A1", "Cobrir o custo mensal com tarifas do aplicativo", fmt["title"])
target.merge_range("A2:F2", "Piso de cobertura bruta, sem margem extra. Custo agregado inclui pessoal, marketing, tecnologia, tokens e operação; não é orçamento discriminado validado. USD/USDC 1:1 somente como hipótese.", fmt["warning"])
target.set_row(1, 52)
target.write_row("A3", ["Indicador", "Cenário equilibrado", "Referência superior de custo"], fmt["head"])
labels = {4: "Referência de custo para comparar os fixos, US$", 5: "Tarifa por operação, US$", 6: "Dias no mês",
          7: "Custo adicional/operação NÃO incluído no orçamento",
          8: "Pontos percentuais adicionais de provisão / receita",
          9: "Fixos do Plano-base × referência / meta-base",
          10: "Contribuição por operação", 11: "Operações tarifadas necessárias/mês",
          12: "Média de operações/dia", 13: "Pessoas com um saque/dia, arredondado",
          14: "Receita bruta no piso", 15: "Contribuição para cobrir os fixos",
          18: "Pessoas fazendo quatro operações/mês",
          19: "Pessoas fazendo duas operações/mês",
          20: "Saques/mês com as pessoas da linha 13",
          21: "Receita bruta dos saques diários da linha 20"}
for row, label in labels.items():
    target.write(f"A{row}", label, fmt["text"])
    if row in (7, 8):
        target.set_row(row-1, 40)
for col, budget in [("B", TARGETS["monthlyBudgetUsd"]), ("C", TARGETS["upperBudgetReferenceUsd"])]:
    proposed_fixed = sum(p["proposedMonthlySalaryUsd"] for p in TEAM["positions"])*(1+BUSINESS["payrollChargesRate"])+sum(c["amountUsd"] for c in BUSINESS["fixedCosts"])
    fixed_reference = proposed_fixed*budget/TARGETS["monthlyBudgetUsd"]
    base_contribution = 2.5*(1-BUSINESS["revenueTaxProvisionRate"])-BUSINESS["variableCostPerOperationUsd"]
    n = math.ceil(fixed_reference/base_contribution)
    daily_people = math.ceil(n / TARGETS["daysPerMonth"])
    for row, value in [(4, budget), (6, TARGETS["daysPerMonth"]), (7, 0), (8, 0)]:
        number_input(target, f"{col}{row}", row == 6)
        target.write_number(f"{col}{row}", value, fmt["percent" if row == 8 else "integer" if row == 6 else "input"])
    target.data_validation(f"{col}6", {"validate": "integer", "criteria": "between", "minimum": 1, "maximum": 31, "error_type": "stop"})
    target.data_validation(f"{col}8", {"validate": "decimal", "criteria": "between", "minimum": 0, "maximum": .999999, "error_type": "stop"})
    formula(target, f"{col}5", "=Premissas!$B$4", 2.5)
    reference_guard = f'AND(COUNT({col}4:{col}8)=5,{col}4>=0,{col}5>0,{col}6>=1,{col}6<=31,MOD({col}6,1)=0,{col}8>=0,{col}7>=0,COUNT(\'Plano-base\'!B14,\'Plano-base\'!B16:B17)=3,\'Plano-base\'!B14>=0,\'Plano-base\'!B16>=0,\'Plano-base\'!B17>=0,\'Plano-base\'!B17+{col}8<1,COUNT(Premissas!B4:B6)=3,Premissas!B4=Premissas!B5,Premissas!B4=Premissas!B6)'
    formula(target, f"{col}9", f'=IFERROR(IF({reference_guard},\'Plano-base\'!B14*{col}4/{TARGETS["monthlyBudgetUsd"]},"REVER PREMISSAS"),"REVER PREMISSAS")', fixed_reference)
    formula(target, f"{col}10", f'=IFERROR(IF({reference_guard},{col}5*(1-\'Plano-base\'!B17-{col}8)-\'Plano-base\'!B16-{col}7,"REVER PREMISSAS"),"REVER PREMISSAS")', base_contribution)
    formula(target, f"{col}11", f'=IF(COUNT({col}9:{col}10)=2,IF(AND({col}9>=0,{col}10>0),ROUNDUP({col}9/{col}10,0),"CONTRIBUIÇÃO NÃO POSITIVA"),"REVER PREMISSAS")', n, True)
    expressions = {12: (f"{col}11/{col}6", n/TARGETS["daysPerMonth"]),
                   13: (f"ROUNDUP({col}11/{col}6,0)", daily_people),
                   14: (f"{col}11*{col}5", n*2.5), 15: (f"{col}11*{col}10", n*base_contribution),
                   18: (f"ROUNDUP({col}11/4,0)", math.ceil(n/4)), 19: (f"ROUNDUP({col}11/2,0)", math.ceil(n/2)),
                   20: (f"ROUNDUP({col}11/{col}6,0)*{col}6", daily_people*TARGETS["daysPerMonth"]),
                   21: (f"ROUNDUP({col}11/{col}6,0)*{col}6*{col}5", daily_people*TARGETS["daysPerMonth"]*2.5)}
    for row, (expression, cached) in expressions.items():
        formula(target, f"{col}{row}", f'=IF(ISNUMBER({col}11),{expression},"REVER PREMISSAS")', cached, row in (11, 12, 13, 18, 19, 20))
target.write_row("A24", ["Compras exclusivas — cenário B", "Ticket USDC", "Operações", "Preço à tesouraria", "Tarifas operacionais", "Total pago"], fmt["head"])
for row, ticket in enumerate(TARGETS["purchaseTicketsUsdc"], 25):
    target.write(f"A{row}", "Compra primária; ticket hipotético", fmt["text"])
    number_input(target, f"B{row}")
    target.write_number(f"B{row}", ticket, fmt["input"])
    for col, expression, cached in [("C", "$B$11", TARGETS["monthlyBudgetUsd"]/2.5),
                                   ("D", f"$B$11*B{row}", TARGETS["monthlyBudgetUsd"]/2.5*ticket),
                                   ("E", "$B$14", TARGETS["monthlyBudgetUsd"]),
                                   ("F", f"D{row}+E{row}", TARGETS["monthlyBudgetUsd"]/2.5*ticket+TARGETS["monthlyBudgetUsd"])]:
        formula(target, f"{col}{row}", f'=IF(AND(ISNUMBER($B$11),ISNUMBER(B{row})),{expression},"REVER PREMISSAS")', cached, col == "C")
target.merge_range("A29:F31", "Saques e envios podem compor o mesmo alvo, sem exigir compras exclusivas. Com 20 mil saques solicitados de 10 USDC: 200 mil solicitados, 50 mil de tarifas já incluídas e 150 mil líquidos antes de outros encargos. Sem créditos anteriores/retencões, exige ao menos 800 mil de lucro elegível para gerar créditos via split de 25%. Saldo e demais condições são obrigatórios. Envios BETTEX não são nova captação em USDC.", fmt["text"])
target.write_row("A34", ["Sensibilidade — orçamento B", "Custo extra/operação", "Tributo extra/receita", "Contribuição", "Operações necessárias"], fmt["head"])
for row, tax in [(35, 0), (36, TARGETS["additionalRevenueTaxExample"])]:
    cost = TARGETS["additionalVariableCostExampleUsd"]
    contribution = 2.5*(1-BUSINESS["revenueTaxProvisionRate"]-tax)-BUSINESS["variableCostPerOperationUsd"]-cost
    reference_fixed = proposed_fixed
    target.write(f"A{row}", "Hipótese adicional, NÃO incluída no orçamento", fmt["text"])
    target.write_number(f"B{row}", cost, fmt["money"])
    target.write_number(f"C{row}", tax, fmt["percent"])
    formula(target, f"D{row}", f'=IFERROR(IF(AND(COUNT($B$5,B{row}:C{row},\'Plano-base\'!B16:B17)=5,$B$5>0,MIN(B{row}:C{row})>=0,\'Plano-base\'!B16>=0,\'Plano-base\'!B17>=0,\'Plano-base\'!B17+C{row}<1),$B$5*(1-\'Plano-base\'!B17-C{row})-\'Plano-base\'!B16-B{row},"REVER PREMISSAS"),"REVER PREMISSAS")', contribution)
    formula(target, f"E{row}", f'=IF(COUNT($B$9,D{row})=2,IF(AND($B$9>=0,D{row}>0),ROUNDUP($B$9/D{row},0),"REVER PREMISSAS"),"REVER PREMISSAS")', math.ceil(reference_fixed/contribution), True)
target.merge_range("A38:F40", "Mesmos fixos, variáveis e provisão do Plano-base. Comparação superior escala os fixos pela referência/meta-base; não recalibra fixos para esconder estouro da meta. Adicionais preservam fixos. US$75 mil não é captação nem orçamento aprovado. Linhas 35–36 são comparações próprias, não somadas aos adicionais 7–8. Após editar, receita no piso é o custo sustentado, não necessariamente a referência da linha 4.", fmt["warning"])
target.merge_range("A42:F44", "Se a venda primária captar 75 mil USDC em preço dos tokens no mês, com ticket hipotético de 100 USDC: 750 compras, 1.875 USDC em tarifas adicionais e 19.250 outras operações necessárias para completar 50 mil brutos em taxas. Captação à tesouraria não é caixa para salários. Exemplo condicional, não meta de captação confirmada.", fmt["text"])
salary = sum(p["proposedMonthlySalaryUsd"] for p in TEAM["positions"])
charges = salary * BUSINESS["payrollChargesRate"]
fixed = salary + charges + sum(c["amountUsd"] for c in BUSINESS["fixedCosts"])
setup = sum(c["amountUsd"] for c in BUSINESS["setupCosts"])
contribution = POLICY["fees"][0]["amountUsd"] * (1 - BUSINESS["revenueTaxProvisionRate"]) - BUSINESS["variableCostPerOperationUsd"]
assert TEAM["positions"][0]["proposedMonthlySalaryUsd"] == 0 and contribution > 0
be_operations = math.ceil(fixed / contribution)
plan = sheet("Plano-base", {"A:A": 48, "B:B": 24, "C:C": 86, "D:D": 42, "E:E": 25})
plan.write("A1", "Identidade e negócios — orçamento proposto", fmt["title"])
plan.merge_range("A2:E2", "Hipóteses para feedback, não salários contratados, cotações ou tributação confirmada. Fundador zero é decisão. Não somar este modelo ao orçamento anterior; são propostas separadas.", fmt["warning"])
plan.set_row(1, 48)
plan.write_row("A3", ["Rubrica", "US$/mês", "Escopo", "Outras premissas", "Valor"], fmt["head"])
plan.write("A4", "Remunerações (Equipe AI)")
formula(plan, "B4", "='Equipe AI'!C10", salary)
plan.write("C4", "Quatro colaboradores; fundador sem salário.", fmt["text"])
plan.write("D4", "Encargos hipotéticos / remuneração")
plan.write_number("E4", BUSINESS["payrollChargesRate"], fmt["percent"])
plan.data_validation("E4", {"validate": "decimal", "criteria": ">=", "value": 0, "error_type": "stop"})
plan.write("A5", "Encargos e benefícios propostos")
formula(plan, "B5", '=IF(AND(ISNUMBER(B4),ISNUMBER(E4),E4>=0),B4*E4,"VALIDAR REMUNERAÇÕES/ENCARGOS")', charges)
plan.write("C5", "Provisão de planejamento, não alíquota validada.", fmt["text"])
for row, item in enumerate(BUSINESS["fixedCosts"], 6):
    plan.write(f"A{row}", item["name"])
    number_input(plan, f"B{row}")
    plan.write_number(f"B{row}", item["amountUsd"], fmt["input"])
    plan.write(f"C{row}", item["scope"], fmt["text"])
    plan.set_row(row - 1, 36)
plan.write("A14", "Total fixo", fmt["head"])
formula(plan, "B14", '=IF(AND(COUNT(B4:B13)=10,MIN(B4:B13)>=0),SUM(B4:B13),"VALIDAR FIXOS")', fixed)
inputs = [
    (16, "Custo variável / operação", BUSINESS["variableCostPerOperationUsd"]),
    (17, "Provisão fiscal / receita de serviços", BUSINESS["revenueTaxProvisionRate"]),
    (23, "Meses de reserva de caixa", BUSINESS["reserveMonths"]),
]
for row, label, value in inputs:
    plan.write(f"A{row}", label)
    number_input(plan, f"B{row}", integer=row == 23)
    plan.write_number(f"B{row}", value, fmt["percent" if row == 17 else "integer" if row == 23 else "input"])
plan.data_validation("B17", {"validate": "decimal", "criteria": "between", "minimum": 0, "maximum": .999999, "error_type": "stop"})
plan.write("A18", "Tarifa — Premissas")
formula(plan, "B18", '=IF(AND(COUNT(\'Premissas\'!B4:B6)=3,MIN(\'Premissas\'!B4:B6)>0,MIN(\'Premissas\'!B4:B6)=MAX(\'Premissas\'!B4:B6)),\'Premissas\'!B4,"REVER TARIFAS/MIX")', 2.5)
plan.write("A19", "Contribuição / operação")
formula(plan, "B19", '=IF(AND(COUNT(B16:B18)=3,B16>=0,B17>=0,B17<1,B18>0),B18*(1-B17)-B16,"VALIDAR PREMISSAS")', contribution)
plan.write("A20", "Operações para equilíbrio", fmt["head"])
formula(plan, "B20", '=IF(AND(E32=1,ISNUMBER(B14),ISNUMBER(B19),B19>0),ROUNDUP(B14/B19,0),"VALIDAR PREMISSAS")', be_operations, True)
plan.write("A21", "Custo recorrente no equilíbrio")
formula(plan, "B21", '=IF(COUNT(B14,B16:B18,B20)=5,B14+B20*B16+B20*B18*B17,"VALIDAR PREMISSAS")', fixed+be_operations*(BUSINESS["variableCostPerOperationUsd"]+2.5*BUSINESS["revenueTaxProvisionRate"]))
plan.write("A22", "Implantação pontual")
formula(plan, "B22", '=IF(AND(COUNT(B27:B30)=4,MIN(B27:B30)>=0),SUM(B27:B30),"VALIDAR IMPLANTAÇÃO")', setup)
plan.write("A24", "Reserva = fixos × meses")
formula(plan, "B24", '=IF(AND(COUNT(B14,B23)=2,B23>=0,MOD(B23,1)=0),B14*B23,"VALIDAR RESERVA")', fixed*BUSINESS["reserveMonths"])
for row, item in enumerate(BUSINESS["setupCosts"], 27):
    plan.write(f"A{row}", item["name"], fmt["text"])
    number_input(plan, f"B{row}")
    plan.write_number(f"B{row}", item["amountUsd"], fmt["input"])
    plan.set_row(row-1, 32)
for row, label, value in [
    (16, "Mix: compras", BUSINESS["mix"]["purchaseShare"]),
    (17, "Mix: saques", BUSINESS["mix"]["withdrawalShare"]),
    (18, "Ticket compra USDC", BUSINESS["mix"]["purchaseTicketUsdc"]),
    (19, "Ticket solicitado saque USDC", BUSINESS["mix"]["withdrawalTicketUsdc"]),
    (21, "Chamados / usuário mensal", BUSINESS["support"]["ticketsPerMonthlyActiveUser"]),
    (22, "Resolução automática correta", BUSINESS["support"]["automatedResolutionShare"]),
    (23, "Minutos humanos / chamado", BUSINESS["support"]["humanMinutesPerTicket"]),
    (24, "Horas humanas / mês para suporte", BUSINESS["support"]["humanHoursBudget"]),
]:
    plan.write(f"D{row}", label, fmt["text"])
    number_input(plan, f"E{row}")
    plan.write_number(f"E{row}", value, fmt["percent" if row in (16, 17, 22) else "ratio" if row == 21 else "input"])
    if row in (16, 17, 22):
        plan.data_validation(f"E{row}", {"validate": "decimal", "criteria": "between", "minimum": 0, "maximum": 1, "error_type": "stop"})
plan.write("D32", "Coerência numérica (1 = completa)", fmt["text"])
formula(plan, "E32", '=IFERROR(IF(AND(COUNT(B4:B13)=10,MIN(B4:B13)>=0,COUNT(B16:B19)=4,B16>=0,B17>=0,B17<1,B18>0,B19>0,COUNT(B23,E4)=2,B23>=0,MOD(B23,1)=0,E4>=0,COUNT(B27:B30)=4,MIN(B27:B30)>=0,COUNT(E16:E19)=4,E16>=0,E16<=1,E17>=0,E17<=1,E16+E17<=1,E18>0,E19>B18,COUNT(E21:E24)=4,E21>=0,E22>=0,E22<1,E23>0,E24>=0),1,"VALIDAR PREMISSAS"),"VALIDAR PREMISSAS")', 1, True)

launch = sheet("Lançamento 12m", {"A:A": 10, "B:F": 17, "G:L": 22, "M:O": 22, "P:T": 20})
launch.write("A1", "Lançamento, caixa e dependência de volumes", fmt["title"])
launch.merge_range("A2:T2", "Meses relativos à implantação; não alteram Roadmap/vesting. Caixa livre após separar provisões, antes de aportes; não extrato bancário. Piso agregado pressupõe q=100% do rateio nos sacadores, sem créditos anteriores/retenções. Suporte parcial, não cobertura global comprovada.", fmt["warning"])
launch.set_row(1, 48)
launch.write_row("A3", ["Mês", "Operações", "Compras", "Saques", "Envios", "Receita", "Fixos", "Variáveis", "Provisão fiscal", "Implantação", "Variação livre", "Acumulado livre sem aportes", "USDC compras → tesouraria", "USDC saques solicitados", "Piso agregado: q=100%", "Usuários mensais", "Chamados", "Casos humanos", "Horas de escalonamentos", "Capacidade parcial"], fmt["head"])
launch.set_row(2, 55)
cash_rows = []
cumulative = 0
for row, m in enumerate(BUSINESS["months"], 4):
    n = m["operations"]
    purchases = math.floor(n*BUSINESS["mix"]["purchaseShare"])
    withdrawals = math.floor(n*BUSINESS["mix"]["withdrawalShare"])
    transfers = n-purchases-withdrawals
    revenue = n*2.5
    variable = n*BUSINESS["variableCostPerOperationUsd"]
    tax = revenue*BUSINESS["revenueTaxProvisionRate"]
    initial = setup if m["month"] == 1 else 0
    result = revenue-fixed-variable-tax-initial
    cumulative += result
    cash_rows.append(cumulative)
    support_tickets = m["monthlyActiveUsers"]*BUSINESS["support"]["ticketsPerMonthlyActiveUser"]
    human_tickets = support_tickets*(1-BUSINESS["support"]["automatedResolutionShare"])
    hours = human_tickets*BUSINESS["support"]["humanMinutesPerTicket"]/60
    launch.write_number(f"A{row}", m["month"], fmt["result"])
    for col, value in [("B", n), ("P", m["monthlyActiveUsers"])]:
        number_input(launch, f"{col}{row}", integer=True)
        launch.write_number(f"{col}{row}", value, fmt["integer"])
    exprs = {
        "C": (f'IF(AND(COUNT(B{row},\'Plano-base\'!E16:E17)=3,B{row}>=0,\'Plano-base\'!E16+\'Plano-base\'!E17<=1),ROUNDDOWN(B{row}*\'Plano-base\'!E16,0),"VALIDAR MIX")', purchases),
        "D": (f'IF(ISNUMBER(C{row}),ROUNDDOWN(B{row}*\'Plano-base\'!E17,0),"VALIDAR MIX")', withdrawals),
        "E": (f'IF(COUNT(B{row}:D{row})=3,B{row}-C{row}-D{row},"VALIDAR MIX")', transfers),
        "F": (f'IF(COUNT(B{row}:E{row},\'Plano-base\'!B18)=5,B{row}*\'Plano-base\'!B18,"VALIDAR VOLUME/TARIFA/MIX")', revenue),
        "G": ("'Plano-base'!B14", fixed),
        "H": (f'IF(COUNT(B{row},\'Plano-base\'!B16)=2,B{row}*\'Plano-base\'!B16,"VALIDAR VARIÁVEIS")', variable),
        "I": (f'IF(COUNT(F{row},\'Plano-base\'!B17)=2,F{row}*\'Plano-base\'!B17,"VALIDAR PROVISÃO")', tax),
        "J": ("'Plano-base'!B22" if m["month"] == 1 else "0", initial),
        "K": (f'IF(COUNT(F{row}:J{row})=5,F{row}-SUM(G{row}:J{row}),"VALIDAR CUSTOS/VOLUME")', result),
        "L": (f'IF(COUNT(K$4:K{row})={row-3},SUM(K$4:K{row}),"VALIDAR CAIXA")', cumulative),
        "M": (f'IF(COUNT(C{row},\'Plano-base\'!E18)=2,C{row}*\'Plano-base\'!E18,"VALIDAR COMPRAS")', purchases*BUSINESS["mix"]["purchaseTicketUsdc"]),
        "N": (f'IF(AND(COUNT(D{row},\'Plano-base\'!E19,\'Plano-base\'!B18)=3,\'Plano-base\'!E19>\'Plano-base\'!B18),D{row}*\'Plano-base\'!E19,"VALIDAR SAQUES")', withdrawals*BUSINESS["mix"]["withdrawalTicketUsdc"]),
        "O": (f'IF(ISNUMBER(N{row}),N{row}/25%,"VALIDAR CRÉDITOS")', withdrawals*BUSINESS["mix"]["withdrawalTicketUsdc"]/.25),
        "Q": (f'IF(COUNT(P{row},\'Plano-base\'!E21)=2,P{row}*\'Plano-base\'!E21,"VALIDAR SUPORTE")', support_tickets),
        "R": (f'IF(COUNT(Q{row},\'Plano-base\'!E22)=2,Q{row}*(1-\'Plano-base\'!E22),"VALIDAR SUPORTE")', human_tickets),
        "S": (f'IF(COUNT(R{row},\'Plano-base\'!E23)=2,R{row}*\'Plano-base\'!E23/60,"VALIDAR SUPORTE")', hours),
        "T": (f'IF(COUNT(S{row},\'Plano-base\'!E24)=2,IF(S{row}<=\'Plano-base\'!E24,"DENTRO: MODELO PARCIAL","REVER COBERTURA"),"VALIDAR SUPORTE")', "DENTRO: MODELO PARCIAL" if hours <= BUSINESS["support"]["humanHoursBudget"] else "REVER COBERTURA"),
    }
    for col, (expr, cache) in exprs.items():
        valid_row = f'AND(\'Plano-base\'!$E$32=1,COUNT(B{row},P{row})=2,B{row}>=0,P{row}>=0,MOD(B{row},1)=0,MOD(P{row},1)=0,OR(B{row}=0,P{row}>0))'
        guarded = f'=IFERROR(IF({valid_row},{expr},"VALIDAR PREMISSAS/VOLUMES"),"VALIDAR PREMISSAS/VOLUMES")'
        formula(launch, f"{col}{row}", guarded, cache, col in ("C", "D", "E", "Q", "R", "S", "T"))
deficit = -min(0, *cash_rows)
plan.write("A32", "Financiamento operacional inicial", fmt["head"])
formula(plan, "B32", '=IF(AND(COUNT(\'Lançamento 12m\'!L4:L15)=12,ISNUMBER(B24)),MAX(0,-MIN(\'Lançamento 12m\'!L4:L15))+B24,"VALIDAR RAMPA/RESERVA")', deficit+fixed*BUSINESS["reserveMonths"])
plan.write("A33", "Déficit máximo (inclui implantação)")
formula(plan, "B33", '=IF(COUNT(\'Lançamento 12m\'!L4:L15)=12,MAX(0,-MIN(\'Lançamento 12m\'!L4:L15)),"VALIDAR RAMPA")', deficit)
plan.write("A34", "Aporte total se fonte exclusiva 50/50")
formula(plan, "B34", '=IF(ISNUMBER(B32),B32/50%,"VALIDAR FINANCIAMENTO")', (deficit+fixed*BUSINESS["reserveMonths"])/.5)
plan.merge_range("A36:E38", "Caixa livre após reservar provisões, antes de aportes; não extrato bancário ou lucro distribuível. Pagar tributo já reservado não reduz o livre outra vez. Financiamento não é receita; reserva de caixa não é despesa ou reserva de investimentos. Suporte é parcial: exclui interessados, revisões, reaberturas, picos e especialistas. Piso de lucro O usa q=100%; com peso menor, solicitado /(25%×q). Validar estoque, permissões e saldo individual.", fmt["text"])
wb.close()

# Validate the archive, formulas, and cached scenario values without pretending
# Python recalculates arbitrary Excel formulas.
ns = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
with zipfile.ZipFile(DEST) as z:
    assert z.testzip() is None
    xml = ET.fromstring(z.read("xl/worksheets/sheet3.xml"))
    cells = {e.attrib["r"]: e for e in xml.findall(".//s:c", ns)}
    expected = {"F4": 25000, "F5": 50000, "F6": 30000, "F7": 40000,
                "F8": 8750, "F12": 5000, "F13": 50000, "F14": 250000}
    for ref, value in expected.items():
        assert float(cells[ref].find("s:v", ns).text) == value
        assert cells[ref].find("s:f", ns) is not None
    for file in ["xl/worksheets/sheet4.xml", "xl/worksheets/sheet5.xml"]:
        tree = ET.fromstring(z.read(file))
        for e in tree.findall(".//s:c", ns):
            f = e.find("s:f", ns)
            if f is not None:
                assert "#REF!" not in f.text
    assert math.ceil(20000 / (2.5-.15)) == 8511
    t = ET.fromstring(z.read("xl/worksheets/sheet8.xml"))
    cells = {e.attrib["r"]: e for e in t.findall(".//s:c", ns)}
    for ref, value in {"B11": 20000, "C11": 30000, "B13": 667, "B20": 20010,
                       "B21": 50025, "D25": 1000000, "F25": 1050000,
                       "B9": 42000, "C9": 63000, "B10": 2.1,
                       "E35": 21539, "E36": 24706}.items():
        assert float(cells[ref].find("s:v", ns).text) == value
        assert cells[ref].find("s:f", ns) is not None
    people_xml = ET.fromstring(z.read("xl/worksheets/sheet7.xml"))
    cells = {e.attrib["r"]: e for e in people_xml.findall(".//s:c", ns)}
    assert float(cells["C4"].find("s:v", ns).text) == 0
    assert float(cells["C10"].find("s:v", ns).text) == 20000
    for sheet_num, expected in {
        9: {"B4": 20000, "B5": 4000, "B14": 42000, "B19": 2.1, "B20": 20000,
            "B21": 50000, "B22": 45000, "B24": 126000, "B32": 411450, "B33": 285450, "B34": 822900},
        10: {"K4": -87000, "L11": -285450, "K12": 0, "F12": 50000,
             "D12": 15000, "N12": 150000, "O12": 600000, "L15": -235050, "S15": 48},
    }.items():
        xml = ET.fromstring(z.read(f"xl/worksheets/sheet{sheet_num}.xml"))
        cells = {e.attrib["r"]: e for e in xml.findall(".//s:c", ns)}
        for ref, value in expected.items():
            assert math.isclose(float(cells[ref].find("s:v", ns).text), value, rel_tol=1e-9)
            assert cells[ref].find("s:f", ns) is not None
print(f"Generated and verified: {DEST.name}; 10 sheets; salary, budget, ramp and scenario caches/formula references checked.")