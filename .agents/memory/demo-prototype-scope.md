---
name: Escopo da demonstração BETTEX
description: Saldos e carteiras on-chain como requisito atual; isolamento por aba, fase ALFA e avisos restritos ao cabeçalho.
---

O demo anônimo deve ter uma instância independente por aba, sem cadastro. Recarregar e navegar preservam o teste; abrir uma nova aba ou reiniciar o demo cria uma conta limpa sem alterar outras abas nem contas reais.

**Why:** O criador escolheu uma instância por aba para permitir testes livres, validação e apresentações ao vivo para investidores.

**How to apply:** Separar os dados pessoais simulados por sessão da aba, inclusive quando o navegador duplica uma aba e copia seu armazenamento. A identidade anônima do demo nunca concede autenticação, permissões financeiras ou acesso ao histórico privado.

O requisito atual do criador é “there is no internal balance, everything is on chain”, com staking possível apenas dentro do app. A exigência atual substitui a apresentação anterior de saldos pessoais como emulação persistida.

**Why:** O criador corrigiu expressamente a explicação de saldos internos ao pedir a exportação das carteiras.

**How to apply:** Não apresentar registros simulados como prova de saldo blockchain nem criar carteiras sem vínculo com os fundos mostrados. Usar a rede e os contratos confirmados para ler e movimentar os saldos pessoais; preservar identidade, regras de staking e ciclos. A fase ALFA não autoriza movimentações de dinheiro real.

A área operacional do app é light mode; o restante do site não precisa mudar. A identificação ALFA/sem dinheiro real fica apenas na faixa azul do cabeçalho do app. Não repetir avisos, selos de teste ou qualificadores demo/emulado nos cartões, títulos, ações, modais ou páginas.

**Why:** O criador aprovou o tom claro e restringiu a mudança à área operacional. Reiterou: “dont add test everywhere, we have that already on the header, REMOVE other warnings please, everywhere”.

**How to apply:** Usar rótulos normais de conta e carteira. Manter identificação de rede/origem dos saldos e erros ou confirmações de segurança funcionais, sem transformá-los em avisos genéricos repetidos. A remoção visual não muda simulação, permissões ou salvaguardas. Usar overlays para ações pessoais, helpers para termos, nome/dados básicos e saudação; sempre exibir equivalências em reais.

Avisos específicos de transferência devem aparecer onde a pessoa informa o destino: ativo, rede, formato de endereço e risco de perda permanente por destino incompatível.

**Why:** O criador pediu instruções claras sobre o tipo de carteira, perguntou se era ETH e exigiu aviso de perda ao usar destino incompatível. Isso não revoga a proibição de avisos genéricos ALFA/teste repetidos.

**How to apply:** Distinguir token de gás e rede de referência do produto da rede real de execução. Um endereço 0x válido não comprova suporte à rede ou ao token; nunca afirmar que essa compatibilidade foi validada apenas pelo formato.

Não há suporte dentro do aplicativo; suporte é pela comunidade no Telegram.

**Why:** O usuário disse “Suporte é pela comunidade” e pediu encaminhar as pessoas ao Telegram.

**How to apply:** Direcionar suporte e comunidade ao Telegram aprovado; explicações contextuais de campos não são um chat interno de suporte.

A identificação pública permanece ALFA. O criador definiu o ALFA como produto seed com token, contratos básicos e primeiros agentes, não apenas lançamento mock. O cronograma vigente e a lista de features a detalhar estão em replit.md. A experiência emulada existente não prova que essas capacidades já foram implementadas. O Roadmap identifica a fase com “Estamos aqui”, e topo/rodapé preservam o selo.

**Why:** O criador manteve a comunicação ALFA, declarou a entrada no desenvolvimento e definiu “a fase alpha já vai ter o token”, com audiência semente; o go to market acompanha o BETA.

**How to apply:** Distinguir o demo em validação das metas futuras de compradores e usuários. Manter ALFA junto da marca nas duas posições enquanto essa for a fase definida pelo criador, sem afirmar operações financeiras reais. A abertura de Go to market no Pitch apresenta “Fase atual — ALFA”. O mesmo Roadmap da homepage, com etapas e cronograma iguais, aparece em seção independente imediatamente antes de Go to market, com item próprio no menu e fundo branco de ponta a ponta, sem container claro dentro de uma área escura.

**Why da separação:** O criador pediu o Roadmap antes de Go to market, com seção e item próprios no menu, e esclareceu “Não quero esse container claro, o fundo é claro”.

No mobile, as telas devem aparecer antes das imagens, ícones e símbolos que exemplificam cada área.

**Why:** O criador disse que as ilustrações antes da tela dificultam ver o demo.

**How to apply:** Priorizar a tela na ordem visual mobile de todas as áreas; manter os elementos ilustrativos abaixo, sem mudar a disposição desktop.

Na homepage, a área “Conheça o app da BETTEX” deve ser um banner simples convidando a acessar o demo existente, sem a apresentação de telas.

**Why:** O criador disse que “nós já temos um demo” e pediu “Acesse o demo ao vivo agora mesmo”, sem precisar mostrar aquelas telas.

**How to apply:** Não reconstruir o showcase de telas na homepage ao melhorar o banner. A prioridade visual das telas sobre ilustrações se aplica somente às áreas que continuam apresentando telas, não exige reintroduzi-las na homepage.

A página pública de entrada do app deve apresentar “Em breve” ou “Em desenvolvimento” e o slider com as telas do aplicativo, em vez de cartões vazios que parecem carregamento.

**Why:** O criador pediu uma landing page melhor nessa página e a volta do slider anterior com as telas do app em desenvolvimento.

**How to apply:** Aplicar à apresentação pública do app, não ao banner da homepage. Identificar as telas como ilustrativas, preservar o dashboard funcional de desenvolvimento e não dar a entender que operações financeiras reais já estão disponíveis.