"""Planilha de planejamento, não um mecanismo de cobrança ou cotação ao vivo."""
import json
from pathlib import Path
import xlsxwriter

app = Path(__file__).resolve().parents[1]
proposal = json.loads((app / "src/lib/service-fee-proposal.json").read_text())
example_amount = 100
example_price = 0.2
purchase_rate = proposal["fees"][0]["rate"]
example_gross = example_amount / example_price
example_fee_usdc = example_amount * purchase_rate
example_fee_tokens = example_fee_usdc / example_price
output = app / "public/downloads/bettex-taxas-fundacao.xlsx"
output.parent.mkdir(parents=True, exist_ok=True)
book = xlsxwriter.Workbook(output)
book.set_properties({"title": "BETTEX — taxas e financiamento da Fundação",
                     "comments": "Compra a 1% e saque do staking a 2% definidos pelo criador. Outras taxas sugeridas. Exemplos não são preços ou receitas reais."})
title = book.add_format({"bold": True, "font_size": 18, "font_color": "#FFFFFF", "bg_color": "#13204F"})
header = book.add_format({"bold": True, "font_color": "#FFFFFF", "bg_color": "#13204F", "text_wrap": True})
text = book.add_format({"text_wrap": True, "valign": "top"})
input_number = book.add_format({"font_color": "#125BB5", "bg_color": "#FFF2CB", "num_format": "#,##0.000000", "locked": False})
number = book.add_format({"num_format": "#,##0.000000", "bg_color": "#EFF2F7"})
rate = book.add_format({"num_format": "0.0%", "font_color": "#125BB5", "bg_color": "#FFF2CB"})
note = book.add_format({"text_wrap": True, "font_color": "#5B6172", "valign": "top"})
choice = book.add_format({"font_color": "#125BB5", "bg_color": "#FFF2CB", "text_wrap": True})

def setup(name, heading, subtitle, last_col=3):
    sheet = book.add_worksheet(name)
    sheet.hide_gridlines(2)
    sheet.merge_range(0, 0, 0, last_col, heading, title)
    sheet.set_row(0, 32)
    sheet.merge_range(1, 0, 1, last_col, subtitle, note)
    sheet.set_row(1, 52)
    sheet.freeze_panes(4, 0)
    sheet.set_landscape()
    sheet.fit_to_pages(1, 1)
    sheet.set_paper(9)
    return sheet

fees = setup("Taxas", "BETTEX — taxas definidas e sugestões",
             "Compra: alvo líquido de tributos 1%. Saque: alvo líquido 2%. Cobrança total inclui cobertura fiscal e é paga em BETTEX à Fundação, sem queima. Simulação sem tarifas reais.")
fees.set_column("A:A", 46)
fees.set_column("B:B", 16)
fees.set_column("C:C", 44)
fees.set_column("D:D", 45)
fees.write_row(3, 0, ["Operação", "Percentual", "Base de cálculo", "Situação"], header)
for row, item in enumerate(proposal["fees"], 4):
    fees.write(row, 0, item["operation"], text)
    fees.write(row, 1, item["rate"], rate)
    fees.write(row, 2, item["basis"], text)
    fees.write(row, 3, item["scope"], text)
    fees.set_row(row, 52)
fees.data_validation("B5:B8", {"validate": "decimal", "criteria": "between", "minimum": 0, "maximum": 0.99})
fees.merge_range("A10:D11", "Recomendação: depósito simples e crédito automático do yield sem segunda taxa. Transferências diretas fora do aplicativo não pagam taxa de serviço. Os custos externos continuam separados.", note)
fees.merge_range("A13:D14", "100% do USDC da venda pública permanece na tesouraria. A taxa usa tokens existentes e não altera 1 bilhão, 65% / 20% / 15% ou vesting de 36 meses. O token não representa participação na empresa.", note)
fees.print_area("A1:D14")
book.define_name("OPERACOES_CALCULADORA", "='Taxas'!$A$5:$A$6")

calc = setup("Calculadora", "BETTEX — calculadora por operação",
             "100 USDC a 0,20 USDC/BETTEX são ilustrativos. Informe B23:B24. Perfil fiscal comum a compra/saque/reposição somente neste exemplo; operação real exige cotação fiscal própria.", 2)
