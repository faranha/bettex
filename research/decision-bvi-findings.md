## Key Facts

**Corte: 3 outubro 2026. Resultado para a bifurcação “empresa operacional própria ou fundo” — não é relatório geral BVI.** A lei não converte automaticamente toda empresa que investe seu próprio caixa em fundo. SIBA §63A define private investment fund (“PIF”) por **dois requisitos cumulativos**, sem condição de resgate: (a) entidade recolhe e agrega fundos de investidores para investimento coletivo e diversificação de risco de carteira; **e** (b) emite fund interests que dão ao titular direito a um montante calculado por referência ao valor de um interesse proporcional no todo ou parte dos ativos líquidos da entidade. “Company” está expressamente incluída. Não há, no texto examinado, exclusão geral para “investment holding company” ou “operating company”; a distinção passa pela finalidade do caixa e, decisivamente neste caso, pelo segundo requisito.

**Aplicação ao desenho BETTEX.**

1. **Primeiro elemento de §63A — SIM, fortemente presente.** Os 100% de USDC de subscrição entram na tesouraria única; a IA aplica esses fundos em múltiplas classes/mercados para obter retorno e diversificar risco. Chamar o caixa de “capital próprio” depois da subscrição é argumento útil sobre propriedade/ausência de custódia, mas não muda sozinho a origem/pooling econômico. Se houver receita de serviço operacional real misturada no balanço, isso pode apoiar a tese de companhia comercial, porém o modelo descrito não é apenas venda de software: o próprio capital do público é o capital investido para o seu retorno.

2. **Segundo elemento de §63A — NÃO demonstrado como escrito; esta é a diferença legal que conserva a tese operacional, mas há um limite interpretativo real.** O holder não tem ação, voto, fração de propriedade, reembolso, resgate, direito de venda compulsória ou direito ao percentual do patrimônio líquido da companhia. O pagamento contratual é 25% do lucro elegível distribuído; o lucro é `max(0, min(R, P−B))`, e a parcela individual é ponderada por token × tempo, inclusive se staking for facultativo. A fórmula não concede percentual do P/NAV, direito sobre ativos identificáveis nem liquidação proporcional da companhia. Sua referência imediata é lucro líquido realizado acumulado (limitado por patrimônio atualizado e base ajustada), rateado pela ponderação temporal. Por isso, no texto fornecido, não se prova que o token dê “amount … by reference to the value of a proportionate interest” nos ativos líquidos. **Melhor leitura aplicada: §63A(b) provavelmente NÃO, mas não certeza judicial.**

   O argumento contrário não pode ser descartado: `P−B` faz o teto do lucro depender do valor corrente do patrimônio líquido; no cenário em que esse teto é vinculante, a parcela do titular varia com o aumento líquido de ativos. A lei não define “by reference to”, “fund interest” nem “proportionate interest” de modo que resolva se uma participação contratual em lucro de investimento, com teto de NAV, é suficientemente referenciada a NAV. A proporcionalidade BETTEX é por token-tempo e por lucros, não propriedade proporcional de NAV; ainda assim, uma leitura ampla pode entender que o componente NAV satisfaz a referência estatutária. Sem precedente ou guidance oficial sobre fórmula equivalente, não declarar isenção certa. **A resposta mudaria se os documentos derem ao token uma fração do NAV, um crédito calculado diretamente por saldo de ativos líquidos, ou se o lucro elegível/claim puder ser liquidado proporcionalmente ao valor dos ativos.**

3. **Sem resgate não elimina PIF.** A própria reg. 8(3)(c) das Private Investment Funds Regulations exige que o term sheet de um PIF declare que investidores não têm direito de resgatar/retirar interesses sob demanda. Portanto a ausência de redemption afasta o elemento específico de “on demand” do conceito separado de mutual fund aberto (§40), mas não é argumento contra PIF (§63A). A afirmação “sem resgate = não é fundo” é legalmente errada.

