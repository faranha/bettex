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
             "Compra: 1%. Saque USDC do staking: 2%. Taxas em BETTEX vão à carteira própria da Fundação, sem queima. Células editáveis para simulação; não alteram as tarifas do projeto.")
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
             "Exemplo ilustrativo: 100 USDC e 0,20 USDC por BETTEX. Não é preço do projeto. Amarelo = entrada editável; precisão exibida não define a precisão do contrato.", 2)
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
calc.write("A8", "Percentual da operação", text)
calc.write_formula("B8", "=INDEX(Taxas!$B$5:$B$6,MATCH(B7,Taxas!$A$5:$A$6,0))", rate, purchase_rate)
calc.write("A9", "Saldo BETTEX já disponível para a taxa", text)
calc.write_number("B9", 0, input_number)
calc.write("C9", "Sem incluir tokens reservados, pendentes ou em conciliação", text)
calc.write("A11", "Equivalente da taxa em USDC", text)
calc.write_formula("B11", "=B5*B8", number, example_fee_usdc)
calc.write("A12", "Taxa em BETTEX", text)
calc.write_formula("B12", '=IF(B6>0,B11/B6,"Definir cotação positiva")', number, example_fee_tokens)
calc.write("A14", "Compra: BETTEX brutos", text)
calc.write_formula("B14", '=IF(B7=Taxas!A5,IF(B6>0,B5/B6,"Definir cotação positiva"),"Não aplicável")', number, example_gross)
calc.write("A15", "Compra: BETTEX líquidos para o titular", text)
calc.write_formula("B15", '=IF(B7=Taxas!A5,IF(AND(ISNUMBER(B14),ISNUMBER(B12)),B14-B12,"Definir cotação positiva"),"Não aplicável")', number, example_gross - example_fee_tokens)
calc.write("C15", "Bruto menos taxa à Fundação; primeira compra não exige saldo prévio", text)
calc.write("A17", "Saque: compra bruta para completar a taxa", text)
calc.write_formula("B17", '=IF(B7=Taxas!A5,"Taxa deduzida na compra",IF(AND(ISNUMBER(B12),Taxas!B5<1),MAX(0,B12-B9)/(1-Taxas!B5),"Rever cotação e percentual"))', number, "Taxa deduzida na compra")
calc.write("C17", "Considera a taxa da própria compra: líquido precisa cobrir o saldo faltante", text)
calc.write("A18", "USDC necessário para essa compra", text)
calc.write_formula("B18", '=IF(ISNUMBER(B17),B17*B6,"Não aplicável")', number, "Não aplicável")
calc.data_validation("B5", {"validate": "decimal", "criteria": ">=", "value": 0})
calc.data_validation("B6", {"validate": "decimal", "criteria": ">", "value": 0})
calc.data_validation("B9", {"validate": "decimal", "criteria": ">=", "value": 0})
calc.merge_range("A20:C21", "As fórmulas usam cotação comum e não executam operações. Gas, tarifas externas, liquidez e arredondamento executável precisam de validação separada. Saldo insuficiente não cancela yield nem autoriza compra automática.", note)
calc.print_area("A1:C21")

monthly = setup("Operação mensal", "BETTEX — orçamento institucional",
                "Preencha os volumes e custos: nenhum volume operacional real foi informado. Equivalente estimado de taxas em USDC NÃO é caixa recebido.", 2)
monthly.set_column("A:A", 59)
monthly.set_column("B:B", 24)
monthly.set_column("C:C", 67)
monthly.write_row(3, 0, ["Parâmetro mensal", "USDC", "Tratamento"], header)
inputs = [
    ("Volume bruto de compras do pool", "Entrada de cenário; não receita institucional em USDC"),
    ("Volume solicitado de saques de USDC do staking", "Não somar novamente o crédito automático do yield"),
    ("Custo institucional mensal previsto", "Infraestrutura, auditoria, administração e operação"),
    ("Caixa líquido efetivo da conversão de taxas", "Somente USDC efetivamente recebido, após custos"),
    ("Orçamento inicial ainda disponível", "Saldo finito; não é receita recorrente"),
]
for row, (label, description) in enumerate(inputs, 4):
    monthly.write(row, 0, label, text)
    monthly.write_number(row, 1, 0, input_number)
    monthly.write(row, 2, description, text)
    monthly.set_row(row, 32)
monthly.data_validation("B5:B9", {"validate": "decimal", "criteria": ">=", "value": 0})
monthly.write("A11", "Equivalente nominal das taxas previstas", text)
monthly.write_formula("B11", "=B5*Taxas!B5+B6*Taxas!B6", number, 0)
monthly.write("C11", "Estimativa de valor; não presume venda dos tokens ou caixa", text)
monthly.write("A12", "Cobertura do custo com caixa e orçamento", text)
monthly.write_formula("B12", "=B8+B9-B7", number, 0)
monthly.write("C12", "Não inclui tokens apenas avaliados. Negativo indica falta de financiamento.", text)
monthly.write("A14", "Volume teórico de saques para cobrir o custo", text)
monthly.write_formula("B14", '=IF(Taxas!B6>0,MAX(0,B7-B5*Taxas!B5)/Taxas!B6,"Sem taxa de saque")', number, 0)
monthly.write("C14", "Hipótese de conversão integral ao valor indicado, sem custos; não comprova viabilidade.", text)
monthly.merge_range("A16:C18", "Converta ou utilize receitas institucionais separadamente. Venda de tokens recebidos como taxa não é nova venda pública nem lucro da tesouraria. O orçamento inicial não se repete mensalmente. Swap e retirada de BETTEX são propostas adicionais, não somadas aos volumes acima. Trate cotações variáveis e custos de conversão com registros efetivos.", note)
monthly.print_area("A1:C18")
book.close()
print(output)