calc.set_column("A:A", 54)
calc.set_column("B:B", 48)
calc.set_column("C:C", 65)
calc.write_row(3, 0, ["Parâmetro", "Valor", "Explicação"], header)
calc.write_row(4, 0, ["Valor-base em USDC", example_amount, "Compra ou USDC do staking solicitado no saque"], text)
calc.write_number("B5", example_amount, input_number)
calc.write_row(5, 0, ["Cotação: USDC por BETTEX", example_price, "Cotação positiva, com fonte e validade a conferir"], text)
calc.write_number("B6", example_price, input_number)
calc.write_row(6, 0, ["Operação", proposal["fees"][0]["operation"], "Selecione compra ou saque de USDC do staking"], text)
calc.write("B7", proposal["fees"][0]["operation"], choice)
calc.set_row(6, 44)
calc.data_validation("B7", {"validate": "list", "source": "=OPERACOES_CALCULADORA"})
calc.write("A8", "Percentual líquido-alvo após tributos", text)
calc.write_formula("B8", "=INDEX(Taxas!$B$5:$B$6,MATCH(B7,Taxas!$A$5:$A$6,0))", rate, purchase_rate)
calc.write("A9", "Saldo BETTEX já disponível para a taxa", text)
calc.write_number("B9", 0, input_number)
calc.write("C9", "Sem incluir tokens reservados, pendentes ou em conciliação", text)
calc.write("A11", "Cobrança total com tributos: equivalente USDC", text)
calc.write_formula("B11", '=IF(COUNT(B23:B24)<2,"Informar dados fiscais",IF(AND(B23>=0,B23<1,B24>=0,B5>=0),(B5*B8+B24)/(1-B23),"Rever dados fiscais"))', number, "Informar dados fiscais")
calc.write("A12", "Taxa em BETTEX", text)
calc.write_formula("B12", '=IF(AND(B6>0,ISNUMBER(B11)),B11/B6,"Conferir cotação e tributos")', number, "Conferir cotação e tributos")
calc.write("A14", "Compra: BETTEX brutos", text)
calc.write_formula("B14", '=IF(B7=Taxas!A5,IF(B6>0,B5/B6,"Definir cotação positiva"),"Não aplicável")', number, example_gross)
calc.write("A15", "Compra: BETTEX líquidos para o titular", text)
calc.write_formula("B15", '=IF(B7=Taxas!A5,IF(AND(ISNUMBER(B14),ISNUMBER(B12)),IF(B14>B12,B14-B12,"Cobrança esgota compra"),"Conferir cotação e tributos"),"Não aplicável")', number, "Conferir cotação e tributos")
calc.write("C15", "Bruto menos taxa à Fundação; primeira compra não exige saldo prévio", text)
calc.write("A17", "Saque: compra bruta para completar a taxa", text)
calc.write_formula("B17", '=IF(B7=Taxas!A5,"Cobrança deduzida na compra",IF(AND(ISNUMBER(B12),B6>0,COUNT(B23:B24)=2,B23>=0,B24>=0,1-B23-Taxas!B5>0),IF(B12<=B9,0,((B12-B9)*(1-B23)+B24/B6)/(1-B23-Taxas!B5)),"Conferir cotação e tributos"))', number, "Cobrança deduzida na compra")
calc.write("C17", "Inclui tributos da compra. Perfil comum apenas nesta hipótese; sem saldo faltante não há compra nem segunda provisão.", text)
calc.write("A18", "USDC necessário para essa compra", text)
calc.write_formula("B18", '=IF(ISNUMBER(B17),B17*B6,"Não aplicável")', number, "Não aplicável")
calc.data_validation("B5", {"validate": "decimal", "criteria": ">=", "value": 0})
calc.data_validation("B6", {"validate": "decimal", "criteria": ">", "value": 0})
calc.data_validation("B9", {"validate": "decimal", "criteria": ">=", "value": 0})
calc.merge_range("A20:C21", "As fórmulas usam cotação comum e não executam operações. Gas, tarifas externas, liquidez e arredondamento executável precisam de validação separada. Saldo insuficiente não cancela yield nem autoriza compra automática.", note)
calc.write("A23", "Carga efetiva sobre total cobrado (hipótese)", text)
calc.write_blank("B23", None, rate)
calc.write("C23", "Modelo linear. Não é alíquota universal nem apuração legal; incide também sobre o acréscimo fiscal.", text)
calc.write("A24", "Outros tributos por operação (USDC)", text)
calc.write_blank("B24", None, input_number)
calc.write("C24", "Somente obrigações ainda não cobertas, não incluídas na carga proporcional ou financiadas por outra fonte.", text)
calc.write("A26", "Líquido-alvo em USDC antes de demais despesas", text)
calc.write_formula("B26", "=B5*B8", number, example_fee_usdc)
calc.data_validation("B23", {"validate": "decimal", "criteria": "between", "minimum": 0, "maximum": 0.999999})
calc.data_validation("B24", {"validate": "decimal", "criteria": ">=", "value": 0})
calc.set_row(22, 48)
calc.set_row(23, 48)
calc.print_area("A1:C26")