4. **Solução “fund” não cabe às premissas de varejo.** Se o enquadramento PIF se confirmar, a reg. 8(3)(a) pede que a oferta identifique uma destas bases: suitability para investidores privados com limite de 50 ou convite só em base privada; ou suitability apenas para profissionais (com investimento mínimo regulatório). Não corresponde a 100 mil holders varejistas internacionais. Recognition não é “solução” compatível com o brief; esta pesquisa não recomenda mudar distribuição para profissional-only nem tratar registro/reconhecimento como autorização da emissão. Staking facultativo, por si, não muda nenhum desses elementos nem torna PIF necessário: examina-se o direito econômico que todos os tokens carregam.

5. **Debt/debenture — CONDICIONAL, independente de PIF.** Schedule 1 para. 2 inclui debêntures, bonds e “any other instruments creating or acknowledging indebtedness”, sujeito às exceções ali listadas. Não é necessário voto, equity, principal garantido ou reembolso de principal para uma obrigação contingente de pagar distribuição já exigível ser potencialmente um debt instrument; por outro lado, lucro declarado/distribuição societária sem obrigação de crédito individualizada não é automaticamente dívida. Como BETTEX promete distribuir 25% e creditar/pagar por fórmula, há argumento material de obrigação contratual contingente quando lucro elegível existe. O resultado depende de quem é credor e quando nasce o crédito, poder discricionário (não presumido aqui), vencimento, prioridade, recurso por inadimplemento e direitos após transferência. A classificação possível como debenture não satisfaz automaticamente §63A(b): security/debenture e fund interest/PIF são testes distintos.

6. **Derivatives — NÃO automaticamente, CONDICIONAL na redação.** Schedule 1 para. 7 abrange direitos sob contrato por diferenças e outros contratos cujo propósito seja obter lucro/evitar perda por referência a flutuações em preço/valor de propriedade ou índice, salvo o caso de ganho/perda pretendido por entrega da propriedade. A distribuição BETTEX deriva de lucros efetivamente realizados pela tesouraria, sujeito a limites R/P/B, não de um payoff bilateral por diferença de preço em ativo de referência; isso dá argumento positivo contra CfD. A ligação explícita a P e a posições do portfólio, liquidação em USDC e investimento multimercado dão argumento contrário de payoff referenciado em valor de propriedade. Não há base para declarar que qualquer revenue/profit share é derivativo, nem para excluir a hipótese sem ver os termos e a prática de contabilização. A fórmula exata é mais próxima de participação em lucro corporativo do que de derivativo padrão, mas o teto `P−B` impede conclusão categórica.

7. **Emissão própria/own-account dealing — alívio estreito, não salvo-conduto.** SIBA Schedule 2 Part B, 1(2)(a) diz expressamente que emissão, resgate ou recompra pela companhia de suas próprias ações, debêntures ou instrumentos que deem direito a ações/debêntures “deemed not to constitute dealing in investments” para Schedule 2 Part A, 1. Part B 1(2)(b)–(c) tem regras análogas para interesses de unit trust/parceria. É argumento positivo forte contra uma licença SIBA **só por emitir** o próprio instrumento, mesmo quando seja investment/debenture. Part B 2(4) também exclui arranjos feitos pela entidade para transação especificada no próprio issue/redemption/repurchase. Mas isso não declara que o direito não é investment, não autoriza gerir/fazer dealing em investimentos de terceiros, não é exclusão geral de arranging, exchange/custody, fundos, lei de oferta pública, VASP ou leis dos países dos buyers.

   A ressalva de solicitation deve ser aplicada com precisão: Part B 1(3), a exceção de supplier of goods/services, não serve ao fornecedor que regularmente solicita o público a comprar/vender/subscrever/underwrite investments. Isso limita essa exceção distinta; não está redigida como condição que apaga o own-issuance exclusion de 1(2). A distribuição varejista solicitada também pode afetar outras qualificações e regras de oferta. A exclusão é atividade-específica, não um safe harbour geral por operar por conta própria.

