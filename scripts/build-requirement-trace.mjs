/** Emit the source-level appendix of the review, never infer completeness from file existence. */
import {readFile,writeFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile('docs/requirements/source-catalog-2026-10-05.json','utf8'));
const groups={
  accounts:['C02','Accounts + account UI','check:accounts/check:security/browser'],
  wallets:['C03','Wallets + client vault','check:wallets/check:journey/browser'],
  contracts:['C04','lib/bettex-contracts','19 Solidity/EVM contract tests; browser purchase receipts'],
  participation:['C06','ledger/participation + local-round','check:journey/check:demo/local-round tests; browser tokenSeconds'],
  treasury:['C07','ledger/risk/local-round','local journal SQL + successful receipt audit; demo rules tests'],
  history:['C09','audit/history + HistoryPanel','check:history/check:security/browser owner isolation'],
  security:['C10','Security middleware + custody boundaries','security review + quality/security tests'],
  architecture:['C11','Modular boundaries + generated contracts','check:architecture/check:technical-docs/types/build'],
  research:['C12','Official technical reference store','check:technical-docs; availability limits in manifests'],
  content:['C01','Canonical source precedence','replit.md; preserved homepage/Pitch'],
};
let sequence=0;
const rows=catalog.flatMap(s=>s.requirements.items.map(r=>{
  const g=groups[r.domain]??groups.architecture,q=r.requirement.toLowerCase();
  let state='parcial',scope='Evidência compartilhada de família; não implica prova individual desta cláusula',block='',action='Conferir a cláusula contra sua evidência específica; não declarar encerramento por existência de componente.';
  if (/cadastro|login|sessão|duas carteiras|criptograf|idempot|paginação|precisão|gerad|fronteira|openapi|saldo.*tempo|quantidade.*tempo|rodada.*utc/.test(q)) {
    state='concluído';scope='No ambiente local/Alpha indicado; não constitui operação pública';action='';
  }
  if(/aporte.*investidor.*50|investidor.*50.*tesouraria|75%.*tesouraria/.test(q)){
    scope='Regra antiga resolvida por precedência: aporte anjo 100% produto/tecnologia/marketing; split vigente 50/25/25.';
    state='concluído';action='';
  }else if(/produç|dinheiro real|testnet pública|sepolia|blockchain pública|implanta.*públic|deploy.*públic/.test(q)){
    state='bloqueado';block='B01';action='Operador autorizado, deployment e funding público verificáveis.';
  }else if(/enviar.*ordens|cancelar.*ordens|conta operacional|on-ramp|onramp|robinhood|recompra.*execut|execut.*recompra|queima.*recompra/.test(q)){
    state='bloqueado';block='B02';action='Conta/conector autorizado e aptidão da plataforma; burn existe, operação externa não provada.';
  }else if(/saída.*cancela|cancel.*crédito|créditos.*saída|formalizar.*smart contract|acesso.*capital.*contrato/.test(q)){
    state='parcial';block='B03';scope='Cálculo e cancelamento pré-envio locais verificados; atomicidade financeira EOA não certificada.';
    action='Vincular condição de saída/expiração e mandato atomicamente on-chain antes de utilização financeira.';
  }else if(/reserva defensiva|custo.*obriga|resultado.*realiz|tribu|impost|patrimônio|alocaç.*cust/.test(q)){
    state='bloqueado';block='B04';scope='Controller/journal local; resultado/custos/reserva de fixture explicitamente sintéticos.';
    action='Políticas aprovadas e registros reais de posições/custos/tributos; fixture não é apuração comercial.';
  }else if(/saque|swapping|troca inversa|converter.*usdc|converter.*bettex/.test(q)){
    state='parcial';block='B05';scope='Demo emulado verificado; compra EVM comprovada, saque/conversão inversa EVM não comprovados.';
    action='Completar adaptador/UI/mandato do caminho financeiro específico; não confundir emulação com execução.';
  }
  return {id:`R${String(++sequence).padStart(3,'0')}`,source:s.path,line:r.line,requirement:r.requirement,
    family:g[0],state,scope,implementation:g[1],evidence:g[2],block,next_action:action};
}));
const columns=Object.keys(rows[0]),cell=v=>`"${String(v??'').replaceAll('"','""')}"`;
await writeFile('docs/requirements/review-2026-10-05.csv','\uFEFF'+columns.map(cell).join(',')+'\n'+
  rows.map(r=>columns.map(k=>cell(r[k])).join(',')).join('\n')+'\n');
console.log(JSON.stringify({rows:rows.length,states:rows.reduce((a,r)=>(a[r.state]=(a[r.state]??0)+1,a),{})}));