monthly = setup("Operação mensal", "BETTEX — orçamento institucional",
                "Preencha os volumes e custos: nenhum volume operacional real foi informado. Equivalente estimado de taxas em USDC NÃO é caixa recebido.", 2)
monthly.set_column("A:A", 59)
monthly.set_column("B:B", 24)
monthly.set_column("C:C", 67)
monthly.write_row(3, 0, ["Parâmetro mensal", "USDC", "Tratamento"], header)
inputs = [
    ("Volume bruto de compras do pool", "Entrada de cenário; não receita institucional em USDC"),
    ("Volume solicitado de saques de USDC do staking", "Não somar novamente o crédito automático do yield"),
    ("Custo institucional mensal previsto, inclusive tributos", "Infraestrutura, auditoria, administração, operação e tributos próprios da Fundação, fora da tesouraria"),
    ("Caixa líquido efetivo da conversão de taxas", "Somente USDC efetivamente recebido, após custos"),
    ("Orçamento inicial ainda disponível", "Saldo finito; não é receita recorrente"),
]
for row, (label, description) in enumerate(inputs, 4):
    monthly.write(row, 0, label, text)
    monthly.write_number(row, 1, 0, input_number)
    monthly.write(row, 2, description, text)
    monthly.set_row(row, 32)
monthly.data_validation("B5:B9", {"validate": "decimal", "criteria": ">=", "value": 0})
monthly.write("A11", "Equivalente nominal líquido-alvo após tributos", text)
monthly.write_formula("B11", "=B5*Taxas!B5+B6*Taxas!B6", number, 0)
monthly.write("C11", "Alvo 1% / 2% líquido de tributos, antes dos demais custos. Cobrança bruta na aba Cobertura fiscal. Não é caixa.", text)
monthly.write("A12", "Cobertura do custo com caixa e orçamento", text)
monthly.write_formula("B12", "=B8+B9-B7", number, 0)
monthly.write("C12", "Não inclui tokens apenas avaliados. Negativo indica falta de financiamento.", text)
monthly.write("A14", "Volume teórico de saques para cobrir o custo", text)
monthly.write_formula("B14", '=IF(Taxas!B6>0,MAX(0,B7-B5*Taxas!B5)/Taxas!B6,"Sem taxa de saque")', number, 0)
monthly.write("C14", "Hipótese de conversão integral ao valor indicado, sem custos; não comprova viabilidade.", text)
monthly.merge_range("A16:C18", "Converta ou utilize receitas institucionais separadamente. Venda de tokens recebidos como taxa não é nova venda pública nem lucro da tesouraria. O orçamento inicial não se repete mensalmente. Swap e retirada de BETTEX são propostas adicionais, não somadas aos volumes acima. Trate cotações variáveis e custos de conversão com registros efetivos.", note)
monthly.print_area("A1:C18")

scenarios = json.loads((app / "src/lib/fee-projection-scenarios.json").read_text())["scenarios"]
projection = setup("Projeções", "BETTEX — comportamento de saques diários",
                   "Mês hipotético de 30 dias. Valores de taxas são ALVOS líquidos de tributos, antes dos demais custos, não cobrança bruta ou caixa. Informe o perfil na aba Cobertura fiscal.")