8. **Part II de SIBA — status não confirmado com o padrão primário necessário.** O texto oficial FSC da Lei (Revised Edition 2020) identifica commencement “17 May 2010 (except for Part II)” e o Schedule 8 diz que §25 não deve ter efeito até 31 Dec. 2010. Isso mostra a intenção/data de transição original, mas não é um instrumento expresso posterior que prove quando todo Part II (ss. 23–39) foi formalmente posto em vigor. O compêndio Conyers publicado/listado em Jan. 2025 registra Part II ss. 23–39 como “not in force”; isso é evidência secundária contrária à conclusão automática de vigência, **mas não valida sozinho a situação em 2026**. O portal legislativo atual enumera emendas e o Schedule 1 Order 2024, mas o viewer oficial não revelou notice/consolidação apta a sanar a questão. Assim, não uso §25 como proibição atualmente aplicável nem como permissão: **estado atual de Part II = lacuna de commencement**. Mesmo se Part II continuar sem vigência, isso não anula SIBA Parts I/III/IIIA, outras leis nem a lei do destino. Essa lacuna muda a decisão de “pode lançar uma emissão pública sem licença/aprovação?”; não muda a distinção estatutária PIF sob §63A.

9. **VASP — tesouraria própria vs serviço ao usuário.** A Lei VASP define serviço como negócio feito “on behalf of another person”; inclui serviço financeiro relativo à emissão/oferta/venda de virtual asset, exchange e transferência/custódia. Assim, investimento pela BETTEX dos seus próprios USDC em nome e para conta da sociedade, e pagamento de sua própria obrigação de lucro em USDC, não são por si só custódia de ativos de cliente nem transferência/exchange prestada em nome de holder. Isso não resolve SIBA/debenture/PIF. A exceção legal para software/unhosted wallet é limitada a atuação sem facilitação ativa dos serviços VASP para outra pessoa. O app pool/swap muda materialmente a análise: se a BETTEX opera como plataforma e toma posse/controle de USDC ou outros virtual assets em qualquer ponto, ou faz exchange/transferência/custódia por conta do usuário, atividade VASP é provável e registro/aprovação pertinentes podem ser exigidos. Um front end passivo, transação wallet-to-contract sob controle exclusivo do usuário e mero pagamento de dívida própria são fatos diferentes. Sem KYC atual não sobrevive se a empresa de fato operar VASP: obrigações AML/Travel Rule então precisam ser analisadas.

**Conclusão de escolha/eliminação, limitada a esta frente.** Para a escolha entre constituir uma **companhia comercial de capital fechado com tesouraria própria** e partir de um fundo, **escolho a tese operacional como a leitura melhor do instrumento BETTEX hoje descrito; não classifico PIF obrigatório apenas pelo pooling, investimento ou staking facultativo**. §63A exige também interesse proporcional em ativos líquidos; o documento não concede esse direito de forma expressa, e um claim variável de lucro não é automaticamente participação em NAV. Porém o risco não é meramente teórico porque P−B referencia NAV e não há decisão/guia oficial que fixe o limite. **Logo a tese “BVI sem licença/aprovação financeira para 100 mil varejistas” está eliminada como conclusão segura; BVI operacional não está eliminada como entidade a investigar/selecionar.** Não recomendamos fundo como default ou solução, nem afirmamos autorização de emissão sem aprovação: a decisão final de BVI depende de resolver (a) se claim exatamente formulado passa §63A(b), (b) status de commencement de SIBA Part II, e (c) se pool/swap app tem tomada de controle/serviço a clientes. Se qualquer um tornar BETTEX PIF ou VASP, isso conflita com o brief de varejo/não registro e muda a decisão contra BVI sob as restrições atuais. O regime para 100 mil holders em mercados de destino não foi objeto desta frente.