projection.set_column("A:A", 62)
projection.set_column("B:D", 27)
projection.write_row(3, 0, ["Indicador"] + [s["name"] for s in scenarios], header)
input_rows = [
    (4, "activeUsers", "Usuários ativos no mês", input_number),
    (5, "newBuyerShare", "Parcela dos ativos que faz primeira compra", rate),
    (6, "firstPurchase", "Ticket da primeira compra (USDC)", input_number),
    (7, "repeatBuyerShare", "Parcela dos ativos que faz compras adicionais", rate),
    (8, "monthlyRepeatPurchase", "Compras adicionais por comprador/mês (USDC)", input_number),
    (9, "withdrawerShare", "Parcela dos ativos que saca diariamente", rate),
    (10, "dailyWithdrawal", "Ticket por saque diário (USDC por pessoa)", input_number),
    (11, "withdrawalDays", "Dias com saque por pessoa/mês", input_number),
]
for row, _, label, _ in input_rows:
    projection.write(row, 0, label, text)
projection.write("A13", "Cotação ilustrativa: USDC por BETTEX", text)
labels = {
    13: "Pessoas que fazem primeira compra",
    14: "Pessoas que fazem compras adicionais",
    15: "Pessoas que sacam diariamente",
    16: "USDC sacado por pessoa/mês",
    17: "Volume mensal de compras (USDC)",
    18: "Volume mensal de saques (USDC)",
    19: "Quantidade de saques concluídos/mês",
    20: "Alvo líquido de compra: equivalente USDC/mês",
    21: "Alvo líquido de saque: equivalente USDC/mês",
    22: "Total líquido-alvo: equivalente USDC/mês",
    23: "Alvo em 12 meses constantes: equivalente USDC",
    24: "Taxas por usuário ativo/mês: equivalente USDC",
    25: "Taxas de saque por dia ativo: equivalente USDC",
    26: "Piso líquido elegível/mês, sem retenção individual",
    27: "Alvo em BETTEX/mês, sem provisão fiscal bruta",
    28: "Piso líquido elegível/dia, sem retenção individual",
}
for row, label in labels.items():
    projection.write(row, 0, label, text)
for col, s in enumerate(scenarios, 1):
    letter = xlsxwriter.utility.xl_col_to_name(col)
    for row, key, _, fmt in input_rows:
        projection.write_number(row, col, s[key], fmt)
    projection.write_number(12, col, example_price, input_number)
    for excel_row in [5, 7, 9, 11]:
        projection.data_validation(f"{letter}{excel_row}", {"validate": "decimal", "criteria": ">=", "value": 0})
    for excel_row, other in [(6, 8), (8, 6)]:
        projection.data_validation(f"{letter}{excel_row}", {
            "validate": "custom",
            "value": f"=AND(ISNUMBER({letter}{excel_row}),{letter}{excel_row}>=0,{letter}{excel_row}+{letter}{other}<=1)",
            "error_message": "Primeiros e recorrentes devem somar no máximo 100%.",
        })
    projection.data_validation(f"{letter}10", {"validate": "decimal", "criteria": "between", "minimum": 0, "maximum": 1})
    projection.data_validation(f"{letter}12", {"validate": "integer", "criteria": "between", "minimum": 0, "maximum": 31})
    projection.data_validation(f"{letter}13", {"validate": "decimal", "criteria": ">", "value": 0})
    new_buyers = s["activeUsers"] * s["newBuyerShare"]
    repeat_buyers = s["activeUsers"] * s["repeatBuyerShare"]
    withdrawers = s["activeUsers"] * s["withdrawerShare"]
    buys = new_buyers * s["firstPurchase"] + repeat_buyers * s["monthlyRepeatPurchase"]
    monthly_withdrawal = s["dailyWithdrawal"] * s["withdrawalDays"]
    withdrawal_count = withdrawers * s["withdrawalDays"]
    daily_volume = withdrawers * s["dailyWithdrawal"] if s["withdrawalDays"] > 0 else 0
    withdrawals = daily_volume * s["withdrawalDays"]
    buy_fees = buys * purchase_rate
    withdrawal_fees = withdrawals * proposal["fees"][1]["rate"]
    total = buy_fees + withdrawal_fees
    formulas = [
        (13, f"={letter}5*{letter}6", new_buyers),
        (14, f"={letter}5*{letter}8", repeat_buyers),
        (15, f"={letter}5*{letter}10", withdrawers),
        (16, f"={letter}11*{letter}12", monthly_withdrawal),
        (17, f"={letter}14*{letter}7+{letter}15*{letter}9", buys),
        (18, f"={letter}16*{letter}11*{letter}12", withdrawals),
        (19, f"={letter}16*{letter}12", withdrawal_count),
        (20, f"={letter}18*Taxas!$B$5", buy_fees),
        (21, f"={letter}19*Taxas!$B$6", withdrawal_fees),
        (22, f"={letter}21+{letter}22", total),
        (23, f"={letter}23*12", total * 12),
        (24, f"=IF({letter}5>0,{letter}23/{letter}5,0)", total / s["activeUsers"]),
        (25, f"=IF({letter}12>0,{letter}16*{letter}11*Taxas!$B$6,0)", daily_volume * proposal["fees"][1]["rate"]),
        (26, f"={letter}19/25%", withdrawals / .25),
        (27, f'=IF({letter}13>0,{letter}23/{letter}13,"Definir cotação positiva")', total / example_price),
        (28, f"=IF({letter}12>0,{letter}16*{letter}11/25%,0)", daily_volume / .25),
    ]
    for row, formula, cached in formulas:
        projection.write_formula(row, col, formula, number, cached)
projection.merge_range("A30:D31", "Ticket de saque = valor por dia; um saque por pessoa/dia ativo. Recompras = total mensal. Volume = pessoas × dias × ticket. Os 12 meses repetem o mês de referência, não calendário exato. Entrantes compensam inativos. Dividir o mesmo volume não altera o alvo líquido de 2%, mas pode alterar provisão fiscal por operação. Cobrança bruta na aba Cobertura fiscal.", note)
projection.set_row(29, 35)
projection.set_row(30, 35)
projection.merge_range("A33:D34", "Saques pressupõem crédito líquido de retenções, liquidez e BETTEX para taxa. Pisos de lucro elegível são APÓS tributos da entidade, sem créditos anteriores e sem retenções individuais. Com retenção: (saques líquidos + imposto retido) / 25%. Preencha a aba Tributos; ausência de valor não significa isenção. Reservas precedem split; retenção para recomposição não cria crédito.", note)
projection.set_row(32, 35)
projection.set_row(33, 35)
projection.merge_range("A36:D37", "Somente compra do pool no aplicativo (1%) e saque USDC do staking (2%). Exclui taxas sugeridas, transferências externas e orçamento inicial. Não presume cobrança em vendas diretas a corretoras. Conversão de BETTEX em caixa considera valores efetivos, liquidez e custos. Compras para completar a taxa entram uma vez no volume, não automaticamente.", note)
projection.set_row(35, 35)
projection.set_row(36, 35)
projection.print_area("A1:D37")

tax = setup("Tributos", "BETTEX — ordem fiscal da distribuição",
            "Simulação, não cálculo de alíquotas legais. Valores fiscais em branco bloqueiam resultados; informe zero explicitamente se essa for a hipótese. Nenhuma obrigação real é criada.", 2)
tax.set_column("A:A", 61)
tax.set_column("B:B", 30)
tax.set_column("C:C", 74)
tax.write_row(3, 0, ["Parâmetro", "USDC ou condição", "Tratamento"], header)
tax.write("A5", "Resultado após custos, antes dos tributos", text)
tax.write_number("B5", 1000, input_number)
tax.write("C5", "Exemplo isolado: R = P − B antes dos tributos, sem perdas anteriores ou posições abertas.", text)
tax.write("A6", "Tributos da entidade imputáveis à tesouraria", text)
tax.write_blank("B6", None, input_number)
tax.write("C6", "Tributos e custos fiscais atribuídos à tesouraria ainda não deduzidos; incluir cobertura de outras obrigações somente conforme fonte validada, sem repetir o já financiado nas taxas.", text)
tax.write("A7", "Retenções totais dos beneficiários desta rodada", text)
tax.write_blank("B7", None, input_number)
tax.write("C7", "Incidências individuais validadas, separadas do bruto. Não é alíquota universal nem receita da Fundação.", text)
tax.write("A8", "Condições de distribuição atendidas no exemplo?", text)
tax.write("B8", "Não", choice)
tax.write("C8", "Sim pressupõe reservas, liquidez, conciliação e pesos positivos. Não mantém lucro líquido retido, sem novo split.", text)
tax.data_validation("B8", {"validate": "list", "source": ["Sim", "Não"]})
tax.data_validation("B5", {"validate": "decimal", "criteria": "between", "minimum": -1e15, "maximum": 1e15})
for cell in ["B6", "B7", "B21", "B22"]:
    tax.data_validation(cell, {"validate": "decimal", "criteria": ">=", "value": 0})