## Notable Claims Requiring Cross-Reference

- **“BETTEX não é fundo porque não tem resgate.”** Contradito como proposição geral: §63A PIF não exige resgate e as Regulations admitem interesse sem resgate sob demanda. Ausência de resgate ajuda apenas contra o elemento específico de mutual fund §40.
- **“Pooling dos USDC e IA multimercado tornam PIF obrigatório.”** Incompleto: satisfazem fortemente §63A(a), mas ambos os elementos são cumulativos. §63A(b) pede direito a valor proporcional de ativos líquidos; o claim BETTEX é lucro acumulado, com rateio token-tempo e teto de NAV, não fração do balanço. Ainda é uma lacuna genuína por “by reference to” e P−B.
- **“Participação em lucros é necessariamente security/debenture” / “não é security sem principal ou voto.”** Ambos simplificam demais: promessa exigível de distribuição pode reconhecer dívida contingente; token pode ser outro investimento por Schedule 1; termos de crédito e fórmula controlam.
- **“Own account + emissão de token próprio exclui toda licença/aprovação.”** Só own issuance dealing (e arranging desse próprio issue em Part B 2(4)) é expressamente excluído. Não resolve PIF, VASP de swap/custódia para usuários, oferta pública, advisory/dealing em investimentos de terceiros nem legislação estrangeira.
- **“Part II já entrou em vigor em 31/12/2010” / “Part II segue not-in-force em 2026.”** Nenhuma conclusão foi provada neste sweep. O texto oficial mostra carve-out de commencement e uma data de transição para §25; compêndio de Jan. 2025 diz Part II ss. 23–39 not-in-force; falta instrumento primário atualizado. Não usar qualquer uma como fato definitivo até conferir Gazette/ordem de commencement corrente.
- **“Emissão própria não é VASP.”** FAQ/guia jurídico pode apoiar, mas a conclusão legal depende do elemento “on behalf of another” e das operações. A lei cobre prestação de serviços financeiros ligados à emissão de ativos de terceiros e exige análise separada de pool/swap, custódia e transferências.
- **“Schedule 1, para. 7 captura qualquer token rentável.”** Não: o teste é propósito de assegurar lucro/evitar perda por referência a flutuações de preço/valor; pagamento de lucro corporativo realizado não é automaticamente CfD. Teto P−B pode, contudo, levantar a questão de forma factual.

## Source Quality Assessment

- **Tier 1, texto primário oficial, fetched integralmente/extrato jurídico completo:** SIBA (FSC PDF, revisão identificada como 1 Jan. 2020; consolidada até Act 12 of 2019); Private Investment Funds Regulations, S.I. 80/2019; SIBA Schedule 1 Order 2024; Virtual Assets Service Providers Act 2022 (PDF FSC); FSC Guidance on Regulation of Virtual Assets (13 July 2020). Melhor suporte para texto e teste; a data/revisão do SIBA exige cuidado para emendas posteriores e commencement.
- **Tier 2, análise jurídica completa/fetched:** Maples Group, PDF 23 Apr. 2026, útil para separar leis de fundos/SIBA/VASP e confirmar que tokenização não muda o teste. Trata tokenização de fundos, não interpreta fórmula BETTEX nem decide §63A(b). Harneys practical VASP guide, útil para “issuer’s own tokens” e bordas de exchange/custody, mas guia não vinculante. Conyers Nov. 2025/Jan. 2025 compendium é referência secundária de status e partes foram extraídas com truncamento; seu “Part II not in force” é atribuído, não elevado a prova primária de status em 2026.
- **Tier 2 / snippet only:** Mourant 2026 sobre own-issue arrangements, Legal500/Conyers sobre Schedule 1 Order in force 2 Jan. 2025, ICLG 2026 e páginas FSC de aviso/related legislation estão registrados em `research/sources/decision-bvi-snippets.md`. Não sustentar neles conclusões que o Act/regulamento resolve.
- **Limite de atualização:** o FSC aloja SIBA cuja revisão impressa é 2020; o portal oficial de leis referencia enactments mas seu PDF viewer não foi recuperado como consolidação integral. O Schedule 1 Order 2024 adiciona currency FX instrument 7A (em vigor 2 Jan. 2025 segundo referência Conyers), sem alterar §63A em texto, mas isso não certifica o estado de commencement de Part II. A busca não encontrou uma decisão judicial BVI sobre o limite “by reference to proportionate net assets” em token de lucro por tempo, nem regra expressa de carveout de operating company.

## Gaps & Unanswered Questions

1. **Precisão decisória ainda pendente:** nenhuma decisão oficial/caso encontrado testa um token com distribuição `25% × max(0,min(R,P−B)) × peso token-tempo`. Interpretar “by reference to” e “proportionate interest” com esta fórmula — especificamente se o limitador `P−B` basta para §63A(b) — é a lacuna concreta que pode obrigar reconhecimento PIF e inviabilizar 100 mil varejistas, portanto altera a escolha de jurisdição sob o brief.
2. **Part II:** obter a cadeia primária de commencement/Gazette atual que reconcilie SIBA “except for Part II”, Schedule 8 §25/transição e afirmação de Conyers de que ss. 23–39 não estão em vigor. Enquanto ausente, não declarar Part II aplicável nem inoperante em 2026.
3. **Direito contratual exato:** token terms precisam esclarecer quando a distribuição nasce e se é dívida exigível ou declaração empresarial, eventual discrição, titular do crédito, priority, default/remedies, vesting, fee/withholding e efeitos de transferência. Isso decide a hipótese de debenture e pode afetar a hipótese derivativa, sem alterar o teste PIF pelo nome do produto.
4. **Operação/técnica:** confirmar titularidade jurídica e contábil dos USDC após venda primária; inexistência de segregação ou poderes fiduciários; quem assina posições; contratos do pool/swap; controle das chaves e custódia em cada fluxo; se cada payout é pagamento de obrigação própria ou transferência/exchange em nome do holder. “Wallet exportável” não responde esses fatos.
5. **Alcance territorial:** esta conclusão não decide se uma emissão por BVI company dirigida a varejistas em cada país exige registro/prospecto/financial promotion local. O próprio §38 do Act legado faz referência à lei do local onde uma oferta externa é feita, mas o status de Part II não foi usado para dar autorização internacional.

## Sources

1. **Title:** Securities and Investment Business Act, 2010 (Revised Edition 2020; PDF on FSC site)  
   **URL:** https://www.bvifsc.vg/sites/default/files/securities_and_investment_business_act.pdf  
   **Date:** Act 2 of 2010; revision date 1 Jan. 2020; amended through Act 12 of 2019 in the PDF; fetched 3 Oct. 2026  
   **Tier:** 1 — official primary legislation  
   **Evidence:** §63A(1), both cumulative limbs; §40 mutual-fund redemption limb; Part IIIA §§63B–63C; Schedule 1 paras. 2 and 7; Schedule 2 Part B 1(2), 1(3), 2(4); commencement page / Schedule 8 transition. Saved: `research/sources/decision-bvi-02-siba-act.md`.  
   **Quality:** Integral extraction from official Act PDF; revision is not current through 2026 and the Part II commencement record is not conclusive.

2. **Title:** Private Investment Funds Regulations, S.I. 80/2019  
   **URL:** https://www.bvifsc.vg/sites/default/files/private_investment_funds_regulations.pdf  
   **Date:** Commencement 31 Dec. 2019; fetched 3 Oct. 2026  
   **Tier:** 1 — official subsidiary legislation  
   **Evidence:** regs. 4 (professional investor threshold/minimum investment), 5–6 (directors, management/valuation/safekeeping person), 8(3)(a), (c) (private/professional eligibility disclosure, no on-demand redemption); reg. 9 valuation. Saved: `research/sources/decision-bvi-05-pif-regulations.md`.  
   **Quality:** Full extraction, no truncation reported by fetch; regulations do not define an operating-company carveout.