tax.write("A10", "Validação das entradas", text)
tax.write_formula("B10", '=IF(COUNT(B5:B7)<3,"Informar tributos e retenções",IF(OR(B6<0,B7<0),"Valores inválidos",IF(AND(B8<>"Sim",B8<>"Não"),"Rever condições",IF(B7>IF(B8="Sim",MAX(0,B5-B6)*25%,0),"Retenção supera staking","Calculado"))))', text, "Informar tributos e retenções")
tax_rows = [
    (12, "Resultado após tributos da entidade", "=B5-B6"),
    (13, "Lucro elegível neste exemplo isolado", "=MAX(0,B12)"),
    (14, "Parcela da tesouraria ou lucro retido", '=IF(B8="Sim",B13*75%,B13)'),
    (15, "Staking bruto", '=IF(B8="Sim",B13*25%,0)'),
    (16, "Tributo retido a recolher", "=B7"),
    (17, "Staking líquido a pagar", "=B15-B16"),
]
for row, label, formula in tax_rows:
    tax.write(f"A{row}", label, text)
    tax.write_formula(f"B{row}", f'=IF(B10="Calculado",{formula[1:]},"Não calculado")', number, "Não calculado")
tax.merge_range("A19:C19", "Meta de saques mensais do cenário de referência: demanda líquida, não previsão de rendimento", header)
tax.write("A21", "Retenções dos beneficiários no mês", text)
tax.write_blank("B21", None, input_number)
tax.write("C21", "Total fiscal previsto para os beneficiários do cenário. Informe inclusive zero; nenhuma isenção é presumida.", text)
tax.write("A22", "Tributos da entidade no mês, ainda não deduzidos", text)
tax.write_blank("B22", None, input_number)
tax.write("C22", "Tributos imputáveis a esse resultado. Regime, base e cálculo exigem validação; não é percentual sobre o lucro elegível por padrão.", text)
tax.write("A23", "Volume líquido de saques pretendido", text)
reference_withdrawals = scenarios[1]["activeUsers"] * scenarios[1]["withdrawerShare"] * scenarios[1]["dailyWithdrawal"] * scenarios[1]["withdrawalDays"]
tax.write_formula("B23", "='Projeções'!C19", number, reference_withdrawals)
tax.write("A24", "Lucro líquido elegível necessário após tributos", text)
tax.write_formula("B24", '=IF(COUNT(B21)=1,IF(B21>=0,(B23+B21)/25%,"Valor inválido"),"Informar retenções")', number, "Informar retenções")
tax.write("A25", "Resultado necessário antes dos tributos da entidade", text)
tax.write_formula("B25", '=IF(AND(ISNUMBER(B24),COUNT(B22)=1),IF(B22>=0,B24+B22,"Valor inválido"),"Informar tributos e retenções")', number, "Informar tributos e retenções")
tax.merge_range("A27:C29", "Tributos da entidade precedem apuração e split; retenções precedem pagamento no evento fiscal aplicável. Bruto = líquido devido + imposto retido. Reservar para recolhimento, sem caixa livre. Não deduzir ou financiar de novo imposto já coberto. Metas supõem ausência de créditos anteriores e saque de todo o líquido; perdas e recomposição podem impedir split. 1% compra / 2% saque são alvos líquidos: total inclui cobertura fiscal. Sem pagamentos reais.", note)
for row in [4, 5, 6, 7, 9, 20, 21]:
    tax.set_row(row, 48)
for row in [26, 27, 28]:
    tax.set_row(row, 30)
tax.print_area("A1:C29")

coverage = setup("Cobertura fiscal", "BETTEX — alvo líquido e cobrança bruta mensal",
                 "Referência: 1% compra / 2% saque líquidos de tributos. Entradas fiscais em branco impedem cobrança total. Modelos lineares distintos por operação, sem alíquota legal presumida.", 2)