3. **Title:** Securities and Investment Business (Amendment of Schedule 1) Order, 2024, S.I. No. 42 of 2024  
   **URL:** https://www.bvifsc.vg/sites/default/files/si_no_42_of_2024-securities_and_investment_business_amendment_of_schedule_1_order_2024.pdf  
   **Date:** 2024; fetched 3 Oct. 2026  
   **Tier:** 1 — official subsidiary legislation  
   **Evidence:** inserts Schedule 1 para. 7A “instruments for foreign exchange”; order text says effective on a date appointed by Gazette notice. Saved: `research/sources/decision-bvi-06-schedule1-order.md`.  
   **Quality:** Full order extraction; commencement date itself cross-referenced to Conyers snippet (2 Jan. 2025), not established by the fetched notice page.

4. **Title:** Virtual Assets Service Providers Act, 2022  
   **URL:** https://www.bvifsc.vg/sites/default/files/virtual_assets_service_providers_act_2022.pdf  
   **Date:** Act 17 of 2022; commenced 1 Feb. 2023 per FSC materials; fetched previously 3 Oct. 2026  
   **Tier:** 1 — official primary legislation  
   **Evidence:** §2 “virtual assets service,” “VASP,” “on behalf of another person,” exclusions for unhosted wallet/software; §§3, 5 registration scope; §§27–32 custody/exchange. Saved: `research/sources/bvi-deep-vasp-02-act.md`.  
   **Quality:** Full legislative extraction in the existing source; important to separate own treasury from a service for holders.

5. **Title:** Guidance on Regulation of Virtual Assets in the Virgin Islands (BVI)  
   **URL:** https://www.bvifsc.vg/sites/default/files/guidance_on_regulation_of_virtual_assets_in_the_virgin_islands_bvi_final_0.pdf  
   **Date:** 13 July 2020; fetched previously 3 Oct. 2026  
   **Tier:** 1 — FSC regulatory guidance, not legislation  
   **Evidence:** profit share/dividend rights as relevant token-characterization factors; investment activity, custody/exchange after issue; disclaimer that guidance is non-exhaustive. Saved: `research/sources/bvi-deep-siba-02.md`.  
   **Quality:** Full text; official but older than VASP Act and current app design.

6. **Title:** The Rise of Digital Asset Funds and Tokenisation in the Cayman Islands and the British Virgin Islands  
   **URL:** https://maples.com/wp-content/uploads/2026/04/20260423-Article-Cayman-and-BVI-The-Rise-of-Digital-Asset-Funds-and-Tokenisation-in-the-Cayman-Islands-and-the-British-Virgin-Islands.pdf  
   **Date:** 23 Apr. 2026 (URL filename); fetched 3 Oct. 2026  
   **Tier:** 2 — specialist law-firm analysis  
   **Evidence:** distinguishes BVI SIBA investment characterization and VASP services; tokenised fund interests mirror statutory register; new Cayman tokenized-fund legal framework is not BVI approval. Saved: `research/sources/decision-bvi-01-maples-2026.pdf.md`.  
   **Quality:** Full fetch; parser title metadata was generic, so cited article title comes from URL/filename. Not an opinion on BETTEX §63A formula.

7. **Title:** BVI Virtual Asset (Service Providers) Act — a practical guide  
   **URL:** https://www.harneys.com/media/lrfj3lwt/bvi-virtual-asset-service-providers-act-a-practical-guide-final.pdf  
   **Date:** Undated in fetched text; accessed 3 Oct. 2026  
   **Tier:** 2 — BVI law-firm guide  
   **Evidence:** own token issuance generally not VASP by itself; services for other issuers, exchange/custody, active facilitation boundaries. Saved: `research/sources/decision-bvi-04-harneys-vasp.md`.  
   **Quality:** Full extraction, nonbinding and not a substitute for precise operational analysis.

8. **Title:** Securities and Investment Business Act Compendium — Conyers  
   **URL:** https://www.conyers.com/wp-content/uploads/2025/11/Securities_and_Investment_Business_Act_2010_Compendium-BVI.pdf  
   **Date:** Compendium PDF fetched 3 Oct. 2026; content says Jan. 2025  
   **Tier:** 2 — legal compendium  
   **Evidence:** compendium text identifies Part II §§23–39 as “not in force”; the associated fetch also restates §63A and Schedule 1. Saved: `research/sources/decision-bvi-08-conyers-compendium.md`.  
   **Quality:** Partial/truncated extraction and secondary authority; cited only to identify a conflict/gap, not as current official proof.

9. **Title:** British Virgin Islands Securities and Investment Business Act and Related Legislation — Conyers  
   **URL:** https://www.conyers.com/publications/view/bvi-securities-investment-business-act-2010  
   **Date:** 24 Jan. 2025 listing  
   **Tier:** 2 — specialist law-firm update  
   **Evidence:** says Schedule 1 para. 7A, added by 2024 Order, in force 2 Jan. 2025. Saved as snippet: `research/sources/decision-bvi-snippets.md`.  
   **Quality:** Snippet only; supports the FX amendment commencement, not Part II status.

10. **Title:** What you need to know about the regulation of investment business in the BVI — Mourant  
    **URL:** https://www.mourant.com/wp-content/uploads/2026/02/Mourant-What-you-need-to-know-about-the-regulation-of-investment-business-in-the-BVI.pdf  
    **Date:** Feb. 2026 (filename)  
    **Tier:** 2 — specialist law-firm guide  
    **Evidence:** own issue/repurchase arrangements excluded under Part B, consistent with official text; stored with URL/title/date/text at `research/sources/decision-bvi-snippets.md`.  
    **Quality:** Search snippet only; primary Act controls.

11. **Title:** Securities and Investment Business Act | Virgin Islands Laws Online  
    **URL:** https://laws.gov.vg/Laws/securities-and-investment-business-act  
    **Date:** Undated page; accessed 3 Oct. 2026  
    **Tier:** 1 — official legislation portal  
    **Evidence:** related-legislation listing includes SIBA regulations, Public Funds Code, and 2024 Schedule 1 Order; viewer did not expose a usable consolidation or commencement instrument. Saved: `research/sources/decision-bvi-snippets.md`.  
    **Quality:** Snippet/page listing only; supports search of the current portal, not the operative status of Part II.

12. **Title:** Notice: Securities and Investment Business (Amendment of Schedule 1) Order, 2024 | BVI FSC  
    **URL:** https://www.bvifsc.vg/library/legislation/notice-securities-and-investment-business-amendment-schedule-1-order-2024  
    **Date:** 2024; precise date not displayed; accessed 3 Oct. 2026  
    **Tier:** 1 — regulator notice page  
    **Evidence:** notice title identifies the instrument intended to bring the Order into force; operative text/date not displayed by the page fetch. Saved: `research/sources/decision-bvi-snippets.md`.  
    **Quality:** Snippet/page title only; not proof of its exact commencement date.

13. **Title:** Alternative Investment Funds Laws 2026 | British Virgin Islands | ICLG  
    **URL:** https://iclg.com/practice-areas/alternative-investment-funds-laws-and-regulations/british-virgin-islands  
    **Date:** 12 Aug. 2026  
    **Tier:** 2 — professional legal guide  
    **Evidence:** search excerpt discusses BVI closed-ended/PIF treatment; exact excerpt recorded in `research/sources/decision-bvi-snippets.md`.  
    **Quality:** Snippet only; not relied upon instead of §63A or the PIF Regulations.