coverage.set_column("A:A", 63)
coverage.set_column("B:B", 32)
coverage.set_column("C:C", 72)
coverage.write_row(3, 0, ["Indicador", "Valor", "Tratamento"], header)
reference = scenarios[1]
reference_buys = reference["activeUsers"] * (reference["newBuyerShare"] * reference["firstPurchase"] + reference["repeatBuyerShare"] * reference["monthlyRepeatPurchase"])
buy_target = reference_buys * purchase_rate
withdrawal_target = reference_withdrawals * proposal["fees"][1]["rate"]
coverage.write("A5", "Alvo líquido mensal de compra", text)
coverage.write_formula("B5", "='Projeções'!C21", number, buy_target)
coverage.write("A6", "Alvo líquido mensal de saque", text)
coverage.write_formula("B6", "='Projeções'!C22", number, withdrawal_target)
for row, label, fmt in [
    (8, "Carga efetiva sobre cobrança bruta de compra", rate),
    (9, "Carga efetiva sobre cobrança bruta de saque", rate),
    (10, "Outros tributos mensais atribuídos à compra", input_number),
    (11, "Outros tributos mensais atribuídos ao saque", input_number),
]:
    coverage.write(f"A{row}", label, text)
    coverage.write_blank(f"B{row}", None, fmt)
    coverage.write(f"C{row}", "Somente obrigações ainda não financiadas. Não somar incidência proporcional e tributo adicional sobre a mesma obrigação.", text)
    coverage.set_row(row - 1, 42)
for cell in ["B8", "B9"]:
    coverage.data_validation(cell, {"validate": "decimal", "criteria": "between", "minimum": 0, "maximum": 0.999999})
for cell in ["B10", "B11"]:
    coverage.data_validation(cell, {"validate": "decimal", "criteria": ">=", "value": 0})
coverage.write("A12", "Cotação ilustrativa: USDC por BETTEX", text)
coverage.write_number("B12", example_price, input_number)
coverage.data_validation("B12", {"validate": "decimal", "criteria": ">", "value": 0})
coverage_formulas = [
    (14, "Cobrança bruta mensal de compra", 'IF(COUNT(B8,B10)<2,"Informar tributos",IF(AND(B8>=0,B8<1,B10>=0),(B5+B10)/(1-B8),"Dados inválidos"))', "Informar tributos"),
    (15, "Cobrança bruta mensal de saque", 'IF(COUNT(B9,B11)<2,"Informar tributos",IF(AND(B9>=0,B9<1,B11>=0),(B6+B11)/(1-B9),"Dados inválidos"))', "Informar tributos"),
    (16, "Total bruto cobrado do usuário", 'IF(AND(ISNUMBER(B14),ISNUMBER(B15)),B14+B15,"Informar tributos")', "Informar tributos"),
    (17, "Provisão fiscal total vinculada", 'IF(ISNUMBER(B16),B16-B5-B6,"Informar tributos")', "Informar tributos"),
    (18, "Total líquido-alvo da Fundação", "B5+B6", buy_target + withdrawal_target),
    (19, "Cobrança bruta em BETTEX à cotação ilustrativa", 'IF(AND(ISNUMBER(B16),B12>0),B16/B12,"Conferir tributos e cotação")', "Conferir tributos e cotação"),
]
for row, label, formula, cached in coverage_formulas:
    coverage.write(f"A{row}", label, text)
    coverage.write_formula(f"B{row}", "=" + formula, number, cached)
coverage.merge_range("A21:C24", "Cobrança total − provisão fiscal = líquido-alvo, antes dos demais custos institucionais. A provisão cobre também a incidência sobre o acréscimo; não é receita livre. Carga efetiva linear só pode representar hipótese validada, não soma automática de alíquotas sobre bases diferentes. Tributos sobre lucro, créditos, faixas e ajustes exigem cálculo fiscal próprio sobre a cobrança final. Identificar obrigação e fonte: não financiar de novo pela tesouraria ou pagamentos o que já foi coberto aqui. Cotação, total e líquido do titular precisam de autorização; sem pagamentos reais.", note)
for row in range(20, 24):
    coverage.set_row(row, 30)
coverage.print_area("A1:C24")
book.close()
print(output)